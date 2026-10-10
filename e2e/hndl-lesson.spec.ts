import { expect, test } from '@playwright/test';

for (const width of [1280, 390, 320]) {
  test(`recorded-traffic quiz rejects classical PFS and explains both outcomes at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('.');
    const question = page.locator('.quiz-q').nth(2);
    await question.locator('button[data-opt="1"]').click();
    await expect(question.locator('.quiz-explain.bad')).toContainText('Not quite.');
    await expect(question.locator('.quiz-explain')).toContainText('long-term-key compromise');
    await expect(question.locator('.quiz-explain')).toContainText('recorded ephemeral public exchange');
    await question.locator('button[data-opt="0"]').click();
    await expect(question.locator('.quiz-explain.good')).toContainText('Correct.');
    await expect(question.locator('.quiz-explain')).toContainText('present at collection');
    const pfs = page.locator('.mitigation-card').filter({ hasText: 'DEPLOY PERFECT FORWARD SECRECY' });
    await pfs.locator('summary').click();
    await expect(pfs).toContainText('does not stop a quantum attacker');
    await expect(page.locator('#brief-pre')).toContainText('key protection must already be present at collection');
    await expect(page.locator('#brief-pre')).toContainText('long-term-key compromise, not solving recorded ephemeral');
    await expect(page.locator('#brief-pre')).not.toContainText('after forward secrecy / hybrid key exchange is deployed is safe');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
