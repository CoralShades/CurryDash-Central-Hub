import { type Page, expect } from '@playwright/test'

/** Wait for the dashboard grid to be visible (indicates page fully loaded) */
export async function waitForDashboard(page: Page) {
  await expect(page.locator('.dashboard-grid')).toBeVisible({ timeout: 15_000 })
}

/** Assert a widget card with the given title is present in the dashboard */
export async function expectWidget(page: Page, title: string) {
  await expect(page.getByText(title, { exact: true }).first()).toBeVisible({ timeout: 10_000 })
}

/** Assert the page header h1 contains the given text */
export async function expectPageTitle(page: Page, title: string) {
  await expect(page.locator('header h1')).toHaveText(title)
}

/** Widget titles per role — sourced from widget-registry.ts */
export const ROLE_WIDGETS = {
  admin: [
    'Stories Completed',
    'PRs Merged',
    'Bugs Open',
    'CI Status',
    'Sprint Progress',
    'CI/CD Pipeline',
    'Team Activity',
    'Blockers & Alerts',
    'System Health',
  ],
  developer: [
    'Stories Completed',
    'PRs Merged',
    'Bugs Open',
    'CI Status',
    'Sprint Progress',
    'Pull Requests',
    'CI/CD Pipeline',
    'Blockers & Alerts',
    'Team Activity',
  ],
  qa: [
    'Stories Completed',
    'PRs Merged',
    'Bugs Open',
    'CI Status',
    'Blockers & Alerts',
    'Team Activity',
    'Sprint Progress',
  ],
  stakeholder: [
    'Stories Completed',
    'PRs Merged',
    'Bugs Open',
    'CI Status',
    'Sprint Progress',
    'Pull Requests',
    'Team Activity',
  ],
} as const

/** Role-specific dashboard paths */
export const ROLE_PATHS = {
  admin: '/admin',
  developer: '/dev',
  qa: '/qa',
  stakeholder: '/stakeholder',
} as const

/** Admin sub-page paths */
export const ADMIN_PAGES = {
  users: '/admin/users',
  integrations: '/admin/integrations',
  systemHealth: '/admin/system-health',
} as const

/** Protected routes that require authentication */
export const PROTECTED_ROUTES = [
  '/admin',
  '/admin/users',
  '/admin/integrations',
  '/admin/system-health',
  '/dev',
  '/qa',
  '/stakeholder',
  '/reports',
] as const
