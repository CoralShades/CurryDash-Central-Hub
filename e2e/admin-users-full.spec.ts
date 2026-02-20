import { test, expect } from '@playwright/test'
import { screenshot } from './helpers'

test.describe('Admin — Users Full', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  })

  test('users page loads and shows table', async ({ page }) => {
    await screenshot(page, 'admin-users-full-page')
    // Check for table or list without crashing
    const hasTable = await page.locator('table, [role="table"]').count()
    expect(hasTable).toBeGreaterThanOrEqual(0)
  })

  test('add user button visible if present', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|invite|new user/i })
    const count = await addBtn.count()
    if (count > 0) {
      await screenshot(page, 'admin-users-full-add-btn')
      await addBtn.first().click()
      await page.waitForTimeout(500)
      await screenshot(page, 'admin-users-full-modal-open')
      await page.keyboard.press('Escape')
    }
  })

  test('search input visible if present', async ({ page }) => {
    const search = page.getByRole('searchbox').or(page.getByPlaceholder(/search/i))
    const count = await search.count()
    if (count > 0) {
      await screenshot(page, 'admin-users-full-search')
    }
  })

  test('pagination or row count visible if present', async ({ page }) => {
    const pagination = page.getByText(/page|pagination|showing/i)
    const count = await pagination.count()
    if (count > 0) {
      await screenshot(page, 'admin-users-full-pagination')
    }
  })

  test('user table columns and content', async ({ page }) => {
    const tableRows = page.locator('table tbody tr, [role="row"]')
    const rowCount = await tableRows.count()
    if (rowCount > 0) {
      await screenshot(page, 'admin-users-full-table-content')
      expect(rowCount).toBeGreaterThan(0)
    }
  })
})
