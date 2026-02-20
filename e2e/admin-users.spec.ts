import { test, expect } from '@playwright/test'
import { expectPageTitle, screenshot } from './helpers'

test.describe('Admin — User Management', () => {
  test('loads user management page', async ({ page }) => {
    await page.goto('/admin/users')
    await expectPageTitle(page, 'User Management')
    await screenshot(page, 'admin-users-page')
  })

  test('displays user table', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page.locator('table').first()).toBeVisible({ timeout: 10_000 })
    await screenshot(page, 'admin-users-table')
  })

  test('table has role column', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page.locator('table').first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Role', { exact: true }).first()).toBeVisible()
    await screenshot(page, 'admin-users-role-column')
  })

  test('table has email column', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page.locator('table').first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Email', { exact: true }).first()).toBeVisible()
    await screenshot(page, 'admin-users-email-column')
  })

  test('navigable from sidebar', async ({ page }) => {
    await page.goto('/admin')
    const sidebar = page.locator('aside[aria-label="Main navigation"]')
    await sidebar.getByText('Users').click()
    await screenshot(page, 'admin-users-from-sidebar')
    await expect(page).toHaveURL('/admin/users')
    await expectPageTitle(page, 'User Management')
  })

  test('sidebar Users link is active on users page', async ({ page }) => {
    await page.goto('/admin/users')
    const usersLink = page.locator('aside[aria-label="Main navigation"]').getByText('Users').locator('..')
    await expect(usersLink).toHaveAttribute('aria-current', 'page')
    await screenshot(page, 'admin-users-active-link')
  })
})
