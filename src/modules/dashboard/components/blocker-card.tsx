'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

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
  item: BlockerItem | null
  open: boolean
  onClose: () => void
}

function DetailPanel({ item, open, onClose }: DetailPanelProps) {
  if (!item) return null

  const handleCopyLink = () => {
    void navigator.clipboard.writeText(window.location.href + '#' + item.id)
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <SheetContent side="right" className="w-[420px] max-w-[90vw] flex flex-col p-0 overflow-y-auto">
        <SheetHeader className="p-5 border-b border-border">
          <p className="m-0 mb-1 text-[0.6875rem] text-muted-foreground">
            Dashboard › Blockers & Alerts › {item.key}
          </p>
          <SheetTitle className="text-base font-semibold leading-[1.4] text-left">
            <span className="text-muted-foreground font-medium">{item.key}</span>
            {' '}
            {item.title}
          </SheetTitle>
        </SheetHeader>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 flex-1">
          {/* Severity badge */}
          <div>
            <Badge
              variant={item.severity === 'blocker' ? 'destructive' : 'secondary'}
              className={cn(
                'text-xs font-semibold',
                item.severity === 'blocker'
                  ? 'bg-destructive/10 text-chili border-0'
                  : 'bg-amber-100 text-amber-800 border-0'
              )}
            >
              {item.severity === 'blocker' ? 'Blocker' : 'Warning'}
            </Badge>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-3 text-[0.8125rem]">
            {item.status && (
              <>
                <span className="text-muted-foreground font-medium">Status</span>
                <span className="text-foreground">{item.status}</span>
              </>
            )}
            {item.priority && (
              <>
                <span className="text-muted-foreground font-medium">Priority</span>
                <span className="text-foreground">{item.priority}</span>
              </>
            )}
            {item.assignee && (
              <>
                <span className="text-muted-foreground font-medium">Assignee</span>
                <span className="text-foreground">{item.assignee}</span>
              </>
            )}
            {item.daysBlocked !== undefined && (
              <>
                <span className="text-muted-foreground font-medium">Duration</span>
                <span className="text-chili font-semibold">
                  {item.daysBlocked} day{item.daysBlocked !== 1 ? 's' : ''} blocked
                </span>
              </>
            )}
            <>
              <span className="text-muted-foreground font-medium">Source</span>
              <span className="text-foreground">{item.source}</span>
            </>
          </div>

          {/* Description */}
          {item.description && (
            <div>
              <p className="m-0 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-[0.05em]">
                Description
              </p>
              <p className="m-0 text-sm text-foreground leading-[1.6]">
                {item.description}
              </p>
            </div>
          )}
        </div>

        {/* Actions footer */}
        <div className="p-4 px-5 border-t border-border flex gap-3">
          {item.externalUrl && (
            <Button asChild size="sm" className="text-[0.8125rem] font-medium">
              <a
                href={item.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in {item.source} ↗
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="text-[0.8125rem] font-medium"
          >
            Copy link
          </Button>
        </div>
      </SheetContent>
    </Sheet>
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
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
            Blockers & Alerts
          </p>

          {blockers.length > 0 && (
            <Badge
              variant="destructive"
              className="bg-destructive/10 text-chili border-0 text-[0.6875rem] font-bold rounded-full px-2 py-0.5"
              aria-label={`${blockers.length} active blockers`}
            >
              {blockers.length} blocker{blockers.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <span className="text-2xl" aria-hidden="true">✓</span>
            <p className="m-0 text-sm text-emerald-600 font-medium">
              No blockers — all clear
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col gap-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={cn(
                  'block w-full text-left py-3 pr-3 pl-4',
                  'bg-muted/50 border border-border rounded-r-[var(--radius-sm)]',
                  'cursor-pointer transition-colors hover:bg-muted',
                  item.severity === 'blocker'
                    ? 'border-l-4 border-l-chili'
                    : 'border-l-4 border-l-turmeric'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-[0.6875rem] font-semibold text-muted-foreground">
                      {item.key}
                    </span>
                    <p
                      className={cn(
                        'mt-0.5 text-[0.8125rem] text-foreground font-medium leading-[1.4]',
                        'overflow-hidden line-clamp-2'
                      )}
                    >
                      {item.title}
                    </p>
                  </div>
                  {item.daysBlocked !== undefined && (
                    <span className="flex-shrink-0 text-[0.6875rem] text-chili font-semibold whitespace-nowrap">
                      blocked · {item.daysBlocked}d
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[0.6875rem] text-muted-foreground">
                  {item.source}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail panel overlay */}
      <DetailPanel
        item={selectedItem}
        open={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
      />
    </>
  )
}
