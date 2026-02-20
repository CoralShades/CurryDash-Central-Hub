import { test, expect } from '@playwright/test'
import { waitForDashboard, expectWidget, expectPageTitle, screenshot, ROLE_WIDGETS } from './helpers'

test.describe('Developer Dashboard', () => {
  test('loads developer dashboard', async ({ page }) => {
    await page.goto('/dev')
    await waitForDashboard(page)
    await screenshot(page, 'dev-dashboard-loaded')
    await expectPageTitle(page, 'Developer Dashboard')
  })

  test('displays dashboard grid', async ({ page }) => {
    await page.goto('/dev')
    await expect(page.locator('.dashboard-grid')).toBeVisible({ timeout: 15_000 })
    await screenshot(page, 'dev-dashboard-grid')
  })

  for (const widgetTitle of ROLE_WIDGETS.developer) {
    test(`renders "${widgetTitle}" widget`, async ({ page }) => {
      await page.goto('/dev')
      await waitForDashboard(page)
      await expectWidget(page, widgetTitle)
      await screenshot(page, `dev-widget-${widgetTitle.toLowerCase().replace(/\s+/g, '-')}`)
    })
  }

  test('sidebar does NOT show admin navigation', async ({ page }) => {
    await page.goto('/dev')
    await waitForDashboard(page)
    const sidebar = page.locator('aside[aria-label="Main navigation"]')
    await expect(sidebar).toBeVisible()
    // Admin section should be completely absent from DOM for non-admin
    await expect(sidebar.getByText('Users')).not.toBeVisible()
    await expect(sidebar.getByText('System Health')).not.toBeVisible()
    await screenshot(page, 'dev-sidebar-no-admin')
  })

  test('does not show "Read-only" badge', async ({ page }) => {
    await page.goto('/dev')
    await waitForDashboard(page)
    await expect(page.getByText('Read-only')).not.toBeVisible()
    await screenshot(page, 'dev-no-readonly-badge')
  })
})
