import { defineConfig, devices } from '@playwright/test'
import path from 'path'

const authDir = path.join(__dirname, 'e2e', '.auth')

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    // Auth setup — runs first, saves storageState per role
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Unauthenticated tests — no auth required
    {
      name: 'unauthenticated',
      testMatch: /unauth-.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Admin tests — depend on auth setup
    {
      name: 'admin',
      testMatch: /admin-.*\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'admin.json'),
      },
    },
    // Developer tests — depend on auth setup
    {
      name: 'developer',
      testMatch: /dev-.*\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'developer.json'),
      },
    },
    // QA tests — depend on auth setup
    {
      name: 'qa',
      testMatch: /qa-.*\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'qa.json'),
      },
    },
    // Stakeholder tests — depend on auth setup
    {
      name: 'stakeholder',
      testMatch: /stakeholder-.*\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'stakeholder.json'),
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
