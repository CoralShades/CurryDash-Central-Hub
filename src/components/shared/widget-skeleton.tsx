import { cn } from '@/lib/utils'

type SkeletonVariant = 'chart' | 'table' | 'stats' | 'list'

interface WidgetSkeletonProps {
  variant: SkeletonVariant
  className?: string
}

function ShimmerLine({ width = 'full', height = 4 }: { width?: string | number; height?: number }) {
  return (
    <div
      className="animate-pulse rounded bg-border"
      style={{
        width: typeof width === 'number' ? `${width}%` : '100%',
        height: `${height * 4}px`,
      }}
    />
  )
}

export function WidgetSkeleton({ variant, className }: WidgetSkeletonProps) {
  return (
    <div className={cn('space-y-3 p-4', className)} aria-busy="true" aria-label="Loading...">
      {variant === 'stats' && (
        <>
          <ShimmerLine width={60} height={3} />
          <ShimmerLine width={40} height={8} />
          <ShimmerLine width={80} height={2} />
        </>
      )}
      {variant === 'chart' && (
        <>
          <ShimmerLine width={50} height={3} />
          <div className="flex h-[120px] items-end gap-2 pt-2">
            {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
              <div
                key={i}
                className="animate-pulse flex-1 rounded-t bg-border"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </>
      )}
      {variant === 'table' && (
        <div className="space-y-2">
          <ShimmerLine height={3} />
          <div className="space-y-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <ShimmerLine key={i} width={i % 2 === 0 ? 100 : 85} height={2} />
            ))}
          </div>
        </div>
      )}
      {variant === 'list' && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-border" />
              <div className="flex-1 space-y-1.5">
                <ShimmerLine width={70} height={2} />
                <ShimmerLine width={50} height={2} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
