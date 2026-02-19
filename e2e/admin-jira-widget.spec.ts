import { test } from '@playwright/test'
import { waitForDashboard, expectWidget } from './helpers'

test.describe('Admin — Jira Widgets', () => {
  test('Sprint Progress widget renders', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await expectWidget(page, 'Sprint Progress')
  })

  test('Stories Completed widget renders', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await expectWidget(page, 'Stories Completed')
  })

  test('Blockers & Alerts widget renders', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await expectWidget(page, 'Blockers & Alerts')
  })
})
