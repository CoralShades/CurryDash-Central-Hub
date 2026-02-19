import {
  getDeadLetterEvents,
  getWebhookMetrics,
  getRateLimitStatus,
} from '../actions/retry-dead-letter'
import { DeadLetterTable } from './dead-letter-table'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.round(ms / 60_000)}min`
}

function successRateColor(rate: number): string {
  if (rate >= 99) return 'var(--color-coriander)'
  if (rate >= 95) return 'var(--color-turmeric)'
  return 'var(--color-chili)'
}

// ── Metric Card ───────────────────────────────────────────────────────────────

interface SystemMetricCardProps {
  label: string
  value: string | number
  subtext: string
  valueColor?: string
  progressPercent?: number
  progressColor?: string
}

function SystemMetricCard({
  label,
  value,
  subtext,
  valueColor,
  progressPercent,
  progressColor,
}: SystemMetricCardProps) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#9ca3af',
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: '2rem',
          fontWeight: 700,
          lineHeight: 1,
          color: valueColor ?? 'var(--color-text)',
        }}
      >
        {value}
      </p>
      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{subtext}</p>
      {progressPercent !== undefined && (
        <div
          style={{
            height: '4px',
            backgroundColor: 'var(--color-border)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginTop: '4px',
          }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: progressColor ?? 'var(--color-coriander)',
              borderRadius: '2px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}
    </div>
  )
}

// ── Rate Limit Card ───────────────────────────────────────────────────────────

interface RateLimitCardProps {
  name: string
  usedPercent: number
  limitLabel: string
  remainingLabel: string
  last429At: string | null
  showWarning: boolean
}

function RateLimitCard({
  name,
  usedPercent,
  limitLabel,
  remainingLabel,
  last429At,
  showWarning,
}: RateLimitCardProps) {
  const barColor =
    usedPercent >= 80
      ? 'var(--color-chili)'
      : usedPercent >= 50
        ? 'var(--color-turmeric)'
        : 'var(--color-coriander)'

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: `1px solid ${showWarning ? 'var(--color-turmeric)' : 'var(--color-border)'}`,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{name}</h4>
        {showWarning && (
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-turmeric)',
              backgroundColor: '#FFF8DC',
            }}
            role="alert"
          >
            ⚠ &gt;50% consumed
          </span>
        )}
      </div>

      {/* Usage bar */}
      <div>
        <div
          style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}
        >
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Usage</span>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>{usedPercent}%</span>
        </div>
        <div
          style={{
            height: '6px',
            backgroundColor: 'var(--color-border)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}
          role="progressbar"
          aria-valuenow={usedPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            style={{
              height: '100%',
              width: `${usedPercent}%`,
              backgroundColor: barColor,
              borderRadius: '3px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: '#6b7280' }}>Limit</span>
          <span style={{ fontWeight: 500 }}>{limitLabel}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: '#6b7280' }}>Remaining</span>
          <span style={{ fontWeight: 500 }}>{remainingLabel}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: '#6b7280' }}>Last 429</span>
          <span style={{ fontWeight: 500, color: last429At ? 'var(--color-chili)' : '#9ca3af' }}>
            {last429At ? formatRelativeTime(last429At) : 'None recorded'}
          </span>
        </div>
      </div>
    </div>
  )
}

function formatRelativeTime(ts: string): string {
  const diffMs = Date.now() - new Date(ts).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return new Date(ts).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// ── WebhookMonitor ─────────────────────────────────────────────────────────────

/**
 * WebhookMonitor — async Server Component
 * Shows webhook pipeline health metrics, dead letter event investigation table,
 * and rate limit status for Jira and GitHub.
 */
export async function WebhookMonitor() {
  const [metricsResult, eventsResult, rateLimitResult] = await Promise.all([
    getWebhookMetrics(),
    getDeadLetterEvents(),
    getRateLimitStatus(),
  ])

  const metrics = metricsResult.data
  const events = eventsResult.data ?? []
  const rateLimit = rateLimitResult.data

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
      {/* ── Section 1: Webhook Pipeline Metrics ─────────────────────────────── */}
      <section>
        <h2
          style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Webhook Pipeline Health
        </h2>

        {metricsResult.error ? (
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
            Failed to load webhook metrics. Please refresh the page.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Success Rate */}
            <SystemMetricCard
              label="Webhook Success Rate"
              value={`${metrics?.successRate ?? 0}%`}
              subtext="processed / total received today"
              valueColor={successRateColor(metrics?.successRate ?? 0)}
              progressPercent={metrics?.successRate ?? 0}
              progressColor={successRateColor(metrics?.successRate ?? 0)}
            />

            {/* Events Today */}
            <SystemMetricCard
              label="Events Processed Today"
              value={metrics?.eventsToday ?? 0}
              subtext={
                metrics
                  ? `${metrics.eventsYesterday} yesterday`
                  : 'vs yesterday'
              }
            />

            {/* Average Latency */}
            <SystemMetricCard
              label="Avg Processing Latency"
              value={metrics ? formatLatency(metrics.avgLatencyMs) : '—'}
              subtext="receipt → dashboard update (target <5min)"
              valueColor={
                metrics?.avgLatencyMs && metrics.avgLatencyMs > 300_000
                  ? 'var(--color-chili)'
                  : metrics?.avgLatencyMs && metrics.avgLatencyMs > 120_000
                    ? 'var(--color-turmeric)'
                    : 'var(--color-coriander)'
              }
            />

            {/* Dead Letter Depth */}
            <SystemMetricCard
              label="Dead Letter Queue Depth"
              value={metrics?.deadLetterDepth ?? 0}
              subtext="unresolved failed events"
              valueColor={
                (metrics?.deadLetterDepth ?? 0) > 0 ? 'var(--color-chili)' : 'var(--color-coriander)'
              }
            />
          </div>
        )}
      </section>

      {/* ── Section 2: Dead Letter Events ──────────────────────────────────── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            Dead Letter Events
          </h2>
          {events.length > 0 && (
            <span
              style={{
                padding: '2px 10px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-chili)',
                backgroundColor: '#FEE2E2',
              }}
            >
              {events.length}
            </span>
          )}
        </div>

        {eventsResult.error ? (
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
            Failed to load dead letter events. Please refresh the page.
          </div>
        ) : (
          <DeadLetterTable events={events} />
        )}
      </section>

      {/* ── Section 3: Rate Limit Status ────────────────────────────────────── */}
      <section>
        <h2
          style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          API Rate Limits
        </h2>

        {/* Global warning banner when any integration exceeds 50% */}
        {rateLimit &&
          (rateLimit.jiraUsedPercent >= 50 || rateLimit.githubUsedPercent >= 50) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: '#FFF8DC',
                border: '1px solid var(--color-turmeric)',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#92400e',
              }}
              role="alert"
            >
              <span style={{ fontSize: '18px' }}>⚠️</span>
              <span>
                API consumption exceeds 50% of limits.{' '}
                {rateLimit.jiraUsedPercent >= 50 && rateLimit.githubUsedPercent >= 50
                  ? 'Both Jira and GitHub are running low on quota.'
                  : rateLimit.jiraUsedPercent >= 50
                    ? 'Jira is running low on quota.'
                    : 'GitHub is running low on quota.'}
              </span>
            </div>
          )}

        {rateLimitResult.error ? (
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
            Failed to load rate limit status.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            <RateLimitCard
              name="Jira"
              usedPercent={rateLimit?.jiraUsedPercent ?? 0}
              limitLabel={`${rateLimit?.jira.callsPerMinute ?? 5} calls/min`}
              remainingLabel={
                rateLimit?.jira.remaining !== null && rateLimit?.jira.remaining !== undefined
                  ? `${rateLimit.jira.remaining} remaining`
                  : 'Not tracked'
              }
              last429At={rateLimit?.jira.last429At ?? null}
              showWarning={(rateLimit?.jiraUsedPercent ?? 0) >= 50}
            />
            <RateLimitCard
              name="GitHub"
              usedPercent={rateLimit?.githubUsedPercent ?? 0}
              limitLabel={`${rateLimit?.github.requestsPerHour?.toLocaleString() ?? '5,000'}/hour`}
              remainingLabel={
                rateLimit?.github.remaining !== null && rateLimit?.github.remaining !== undefined
                  ? `${rateLimit.github.remaining.toLocaleString()} remaining`
                  : 'Not tracked'
              }
              last429At={rateLimit?.github.last429At ?? null}
              showWarning={(rateLimit?.githubUsedPercent ?? 0) >= 50}
            />
          </div>
        )}
      </section>
    </div>
  )
}
