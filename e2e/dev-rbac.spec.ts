import { test, expect } from '@playwright/test'

test.describe('Developer — RBAC Enforcement', () => {
  test('developer accessing /admin redirects to /dev', async ({ page }) => {
    await page.goto('/admin')
    // Middleware should redirect developer to their home dashboard
    await expect(page).toHaveURL('/dev')
  })

  test('developer accessing /admin/users redirects to /dev', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page).toHaveURL('/dev')
  })

  test('developer can access /dev', async ({ page }) => {
    await page.goto('/dev')
    await expect(page).toHaveURL('/dev')
    await expect(page.locator('header h1')).toHaveText('Developer Dashboard')
  })
})
