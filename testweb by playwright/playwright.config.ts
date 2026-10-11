import { defineConfig, devices } from '@playwright/test'

const isCI = !!process.env.CI
const PORT = 4173

// Point BASE_URL at a deployed site (e.g. the Vercel build) to test it instead of a local dev server:
//   BASE_URL=https://project-test-playwright.vercel.app npm run test:e2e
const externalBaseURL = process.env.BASE_URL
const baseURL = externalBaseURL ?? `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI
    ? [['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['list'], ['html', { open: 'never' }]],
  expect: { timeout: 5_000 },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  // Start the Vite dev server automatically unless an external BASE_URL was supplied.
  webServer: externalBaseURL
    ? undefined
    : {
        command: `npm run dev -- --host 127.0.0.1 --port ${PORT} --strictPort`,
        url: baseURL,
        reuseExistingServer: !isCI,
        timeout: 60_000,
      },
})
