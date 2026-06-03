import { defineConfig, devices } from '@playwright/test';

const frontendBaseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173';
const reuseExistingFrontendServer = process.env.PLAYWRIGHT_REUSE_SERVER === '1';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'html' : [['list']],
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
  ],

  webServer: reuseExistingFrontendServer
    ? undefined
    : {
        command: 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',
        url: frontendBaseUrl,
        reuseExistingServer: !!reuseExistingFrontendServer,
      },
});
