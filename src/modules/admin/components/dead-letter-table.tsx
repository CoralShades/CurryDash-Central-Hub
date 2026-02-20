'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  retryDeadLetterEvent,
  bulkRetryDeadLetterEvents,
} from '../actions/retry-dead-letter'
import type { DeadLetterEvent, DeadLetterStatus } from '../actions/retry-dead-letter'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface DeadLetterTableProps {
  events: DeadLetterEvent[]
}

const STATUS_BADGE_STYLES: Record<DeadLetterStatus, string> = {
  pending: 'bg-turmeric/10 text-turmeric border-turmeric/20',
  retried: 'bg-muted text-muted-foreground border-border',
}

const STATUS_LABELS: Record<DeadLetterStatus, string> = {
  pending: 'Pending',
  retried: 'Retried',
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
    <div className="px-5 py-4 bg-muted/30 border-t border-border">
      {/* Correlation ID and pipeline step */}
      <div className="flex gap-8 mb-4 flex-wrap">
        <div>
          <p className="m-0 mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Correlation ID
          </p>
          <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
            {event.correlationId}
          </code>
        </div>
        {event.eventId && (
          <div>
            <p className="m-0 mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Event ID
            </p>
            <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
              {event.eventId}
            </code>
          </div>
        )}
        <div>
          <p className="m-0 mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Retry Count
          </p>
          <span className="text-xs font-mono">
            {event.retryCount}
          </span>
        </div>
      </div>

      {/* Error stack trace */}
      <div className="mb-4">
        <p className="mb-2 text-xs font-semibold text-chili">
          Error / Stack Trace
        </p>
        <ScrollArea className="h-40">
          <pre className="p-3 bg-chili/5 border border-chili/20 rounded-md text-[11px] font-mono text-chili whitespace-pre-wrap break-words">
            {event.error}
          </pre>
        </ScrollArea>
      </div>

      {/* Raw payload */}
      <div>
        <p className="mb-2 text-xs font-semibold text-muted-foreground">
          Raw Payload (JSON)
        </p>
        <ScrollArea className="h-60">
          <pre className="p-3 bg-muted/50 border border-border rounded-md text-[11px] font-mono whitespace-pre-wrap break-words">
            {JSON.stringify(event.payload, null, 2)}
          </pre>
        </ScrollArea>
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
        toast.error(`Retry failed: ${result.error.message}`)
        // Update local state to reflect incremented retry count
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, retryCount: e.retryCount + 1, status: 'retried' as const }
              : e
          )
        )
      } else {
        toast.success('Event retried successfully')
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
        toast.error(`Bulk retry failed: ${result.error.message}`)
      } else {
        const { attempted, succeeded, failed } = result.data
        const message = `Bulk retry: ${succeeded}/${attempted} succeeded${failed > 0 ? `, ${failed} failed` : ''}`
        if (succeeded > 0) {
          toast.success(message)
        } else {
          toast.error(message)
        }
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
      {/* Table header with Retry All */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {events.length === 0
            ? 'No failed events'
            : `${events.length} event${events.length !== 1 ? 's' : ''} — click a row to inspect`}
        </p>
        {pendingCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkRetry}
            disabled={isBulkRetrying}
            className="text-chili border-chili/40 hover:bg-chili/10"
            aria-label={`Retry all ${pendingCount} pending events`}
          >
            {isBulkRetrying ? 'Retrying…' : `Retry All (${pendingCount} pending)`}
          </Button>
        )}
      </div>

      {events.length === 0 ? (
        <div className="py-10 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
          No dead letter events. Pipeline is healthy.
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Source</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Event Type</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Failure Reason</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Failed At</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Retries</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Status</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => {
                const isExpanded = expandedRows.has(event.id)
                const isRetrying = retrying.has(event.id)

                return (
                  <>
                    <TableRow
                      key={event.id}
                      onClick={() => toggleRow(event.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === 'Enter' || e.key === ' ' ? toggleRow(event.id) : undefined
                      }
                      aria-expanded={isExpanded}
                      className={cn(
                        'cursor-pointer',
                        isExpanded ? 'bg-muted/30' : 'hover:bg-muted/20'
                      )}
                    >
                      {/* Source badge */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-xs font-medium"
                        >
                          {event.source}
                        </Badge>
                      </TableCell>

                      {/* Event type */}
                      <TableCell
                        className="text-xs max-w-[120px] truncate"
                        title={event.eventType}
                      >
                        {event.eventType}
                      </TableCell>

                      {/* Failure reason (first line only) */}
                      <TableCell
                        className="text-xs text-chili max-w-[200px] truncate"
                        title={event.error}
                      >
                        {event.error.split('\n')[0]}
                      </TableCell>

                      {/* Timestamp */}
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimestamp(event.createdAt)}
                      </TableCell>

                      {/* Retry count */}
                      <TableCell className="text-sm font-medium">
                        {event.retryCount}
                      </TableCell>

                      {/* Status badge */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('text-[11px] font-semibold', STATUS_BADGE_STYLES[event.status])}
                        >
                          {STATUS_LABELS[event.status]}
                        </Badge>
                      </TableCell>

                      {/* Retry button */}
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRetry(event.id)
                          }}
                          disabled={isRetrying}
                          className="text-coriander border-coriander/40 hover:bg-coriander/10 text-xs"
                          aria-label={`Retry event ${event.id}`}
                        >
                          {isRetrying ? '…' : 'Retry'}
                        </Button>
                      </TableCell>
                    </TableRow>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <TableRow key={`${event.id}-expanded`}>
                        <TableCell colSpan={7} className="p-0">
                          <ExpandedRow event={event} />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
