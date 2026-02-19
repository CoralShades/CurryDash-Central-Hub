import { test, expect } from '@playwright/test'
import { waitForDashboard, expectWidget, expectPageTitle, ROLE_WIDGETS } from './helpers'

test.describe('Developer Dashboard', () => {
  test('loads developer dashboard', async ({ page }) => {
    await page.goto('/dev')
    await waitForDashboard(page)
    await expectPageTitle(page, 'Developer Dashboard')
  })

  test('displays dashboard grid', async ({ page }) => {
    await page.goto('/dev')
    await expect(page.locator('.dashboard-grid')).toBeVisible({ timeout: 15_000 })
  })

  for (const widgetTitle of ROLE_WIDGETS.developer) {
    test(`renders "${widgetTitle}" widget`, async ({ page }) => {
      await page.goto('/dev')
      await waitForDashboard(page)
      await expectWidget(page, widgetTitle)
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
  })

  test('does not show "Read-only" badge', async ({ page }) => {
    await page.goto('/dev')
    await waitForDashboard(page)
    await expect(page.getByText('Read-only')).not.toBeVisible()
  })
})
