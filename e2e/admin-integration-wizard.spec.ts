import { test, expect } from '@playwright/test'

/**
 * Integration Setup Wizard E2E tests.
 * Runs in the 'admin' project context (authenticated as admin role).
 * Depends on auth-setup (storageState: e2e/.auth/admin.json).
 */
test.describe('Admin — Integration Setup Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/integrations')
    // Wait for integration cards to render
    await expect(page.locator('[data-testid="integration-card-jira"]').first()).toBeVisible({
      timeout: 15_000,
    })
  })

  // ── Card rendering ───────────────────────────────────────────────────────

  test('Jira card renders with Setup/Re-sync button', async ({ page }) => {
    const jiraCard = page.locator('[data-testid="integration-card-jira"]')
    await expect(jiraCard).toBeVisible()
    const setupBtn = jiraCard.locator('[data-testid="setup-btn-jira"]')
    await expect(setupBtn).toBeVisible()
  })

  test('GitHub card renders with Setup/Re-sync button', async ({ page }) => {
    const githubCard = page.locator('[data-testid="integration-card-github"]')
    await expect(githubCard).toBeVisible()
    const setupBtn = githubCard.locator('[data-testid="setup-btn-github"]')
    await expect(setupBtn).toBeVisible()
  })

  test('Anthropic card has no Setup button', async ({ page }) => {
    const anthropicCard = page.locator('[data-testid="integration-card-anthropic"]')
    await expect(anthropicCard).toBeVisible()
    await expect(anthropicCard.locator('[data-testid^="setup-btn-"]')).toHaveCount(0)
  })

  test('Setup button shows correct label based on sync state', async ({ page }) => {
    // The button shows 'Setup' when no sync has occurred, 'Re-sync' after
    const jiraCard = page.locator('[data-testid="integration-card-jira"]')
    const setupBtn = jiraCard.locator('[data-testid="setup-btn-jira"]')
    // It should be either 'Setup' or 'Re-sync'
    const text = await setupBtn.textContent()
    expect(['Setup', 'Re-sync']).toContain(text?.trim())
  })

  // ── Wizard dialog ────────────────────────────────────────────────────────

  test('Wizard dialog opens when Setup button is clicked (if connected)', async ({ page }) => {
    const jiraCard = page.locator('[data-testid="integration-card-jira"]')
    const setupBtn = jiraCard.locator('[data-testid="setup-btn-jira"]')

    // Only test if button is not disabled (i.e., integration is connected)
    const isDisabled = await setupBtn.getAttribute('disabled')
    if (isDisabled !== null) {
      test.skip()
      return
    }

    await setupBtn.click()
    await expect(page.locator('[data-testid="wizard-dialog"]')).toBeVisible({ timeout: 5_000 })
  })

  test('Wizard shows 4-step stepper when open', async ({ page }) => {
    const jiraCard = page.locator('[data-testid="integration-card-jira"]')
    const setupBtn = jiraCard.locator('[data-testid="setup-btn-jira"]')

    const isDisabled = await setupBtn.getAttribute('disabled')
    if (isDisabled !== null) {
      test.skip()
      return
    }

    await setupBtn.click()
    await expect(page.locator('[data-testid="wizard-stepper"]')).toBeVisible()

    // Should show 4 step indicators
    for (let i = 0; i < 4; i++) {
      await expect(page.locator(`[data-testid="step-${i}"]`)).toBeVisible()
    }
  })

  test('Wizard step 1 shows Test Connection button', async ({ page }) => {
    const jiraCard = page.locator('[data-testid="integration-card-jira"]')
    const setupBtn = jiraCard.locator('[data-testid="setup-btn-jira"]')

    const isDisabled = await setupBtn.getAttribute('disabled')
    if (isDisabled !== null) {
      test.skip()
      return
    }

    await setupBtn.click()
    await expect(page.locator('[data-testid="test-connection-btn"]')).toBeVisible()
  })

  test('Escape key closes the wizard dialog', async ({ page }) => {
    const jiraCard = page.locator('[data-testid="integration-card-jira"]')
    const setupBtn = jiraCard.locator('[data-testid="setup-btn-jira"]')

    const isDisabled = await setupBtn.getAttribute('disabled')
    if (isDisabled !== null) {
      test.skip()
      return
    }

    await setupBtn.click()
    await expect(page.locator('[data-testid="wizard-dialog"]')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="wizard-dialog"]')).not.toBeVisible({ timeout: 3_000 })
  })

  // ── GitHub wizard ────────────────────────────────────────────────────────

  test('GitHub wizard dialog opens and shows repo load UI', async ({ page }) => {
    const githubCard = page.locator('[data-testid="integration-card-github"]')
    const setupBtn = githubCard.locator('[data-testid="setup-btn-github"]')

    const isDisabled = await setupBtn.getAttribute('disabled')
    if (isDisabled !== null) {
      test.skip()
      return
    }

    await setupBtn.click()
    await expect(page.locator('[data-testid="wizard-dialog"]')).toBeVisible({ timeout: 5_000 })
    await expect(page.locator('[data-testid="test-connection-btn"]')).toBeVisible()
  })

  // ── Disabled state ───────────────────────────────────────────────────────

  test('Setup button is disabled when integration is disconnected', async ({ page }) => {
    // Check all integration cards — any disconnected ones should have disabled Setup button
    const cards = await page.locator('[data-testid^="integration-card-"]').all()

    for (const card of cards) {
      const cardTestId = await card.getAttribute('data-testid')
      const integration = cardTestId?.replace('integration-card-', '')
      if (integration === 'anthropic') continue

      const setupBtn = card.locator(`[data-testid="setup-btn-${integration}"]`)
      const exists = await setupBtn.count()
      if (!exists) continue

      // Check if the card shows 'Disconnected' status
      const isDisconnectedCard = await card.getByText('Disconnected').count()
      if (isDisconnectedCard > 0) {
        await expect(setupBtn).toBeDisabled()
      }
    }
  })

  // ── Test Connection buttons ──────────────────────────────────────────────

  test('Each card has a Test Connection button', async ({ page }) => {
    const integrations = ['jira', 'github', 'anthropic']
    for (const integration of integrations) {
      const card = page.locator(`[data-testid="integration-card-${integration}"]`)
      await expect(card.locator(`[data-testid="test-connection-${integration}"]`)).toBeVisible()
    }
  })
})
