import type { Role } from '@/types/roles'
import { widgetRegistry } from '../config/widget-registry'
import { WidgetCard } from './widget-card'
import { WidgetPlaceholder } from './widget-placeholder'

interface WidgetGridProps {
  role: Role
}

/**
 * Config-driven dashboard grid.
 * Reads the widget registry for the given role and renders each widget
 * inside a WidgetCard (ErrorBoundary + Suspense) within a 12-column CSS Grid.
 *
 * Max width: 1440px, centered, with --space-6 padding and gap.
 * Widget colSpan maps to CSS grid-column: span {colSpan}.
 */
export function WidgetGrid({ role }: WidgetGridProps) {
  const widgets = widgetRegistry[role] ?? []

  return (
    <div
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: 'var(--space-6)',
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: 'var(--space-6)',
      }}
    >
      {widgets.map((config) => (
        <div
          key={config.id}
          style={{ gridColumn: `span ${config.colSpan}` }}
        >
          <WidgetCard config={config}>
            <WidgetPlaceholder config={config} />
          </WidgetCard>
        </div>
      ))}
    </div>
  )
}
