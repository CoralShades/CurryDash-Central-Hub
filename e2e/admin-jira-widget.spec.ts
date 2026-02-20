import { test } from '@playwright/test'
import { waitForDashboard, expectWidget, screenshot } from './helpers'

test.describe('Admin — Jira Widgets', () => {
  test('Sprint Progress widget renders', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await expectWidget(page, 'Sprint Progress')
    await screenshot(page, 'admin-sprint-progress-widget')
  })

  test('Stories Completed widget renders', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await expectWidget(page, 'Stories Completed')
    await screenshot(page, 'admin-stories-completed-widget')
  })

  test('Blockers & Alerts widget renders', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await expectWidget(page, 'Blockers & Alerts')
    await screenshot(page, 'admin-blockers-alerts-widget')
  })
})
