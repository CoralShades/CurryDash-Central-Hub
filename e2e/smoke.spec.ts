import { test, expect } from '@playwright/test'

test('root page redirects to login', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL('/login')
})

test('login page renders', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByText('CurryDash Central Hub')).toBeVisible()
})
