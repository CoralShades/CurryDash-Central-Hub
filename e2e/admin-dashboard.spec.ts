import { test, expect } from '@playwright/test'
import { waitForDashboard, expectWidget, expectPageTitle, screenshot, ROLE_WIDGETS } from './helpers'

test.describe('Admin Dashboard', () => {
  test('loads admin dashboard', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await screenshot(page, 'admin-dashboard-loaded')
    await expectPageTitle(page, 'Admin Dashboard')
  })

  test('displays dashboard grid', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.locator('.dashboard-grid')).toBeVisible()
    await screenshot(page, 'admin-dashboard-grid')
  })

  for (const widgetTitle of ROLE_WIDGETS.admin) {
    test(`renders "${widgetTitle}" widget`, async ({ page }) => {
      await page.goto('/admin')
      await waitForDashboard(page)
      await expectWidget(page, widgetTitle)
      await screenshot(page, `admin-widget-${widgetTitle.toLowerCase().replace(/\s+/g, '-')}`)
    })
  }

  test('sidebar shows admin navigation sections', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    const sidebar = page.locator('aside[aria-label="Main navigation"]')
    await expect(sidebar).toBeVisible()
    await expect(sidebar.getByText('Users')).toBeVisible()
    await expect(sidebar.getByText('Integrations')).toBeVisible()
    await expect(sidebar.getByText('System Health')).toBeVisible()
    await screenshot(page, 'admin-sidebar-navigation')
  })

  test('sidebar shows Dashboard link', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    const sidebar = page.locator('aside[aria-label="Main navigation"]')
    await expect(sidebar.getByText('Dashboard')).toBeVisible()
    await screenshot(page, 'admin-sidebar-dashboard-link')
  })

  test('page header shows user role badge', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await expect(page.locator('header').getByText('admin', { exact: true })).toBeVisible()
    await screenshot(page, 'admin-header-role-badge')
  })
})
