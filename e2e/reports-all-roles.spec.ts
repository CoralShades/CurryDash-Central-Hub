import { test, expect } from '@playwright/test'
import { screenshot } from './helpers'

test.describe('Reports — Accessible by All Roles', () => {
  test('reports page loads and shows heading', async ({ page }) => {
    await page.goto('/reports')
    await expect(page).not.toHaveURL(/\/login/)
    await expect(
      page.getByRole('heading').first()
    ).toBeVisible({ timeout: 15_000 })
    await screenshot(page, 'reports-all-roles-page')
  })
})
