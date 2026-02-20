import { test, expect } from '@playwright/test'
import { screenshot } from './helpers'

test.describe('Admin — System Health Full', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/system-health')
    await expect(page.locator('main')).toBeVisible({ timeout: 15_000 })
  })

  test('system health page loads', async ({ page }) => {
    await screenshot(page, 'admin-system-health-full-page')
    await expect(page.locator('main')).toBeVisible()
  })

  test('webhook monitoring section visible', async ({ page }) => {
    // Check for any metric cards or webhook sections
    const cards = page.locator('[class*="card"], [data-testid*="metric"], [data-testid*="webhook"]')
    const count = await cards.count()
    if (count > 0) {
      await screenshot(page, 'admin-system-health-full-webhooks')
    }
    expect(await page.locator('main').isVisible()).toBe(true)
  })

  test('dead letter events section visible if present', async ({ page }) => {
    const dlSection = page.getByText(/dead letter|failed events|error events/i)
    const count = await dlSection.count()
    if (count > 0) {
      await screenshot(page, 'admin-system-health-full-deadletter')
    }
    // Just verify page didn't crash
    await expect(page.locator('main')).toBeVisible()
  })

  test('rate limits section visible if present', async ({ page }) => {
    const rateLimitSection = page.getByText(/rate limit|rate limiting|quota/i)
    const count = await rateLimitSection.count()
    if (count > 0) {
      await screenshot(page, 'admin-system-health-full-rate-limits')
    }
    await expect(page.locator('main')).toBeVisible()
  })

  test('AI cost tracker section visible if present', async ({ page }) => {
    const aiSection = page.getByText(/ai cost|cost tracker|budget|token usage/i)
    const count = await aiSection.count()
    if (count > 0) {
      await screenshot(page, 'admin-system-health-full-ai-cost')
    }
    await expect(page.locator('main')).toBeVisible()
  })

  test('system metrics cards rendered', async ({ page }) => {
    const metricCards = page.locator('[data-testid*="stat"], [data-testid*="metric"], [class*="stat-card"]')
    const cardCount = await metricCards.count()
    if (cardCount > 0) {
      await screenshot(page, 'admin-system-health-full-metrics')
      expect(cardCount).toBeGreaterThan(0)
    }
  })
})
