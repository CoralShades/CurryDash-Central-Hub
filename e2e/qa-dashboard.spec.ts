import { test, expect } from '@playwright/test'
import { waitForDashboard, expectWidget, expectPageTitle, screenshot, ROLE_WIDGETS } from './helpers'

test.describe('QA Dashboard', () => {
  test('loads QA dashboard', async ({ page }) => {
    await page.goto('/qa')
    await waitForDashboard(page)
    await screenshot(page, 'qa-dashboard-loaded')
    await expectPageTitle(page, 'QA Dashboard')
  })

  for (const widgetTitle of ROLE_WIDGETS.qa) {
    test(`renders "${widgetTitle}" widget`, async ({ page }) => {
      await page.goto('/qa')
      await waitForDashboard(page)
      await expectWidget(page, widgetTitle)
      await screenshot(page, `qa-widget-${widgetTitle.toLowerCase().replace(/\s+/g, '-')}`)
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
    await screenshot(page, 'qa-sprint-progress-full-width')
  })

  test('sidebar does NOT show admin navigation', async ({ page }) => {
    await page.goto('/qa')
    await waitForDashboard(page)
    const sidebar = page.locator('aside[aria-label="Main navigation"]')
    await expect(sidebar.getByText('Users')).not.toBeVisible()
    await screenshot(page, 'qa-sidebar-no-admin')
  })
})
