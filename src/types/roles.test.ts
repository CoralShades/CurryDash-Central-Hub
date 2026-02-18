import { describe, it, expect } from 'vitest'
import { ROLES, ROLE_PERMISSIONS } from '@/types/roles'

describe('Role types', () => {
  it('all 4 roles are defined', () => {
    expect(ROLES).toHaveLength(4)
    expect(ROLES).toContain('admin')
    expect(ROLES).toContain('developer')
    expect(ROLES).toContain('qa')
    expect(ROLES).toContain('stakeholder')
  })

  it('admin can manage users', () => {
    expect(ROLE_PERMISSIONS.admin.canManageUsers).toBe(true)
  })

  it('stakeholder is aggregate-only', () => {
    expect(ROLE_PERMISSIONS.stakeholder.canViewAggregateOnly).toBe(true)
    expect(ROLE_PERMISSIONS.stakeholder.canManageUsers).toBe(false)
    expect(ROLE_PERMISSIONS.stakeholder.canGenerateAiWidgets).toBe(false)
  })
})
