import { test, expect } from '@playwright/test'
import { PROTECTED_ROUTES, screenshot } from './helpers'

test.describe('Unauthenticated — Login Page', () => {
  test('root redirects to /login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/login')
    await screenshot(page, 'unauth-login-redirect')
  })

  test('login page renders branding', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'CurryDash' })).toBeVisible()
    await screenshot(page, 'unauth-login-branding')
  })

  test('login page shows sign-in heading', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Sign in to your account')).toBeVisible()
    await screenshot(page, 'unauth-login-heading')
  })

  test('login page shows magic link form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible()
    await expect(page.getByText('Send Magic Link')).toBeVisible()
    await screenshot(page, 'unauth-login-magic-link-form')
  })

  test('login page shows Google OAuth button', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Continue with Google')).toBeVisible()
    await screenshot(page, 'unauth-login-google-button')
  })

  test('login page shows GitHub OAuth button', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Continue with GitHub')).toBeVisible()
    await screenshot(page, 'unauth-login-github-button')
  })

  test('login page shows usage policy text', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText(/usage policies/)).toBeVisible()
    await screenshot(page, 'unauth-login-usage-policy')
  })

  test('magic link form requires email', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.getByPlaceholder('your@email.com')
    await expect(emailInput).toHaveAttribute('required', '')
    await screenshot(page, 'unauth-login-email-required')
  })

  test('magic link form accepts valid email', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.getByPlaceholder('your@email.com')
    await emailInput.fill('test@example.com')
    await expect(emailInput).toHaveValue('test@example.com')
    await screenshot(page, 'unauth-login-email-valid')
  })
})

test.describe('Unauthenticated — Protected Route Redirects', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route} redirects to /login`, async ({ page }) => {
      await page.goto(route)
      await expect(page).toHaveURL('/login')
      await screenshot(page, `unauth-protected-route-${route.replace(/\//g, '-').substring(1)}`)
    })
  }
})
