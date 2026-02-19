'use client'

import type { GeneratedReport } from '../types'

interface ReportViewerProps {
  report: GeneratedReport | null
  streamingContent?: string
  isStreaming?: boolean
}

/**
 * ReportViewer — renders a generated or streaming progress summary report.
 *
 * Supports both complete reports (from generateProgressSummary Server Action)
 * and streaming text (from /api/reports/progress-summary SSE endpoint).
 *
 * Renders plain pre-formatted Markdown text without a heavy parser dependency.
 * "Data as of [timestamp]" footer and source citation are included in the content.
 */
export function ReportViewer({ report, streamingContent, isStreaming }: ReportViewerProps) {
  const content = streamingContent ?? report?.content ?? ''
  const generatedAt = report?.generatedAt

  if (!content && !isStreaming) return null

  return (
    <div
      role="region"
      aria-label="Generated report"
      aria-live="polite"
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid hsl(var(--border))',
        backgroundColor: 'hsl(var(--card))',
        padding: '1.5rem',
        marginTop: '1rem',
      }}
    >
      {/* Report content */}
      <pre
        style={{
          fontFamily: 'inherit',
          fontSize: '0.875rem',
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          color: 'hsl(var(--foreground))',
          margin: 0,
        }}
      >
        {content}
        {isStreaming && (
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: '2px',
              height: '1em',
              backgroundColor: 'var(--color-turmeric)',
              marginLeft: '2px',
              verticalAlign: 'text-bottom',
              animation: 'pulse 1s infinite',
            }}
          />
        )}
      </pre>

      {/* Metadata footer — shown once streaming is complete */}
      {generatedAt && !isStreaming && (
        <div
          style={{
            marginTop: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid hsl(var(--border))',
            fontSize: '0.75rem',
            color: 'hsl(var(--muted-foreground))',
          }}
        >
          Generated at {new Date(generatedAt).toLocaleString()}
        </div>
      )}
    </div>
  )
}
