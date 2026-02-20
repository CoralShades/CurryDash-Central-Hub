import { test, expect } from '@playwright/test'
import { screenshot } from './helpers'

test.describe('QA — RBAC Enforcement', () => {
  test('QA can access /qa', async ({ page }) => {
    await page.goto('/qa')
    await expect(page).toHaveURL(/\/qa/)
    await screenshot(page, 'qa-rbac-home')
  })

  test('QA accessing /admin redirects to /qa', async ({ page }) => {
    await page.goto('/admin')
    await page.waitForURL(/\/qa/, { timeout: 10_000 })
    await screenshot(page, 'qa-rbac-admin-redirect')
  })

  test('QA accessing /dev redirects to /qa', async ({ page }) => {
    await page.goto('/dev')
    await page.waitForURL(/\/qa/, { timeout: 10_000 })
    await screenshot(page, 'qa-rbac-dev-redirect')
  })

  test('QA accessing /stakeholder redirects to /qa', async ({ page }) => {
    await page.goto('/stakeholder')
    await page.waitForURL(/\/qa/, { timeout: 10_000 })
    await screenshot(page, 'qa-rbac-stakeholder-redirect')
  })
})
