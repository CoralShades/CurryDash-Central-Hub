import { test } from '@playwright/test'
import { waitForDashboard, expectWidget, screenshot } from './helpers'

test.describe('Admin — GitHub Widgets', () => {
  test('PRs Merged widget renders', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await expectWidget(page, 'PRs Merged')
    await screenshot(page, 'admin-prs-merged-widget')
  })

  test('CI/CD Pipeline widget renders', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await expectWidget(page, 'CI/CD Pipeline')
    await screenshot(page, 'admin-cicd-pipeline-widget')
  })

  test('CI Status widget renders', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await expectWidget(page, 'CI Status')
    await screenshot(page, 'admin-ci-status-widget')
  })
})
