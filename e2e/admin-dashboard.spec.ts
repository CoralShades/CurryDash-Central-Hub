import { test, expect } from '@playwright/test'
import { waitForDashboard, expectWidget, expectPageTitle, ROLE_WIDGETS } from './helpers'

test.describe('Admin Dashboard', () => {
  test('loads admin dashboard', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await expectPageTitle(page, 'Admin Dashboard')
  })

  test('displays dashboard grid', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.locator('.dashboard-grid')).toBeVisible()
  })

  for (const widgetTitle of ROLE_WIDGETS.admin) {
    test(`renders "${widgetTitle}" widget`, async ({ page }) => {
      await page.goto('/admin')
      await waitForDashboard(page)
      await expectWidget(page, widgetTitle)
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
  })

  test('sidebar shows Dashboard link', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    const sidebar = page.locator('aside[aria-label="Main navigation"]')
    await expect(sidebar.getByText('Dashboard')).toBeVisible()
  })

  test('page header shows user role badge', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await expect(page.locator('header').getByText('admin', { exact: false })).toBeVisible()
  })
})
