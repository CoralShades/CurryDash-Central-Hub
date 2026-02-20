import { test, expect } from '@playwright/test'
import { screenshot } from './helpers'

test.describe('Stakeholder — RBAC Enforcement', () => {
  test('stakeholder accessing /admin redirects to /stakeholder', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL('/stakeholder')
    await screenshot(page, 'stakeholder-rbac-admin-redirect')
  })

  test('stakeholder accessing /dev redirects to /stakeholder', async ({ page }) => {
    await page.goto('/dev')
    await expect(page).toHaveURL('/stakeholder')
    await screenshot(page, 'stakeholder-rbac-dev-redirect')
  })

  test('stakeholder can access /stakeholder', async ({ page }) => {
    await page.goto('/stakeholder')
    await expect(page).toHaveURL('/stakeholder')
    await expect(page.locator('header h1')).toHaveText('Stakeholder Dashboard')
    await screenshot(page, 'stakeholder-rbac-access')
  })
})
