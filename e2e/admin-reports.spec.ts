import { test, expect } from '@playwright/test'
import { screenshot } from './helpers'

test.describe('Admin — Reports Page', () => {
  test('loads reports page', async ({ page }) => {
    await page.goto('/reports')
    await expect(page.locator('main, [role="main"]').first()).toBeVisible({ timeout: 10_000 })
    await screenshot(page, 'admin-reports-page')
  })

  test('reports page is accessible to admin', async ({ page }) => {
    await page.goto('/reports')
    // Should not redirect away — admin has access to reports
    await expect(page).not.toHaveURL('/login')
    await screenshot(page, 'admin-reports-accessible')
  })

  test('reports page renders content', async ({ page }) => {
    await page.goto('/reports')
    // The reports page should have some content visible (role-tailored summaries)
    await expect(page.locator('body')).not.toBeEmpty()
    await screenshot(page, 'admin-reports-content')
  })
})
