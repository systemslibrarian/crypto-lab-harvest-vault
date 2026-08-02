import { defineConfig } from '@playwright/test';

/**
 * E2E accessibility gate. Tests run against the production build served by
 * `vite preview`, so what passes here is what actually ships to Pages.
 * Run `npm run build` first (CI does).
 */
// Port is overridable so a local run can dodge a port already taken by another
// lab's preview server. CI leaves it at the default.
const PORT = Number(process.env.PREVIEW_PORT ?? 4223);
const BASE = `http://localhost:${PORT}/crypto-lab-harvest-vault/`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
  projects: [{ name: 'chromium', use: { browserName: 'chromium', colorScheme: 'dark' } }],
  webServer: {
    command: `npm run preview -- --port ${PORT} --strictPort`,
    url: BASE,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: BASE,
    colorScheme: 'dark',
  },
});
