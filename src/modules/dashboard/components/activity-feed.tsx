import { GitPullRequest, GitCommit, CheckCircle2, RefreshCw } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export type ActivityEventType = 'pr_merged' | 'issue_transitioned' | 'commits_pushed' | 'webhook_sync'

export interface ActivityEvent {
  id: string
  type: ActivityEventType
  actor: string
  actorInitials: string
  action: string
  target: string
  targetUrl?: string
  timestamp: string
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_EVENTS: ActivityEvent[] = [
  { id: '1', type: 'pr_merged', actor: 'Alice Chen', actorInitials: 'AC', action: 'merged', target: 'PR #142 — Add OAuth flow', timestamp: '2m ago' },
  { id: '2', type: 'issue_transitioned', actor: 'Bob Kim', actorInitials: 'BK', action: 'moved to', target: 'CUR-312 → In Review', timestamp: '8m ago' },
  { id: '3', type: 'commits_pushed', actor: 'Carol Lin', actorInitials: 'CL', action: 'pushed 3 commits to', target: 'feature/payment-timeout', timestamp: '15m ago' },
  { id: '4', type: 'webhook_sync', actor: 'System', actorInitials: 'SY', action: 'synced', target: '14 Jira issues', timestamp: '22m ago' },
  { id: '5', type: 'pr_merged', actor: 'Dave Wong', actorInitials: 'DW', action: 'merged', target: 'PR #139 — Fix session expiry', timestamp: '45m ago' },
  { id: '6', type: 'issue_transitioned', actor: 'Eve Park', actorInitials: 'EP', action: 'moved to', target: 'PACK-88 → Done', timestamp: '1h ago' },
  { id: '7', type: 'commits_pushed', actor: 'Frank Gill', actorInitials: 'FG', action: 'pushed 7 commits to', target: 'main', timestamp: '2h ago' },
  { id: '8', type: 'webhook_sync', actor: 'System', actorInitials: 'SY', action: 'synced', target: '6 GitHub PRs', timestamp: '2h ago' },
  { id: '9', type: 'issue_transitioned', actor: 'Grace Ho', actorInitials: 'GH', action: 'moved to', target: 'CAD-45 → Testing', timestamp: '3h ago' },
  { id: '10', type: 'pr_merged', actor: 'Henry Lu', actorInitials: 'HL', action: 'merged', target: 'PR #135 — Update docs', timestamp: '4h ago' },
]

const EVENT_ICON_CLASS: Record<ActivityEventType, string> = {
  pr_merged: 'text-coriander',
  issue_transitioned: 'text-turmeric',
  commits_pushed: 'text-primary',
  webhook_sync: 'text-muted-foreground',
}

const EVENT_AVATAR_CLASS: Record<ActivityEventType, string> = {
  pr_merged: 'bg-coriander',
  issue_transitioned: 'bg-turmeric',
  commits_pushed: 'bg-primary',
  webhook_sync: 'bg-muted',
}

function EventTypeIcon({ type }: { type: ActivityEventType }) {
  const cls = cn('h-3.5 w-3.5', EVENT_ICON_CLASS[type])
  switch (type) {
    case 'pr_merged': return <GitPullRequest className={cls} aria-hidden="true" />
    case 'issue_transitioned': return <CheckCircle2 className={cls} aria-hidden="true" />
    case 'commits_pushed': return <GitCommit className={cls} aria-hidden="true" />
    case 'webhook_sync': return <RefreshCw className={cls} aria-hidden="true" />
  }
}

interface ActivityFeedProps {
  events?: ActivityEvent[]
  maxItems?: number
}

/**
 * Chronological activity feed. Uses mock data until Epics 4-5 wire live events.
 * aria-live="polite" for screen reader announcements.
 */
export function ActivityFeed({ events = MOCK_EVENTS, maxItems = 10 }: ActivityFeedProps) {
  const displayEvents = events.slice(0, maxItems)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <p className="m-0 mb-3 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
        Team Activity
      </p>

      {/* Feed */}
      <ScrollArea className="flex-1">
        <div
          aria-live="polite"
          aria-label="Team activity feed"
          className="flex flex-col gap-3 pr-1"
        >
          {displayEvents.map((event) => (
            <div
              key={event.id}
              className="flex gap-3 items-start pb-3 border-b border-border"
            >
              {/* Avatar */}
              <Avatar className={cn('h-8 w-8 flex-shrink-0 text-[0.6875rem] font-semibold text-white', EVENT_AVATAR_CLASS[event.type])} aria-hidden="true">
                <AvatarFallback className={cn('text-[0.6875rem] font-semibold text-white', EVENT_AVATAR_CLASS[event.type])}>
                  {event.actor === 'System'
                    ? <EventTypeIcon type={event.type} />
                    : event.actorInitials}
                </AvatarFallback>
              </Avatar>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="m-0 text-[0.8125rem] text-foreground leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap">
                  <strong className="font-semibold">{event.actor}</strong>
                  {' '}
                  {event.action}
                  {' '}
                  <span className="text-primary font-medium">
                    {event.target}
                  </span>
                </p>
                <p className="m-0 mt-0.5 text-[0.6875rem] text-muted-foreground">
                  {event.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
