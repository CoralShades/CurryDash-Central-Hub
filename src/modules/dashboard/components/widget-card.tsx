import { Suspense } from 'react'
import { ErrorBoundary, WidgetError, WidgetSkeleton } from '@/components/shared'
import { Card } from '@/components/ui/card'
import type { WidgetConfig } from '../config/widget-registry'

interface WidgetCardProps {
  config: WidgetConfig
  children: React.ReactNode
}

/**
 * Card shell wrapping each dashboard widget.
 * - ErrorBoundary: isolates crashes (FR19)
 * - Suspense: shows WidgetSkeleton while data loads
 * - Hover: elevates shadow via CSS transition (no useState required)
 */
export function WidgetCard({ config, children }: WidgetCardProps) {
  return (
    <Card className="flex flex-col min-h-[160px] overflow-hidden p-5 shadow-sm transition-shadow hover:shadow-md">
      <ErrorBoundary fallback={<WidgetError />}>
        <Suspense fallback={<WidgetSkeleton variant={config.skeletonVariant} />}>
          {children}
        </Suspense>
      </ErrorBoundary>
    </Card>
  )
}
