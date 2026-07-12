/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/crypto-lab-harvest-vault/',
  test: {
    // Unit tests only — the Playwright a11y suite lives in e2e/ and must not be
    // collected by vitest (it needs a browser + running preview server).
    include: ['src/**/*.test.ts'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    environment: 'node',
  },
});
