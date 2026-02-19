import {
  getDeadLetterEvents,
  getWebhookMetrics,
  getRateLimitStatus,
} from '../actions/retry-dead-letter'
import { DeadLetterTable } from './dead-letter-table'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.round(ms / 60_000)}min`
}

function successRateColorClass(rate: number): string {
  if (rate >= 99) return 'text-coriander'
  if (rate >= 95) return 'text-turmeric'
  return 'text-chili'
}

// ── Metric Card ───────────────────────────────────────────────────────────────

interface SystemMetricCardProps {
  label: string
  value: string | number
  subtext: string
  valueColorClass?: string
  progressPercent?: number
  progressColorClass?: string
}

function SystemMetricCard({
  label,
  value,
  subtext,
  valueColorClass,
  progressPercent,
  progressColorClass,
}: SystemMetricCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className={cn('text-4xl font-bold leading-none', valueColorClass ?? 'text-foreground')}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{subtext}</p>
        {progressPercent !== undefined && (
          <div
            className="h-1 bg-border rounded-sm overflow-hidden mt-1"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cn('h-full rounded-sm transition-all duration-300', progressColorClass ?? 'bg-coriander')}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
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
  const barColorClass =
    usedPercent >= 80
      ? 'bg-chili'
      : usedPercent >= 50
        ? 'bg-turmeric'
        : 'bg-coriander'

  return (
    <Card className={cn(showWarning && 'border-turmeric')}>
      <CardContent className="flex flex-col gap-3 pt-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h4 className="text-[15px] font-semibold">{name}</h4>
          {showWarning && (
            <Badge
              variant="outline"
              className="text-[11px] font-semibold text-turmeric bg-turmeric/10 border-turmeric/20"
              role="alert"
            >
              &gt;50% consumed
            </Badge>
          )}
        </div>

        {/* Usage bar */}
        <div>
          <div className="flex justify-between mb-1.5">
            <span className="text-xs text-muted-foreground">Usage</span>
            <span className="text-xs font-semibold">{usedPercent}%</span>
          </div>
          <div
            className="h-1.5 bg-border rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={usedPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={cn('h-full rounded-full transition-all duration-300', barColorClass)}
              style={{ width: `${usedPercent}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Limit</span>
            <span className="font-medium">{limitLabel}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-medium">{remainingLabel}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Last 429</span>
            <span className={cn('font-medium', last429At ? 'text-chili' : 'text-muted-foreground')}>
              {last429At ? formatRelativeTime(last429At) : 'None recorded'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
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
    <div className="flex flex-col gap-9">
      {/* ── Section 1: Webhook Pipeline Metrics ─────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Webhook Pipeline Health
        </h2>

        {metricsResult.error ? (
          <div
            className="p-4 bg-destructive/10 rounded-lg text-chili text-sm"
            role="alert"
          >
            Failed to load webhook metrics. Please refresh the page.
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {/* Success Rate */}
            <SystemMetricCard
              label="Webhook Success Rate"
              value={`${metrics?.successRate ?? 0}%`}
              subtext="processed / total received today"
              valueColorClass={successRateColorClass(metrics?.successRate ?? 0)}
              progressPercent={metrics?.successRate ?? 0}
              progressColorClass={
                (metrics?.successRate ?? 0) >= 99
                  ? 'bg-coriander'
                  : (metrics?.successRate ?? 0) >= 95
                    ? 'bg-turmeric'
                    : 'bg-chili'
              }
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
              valueColorClass={
                metrics?.avgLatencyMs && metrics.avgLatencyMs > 300_000
                  ? 'text-chili'
                  : metrics?.avgLatencyMs && metrics.avgLatencyMs > 120_000
                    ? 'text-turmeric'
                    : 'text-coriander'
              }
            />

            {/* Dead Letter Depth */}
            <SystemMetricCard
              label="Dead Letter Queue Depth"
              value={metrics?.deadLetterDepth ?? 0}
              subtext="unresolved failed events"
              valueColorClass={
                (metrics?.deadLetterDepth ?? 0) > 0 ? 'text-chili' : 'text-coriander'
              }
            />
          </div>
        )}
      </section>

      {/* ── Section 2: Dead Letter Events ──────────────────────────────────── */}
      <section>
        <div className="flex items-baseline gap-3 mb-4">
          <h2 className="text-lg font-semibold">
            Dead Letter Events
          </h2>
          {events.length > 0 && (
            <Badge
              variant="outline"
              className="text-xs font-semibold text-chili bg-chili/10 border-chili/20"
            >
              {events.length}
            </Badge>
          )}
        </div>

        {eventsResult.error ? (
          <div
            className="p-4 bg-destructive/10 rounded-lg text-chili text-sm"
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
        <h2 className="mb-4 text-lg font-semibold">
          API Rate Limits
        </h2>

        {/* Global warning banner when any integration exceeds 50% */}
        {rateLimit &&
          (rateLimit.jiraUsedPercent >= 50 || rateLimit.githubUsedPercent >= 50) && (
            <div
              className="flex items-center gap-3 p-3 px-4 bg-turmeric/10 border border-turmeric rounded-lg mb-4 text-sm text-amber-900"
              role="alert"
            >
              <span className="text-lg">⚠️</span>
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
            className="p-4 bg-destructive/10 rounded-lg text-chili text-sm"
            role="alert"
          >
            Failed to load rate limit status.
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
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
