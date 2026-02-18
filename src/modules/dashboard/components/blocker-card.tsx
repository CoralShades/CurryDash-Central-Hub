'use client'

import { useState } from 'react'

export type BlockerSeverity = 'blocker' | 'warning'

export interface BlockerItem {
  id: string
  key: string
  title: string
  severity: BlockerSeverity
  daysBlocked?: number
  source: string
  description?: string
  assignee?: string
  status?: string
  priority?: string
  externalUrl?: string
}

// Mock data — replaced when Jira integration connects
const MOCK_BLOCKERS: BlockerItem[] = [
  {
    id: '1',
    key: 'CUR-312',
    title: 'Payment timeout in production — intermittent 503 errors',
    severity: 'blocker',
    daysBlocked: 3,
    source: 'Jira',
    description: 'Users experiencing intermittent 503 errors during checkout. Payment service timing out after 30s.',
    assignee: 'Carol Lin',
    status: 'In Progress',
    priority: 'Critical',
    externalUrl: '#',
  },
  {
    id: '2',
    key: 'PACK-88',
    title: 'Dependency conflict: react@18 incompatible with legacy auth library',
    severity: 'blocker',
    daysBlocked: 7,
    source: 'Jira',
    description: 'Auth library has peer dependency on react@16. Upgrade blocked until auth library releases v3.',
    assignee: 'Bob Kim',
    status: 'Blocked',
    priority: 'High',
    externalUrl: '#',
  },
  {
    id: '3',
    key: 'CI',
    title: 'GitHub Actions rate limit at 78% — approaching threshold',
    severity: 'warning',
    source: 'GitHub',
    description: 'Current GitHub Actions rate limit usage is at 78%. Consider optimising workflows or requesting limit increase.',
    externalUrl: '#',
  },
  {
    id: '4',
    key: 'JIRA',
    title: 'Jira webhook last synced 22 minutes ago',
    severity: 'warning',
    source: 'System',
    description: 'Jira webhook sync is running behind schedule. Data may be slightly stale.',
  },
]

interface DetailPanelProps {
  item: BlockerItem
  onClose: () => void
}

function DetailPanel({ item, onClose }: DetailPanelProps) {
  const handleCopyLink = () => {
    void navigator.clipboard.writeText(window.location.href + '#' + item.id)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        display: 'flex',
      }}
    >
      {/* Backdrop */}
      <div
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detail: ${item.key}`}
        style={{
          width: '420px',
          maxWidth: '90vw',
          backgroundColor: 'white',
          boxShadow: 'var(--shadow-lg)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-5)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 'var(--space-3)',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Breadcrumb */}
            <p style={{ margin: '0 0 4px', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
              Dashboard › Blockers & Alerts › {item.key}
            </p>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, lineHeight: 1.4 }}>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>{item.key}</span>
              {' '}
              {item.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close detail panel"
            style={{
              flexShrink: 0,
              padding: '4px 8px',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontSize: '1rem',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', flex: 1 }}>
          {/* Severity badge */}
          <div>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: item.severity === 'blocker' ? '#FEE2E2' : '#FEF3C7',
                color: item.severity === 'blocker' ? 'var(--color-chili)' : '#92400E',
              }}
            >
              {item.severity === 'blocker' ? '🔴 Blocker' : '⚠️ Warning'}
            </span>
          </div>

          {/* Metadata grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-3)',
              fontSize: '0.8125rem',
            }}
          >
            {item.status && (
              <>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Status</span>
                <span style={{ color: 'var(--color-text)' }}>{item.status}</span>
              </>
            )}
            {item.priority && (
              <>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Priority</span>
                <span style={{ color: 'var(--color-text)' }}>{item.priority}</span>
              </>
            )}
            {item.assignee && (
              <>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Assignee</span>
                <span style={{ color: 'var(--color-text)' }}>{item.assignee}</span>
              </>
            )}
            {item.daysBlocked !== undefined && (
              <>
                <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Duration</span>
                <span style={{ color: 'var(--color-chili)', fontWeight: 600 }}>
                  {item.daysBlocked} day{item.daysBlocked !== 1 ? 's' : ''} blocked
                </span>
              </>
            )}
            <>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Source</span>
              <span style={{ color: 'var(--color-text)' }}>{item.source}</span>
            </>
          </div>

          {/* Description */}
          {item.description && (
            <div>
              <p style={{ margin: '0 0 var(--space-2)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Description
              </p>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: 1.6 }}>
                {item.description}
              </p>
            </div>
          )}
        </div>

        {/* Actions footer */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-5)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            gap: 'var(--space-3)',
          }}
        >
          {item.externalUrl && (
            <a
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Open in {item.source} ↗
            </a>
          )}
          <button
            onClick={handleCopyLink}
            style={{
              padding: '8px 14px',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              color: 'var(--color-text)',
            }}
          >
            Copy link
          </button>
        </div>
      </div>
    </div>
  )
}

interface BlockerCardProps {
  items?: BlockerItem[]
}

/**
 * Blockers & Alerts card: priority-sorted list with Chili Red (blockers)
 * and Turmeric (warnings) left-border accents. Click any item to open
 * the slide-in detail panel.
 */
export function BlockerCard({ items = MOCK_BLOCKERS }: BlockerCardProps) {
  const [selectedItem, setSelectedItem] = useState<BlockerItem | null>(null)

  const blockers = items.filter((i) => i.severity === 'blocker')

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-3)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text-secondary)',
            }}
          >
            Blockers & Alerts
          </p>

          {blockers.length > 0 && (
            <span
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                backgroundColor: '#FEE2E2',
                color: 'var(--color-chili)',
                borderRadius: '999px',
                fontSize: '0.6875rem',
                fontWeight: 700,
              }}
              aria-label={`${blockers.length} active blockers`}
            >
              {blockers.length} blocker{blockers.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <span style={{ fontSize: '1.5rem' }} aria-hidden="true">✓</span>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-success)', fontWeight: 500 }}>
              No blockers — all clear
            </p>
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: 'var(--space-3) var(--space-3) var(--space-3) var(--space-4)',
                  borderLeft: `4px solid ${item.severity === 'blocker' ? 'var(--color-chili)' : 'var(--color-turmeric)'}`,
                  backgroundColor: 'var(--color-surface)',
                  border: `1px solid var(--color-border)`,
                  borderLeftWidth: '4px',
                  borderLeftColor: item.severity === 'blocker' ? 'var(--color-chili)' : 'var(--color-turmeric)',
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      {item.key}
                    </span>
                    <p
                      style={{
                        margin: '2px 0 0',
                        fontSize: '0.8125rem',
                        color: 'var(--color-text)',
                        fontWeight: 500,
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.title}
                    </p>
                  </div>
                  {item.daysBlocked !== undefined && (
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: '0.6875rem',
                        color: 'var(--color-chili)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      blocked · {item.daysBlocked}d
                    </span>
                  )}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
                  {item.source}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail panel overlay */}
      {selectedItem && (
        <DetailPanel
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  )
}
