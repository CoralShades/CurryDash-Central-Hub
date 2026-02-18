'use client'

interface WidgetErrorProps {
  message?: string
  onRetry?: () => void
}

export function WidgetError({ message = 'Something went wrong', onRetry }: WidgetErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 p-6 text-center">
      <p style={{ color: 'var(--color-chili)', fontSize: 'var(--text-sm)' }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded px-3 py-1.5 text-sm transition-colors hover:opacity-80"
          style={{
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
            backgroundColor: 'transparent',
          }}
        >
          Try again
        </button>
      )}
    </div>
  )
}
