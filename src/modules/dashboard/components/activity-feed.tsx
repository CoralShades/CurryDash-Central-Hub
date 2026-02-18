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

const EVENT_ICONS: Record<ActivityEventType, { icon: string; color: string }> = {
  pr_merged: { icon: '⎇', color: 'var(--color-coriander)' },
  issue_transitioned: { icon: '◈', color: 'var(--color-turmeric)' },
  commits_pushed: { icon: '↑', color: 'var(--color-primary)' },
  webhook_sync: { icon: '⟳', color: 'var(--color-text-muted)' },
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <p
        style={{
          margin: '0 0 var(--space-3)',
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--color-text-secondary)',
        }}
      >
        Team Activity
      </p>

      {/* Feed */}
      <div
        aria-live="polite"
        aria-label="Team activity feed"
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          paddingRight: '4px',
        }}
      >
        {displayEvents.map((event) => {
          const { icon, color } = EVENT_ICONS[event.type]
          return (
            <div
              key={event.id}
              style={{
                display: 'flex',
                gap: 'var(--space-3)',
                alignItems: 'flex-start',
                paddingBottom: 'var(--space-3)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              {/* Avatar */}
              <div
                aria-hidden="true"
                style={{
                  flexShrink: 0,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                }}
              >
                {event.actor === 'System' ? icon : event.actorInitials}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.8125rem',
                    color: 'var(--color-text)',
                    lineHeight: '1.4',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <strong style={{ fontWeight: 600 }}>{event.actor}</strong>
                  {' '}
                  {event.action}
                  {' '}
                  <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                    {event.target}
                  </span>
                </p>
                <p
                  style={{
                    margin: '2px 0 0',
                    fontSize: '0.6875rem',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {event.timestamp}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
