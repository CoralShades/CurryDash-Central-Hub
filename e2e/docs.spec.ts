import { test, expect } from '@playwright/test'
import { screenshot, DOC_ROUTES } from './helpers'

test.describe('Documentation — Public Pages', () => {
  test('docs home page loads', async ({ page }) => {
    await page.goto('/docs')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
    await screenshot(page, 'docs-home')
  })

  test('docs getting-started page loads', async ({ page }) => {
    await page.goto('/docs/getting-started')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
    await screenshot(page, 'docs-getting-started')
  })

  test('docs central-hub page loads', async ({ page }) => {
    await page.goto('/docs/central-hub')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
    await screenshot(page, 'docs-central-hub')
  })
})
