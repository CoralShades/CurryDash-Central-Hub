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
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          System Health
        </h1>
        <p className="text-muted-foreground text-sm">
          Monitor webhook pipeline health, investigate failed events, manage API rate limits, and
          track AI spend
        </p>
      </div>

      <WebhookMonitor />

      <div className="mt-12 mb-8">
        <h1 className="text-2xl font-bold mb-2">
          AI Cost Tracker
        </h1>
        <p className="text-muted-foreground text-sm">
          Monitor AI API spending, model usage, and token budget consumption
        </p>
      </div>

      <AiCostTracker />
    </div>
  )
}
