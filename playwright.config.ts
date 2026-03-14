import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

// Load the .env.local file
dotenv.config({ path: path.resolve(__dirname, '.env.local') })

const BASE_URL = 'http://localhost:3000'
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 2,
  reporter: 'html',
  outputDir: './e2e/out',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  globalSetup: require.resolve('./e2e/global.setup.ts'),
  globalTeardown: require.resolve('./e2e/global.teardown.ts'),

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 2560, height: 1440 },
        storageState: './e2e/storage/session.json',
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run start',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
  },
})
