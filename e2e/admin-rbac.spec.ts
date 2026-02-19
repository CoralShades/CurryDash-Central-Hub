import { test, expect } from '@playwright/test'

test.describe('Admin — RBAC Enforcement', () => {
  test('admin can access /admin', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL('/admin')
    await expect(page.locator('header h1')).toHaveText('Admin Dashboard')
  })

  test('admin can access /admin/users', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page).toHaveURL('/admin/users')
  })

  test('admin can access /admin/integrations', async ({ page }) => {
    await page.goto('/admin/integrations')
    await expect(page).toHaveURL('/admin/integrations')
  })

  test('admin can access /admin/system-health', async ({ page }) => {
    await page.goto('/admin/system-health')
    await expect(page).toHaveURL('/admin/system-health')
  })
})
