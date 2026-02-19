'use client'

import { useState } from 'react'

interface ChartDataPoint {
  date: string
  count: number
}

interface CommitActivityChartProps {
  data: ChartDataPoint[]
  weekCount: number
}

/**
 * CommitActivityChart — inline SVG sparkline bar chart.
 * Shows commit frequency over the last 14 days using --color-primary for bars.
 * Tooltip on hover shows date and commit count.
 */
export function CommitActivityChart({ data, weekCount }: CommitActivityChartProps) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number } | null>(null)

  const maxCount = Math.max(...data.map((d) => d.count), 1)
  const chartHeight = 40
  const barWidth = 10
  const barGap = 2
  const totalWidth = data.length * (barWidth + barGap) - barGap

  return (
    <div
      style={{
        borderTop: '1px solid var(--color-border)',
        paddingTop: 'var(--space-2)',
      }}
    >
      <p
        style={{
          margin: '0 0 var(--space-2) 0',
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--color-text-secondary)',
        }}
      >
        Commit Activity
      </p>

      <div style={{ position: 'relative', userSelect: 'none' }}>
        <svg
          width={totalWidth}
          height={chartHeight}
          role="img"
          aria-label={`Commit activity chart: ${weekCount} commits this week`}
          style={{ display: 'block', overflow: 'visible' }}
        >
          {data.map((point, i) => {
            const barHeight = Math.max(2, Math.round((point.count / maxCount) * chartHeight))
            const x = i * (barWidth + barGap)
            const y = chartHeight - barHeight
            return (
              <rect
                key={point.date}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="var(--color-primary)"
                opacity={0.85}
                rx={1}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setTooltip({ date: point.date, count: point.count, x })}
                onMouseLeave={() => setTooltip(null)}
                aria-label={`${point.date}: ${point.count} commits`}
              />
            )
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            role="tooltip"
            style={{
              position: 'absolute',
              top: -36,
              left: tooltip.x,
              transform: 'translateX(-50%)',
              backgroundColor: 'var(--color-text)',
              color: 'var(--color-background)',
              fontSize: '0.6875rem',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {tooltip.date}: {tooltip.count} commit{tooltip.count !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <p
        style={{
          margin: 'var(--space-2) 0 0 0',
          fontSize: '0.75rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{weekCount}</span>
        {' '}commit{weekCount !== 1 ? 's' : ''} this week
      </p>
    </div>
  )
}
