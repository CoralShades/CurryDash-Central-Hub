import { test, expect } from '@playwright/test'
import { expectPageTitle, screenshot } from './helpers'

test.describe('Admin — System Health', () => {
  test('loads system health page', async ({ page }) => {
    await page.goto('/admin/system-health')
    await expectPageTitle(page, 'System Health')
    await screenshot(page, 'admin-system-health-page')
  })

  test('navigable from sidebar', async ({ page }) => {
    await page.goto('/admin')
    const sidebar = page.locator('aside[aria-label="Main navigation"]')
    await sidebar.getByText('System Health').click()
    await screenshot(page, 'admin-system-health-from-sidebar')
    await expect(page).toHaveURL('/admin/system-health')
  })

  test('displays system health content', async ({ page }) => {
    await page.goto('/admin/system-health')
    await expect(page.locator('main, [role="main"], .dashboard-grid').first()).toBeVisible({
      timeout: 10_000,
    })
    await screenshot(page, 'admin-system-health-content')
  })
})
