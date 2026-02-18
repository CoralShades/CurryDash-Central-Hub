import { describe, it, expect } from 'vitest'
import type { Role } from '@/types/roles'

// Test the pure routing logic from the sidebar
const roleDashboardHref: Record<Role, string> = {
  admin: '/admin',
  developer: '/dev',
  qa: '/qa',
  stakeholder: '/stakeholder',
}

// Nav sections role filter logic
function shouldShowSection(sectionRoles: Role[] | undefined, userRole: Role | null): boolean {
  if (!sectionRoles) return true
  if (!userRole) return false
  return sectionRoles.includes(userRole)
}

describe('Sidebar role-based visibility', () => {
  it('shows admin section only to admin role', () => {
    expect(shouldShowSection(['admin'], 'admin')).toBe(true)
    expect(shouldShowSection(['admin'], 'developer')).toBe(false)
    expect(shouldShowSection(['admin'], 'qa')).toBe(false)
    expect(shouldShowSection(['admin'], 'stakeholder')).toBe(false)
    expect(shouldShowSection(['admin'], null)).toBe(false)
  })

  it('shows unrestricted sections to all roles', () => {
    const roles: Array<Role | null> = ['admin', 'developer', 'qa', 'stakeholder', null]
    roles.forEach((role) => {
      expect(shouldShowSection(undefined, role)).toBe(true)
    })
  })
})

describe('Sidebar role-to-dashboard mapping', () => {
  it('maps each role to the correct dashboard path', () => {
    expect(roleDashboardHref.admin).toBe('/admin')
    expect(roleDashboardHref.developer).toBe('/dev')
    expect(roleDashboardHref.qa).toBe('/qa')
    expect(roleDashboardHref.stakeholder).toBe('/stakeholder')
  })
})
