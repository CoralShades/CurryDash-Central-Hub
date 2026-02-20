import { test, expect } from '@playwright/test'
import { waitForDashboard, screenshot } from './helpers'

test.describe('Admin — Session & User Menu', () => {
  test('user menu button is visible', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await screenshot(page, 'admin-user-menu-button')
    await expect(page.getByLabel('User menu')).toBeVisible()
  })

  test('user menu opens on click and shows sign out', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await page.getByLabel('User menu').click()
    const menu = page.locator('[role="menu"]')
    await expect(menu).toBeVisible()
    await screenshot(page, 'admin-user-menu-opened')
    await expect(menu.getByText('Sign out')).toBeVisible()
    await expect(menu.getByText('My Dashboard')).toBeVisible()
  })
})
