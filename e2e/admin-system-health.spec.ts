import { test, expect } from '@playwright/test'
import { expectPageTitle } from './helpers'

test.describe('Admin — System Health', () => {
  test('loads system health page', async ({ page }) => {
    await page.goto('/admin/system-health')
    await expectPageTitle(page, 'System Health')
  })

  test('navigable from sidebar', async ({ page }) => {
    await page.goto('/admin')
    const sidebar = page.locator('aside[aria-label="Main navigation"]')
    await sidebar.getByText('System Health').click()
    await expect(page).toHaveURL('/admin/system-health')
  })

  test('displays system health content', async ({ page }) => {
    await page.goto('/admin/system-health')
    await expect(page.locator('main, [role="main"], .dashboard-grid').first()).toBeVisible({
      timeout: 10_000,
    })
  })
})
