'use client'

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { AiWidgetConfig, AiWidgetType } from '@/lib/schemas/ai-widget-schema'
import type { WidgetVariant } from '../config/widget-registry'

export { AI_WIDGET_TYPES } from '@/lib/schemas/ai-widget-schema'

/** Maps widget type → WidgetSkeleton variant for loading states. */
export function getSkeletonVariant(type: AiWidgetType): WidgetVariant {
  switch (type) {
    case 'metric-card': return 'stats'
    case 'data-table': return 'table'
    default: return 'chart'
  }
}

/** Sample data points used in the sidebar preview (real data loads post-save). */
export interface DataPoint {
  name: string
  value: number
}

export function getSampleData(type: AiWidgetType): DataPoint[] {
  switch (type) {
    case 'bar-chart':
    case 'line-chart':
      return [
        { name: 'Mon', value: 4 },
        { name: 'Tue', value: 7 },
        { name: 'Wed', value: 5 },
        { name: 'Thu', value: 9 },
        { name: 'Fri', value: 6 },
      ]
    case 'pie-chart':
      return [
        { name: 'Critical', value: 3 },
        { name: 'High', value: 8 },
        { name: 'Medium', value: 14 },
        { name: 'Low', value: 5 },
      ]
    default:
      return []
  }
}

const SAMPLE_TABLE_ROWS = [
  { id: '1', col1: 'Item A', col2: '42' },
  { id: '2', col1: 'Item B', col2: '17' },
  { id: '3', col1: 'Item C', col2: '28' },
]

interface AiWidgetRendererProps {
  config: AiWidgetConfig
  /** When true, overlays a "Preview" badge and uses sample data. */
  isPreview?: boolean
}

/**
 * AiWidgetRenderer — renders an AI-generated widget from its configuration.
 *
 * Supports: metric card, bar chart, line chart, pie chart, data table (FR42).
 * Colors use spice-theme CSS custom properties only — never hardcoded hex values.
 * In preview mode, displays sample data with a badge (FR41, UX-7).
 */
export function AiWidgetRenderer({ config, isPreview = false }: AiWidgetRendererProps) {
  const primaryColor = config.displayProperties?.primaryColor ?? 'var(--color-turmeric)'
  const secondaryColor = config.displayProperties?.secondaryColor ?? 'var(--color-coriander)'

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Preview badge */}
      {isPreview && (
        <span
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 10,
            backgroundColor: 'var(--color-turmeric)',
            color: 'white',
            fontSize: '0.6875rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            letterSpacing: '0.04em',
          }}
        >
          Preview
        </span>
      )}

      {/* Widget title */}
      <p
        style={{
          margin: '0 0 var(--space-3)',
          fontSize: '0.8125rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--color-text-secondary)',
        }}
      >
        {config.title}
      </p>

      {/* Widget body */}
      {config.type === 'metric-card' && (
        <MetricCardBody primaryColor={primaryColor} />
      )}
      {config.type === 'bar-chart' && (
        <BarChartBody config={config} primaryColor={primaryColor} />
      )}
      {config.type === 'line-chart' && (
        <LineChartBody config={config} primaryColor={primaryColor} />
      )}
      {config.type === 'pie-chart' && (
        <PieChartBody config={config} primaryColor={primaryColor} secondaryColor={secondaryColor} />
      )}
      {config.type === 'data-table' && (
        <DataTableBody />
      )}
    </div>
  )
}

function MetricCardBody({ primaryColor }: { primaryColor: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      <span
        style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          lineHeight: 1,
          color: primaryColor,
        }}
      >
        42
      </span>
      <span
        style={{
          fontSize: '0.8125rem',
          color: 'var(--color-text-muted)',
        }}
      >
        Sample metric value
      </span>
    </div>
  )
}

function BarChartBody({
  config,
  primaryColor,
}: {
  config: AiWidgetConfig
  primaryColor: string
}) {
  const data = getSampleData('bar-chart')
  const xLabel = config.displayProperties?.xAxisLabel
  const yLabel = config.displayProperties?.yAxisLabel

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -4, fontSize: 11 } : undefined}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fontSize: 11 } : undefined}
        />
        <Tooltip
          contentStyle={{
            fontSize: '0.75rem',
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius-sm)',
          }}
        />
        <Bar dataKey="value" fill={primaryColor} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function LineChartBody({
  config,
  primaryColor,
}: {
  config: AiWidgetConfig
  primaryColor: string
}) {
  const data = getSampleData('line-chart')
  const xLabel = config.displayProperties?.xAxisLabel
  const yLabel = config.displayProperties?.yAxisLabel

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -4, fontSize: 11 } : undefined}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fontSize: 11 } : undefined}
        />
        <Tooltip
          contentStyle={{
            fontSize: '0.75rem',
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius-sm)',
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={primaryColor}
          strokeWidth={2}
          dot={{ r: 3, fill: primaryColor }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

const PIE_COLORS = [
  'var(--color-turmeric)',
  'var(--color-coriander)',
  'var(--color-cinnamon)',
  'var(--color-chili)',
]

function PieChartBody({
  config,
  primaryColor,
  secondaryColor,
}: {
  config: AiWidgetConfig
  primaryColor: string
  secondaryColor: string
}) {
  const data = getSampleData('pie-chart')
  const colors = config.displayProperties?.primaryColor
    ? [primaryColor, secondaryColor, ...PIE_COLORS.slice(2)]
    : PIE_COLORS

  return (
    <ResponsiveContainer width="100%" height={160}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={60}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {data.map((_, idx) => (
            <Cell key={idx} fill={colors[idx % colors.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            fontSize: '0.75rem',
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius-sm)',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

function DataTableBody() {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.8125rem',
        }}
      >
        <thead>
          <tr>
            {['Name', 'Value'].map((col) => (
              <th
                key={col}
                style={{
                  textAlign: 'left',
                  padding: 'var(--space-2) var(--space-3)',
                  borderBottom: '1px solid hsl(var(--border))',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  fontSize: '0.6875rem',
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SAMPLE_TABLE_ROWS.map((row) => (
            <tr key={row.id}>
              <td
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderBottom: '1px solid hsl(var(--border) / 0.5)',
                  color: 'var(--color-text)',
                }}
              >
                {row.col1}
              </td>
              <td
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderBottom: '1px solid hsl(var(--border) / 0.5)',
                  color: 'var(--color-text)',
                }}
              >
                {row.col2}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
