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
import { SprintProgressWidget } from '@/modules/jira/components/sprint-progress-widget'
import { PrStatusWidget } from '@/modules/github/components/pr-status-widget'
import { CicdStatusWidget } from '@/modules/github/components/cicd-status-widget'

interface WidgetGridProps {
  role: Role
}

/**
 * Resolves widget.id → React component.
 * New widget implementations are registered here as they ship.
 * Falls back to WidgetPlaceholder for unimplemented widget IDs.
 */
function resolveWidget(config: WidgetConfig, role: Role) {
  switch (config.id) {
    case 'stories-completed': return <StoriesCompletedWidget />
    case 'prs-merged':        return <PrsMergedWidget />
    case 'bugs-open':         return <BugsOpenWidget />
    case 'ci-status':         return <CiStatusWidget />
    case 'team-activity':      return <ActivityFeed />
    case 'blockers':           return <BlockerCard />
    case 'sprint-progress':    return <SprintProgressWidget />
    case 'pr-status':          return <PrStatusWidget role={role} />
    case 'cicd-pipeline':      return <CicdStatusWidget />
    default:                   return <WidgetPlaceholder config={config} />
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
    <>
      {/* Mobile message — CSS hides .dashboard-grid and shows this at <768px */}
      <div className="dashboard-mobile-message">
        <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
          Best viewed on desktop
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
          CurryDash Central Hub is optimised for desktop. For the best experience, please use a laptop or tablet.
        </p>
      </div>

      <div className="dashboard-grid">
      {widgets.map((config) => (
        <div
          key={config.id}
          style={{ gridColumn: `span ${config.colSpan}` }}
        >
          <WidgetCard config={config}>
            {resolveWidget(config, role)}
          </WidgetCard>
        </div>
      ))}
      </div>
    </>
  )
}
