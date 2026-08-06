import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * WCAG regression gate. Deploys are already gated on correctness; this gates
 * them on accessibility the same way. Scans the full page in both themes with
 * every collapsible region expanded and animations neutralized.
 *
 * The page renders a single view (no routing). Its <details> mitigation cards
 * are collapsed by default, so we open every <details> before scanning. We also
 * clear any inline display:none and neutralize animations/transitions so nothing
 * is scanned mid-flight (the hero "acts" strip cycles opacity on a loop).
 */

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function neutralizeMotion(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

async function revealAll(page: Page): Promise<void> {
  await page.evaluate(() => {
    for (const details of document.querySelectorAll('details')) {
      (details as HTMLDetailsElement).open = true;
    }
    for (const el of document.querySelectorAll<HTMLElement>('[style*="display"]')) {
      if (el.style && el.style.display === 'none') el.style.display = '';
    }
  });
}

async function scan(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const summary = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.map((n) => n.target.join(' ')).slice(0, 5),
  }));
  expect(summary).toEqual([]);
}

async function checkGradientContrast(page: Page): Promise<void> {
  const contrastRatio = await page.evaluate(() => {
    function getLuminance(r: number, g: number, b: number) {
      const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }
    function parseRGB(color: string) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      return match ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])] : [0, 0, 0];
    }
    const divBg = document.createElement('div');
    divBg.style.color = 'var(--bg)';
    document.body.appendChild(divBg);
    const divText = document.createElement('div');
    divText.style.color = 'var(--text)';
    document.body.appendChild(divText);
    const bgRgb = getComputedStyle(divBg).color;
    const textRgb = getComputedStyle(divText).color;
    divBg.remove();
    divText.remove();
    const [bgR, bgG, bgB] = parseRGB(bgRgb);
    const [txtR, txtG, txtB] = parseRGB(textRgb);
    const lBg = getLuminance(bgR, bgG, bgB);
    const lTxt = getLuminance(txtR, txtG, txtB);
    const lighter = Math.max(lBg, lTxt);
    const darker = Math.min(lBg, lTxt);
    return (lighter + 0.05) / (darker + 0.05);
  });
  expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
}

async function runSuite(page: Page): Promise<void> {
  await revealAll(page);
  await neutralizeMotion(page);
  await expect(page.locator('h1')).toBeVisible();
  await scan(page);
  await checkGradientContrast(page);
}

test('no WCAG A/AA violations in dark theme', async ({ page }) => {
  await page.goto('.');
  await runSuite(page);
});

test('no WCAG A/AA violations in light theme', async ({ page }) => {
  await page.goto('.');
  await page.locator('#cl-theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await runSuite(page);
});
