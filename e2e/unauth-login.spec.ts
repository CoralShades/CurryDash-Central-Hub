import { test, expect } from '@playwright/test'
import { PROTECTED_ROUTES } from './helpers'

test.describe('Unauthenticated — Login Page', () => {
  test('root redirects to /login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/login')
  })

  test('login page renders branding', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('CurryDash Central Hub')).toBeVisible()
  })

  test('login page shows sign-in heading', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Sign in to your account')).toBeVisible()
  })

  test('login page shows magic link form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible()
    await expect(page.getByText('Send Magic Link')).toBeVisible()
  })

  test('login page shows Google OAuth button', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Continue with Google')).toBeVisible()
  })

  test('login page shows GitHub OAuth button', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Continue with GitHub')).toBeVisible()
  })

  test('login page shows usage policy text', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText(/usage policies/)).toBeVisible()
  })

  test('magic link form requires email', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.getByPlaceholder('your@email.com')
    await expect(emailInput).toHaveAttribute('required', '')
  })

  test('magic link form accepts valid email', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.getByPlaceholder('your@email.com')
    await emailInput.fill('test@example.com')
    await expect(emailInput).toHaveValue('test@example.com')
  })
})

test.describe('Unauthenticated — Protected Route Redirects', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route} redirects to /login`, async ({ page }) => {
      await page.goto(route)
      await expect(page).toHaveURL('/login')
    })
  }
})
