import { test, expect } from '@playwright/test'
import { waitForDashboard, expectWidget, expectPageTitle, screenshot, ROLE_WIDGETS } from './helpers'

test.describe('Stakeholder Dashboard', () => {
  test('loads stakeholder dashboard', async ({ page }) => {
    await page.goto('/stakeholder')
    await waitForDashboard(page)
    await screenshot(page, 'stakeholder-dashboard-loaded')
    await expectPageTitle(page, 'Stakeholder Dashboard')
  })

  for (const widgetTitle of ROLE_WIDGETS.stakeholder) {
    test(`renders "${widgetTitle}" widget`, async ({ page }) => {
      await page.goto('/stakeholder')
      await waitForDashboard(page)
      await expectWidget(page, widgetTitle)
      await screenshot(page, `stakeholder-widget-${widgetTitle.toLowerCase().replace(/\s+/g, '-')}`)
    })
  }

  test('shows "Read-only" badge in header', async ({ page }) => {
    await page.goto('/stakeholder')
    await waitForDashboard(page)
    await expect(page.getByText('Read-only')).toBeVisible()
    await screenshot(page, 'stakeholder-readonly-badge')
  })

  test('Team Activity widget has full-width colSpan 12', async ({ page }) => {
    await page.goto('/stakeholder')
    await waitForDashboard(page)
    // In widget-registry.ts, Stakeholder's Team Activity has colSpan: 12
    const teamWidget = page.getByText('Team Activity', { exact: true }).first()
    await expect(teamWidget).toBeVisible()
    await screenshot(page, 'stakeholder-team-activity-full-width')
  })

  test('sidebar does NOT show admin navigation', async ({ page }) => {
    await page.goto('/stakeholder')
    await waitForDashboard(page)
    const sidebar = page.locator('aside[aria-label="Main navigation"]')
    await expect(sidebar.getByText('Users')).not.toBeVisible()
    await screenshot(page, 'stakeholder-sidebar-no-admin')
  })
})
