import { test, expect } from '@playwright/test'
import { waitForDashboard, screenshot } from './helpers'

test.describe('Admin — AI Sidebar', () => {
  test('AI toggle button is visible', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await screenshot(page, 'admin-ai-toggle-button')
    await expect(page.getByLabel(/AI assistant/)).toBeVisible()
  })

  test('AI toggle button has correct initial label', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await screenshot(page, 'admin-ai-button-label')
    await expect(page.getByLabel('Open AI assistant (Cmd+K)')).toBeVisible()
  })

  test('clicking AI toggle opens sidebar', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    await page.getByLabel('Open AI assistant (Cmd+K)').click()
    await screenshot(page, 'admin-ai-sidebar-opened')
    // After toggle, the label should change to "Close"
    await expect(page.getByLabel('Close AI assistant (Cmd+K)')).toBeVisible()
  })

  test('clicking AI toggle again closes sidebar', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    // Open
    await page.getByLabel('Open AI assistant (Cmd+K)').click()
    await expect(page.getByLabel('Close AI assistant (Cmd+K)')).toBeVisible()
    // Close
    await page.getByLabel('Close AI assistant (Cmd+K)').click()
    await screenshot(page, 'admin-ai-sidebar-closed')
    await expect(page.getByLabel('Open AI assistant (Cmd+K)')).toBeVisible()
  })

  test('Cmd+K keyboard shortcut toggles sidebar', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    // Press Cmd+K (Meta+K on Mac, Ctrl+K elsewhere)
    await page.keyboard.press('Control+k')
    await screenshot(page, 'admin-ai-keyboard-shortcut')
    await expect(page.getByLabel('Close AI assistant (Cmd+K)')).toBeVisible()
    // Press again to close
    await page.keyboard.press('Control+k')
    await expect(page.getByLabel('Open AI assistant (Cmd+K)')).toBeVisible()
  })

  test('AI toggle button has aria-pressed attribute', async ({ page }) => {
    await page.goto('/admin')
    await waitForDashboard(page)
    const btn = page.getByLabel('Open AI assistant (Cmd+K)')
    await expect(btn).toHaveAttribute('aria-pressed', 'false')
    await btn.click()
    await screenshot(page, 'admin-ai-aria-pressed')
    await expect(page.getByLabel('Close AI assistant (Cmd+K)')).toHaveAttribute('aria-pressed', 'true')
  })
})
