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
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'on',
  },
  projects: [
    // Unauthenticated tests — no auth required (login page, docs)
    {
      name: 'unauthenticated',
      testMatch: /unauth-.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Docs tests — no auth required (Fumadocs public pages)
    {
      name: 'docs',
      testMatch: /docs.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    // Admin tests
    {
      name: 'admin',
      testMatch: /admin-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'admin.json'),
      },
    },
    // Developer tests
    {
      name: 'developer',
      testMatch: /dev-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'developer.json'),
      },
    },
    // QA tests
    {
      name: 'qa',
      testMatch: /qa-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'qa.json'),
      },
    },
    // Stakeholder tests
    {
      name: 'stakeholder',
      testMatch: /stakeholder-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'stakeholder.json'),
      },
    },
    // Reports — all roles (matched by reports-all-roles.spec.ts pattern)
    {
      name: 'reports-admin',
      testMatch: /reports-all-roles\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'admin.json'),
      },
    },
    {
      name: 'reports-developer',
      testMatch: /reports-all-roles\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'developer.json'),
      },
    },
    {
      name: 'reports-qa',
      testMatch: /reports-all-roles\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(authDir, 'qa.json'),
      },
    },
    {
      name: 'reports-stakeholder',
      testMatch: /reports-all-roles\.spec\.ts/,
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
