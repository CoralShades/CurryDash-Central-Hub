import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth'
import { WebhookMonitor } from '@/modules/admin/components/webhook-monitor'

export const metadata: Metadata = {
  title: 'System Health | CurryDash Admin',
}

/**
 * System Health page — admin-only.
 * Shows webhook pipeline health metrics, dead letter events for investigation
 * and retry, and API rate limit status for Jira and GitHub.
 */
export default async function AdminSystemHealthPage() {
  await requireAuth('admin')

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 700 }}>
          System Health
        </h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
          Monitor webhook pipeline health, investigate failed events, and manage API rate limits
        </p>
      </div>

      <WebhookMonitor />
    </div>
  )
}
