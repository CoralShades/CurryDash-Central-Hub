import type { ReactNode } from 'react'
import type { UserRole } from '@/types/database'

interface RoleGateProps {
  allowedRoles: UserRole[]
  currentRole: UserRole | null
  children: ReactNode
}

// Renders nothing (not greyed out) for unauthorized roles
export function RoleGate({ allowedRoles, currentRole, children }: RoleGateProps) {
  if (!currentRole || !allowedRoles.includes(currentRole)) return null
  return <>{children}</>
}
