import { defineConfig } from '@playwright/test';

// Web E2E tests. (Maestro is a MOBILE-only tool, so Playwright is the correct
// equivalent for this React web app.)
export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  use: { baseURL: 'http://localhost:5173', headless: true },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
