import type { Role } from '@/types/roles'
import type { WidgetConfig } from '../config/widget-registry'
import { widgetRegistry } from '../config/widget-registry'
import { WidgetCard } from './widget-card'
import { WidgetPlaceholder } from './widget-placeholder'
import {
  StoriesCompletedWidget,
  PrsMergedWidget,
  BugsOpenWidget,
  CiStatusWidget,
} from './metric-card'
import { ActivityFeed } from './activity-feed'
import { BlockerCard } from './blocker-card'

interface WidgetGridProps {
  role: Role
}

/**
 * Resolves widget.id → React component.
 * New widget implementations are registered here as they ship.
 * Falls back to WidgetPlaceholder for unimplemented widget IDs.
 */
function resolveWidget(config: WidgetConfig) {
  switch (config.id) {
    case 'stories-completed': return <StoriesCompletedWidget />
    case 'prs-merged':        return <PrsMergedWidget />
    case 'bugs-open':         return <BugsOpenWidget />
    case 'ci-status':         return <CiStatusWidget />
    case 'team-activity':     return <ActivityFeed />
    case 'blockers':          return <BlockerCard />
    default:                  return <WidgetPlaceholder config={config} />
  }
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
            {resolveWidget(config)}
          </WidgetCard>
        </div>
      ))}
    </div>
  )
}
