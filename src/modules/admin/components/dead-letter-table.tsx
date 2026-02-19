'use client'

import { useState, useTransition } from 'react'
import {
  retryDeadLetterEvent,
  bulkRetryDeadLetterEvents,
} from '../actions/retry-dead-letter'
import type { DeadLetterEvent, DeadLetterStatus } from '../actions/retry-dead-letter'

interface DeadLetterTableProps {
  events: DeadLetterEvent[]
}

const STATUS_STYLE: Record<DeadLetterStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'var(--color-turmeric)', bg: '#FFF8DC' },
  retried: { label: 'Retried', color: '#6b7280', bg: '#f3f4f6' },
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts)
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface ExpandedRowProps {
  event: DeadLetterEvent
}

function ExpandedRow({ event }: ExpandedRowProps) {
  return (
    <div
      style={{
        padding: '16px 20px',
        backgroundColor: '#fafafa',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      {/* Correlation ID and pipeline step */}
      <div style={{ display: 'flex', gap: '32px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div>
          <p
            style={{
              margin: '0 0 4px 0',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#9ca3af',
            }}
          >
            Correlation ID
          </p>
          <code
            style={{
              fontSize: '12px',
              color: 'var(--color-text)',
              fontFamily: 'monospace',
              backgroundColor: '#f1f5f9',
              padding: '2px 6px',
              borderRadius: '4px',
            }}
          >
            {event.correlationId}
          </code>
        </div>
        {event.eventId && (
          <div>
            <p
              style={{
                margin: '0 0 4px 0',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#9ca3af',
              }}
            >
              Event ID
            </p>
            <code
              style={{
                fontSize: '12px',
                color: 'var(--color-text)',
                fontFamily: 'monospace',
                backgroundColor: '#f1f5f9',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {event.eventId}
            </code>
          </div>
        )}
        <div>
          <p
            style={{
              margin: '0 0 4px 0',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#9ca3af',
            }}
          >
            Retry Count
          </p>
          <span
            style={{ fontSize: '12px', color: 'var(--color-text)', fontFamily: 'monospace' }}
          >
            {event.retryCount}
          </span>
        </div>
      </div>

      {/* Error stack trace */}
      <div style={{ marginBottom: '16px' }}>
        <p
          style={{
            margin: '0 0 8px 0',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-chili)',
          }}
        >
          Error / Stack Trace
        </p>
        <pre
          style={{
            margin: 0,
            padding: '12px',
            backgroundColor: '#fff1f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            fontSize: '11px',
            fontFamily: 'monospace',
            color: 'var(--color-chili)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '160px',
            overflowY: 'auto',
          }}
        >
          {event.error}
        </pre>
      </div>

      {/* Raw payload */}
      <div>
        <p
          style={{
            margin: '0 0 8px 0',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
          }}
        >
          Raw Payload (JSON)
        </p>
        <pre
          style={{
            margin: 0,
            padding: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#0f172a',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '240px',
            overflowY: 'auto',
          }}
        >
          {JSON.stringify(event.payload, null, 2)}
        </pre>
      </div>
    </div>
  )
}

/**
 * DeadLetterTable — Client Component
 * Displays failed webhook events with expandable rows for investigation.
 * Provides Retry (single) and Retry All (bulk) actions.
 */
export function DeadLetterTable({ events: initialEvents }: DeadLetterTableProps) {
  const [events, setEvents] = useState(initialEvents)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [retrying, setRetrying] = useState<Set<string>>(new Set())
  const [isBulkRetrying, startBulkTransition] = useTransition()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  function toggleRow(id: string) {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function handleRetry(eventId: string) {
    setRetrying((prev) => new Set(prev).add(eventId))
    try {
      const result = await retryDeadLetterEvent({ eventId })
      if (result.error) {
        showToast(`Retry failed: ${result.error.message}`, 'error')
        // Update local state to reflect incremented retry count
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, retryCount: e.retryCount + 1, status: 'retried' as const }
              : e
          )
        )
      } else {
        showToast('Event retried successfully', 'success')
        // Remove from local list (deleted from DB on success)
        setEvents((prev) => prev.filter((e) => e.id !== eventId))
      }
    } finally {
      setRetrying((prev) => {
        const next = new Set(prev)
        next.delete(eventId)
        return next
      })
    }
  }

  function handleBulkRetry() {
    startBulkTransition(async () => {
      const result = await bulkRetryDeadLetterEvents()
      if (result.error) {
        showToast(`Bulk retry failed: ${result.error.message}`, 'error')
      } else {
        const { attempted, succeeded, failed } = result.data
        showToast(
          `Bulk retry: ${succeeded}/${attempted} succeeded${failed > 0 ? `, ${failed} failed` : ''}`,
          succeeded > 0 ? 'success' : 'error'
        )
        // Refresh local state: remove successfully retried events
        if (succeeded > 0) {
          setEvents((prev) => prev.filter((e) => e.retryCount > 0))
        }
      }
    })
  }

  const pendingCount = events.filter((e) => e.status === 'pending').length

  return (
    <div>
      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            padding: '12px 20px',
            borderRadius: '8px',
            backgroundColor: toast.type === 'success' ? 'var(--color-coriander)' : 'var(--color-chili)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500,
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      {/* Table header with Retry All */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            {events.length === 0
              ? 'No failed events'
              : `${events.length} event${events.length !== 1 ? 's' : ''} — click a row to inspect`}
          </p>
        </div>
        {pendingCount > 0 && (
          <button
            onClick={handleBulkRetry}
            disabled={isBulkRetrying}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid var(--color-chili)',
              backgroundColor: isBulkRetrying ? '#f3f4f6' : 'white',
              color: isBulkRetrying ? '#9ca3af' : 'var(--color-chili)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: isBulkRetrying ? 'not-allowed' : 'pointer',
            }}
            aria-label={`Retry all ${pendingCount} pending events`}
          >
            {isBulkRetrying ? 'Retrying…' : `Retry All (${pendingCount} pending)`}
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            color: '#9ca3af',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px dashed var(--color-border)',
          }}
        >
          No dead letter events. Pipeline is healthy.
        </div>
      ) : (
        <div
          style={{
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 120px 1fr 180px 80px 80px 80px',
              padding: '10px 16px',
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#6b7280',
              gap: '12px',
            }}
          >
            <span>Source</span>
            <span>Event Type</span>
            <span>Failure Reason</span>
            <span>Failed At</span>
            <span>Retries</span>
            <span>Status</span>
            <span>Action</span>
          </div>

          {/* Table rows */}
          {events.map((event) => {
            const isExpanded = expandedRows.has(event.id)
            const isRetrying = retrying.has(event.id)
            const statusStyle = STATUS_STYLE[event.status]

            return (
              <div key={event.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                {/* Main row */}
                <div
                  onClick={() => toggleRow(event.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' || e.key === ' ' ? toggleRow(event.id) : undefined}
                  aria-expanded={isExpanded}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 120px 1fr 180px 80px 80px 80px',
                    padding: '12px 16px',
                    gap: '12px',
                    alignItems: 'center',
                    cursor: 'pointer',
                    backgroundColor: isExpanded ? '#f8fafc' : 'white',
                    transition: 'background-color 0.1s',
                  }}
                >
                  {/* Source badge */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor:
                          event.source === 'jira'
                            ? '#0052CC'
                            : event.source === 'github'
                              ? '#24292e'
                              : '#6b7280',
                        flexShrink: 0,
                      }}
                    />
                    {event.source}
                  </span>

                  {/* Event type */}
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#374151',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={event.eventType}
                  >
                    {event.eventType}
                  </span>

                  {/* Failure reason (first line only) */}
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-chili)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={event.error}
                  >
                    {event.error.split('\n')[0]}
                  </span>

                  {/* Timestamp */}
                  <span style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                    {formatTimestamp(event.createdAt)}
                  </span>

                  {/* Retry count */}
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text)' }}>
                    {event.retryCount}
                  </span>

                  {/* Status badge */}
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: statusStyle.color,
                      backgroundColor: statusStyle.bg,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {statusStyle.label}
                  </span>

                  {/* Retry button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRetry(event.id)
                    }}
                    disabled={isRetrying}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: '1px solid var(--color-coriander)',
                      backgroundColor: isRetrying ? '#f3f4f6' : 'white',
                      color: isRetrying ? '#9ca3af' : 'var(--color-coriander)',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: isRetrying ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                    aria-label={`Retry event ${event.id}`}
                  >
                    {isRetrying ? '…' : 'Retry'}
                  </button>
                </div>

                {/* Expanded detail row */}
                {isExpanded && <ExpandedRow event={event} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
