import { test as setup } from '@playwright/test'
import path from 'path'

const authDir = path.join(__dirname, '.auth')

/**
 * Role-based auth setup for Playwright E2E tests.
 *
 * Each role requires a separate GitHub account. Set credentials in .env.local:
 *   E2E_ADMIN_GITHUB_USER / E2E_ADMIN_GITHUB_PASS
 *   E2E_DEV_GITHUB_USER   / E2E_DEV_GITHUB_PASS
 *   E2E_QA_GITHUB_USER    / E2E_QA_GITHUB_PASS
 *   E2E_STAKE_GITHUB_USER / E2E_STAKE_GITHUB_PASS
 *
 * Alternatively, run each role setup manually:
 *   1. npm run dev
 *   2. Go to /login in the browser
 *   3. Click "Continue with GitHub"
 *   4. Log in with the appropriate GitHub account
 *   5. Copy the saved state from e2e/.auth/{role}.json
 */

const roles = [
  {
    name: 'admin',
    userEnv: 'E2E_ADMIN_GITHUB_USER',
    passEnv: 'E2E_ADMIN_GITHUB_PASS',
  },
  {
    name: 'developer',
    userEnv: 'E2E_DEV_GITHUB_USER',
    passEnv: 'E2E_DEV_GITHUB_PASS',
  },
  {
    name: 'qa',
    userEnv: 'E2E_QA_GITHUB_USER',
    passEnv: 'E2E_QA_GITHUB_PASS',
  },
  {
    name: 'stakeholder',
    userEnv: 'E2E_STAKE_GITHUB_USER',
    passEnv: 'E2E_STAKE_GITHUB_PASS',
  },
] as const

for (const role of roles) {
  setup(`authenticate as ${role.name}`, async ({ page }) => {
    const username = process.env[role.userEnv]
    const password = process.env[role.passEnv]

    if (!username || !password) {
      setup.skip(
        !username || !password,
        `Skipping ${role.name} auth: set ${role.userEnv} and ${role.passEnv} in .env.local`
      )
      return
    }

    // Navigate to login page
    await page.goto('/login')

    // Click "Continue with GitHub"
    await page.getByText('Continue with GitHub').click()

    // Handle GitHub OAuth login page
    await page.waitForURL(/github\.com/, { timeout: 10_000 })

    // Fill GitHub credentials
    await page.getByLabel('Username or email address').fill(username)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Handle authorization screen if it appears (first-time only)
    const authorizeButton = page.getByRole('button', { name: /Authorize/i })
    if (await authorizeButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await authorizeButton.click()
    }

    // Wait for redirect back to the app dashboard
    await page.waitForURL(/localhost:3000\/(admin|dev|qa|stakeholder)/, {
      timeout: 15_000,
    })

    // Save authenticated state
    const storagePath = path.join(authDir, `${role.name}.json`)
    await page.context().storageState({ path: storagePath })
  })
}
