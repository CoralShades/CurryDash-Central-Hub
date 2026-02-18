export type TrendDirection = 'up' | 'down' | 'neutral'

export interface MetricCardProps {
  label: string
  value: string | number
  trend: TrendDirection
  delta: string
  period: string
  /** Optional mini-bar percentage (0–100) shown beneath the value */
  progressPercent?: number
}

const TREND_ICON: Record<TrendDirection, string> = {
  up: '↑',
  down: '↓',
  neutral: '→',
}

function trendColor(trend: TrendDirection, isPositiveGood = true): string {
  if (trend === 'neutral') return 'var(--color-text-muted)'
  const isGood = isPositiveGood ? trend === 'up' : trend === 'down'
  return isGood ? 'var(--color-success)' : 'var(--color-error)'
}

/**
 * Reusable metric card widget: label, large value, trend indicator, mini progress bar.
 * Uses placeholder/mock data until integrations ship (Epics 4-5).
 */
export function MetricCard({
  label,
  value,
  trend,
  delta,
  period,
  progressPercent,
}: MetricCardProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', height: '100%' }}>
      {/* Label */}
      <p
        style={{
          margin: 0,
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--color-text-secondary)',
        }}
      >
        {label}
      </p>

      {/* Value */}
      <p
        style={{
          margin: 0,
          fontSize: '1.875rem',
          fontWeight: 600,
          lineHeight: 1,
          color: 'var(--color-text)',
        }}
      >
        {value}
      </p>

      {/* Trend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.8125rem',
          color: trendColor(trend),
        }}
        aria-label={`${delta} ${period}`}
      >
        <span aria-hidden="true">{TREND_ICON[trend]}</span>
        <span>{delta}</span>
        <span style={{ color: 'var(--color-text-muted)' }}>{period}</span>
      </div>

      {/* Optional mini progress bar */}
      {progressPercent !== undefined && (
        <div
          style={{
            marginTop: 'auto',
            height: '4px',
            backgroundColor: 'var(--color-border)',
            borderRadius: '2px',
            overflow: 'hidden',
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
              backgroundColor:
                progressPercent >= 80
                  ? 'var(--color-success)'
                  : progressPercent >= 50
                    ? 'var(--color-turmeric)'
                    : 'var(--color-error)',
              borderRadius: '2px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}
    </div>
  )
}

// ── Pre-configured metric widget instances ────────────────────────────────────
// Each maps to a widget ID in the registry. Mock data used until Epics 4-5.

export function StoriesCompletedWidget() {
  return (
    <MetricCard
      label="Stories Completed"
      value={24}
      trend="up"
      delta="+3"
      period="vs last week"
      progressPercent={68}
    />
  )
}

export function PrsMergedWidget() {
  return (
    <MetricCard
      label="PRs Merged"
      value={12}
      trend="up"
      delta="+5"
      period="vs last week"
    />
  )
}

export function BugsOpenWidget() {
  return (
    <MetricCard
      label="Bugs Open"
      value={7}
      trend="down"
      delta="-2"
      period="vs last week"
    />
  )
}

export function CiStatusWidget() {
  return (
    <MetricCard
      label="CI Status"
      value="94%"
      trend="up"
      delta="+2%"
      period="pass rate"
      progressPercent={94}
    />
  )
}
