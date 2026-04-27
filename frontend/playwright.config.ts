import { defineConfig, devices } from '@playwright/test';

const frontendBaseUrl = 'http://127.0.0.1:4173';
const reuseExistingFrontendServer = process.env.PLAYWRIGHT_REUSE_SERVER === '1';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: frontendBaseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173 --strictPort',
    url: frontendBaseUrl,
    reuseExistingServer: reuseExistingFrontendServer,
  },
});
