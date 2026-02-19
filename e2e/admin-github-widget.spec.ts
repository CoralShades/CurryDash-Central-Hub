import { test } from '@playwright/test'
import { waitForDashboard, expectWidget } from './helpers'

test.describe('Admin — GitHub Widgets', () => {
  test('PRs Merged widget renders', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await expectWidget(page, 'PRs Merged')
  })

  test('CI/CD Pipeline widget renders', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await expectWidget(page, 'CI/CD Pipeline')
  })

  test('CI Status widget renders', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await expectWidget(page, 'CI Status')
  })
})
