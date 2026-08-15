import { defineConfig } from '@playwright/test';

/**
 * E2E accessibility gate. Tests run against the production build served by
 * `vite preview`, so what passes here is what actually ships to Pages.
 * The build runs as part of the webServer command, so a run always tests the
 * current source rather than whatever bundle happens to be sitting in dist/.
 */
// Must be unique across the crypto-lab fleet. `reuseExistingServer` adopts
// whatever already listens here, so a shared port lets this suite scan a
// sibling lab's page and report its findings as ours. The previous default was
// held by two other labs at once, crypto-lab-ibe-gate and the demo inside
// crypto-lab-dead-sea-cipher. PREVIEW_PORT stays as a local escape hatch, but
// it is not the fix: CI and every unprimed local run use the committed
// default, so that is what has to be unique.
const PORT = Number(process.env.PREVIEW_PORT ?? 4679);
const BASE = `http://localhost:${PORT}/crypto-lab-harvest-vault/`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
  projects: [{ name: 'chromium', use: { browserName: 'chromium', colorScheme: 'dark' } }],
  webServer: {
    // Build first: `vite preview` only serves the existing dist/, so without
    // this a broken build leaves the last good bundle in place and the suite
    // passes green against source that no longer compiles.
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: BASE,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: BASE,
    colorScheme: 'dark',
  },
});
