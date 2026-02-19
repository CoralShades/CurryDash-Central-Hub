import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth'
import { WebhookMonitor } from '@/modules/admin/components/webhook-monitor'
import { AiCostTracker } from '@/modules/admin/components/ai-cost-tracker'

export const metadata: Metadata = {
  title: 'System Health | CurryDash Admin',
}

/**
 * System Health page — admin-only.
 * Shows webhook pipeline health metrics, dead letter events for investigation
 * and retry, API rate limit status, and AI API cost telemetry.
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
          Monitor webhook pipeline health, investigate failed events, manage API rate limits, and
          track AI spend
        </p>
      </div>

      <WebhookMonitor />

      <div style={{ marginTop: '48px', marginBottom: '32px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 700 }}>
          AI Cost Tracker
        </h1>
        <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
          Monitor AI API spending, model usage, and token budget consumption
        </p>
      </div>

      <AiCostTracker />
    </div>
  )
}
