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
    <div className="p-6">
      <div className="mb-7">
        <h1 className="text-3xl font-bold mb-2">
          Integration Management
        </h1>
        <p className="text-muted-foreground text-sm">
          Configure and monitor Jira, GitHub, and Anthropic AI connections
        </p>
      </div>

      <IntegrationHealth />
    </div>
  )
}
