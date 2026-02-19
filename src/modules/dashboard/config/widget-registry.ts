import type { Role } from '@/types/roles'

export type WidgetColSpan = 3 | 4 | 6 | 12
export type WidgetVariant = 'stats' | 'chart' | 'table' | 'list'
export type RefreshBehavior = 'static' | 'realtime' | 'polling'

export interface WidgetConfig {
  id: string
  title: string
  description?: string
  colSpan: WidgetColSpan
  skeletonVariant: WidgetVariant
  dataSource: 'jira' | 'github' | 'supabase' | 'mixed' | 'static'
  refreshBehavior: RefreshBehavior
}

/**
 * Config-driven widget registry: maps role → ordered list of widget configs.
 * Actual widget React components are rendered by WidgetGrid based on widget.id.
 * Add new widgets here first, then create the corresponding component.
 */
export const widgetRegistry: Record<Role, WidgetConfig[]> = {
  admin: [
    {
      id: 'stories-completed',
      title: 'Stories Completed',
      colSpan: 3,
      skeletonVariant: 'stats',
      dataSource: 'jira',
      refreshBehavior: 'realtime',
    },
    {
      id: 'prs-merged',
      title: 'PRs Merged',
      colSpan: 3,
      skeletonVariant: 'stats',
      dataSource: 'github',
      refreshBehavior: 'realtime',
    },
    {
      id: 'bugs-open',
      title: 'Bugs Open',
      colSpan: 3,
      skeletonVariant: 'stats',
      dataSource: 'jira',
      refreshBehavior: 'realtime',
    },
    {
      id: 'ci-status',
      title: 'CI Status',
      colSpan: 3,
      skeletonVariant: 'stats',
      dataSource: 'github',
      refreshBehavior: 'realtime',
    },
    {
      id: 'sprint-progress',
      title: 'Sprint Progress',
      colSpan: 6,
      skeletonVariant: 'chart',
      dataSource: 'jira',
      refreshBehavior: 'realtime',
    },
    {
      id: 'team-activity',
      title: 'Team Activity',
      colSpan: 6,
      skeletonVariant: 'list',
      dataSource: 'mixed',
      refreshBehavior: 'realtime',
    },
    {
      id: 'blockers',
      title: 'Blockers & Alerts',
      colSpan: 6,
      skeletonVariant: 'list',
      dataSource: 'jira',
      refreshBehavior: 'realtime',
    },
    {
      id: 'system-health',
      title: 'System Health',
      colSpan: 6,
      skeletonVariant: 'table',
      dataSource: 'supabase',
      refreshBehavior: 'polling',
    },
  ],
  developer: [
    {
      id: 'stories-completed',
      title: 'Stories Completed',
      colSpan: 3,
      skeletonVariant: 'stats',
      dataSource: 'jira',
      refreshBehavior: 'realtime',
    },
    {
      id: 'prs-merged',
      title: 'PRs Merged',
      colSpan: 3,
      skeletonVariant: 'stats',
      dataSource: 'github',
      refreshBehavior: 'realtime',
    },
    {
      id: 'bugs-open',
      title: 'Bugs Open',
      colSpan: 3,
      skeletonVariant: 'stats',
      dataSource: 'jira',
      refreshBehavior: 'realtime',
    },
    {
      id: 'ci-status',
      title: 'CI Status',
      colSpan: 3,
      skeletonVariant: 'stats',
      dataSource: 'github',
      refreshBehavior: 'realtime',
    },
    {
      id: 'sprint-progress',
      title: 'Sprint Progress',
      colSpan: 6,
      skeletonVariant: 'chart',
      dataSource: 'jira',
      refreshBehavior: 'realtime',
    },
    {
      id: 'pr-status',
      title: 'Pull Requests',
      colSpan: 6,
      skeletonVariant: 'table',
      dataSource: 'github',
      refreshBehavior: 'realtime',
    },
    {
      id: 'blockers',
      title: 'Blockers & Alerts',
      colSpan: 6,
      skeletonVariant: 'list',
      dataSource: 'jira',
      refreshBehavior: 'realtime',
    },
    {
      id: 'team-activity',
      title: 'Team Activity',
      colSpan: 6,
      skeletonVariant: 'list',
      dataSource: 'mixed',
      refreshBehavior: 'realtime',
    },
  ],
  qa: [
    {
      id: 'stories-completed',
      title: 'Stories Completed',
      colSpan: 3,
      skeletonVariant: 'stats',
      dataSource: 'jira',
      refreshBehavior: 'realtime',
    },
    {
      id: 'prs-merged',
      title: 'PRs Merged',
      colSpan: 3,
      skeletonVariant: 'stats',
      dataSource: 'github',
      refreshBehavior: 'realtime',
    },
    {
      id: 'bugs-open',
      title: 'Bugs Open',
      colSpan: 3,
      skeletonVariant: 'stats',
      dataSource: 'jira',
      refreshBehavior: 'realtime',
    },
    {
      id: 'ci-status',
      title: 'CI Status',
      colSpan: 3,
      skeletonVariant: 'stats',
      dataSource: 'github',
      refreshBehavior: 'realtime',
    },
    {
      id: 'blockers',
      title: 'Blockers & Alerts',
      colSpan: 6,
      skeletonVariant: 'list',
      dataSource: 'jira',
      refreshBehavior: 'realtime',
    },
    {
      id: 'team-activity',
      title: 'Team Activity',
      colSpan: 6,
      skeletonVariant: 'list',
      dataSource: 'mixed',
      refreshBehavior: 'realtime',
    },
    {
      id: 'sprint-progress',
      title: 'Sprint Progress',
      colSpan: 12,
      skeletonVariant: 'chart',
      dataSource: 'jira',
      refreshBehavior: 'realtime',
    },
  ],
  stakeholder: [
    {
      id: 'stories-completed',
      title: 'Stories Completed',
      colSpan: 3,
      skeletonVariant: 'stats',
      dataSource: 'jira',
      refreshBehavior: 'realtime',
    },
    {
      id: 'prs-merged',
      title: 'PRs Merged',
      colSpan: 3,
      skeletonVariant: 'stats',
      dataSource: 'github',
      refreshBehavior: 'realtime',
    },
    {
      id: 'bugs-open',
      title: 'Bugs Open',
      colSpan: 3,
      skeletonVariant: 'stats',
      dataSource: 'jira',
      refreshBehavior: 'realtime',
    },
    {
      id: 'ci-status',
      title: 'CI Status',
      colSpan: 3,
      skeletonVariant: 'stats',
      dataSource: 'github',
      refreshBehavior: 'realtime',
    },
    {
      id: 'sprint-progress',
      title: 'Sprint Progress',
      colSpan: 6,
      skeletonVariant: 'chart',
      dataSource: 'jira',
      refreshBehavior: 'realtime',
    },
    {
      id: 'pr-status',
      title: 'Pull Requests',
      colSpan: 6,
      skeletonVariant: 'table',
      dataSource: 'github',
      refreshBehavior: 'realtime',
    },
    {
      id: 'team-activity',
      title: 'Team Activity',
      colSpan: 12,
      skeletonVariant: 'list',
      dataSource: 'mixed',
      refreshBehavior: 'realtime',
    },
  ],
}

export const VALID_COL_SPANS: WidgetColSpan[] = [3, 4, 6, 12]
