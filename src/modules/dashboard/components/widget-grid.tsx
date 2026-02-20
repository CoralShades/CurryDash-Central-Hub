import { auth } from '@/lib/auth'
import type { Role } from '@/types/roles'
import type { WidgetColSpan, WidgetConfig } from '../config/widget-registry'
import { widgetRegistry } from '../config/widget-registry'
import { WidgetCard } from './widget-card'
import { WidgetPlaceholder } from './widget-placeholder'
import { AiWidgetCard } from './ai-widget-card'
import { getUserWidgets } from '../actions/manage-widgets'
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

/** Static mapping for col-span classes — Tailwind JIT requires full class names */
const colSpanClass: Record<WidgetColSpan, string> = {
  3: 'col-span-3',
  4: 'col-span-4',
  6: 'col-span-6',
  12: 'col-span-12',
}

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
 * AI-generated widgets (from Supabase) are appended after static registry widgets (FR43, FR44).
 *
 * Max width: 1440px, centered, with --space-6 padding and gap.
 * Widget colSpan maps to CSS grid-column: span {colSpan}.
 */
export async function WidgetGrid({ role }: WidgetGridProps) {
  const staticWidgets = widgetRegistry[role] ?? []

  // Load persisted AI-generated widgets for the current user (FR43)
  const session = await auth()
  const aiWidgets = session?.user?.id
    ? await getUserWidgets(session.user.id).then((r) => r.data ?? [])
    : []

  return (
    <>
      {/* Mobile message — CSS hides .dashboard-grid and shows this at <768px */}
      <div className="dashboard-mobile-message">
        <p className="text-base font-semibold text-foreground mb-2">
          Best viewed on desktop
        </p>
        <p className="text-sm text-muted-foreground m-0">
          CurryDash Central Hub is optimised for desktop. For the best experience, please use a laptop or tablet.
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Static registry widgets first (FR44 — always available even without AI) */}
        {staticWidgets.map((config) => (
          <div
            key={config.id}
            className={colSpanClass[config.colSpan]}
          >
            <WidgetCard config={config}>
              {resolveWidget(config, role)}
            </WidgetCard>
          </div>
        ))}

        {/* AI-generated widgets appended after static widgets (FR43) */}
        {aiWidgets.map((widget) => (
          <div
            key={widget.id}
            className={colSpanClass[widget.config.colSpan]}
          >
            <AiWidgetCard widgetId={widget.id} config={widget.config} />
          </div>
        ))}
      </div>
    </>
  )
}
