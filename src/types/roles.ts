export type Role = 'admin' | 'developer' | 'qa' | 'stakeholder'

export const ROLES: Role[] = ['admin', 'developer', 'qa', 'stakeholder']

export interface RolePermissions {
  canManageUsers: boolean
  canViewAdminPanel: boolean
  canCreateIssues: boolean
  canViewDevMetrics: boolean
  canViewQaMetrics: boolean
  canViewAggregateOnly: boolean
  canGenerateAiWidgets: boolean
  canConfigureIntegrations: boolean
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  admin: {
    canManageUsers: true,
    canViewAdminPanel: true,
    canCreateIssues: true,
    canViewDevMetrics: true,
    canViewQaMetrics: true,
    canViewAggregateOnly: false,
    canGenerateAiWidgets: true,
    canConfigureIntegrations: true,
  },
  developer: {
    canManageUsers: false,
    canViewAdminPanel: false,
    canCreateIssues: true,
    canViewDevMetrics: true,
    canViewQaMetrics: false,
    canViewAggregateOnly: false,
    canGenerateAiWidgets: true,
    canConfigureIntegrations: false,
  },
  qa: {
    canManageUsers: false,
    canViewAdminPanel: false,
    canCreateIssues: false,
    canViewDevMetrics: false,
    canViewQaMetrics: true,
    canViewAggregateOnly: false,
    canGenerateAiWidgets: true,
    canConfigureIntegrations: false,
  },
  stakeholder: {
    canManageUsers: false,
    canViewAdminPanel: false,
    canCreateIssues: false,
    canViewDevMetrics: false,
    canViewQaMetrics: false,
    canViewAggregateOnly: true,
    canGenerateAiWidgets: false,
    canConfigureIntegrations: false,
  },
}
