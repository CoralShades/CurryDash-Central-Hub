import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth'
import { IntegrationHealth } from '@/modules/admin/components/integration-health'

export const metadata: Metadata = {
  title: 'Integration Management | CurryDash Admin',
}

/**
 * Integration Configuration page — admin-only.
 * Shows Jira, GitHub, and Anthropic AI status cards with
 * test connection and credential management.
 */
export default async function AdminIntegrationsPage() {
  await requireAuth('admin')

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 700 }}>
          Integration Management
        </h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
          Configure and monitor Jira, GitHub, and Anthropic AI connections
        </p>
      </div>

      <IntegrationHealth />
    </div>
  )
}
