import { expect, test, type Page } from '@playwright/test';

/**
 * Functional gate for the capture-then-upgrade exhibit. These assert the outcome
 * the page computes, not the copy it prints around it: a session captured before
 * the PQC upgrade must come back at Q-Day byte-identical, and a session captured
 * after it must not come back at all — with the failure reported as an AES-GCM
 * tag rejection rather than a shrug.
 */

const ROW = (n: number) => `.capture-table tbody tr:nth-child(${n})`;

async function send(page: Page, message: string): Promise<void> {
  await page.fill('#capture-message', message);
  await page.click('#send-session');
  await expect(page.locator('#capture-status')).toContainText('captured over the');
}

async function runQDay(page: Page): Promise<void> {
  await page.click('#run-qday');
  await expect(page.locator('#capture-status')).toContainText('Q-Day complete');
}

test.beforeEach(async ({ page }) => {
  await page.goto('.');
  await page.locator('#capture').scrollIntoViewIfNeeded();
});

test('the store holds ciphertext only — the plaintext is not in the captured copy', async ({
  page,
}) => {
  const secret = 'ILS-API session for patron 4471';
  await send(page, secret);
  const store = await page.locator('#capture-body').innerText();
  expect(store).not.toContain(secret);
  expect(store).toContain('Classical — DH only');
});

test('a session captured before the upgrade is recovered at Q-Day, byte-identical', async ({
  page,
}) => {
  const secret = 'sent in 2026, before anyone deployed ML-KEM';
  await send(page, secret);
  await runQDay(page);

  const row = page.locator(ROW(1));
  await expect(row).toContainText('RECOVERED');
  await expect(row).not.toContainText('NOT RECOVERED');
  await expect(row).toContainText(secret);
  await expect(row).toContainText('byte-identical to what was sent');
  await expect(row).toContainText('unchanged since capture');
  await expect(page.locator('.capture-verdict')).toHaveClass(/at-risk/);
});

test('a session captured after the upgrade survives Q-Day, for a stated reason', async ({
  page,
}) => {
  await page.click('#deploy-pqc');
  await expect(page.locator('#deploy-pqc')).toBeDisabled();
  await expect(page.locator('#send-session')).toHaveText('Send over the hybrid handshake');

  const secret = 'sent after the upgrade landed';
  await send(page, secret);
  await runQDay(page);

  const row = page.locator(ROW(1));
  await expect(row).toContainText('NOT RECOVERED');
  await expect(row).toContainText('AES-GCM authentication failed');
  await expect(row).not.toContainText(secret);
  // The break still happened — the attacker solved the discrete log and came up
  // short on key material. "exponents tried" is printed from the actual loop count.
  await expect(row).toContainText('exponents tried');
  await expect(page.locator('#capture-status')).toContainText('0 of 1 captured session(s) recovered');
  await expect(page.locator('.capture-verdict')).toHaveClass(/ok/);
});

test('upgrading after a capture protects the next message and not the last one', async ({
  page,
}) => {
  const before = 'message one, pre-upgrade';
  const after = 'message two, post-upgrade';

  await send(page, before);
  const firstFingerprint = await page.locator(`${ROW(1)} .small-note`).first().innerText();

  await page.click('#deploy-pqc');
  await send(page, after);

  // The upgrade did not rewrite the stored record: same fingerprint line as
  // before it was deployed.
  await expect(page.locator(`${ROW(1)} .small-note`).first()).toHaveText(firstFingerprint);

  await runQDay(page);

  await expect(page.locator(ROW(1))).toContainText('RECOVERED');
  await expect(page.locator(ROW(1))).toContainText(before);
  await expect(page.locator(ROW(2))).toContainText('NOT RECOVERED');
  await expect(page.locator(ROW(2))).not.toContainText(after);

  const verdict = page.locator('.capture-verdict');
  await expect(verdict).toContainText('Captured before it: 1 session(s), of which Q-Day recovered 1');
  await expect(verdict).toContainText('Captured after it: 1 session(s), of which Q-Day recovered 0');
  await expect(verdict).toContainText('The upgrade did not un-capture anything');
  await expect(verdict).toContainText('2 of 2 stored record(s) hash to exactly what they hashed');
  await expect(page.locator('#capture-status')).toContainText('1 of 2 captured session(s) recovered');
});

test('resetting the exhibit empties the store and re-arms the upgrade', async ({ page }) => {
  await send(page, 'temporary');
  await page.click('#deploy-pqc');
  await page.click('#reset-capture');
  await expect(page.locator('.capture-table')).toHaveCount(0);
  await expect(page.locator('#deploy-pqc')).toBeEnabled();
  await expect(page.locator('#run-qday')).toBeDisabled();
});
