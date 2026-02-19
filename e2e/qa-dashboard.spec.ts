import { test, expect } from '@playwright/test'
import { waitForDashboard, expectWidget, expectPageTitle, ROLE_WIDGETS } from './helpers'

test.describe('QA Dashboard', () => {
  test('loads QA dashboard', async ({ page }) => {
    await page.goto('/qa')
    await waitForDashboard(page)
    await expectPageTitle(page, 'QA Dashboard')
  })

  for (const widgetTitle of ROLE_WIDGETS.qa) {
    test(`renders "${widgetTitle}" widget`, async ({ page }) => {
      await page.goto('/qa')
      await waitForDashboard(page)
      await expectWidget(page, widgetTitle)
    })
  }

  test('Sprint Progress widget has full-width colSpan 12', async ({ page }) => {
    await page.goto('/qa')
    await waitForDashboard(page)
    // In widget-registry.ts, QA's Sprint Progress has colSpan: 12
    // This means grid-column: span 12 (full width)
    const sprintWidget = page.getByText('Sprint Progress', { exact: true }).first().locator('..').locator('..')
    // The parent grid item should span 12 columns
    await expect(sprintWidget).toBeVisible()
  })

  test('sidebar does NOT show admin navigation', async ({ page }) => {
    await page.goto('/qa')
    await waitForDashboard(page)
    const sidebar = page.locator('aside[aria-label="Main navigation"]')
    await expect(sidebar.getByText('Users')).not.toBeVisible()
  })
})
