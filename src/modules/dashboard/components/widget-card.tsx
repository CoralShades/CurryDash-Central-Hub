'use client'

import { useState, Suspense } from 'react'
import { ErrorBoundary, WidgetError, WidgetSkeleton } from '@/components/shared'
import type { WidgetConfig } from '../config/widget-registry'

interface WidgetCardProps {
  config: WidgetConfig
  children: React.ReactNode
}

/**
 * Card shell wrapping each dashboard widget.
 * - ErrorBoundary: isolates crashes (FR19)
 * - Suspense: shows WidgetSkeleton while data loads
 * - Hover: elevates shadow for visual feedback
 */
export function WidgetCard({ config, children }: WidgetCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'white',
        borderRadius: 'var(--radius-md)',
        boxShadow: isHovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        padding: 'var(--space-5)',
        transition: 'box-shadow var(--transition-fast)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '160px',
        overflow: 'hidden',
      }}
    >
      <ErrorBoundary fallback={<WidgetError />}>
        <Suspense fallback={<WidgetSkeleton variant={config.skeletonVariant} />}>
          {children}
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
