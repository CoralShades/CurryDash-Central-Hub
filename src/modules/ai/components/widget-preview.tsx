'use client'

import { useState, useCallback } from 'react'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { WidgetError } from '@/components/shared/widget-error'
import { AiWidgetRenderer } from '@/modules/dashboard/components/ai-widget-renderer'
import { saveWidget } from '@/modules/reports/actions/save-widget'
import type { AiWidgetConfig } from '@/lib/schemas/ai-widget-schema'

interface WidgetPreviewProps {
  config: AiWidgetConfig
  /** CopilotKit action status — used to show appropriate state. */
  status: 'inProgress' | 'complete' | 'executing'
}

/**
 * WidgetPreview — inline AI sidebar preview for a generated widget (FR41, UX-7).
 *
 * Rendered inside a useCopilotAction's `render` callback so it appears
 * directly in the CopilotChat message stream while the action executes.
 *
 * When the user clicks "Add to Dashboard", the widget config is persisted
 * via the saveWidget server action (Zod-validated before write, FR42).
 * Shows WidgetError if the renderer throws (FR19, NFR-P6).
 */
export function WidgetPreview({ config, status }: WidgetPreviewProps) {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleAdd = useCallback(async () => {
    setSaveState('saving')
    setErrorMessage(null)

    const result = await saveWidget(config)

    if (result.error) {
      setSaveState('error')
      setErrorMessage(result.error.message)
      return
    }

    setSaveState('saved')
  }, [config])

  return (
    <div
      style={{
        borderRadius: 'var(--radius-md)',
        border: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--background))',
        overflow: 'hidden',
        marginTop: 'var(--space-3)',
        marginBottom: 'var(--space-1)',
      }}
    >
      {/* Widget preview area */}
      <div
        style={{
          padding: 'var(--space-4)',
          minHeight: '200px',
          position: 'relative',
        }}
      >
        <ErrorBoundary
          fallback={
            <WidgetError
              message="The widget couldn't be rendered. Try asking for a different approach."
            />
          }
        >
          {status === 'inProgress' ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                color: 'hsl(var(--muted-foreground))',
                fontSize: '0.875rem',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-turmeric)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
                aria-hidden="true"
              />
              Generating widget…
            </div>
          ) : (
            <AiWidgetRenderer config={config} isPreview />
          )}
        </ErrorBoundary>
      </div>

      {/* Action footer */}
      {status !== 'inProgress' && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderTop: '1px solid hsl(var(--border))',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            backgroundColor: 'hsl(var(--muted) / 0.3)',
          }}
        >
          {saveState === 'saved' ? (
            <p
              role="status"
              style={{
                margin: 0,
                fontSize: '0.875rem',
                color: 'var(--color-success)',
                fontWeight: 600,
              }}
            >
              Widget added to your dashboard
            </p>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAdd}
                disabled={saveState === 'saving'}
                aria-label="Add this widget to your dashboard"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: 'var(--color-turmeric)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  cursor: saveState === 'saving' ? 'not-allowed' : 'pointer',
                  opacity: saveState === 'saving' ? 0.7 : 1,
                  transition: 'opacity 0.15s',
                }}
              >
                {saveState === 'saving' ? 'Saving…' : 'Add to dashboard'}
              </button>

              {saveState === 'error' && (
                <p
                  role="alert"
                  style={{
                    margin: 0,
                    fontSize: '0.8125rem',
                    color: 'hsl(var(--destructive))',
                  }}
                >
                  {errorMessage ?? 'Failed to save. Please try again.'}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
