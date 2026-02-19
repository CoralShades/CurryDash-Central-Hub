import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

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

function trendColor(trend: TrendDirection, isPositiveGood = true): string {
  if (trend === 'neutral') return 'var(--color-text-muted)'
  const isGood = isPositiveGood ? trend === 'up' : trend === 'down'
  return isGood ? 'var(--color-success)' : 'var(--color-error)'
}

function TrendIcon({ trend }: { trend: TrendDirection }) {
  if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
  if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
  return <Minus className="h-3.5 w-3.5" aria-hidden="true" />
}

function progressColor(percent: number): string {
  if (percent >= 80) return 'var(--color-success)'
  if (percent >= 50) return 'var(--color-turmeric)'
  return 'var(--color-error)'
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
    <div className="flex flex-col gap-3 h-full">
      {/* Label */}
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
        {label}
      </p>

      {/* Value */}
      <p className="m-0 text-[1.875rem] font-semibold leading-none text-foreground">
        {value}
      </p>

      {/* Trend */}
      <div
        className="flex items-center gap-1 text-[0.8125rem]"
        style={{ color: trendColor(trend) }}
        aria-label={`${delta} ${period}`}
      >
        <TrendIcon trend={trend} />
        <span>{delta}</span>
        <span className="text-muted-foreground">{period}</span>
      </div>

      {/* Optional mini progress bar */}
      {progressPercent !== undefined && (
        <div className="mt-auto">
          <Progress
            value={progressPercent}
            className="h-1"
            style={
              {
                '--progress-indicator-color': progressColor(progressPercent),
              } as React.CSSProperties
            }
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
