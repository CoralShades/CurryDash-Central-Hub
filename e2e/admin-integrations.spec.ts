import { test, expect } from '@playwright/test'
import { expectPageTitle } from './helpers'

test.describe('Admin — Integrations', () => {
  test('loads integrations page', async ({ page }) => {
    await page.goto('/admin/integrations')
    await expectPageTitle(page, 'Integrations')
  })

  test('navigable from sidebar', async ({ page }) => {
    await page.goto('/admin')
    const sidebar = page.locator('aside[aria-label="Main navigation"]')
    await sidebar.getByText('Integrations').click()
    await expect(page).toHaveURL('/admin/integrations')
  })

  test('displays integration content', async ({ page }) => {
    await page.goto('/admin/integrations')
    // Page should render without error — content depends on integration health component
    await expect(page.locator('main, [role="main"], .dashboard-grid').first()).toBeVisible({
      timeout: 10_000,
    })
  })

  test('sidebar Integrations link is active', async ({ page }) => {
    await page.goto('/admin/integrations')
    const link = page.locator('aside[aria-label="Main navigation"]').getByText('Integrations').locator('..')
    await expect(link).toHaveAttribute('aria-current', 'page')
  })
})
