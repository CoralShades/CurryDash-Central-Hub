import { CheckCircle2, AlertTriangle, XCircle, Wifi, WifiOff } from 'lucide-react'
import { getIntegrationStatuses } from '@/modules/admin/actions/configure-integration'
import type { IntegrationInfo, IntegrationStatus } from '@/modules/admin/actions/configure-integration'
import { IntegrationConfigForm } from './integration-config-form'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Status display config using design system tokens
const STATUS_CONFIG: Record<
  IntegrationStatus,
  {
    label: string
    textClass: string
    bgClass: string
    Icon: React.ComponentType<{ className?: string }>
    ConnIcon: React.ComponentType<{ className?: string }>
  }
> = {
  connected: {
    label: 'Connected',
    textClass: 'text-coriander',
    bgClass: 'bg-coriander/10',
    Icon: CheckCircle2,
    ConnIcon: Wifi,
  },
  disconnected: {
    label: 'Disconnected',
    textClass: 'text-muted-foreground',
    bgClass: 'bg-muted',
    Icon: WifiOff,
    ConnIcon: WifiOff,
  },
  error: {
    label: 'Error',
    textClass: 'text-chili',
    bgClass: 'bg-chili/10',
    Icon: XCircle,
    ConnIcon: WifiOff,
  },
  unknown: {
    label: 'Unknown',
    textClass: 'text-turmeric',
    bgClass: 'bg-turmeric/10',
    Icon: AlertTriangle,
    ConnIcon: Wifi,
  },
}

const INTEGRATION_ICONS: Record<string, string> = {
  jira: '🔵',
  github: '⚫',
  anthropic: '🤖',
}

function formatTimestamp(ts: string | null): string {
  if (!ts) return 'Never'
  const date = new Date(ts)
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface IntegrationCardProps {
  info: IntegrationInfo
}

function IntegrationCard({ info }: IntegrationCardProps) {
  const statusCfg = STATUS_CONFIG[info.status]
  const { Icon } = statusCfg

  return (
    <Card className="flex flex-col gap-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">
            {INTEGRATION_ICONS[info.integration] ?? '🔗'}
          </span>
          <h3 className="text-lg font-semibold">{info.name}</h3>
        </div>

        {/* Status indicator */}
        <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium', statusCfg.bgClass, statusCfg.textClass)}>
          <Icon className="h-3.5 w-3.5 shrink-0" />
          <span>{statusCfg.label}</span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* Error message if any */}
        {info.errorMessage && (
          <div
            className="px-3 py-2 bg-chili/10 rounded-md text-sm text-chili"
            role="alert"
          >
            {info.errorMessage}
          </div>
        )}

        {/* Timestamps */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last sync</span>
            <span className="font-medium">{formatTimestamp(info.lastSyncAt)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last webhook</span>
            <span className="font-medium">{formatTimestamp(info.lastWebhookAt)}</span>
          </div>
        </div>

        {/* Configure button — client component */}
        <IntegrationConfigForm info={info} />
      </CardContent>
    </Card>
  )
}

/**
 * IntegrationHealth — Server Component
 * Loads integration status from system_health table and renders cards.
 * Each card shows status, timestamps, and a Configure button (Client Component).
 * Integration failures are isolated — each card renders independently.
 */
export async function IntegrationHealth() {
  const { data: integrations, error } = await getIntegrationStatuses()

  if (error) {
    return (
      <div
        className="p-4 bg-destructive/10 rounded-lg text-chili text-sm"
        role="alert"
      >
        Failed to load integration statuses. Please refresh the page.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
      {(integrations ?? []).map((info) => (
        <IntegrationCard key={info.integration} info={info} />
      ))}
    </div>
  )
}
