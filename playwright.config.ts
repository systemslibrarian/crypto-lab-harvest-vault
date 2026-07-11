import { defineConfig } from '@playwright/test';

/**
 * E2E accessibility gate. Tests run against the production build served by
 * `vite preview`, so what passes here is what actually ships to Pages.
 * Run `npm run build` first (CI does).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
  projects: [{ name: 'chromium', use: { browserName: 'chromium', colorScheme: 'dark' } }],
  webServer: {
    command: 'npm run preview -- --port 4223 --strictPort',
    url: 'http://localhost:4223/crypto-lab-harvest-vault/',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:4223/crypto-lab-harvest-vault/',
    colorScheme: 'dark',
  },
});
