'use client'

import { Button } from '@/components/ui/button'

interface WidgetErrorProps {
  message?: string
  onRetry?: () => void
}

export function WidgetError({ message = 'Something went wrong', onRetry }: WidgetErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm text-chili">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
