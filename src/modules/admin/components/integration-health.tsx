import { getIntegrationStatuses } from '@/modules/admin/actions/configure-integration'
import type { IntegrationInfo, IntegrationStatus } from '@/modules/admin/actions/configure-integration'
import { IntegrationConfigForm } from './integration-config-form'

// Status display config
const STATUS_CONFIG: Record<
  IntegrationStatus,
  { label: string; color: string; dotColor: string }
> = {
  connected: {
    label: 'Connected',
    color: 'var(--color-coriander)',
    dotColor: 'var(--color-coriander)',
  },
  disconnected: {
    label: 'Disconnected',
    color: '#6b7280',
    dotColor: '#6b7280',
  },
  error: {
    label: 'Error',
    color: 'var(--color-chili)',
    dotColor: 'var(--color-chili)',
  },
  unknown: {
    label: 'Unknown',
    color: 'var(--color-turmeric)',
    dotColor: 'var(--color-turmeric)',
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

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px', lineHeight: 1 }}>
            {INTEGRATION_ICONS[info.integration] ?? '🔗'}
          </span>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{info.name}</h3>
        </div>

        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: statusCfg.dotColor,
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: 500, color: statusCfg.color }}>
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Error message if any */}
      {info.errorMessage && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#FEE2E2',
            borderRadius: '6px',
            fontSize: '13px',
            color: 'var(--color-chili)',
          }}
          role="alert"
        >
          {info.errorMessage}
        </div>
      )}

      {/* Timestamps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: '#6b7280' }}>Last sync</span>
          <span style={{ fontWeight: 500 }}>{formatTimestamp(info.lastSyncAt)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: '#6b7280' }}>Last webhook</span>
          <span style={{ fontWeight: 500 }}>{formatTimestamp(info.lastWebhookAt)}</span>
        </div>
      </div>

      {/* Configure button — client component */}
      <IntegrationConfigForm info={info} />
    </div>
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
        style={{
          padding: '16px',
          backgroundColor: '#FEE2E2',
          borderRadius: '8px',
          color: 'var(--color-chili)',
          fontSize: '14px',
        }}
        role="alert"
      >
        Failed to load integration statuses. Please refresh the page.
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
      }}
    >
      {(integrations ?? []).map((info) => (
        <IntegrationCard key={info.integration} info={info} />
      ))}
    </div>
  )
}
