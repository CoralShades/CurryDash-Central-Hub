import { describe, it, expect } from 'vitest'
import type { Role } from '@/types/roles'

// --- Inline the pure helper logic to test independently of Next.js Edge Runtime ---

const PUBLIC_PATHS = ['/login', '/register', '/api/webhooks']

const ROUTE_ROLE_MAP: Record<string, Role> = {
  '/admin': 'admin',
  '/dev': 'developer',
  '/qa': 'qa',
  '/stakeholder': 'stakeholder',
}

const ROLE_HOME: Record<Role, string> = {
  admin: '/admin',
  developer: '/dev',
  qa: '/qa',
  stakeholder: '/stakeholder',
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function getRequiredRole(pathname: string): Role | null {
  for (const [prefix, role] of Object.entries(ROUTE_ROLE_MAP)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return role
    }
  }
  return null
}

// --- Tests ---

describe('isPublicPath', () => {
  it('matches exact public paths', () => {
    expect(isPublicPath('/login')).toBe(true)
    expect(isPublicPath('/register')).toBe(true)
  })

  it('matches public path prefixes', () => {
    expect(isPublicPath('/api/webhooks/jira')).toBe(true)
    expect(isPublicPath('/api/webhooks/github')).toBe(true)
  })

  it('rejects protected paths', () => {
    expect(isPublicPath('/admin')).toBe(false)
    expect(isPublicPath('/dev/dashboard')).toBe(false)
    expect(isPublicPath('/qa')).toBe(false)
    expect(isPublicPath('/stakeholder')).toBe(false)
    expect(isPublicPath('/')).toBe(false)
  })
})

describe('getRequiredRole', () => {
  it('returns correct role for each protected prefix', () => {
    expect(getRequiredRole('/admin')).toBe('admin')
    expect(getRequiredRole('/admin/users')).toBe('admin')
    expect(getRequiredRole('/dev')).toBe('developer')
    expect(getRequiredRole('/dev/dashboard')).toBe('developer')
    expect(getRequiredRole('/qa')).toBe('qa')
    expect(getRequiredRole('/qa/tests')).toBe('qa')
    expect(getRequiredRole('/stakeholder')).toBe('stakeholder')
    expect(getRequiredRole('/stakeholder/reports')).toBe('stakeholder')
  })

  it('returns null for unprotected paths', () => {
    expect(getRequiredRole('/login')).toBeNull()
    expect(getRequiredRole('/api/webhooks/jira')).toBeNull()
    expect(getRequiredRole('/')).toBeNull()
  })
})

describe('ROLE_HOME', () => {
  it('maps each role to the correct home path', () => {
    expect(ROLE_HOME.admin).toBe('/admin')
    expect(ROLE_HOME.developer).toBe('/dev')
    expect(ROLE_HOME.qa).toBe('/qa')
    expect(ROLE_HOME.stakeholder).toBe('/stakeholder')
  })

  it('covers all four roles', () => {
    const roles: Role[] = ['admin', 'developer', 'qa', 'stakeholder']
    roles.forEach((role) => {
      expect(ROLE_HOME[role]).toBeDefined()
    })
  })
})
