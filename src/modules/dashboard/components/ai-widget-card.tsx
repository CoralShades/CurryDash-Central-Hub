'use client'

import { useState, Suspense, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ErrorBoundary, WidgetError, WidgetSkeleton } from '@/components/shared'
import { AiWidgetRenderer, getSkeletonVariant } from './ai-widget-renderer'
import { deleteWidget } from '../actions/manage-widgets'
import { useDashboardStore } from '@/stores/use-dashboard-store'
import type { AiWidgetConfig } from '@/lib/schemas/ai-widget-schema'

interface AiWidgetCardProps {
  widgetId: string
  config: AiWidgetConfig
}

/**
 * AiWidgetCard — wraps a persisted AI-generated widget with:
 * - ErrorBoundary + WidgetSkeleton for loading/error states (design-system rules)
 * - "..." context menu with "Remove from dashboard" and "Regenerate" actions (FR43)
 */
export function AiWidgetCard({ widgetId, config }: AiWidgetCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const openAiSidebar = useDashboardStore((s) => s.openAiSidebar)

  function handleRemove() {
    setMenuOpen(false)
    startTransition(async () => {
      await deleteWidget(widgetId)
      router.refresh()
    })
  }

  function handleRegenerate() {
    setMenuOpen(false)
    openAiSidebar()
  }

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: 'white',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        padding: 'var(--space-5)',
        minHeight: '160px',
        overflow: 'hidden',
        opacity: isPending ? 0.5 : 1,
        transition: 'opacity var(--transition-fast)',
      }}
    >
      {/* "..." context menu button */}
      <div style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)', zIndex: 10 }}>
        <button
          aria-label="Widget options"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 'var(--space-1)',
            color: 'var(--color-text-muted)',
            fontSize: '1rem',
            lineHeight: 1,
            borderRadius: 'var(--radius-sm)',
          }}
        >
          •••
        </button>

        {menuOpen && (
          <div
            role="menu"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              backgroundColor: 'white',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-md)',
              minWidth: '160px',
              zIndex: 20,
            }}
          >
            <button
              role="menuitem"
              onClick={handleRegenerate}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: 'var(--space-2) var(--space-3)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'var(--color-text)',
              }}
            >
              Regenerate
            </button>
            <button
              role="menuitem"
              onClick={handleRemove}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: 'var(--space-2) var(--space-3)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'var(--color-chili)',
              }}
            >
              Remove from dashboard
            </button>
          </div>
        )}
      </div>

      <ErrorBoundary fallback={<WidgetError />}>
        <Suspense fallback={<WidgetSkeleton variant={getSkeletonVariant(config.type)} />}>
          <AiWidgetRenderer config={config} />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
