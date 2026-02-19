'use client'

import { Card, CardContent } from '@/components/ui/card'
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
    <Card
      role="region"
      aria-label="Generated report"
      aria-live="polite"
      className="mt-4"
    >
      <CardContent className="pt-6">
        {/* Report content */}
        <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap break-words text-foreground m-0">
          {content}
          {isStreaming && (
            <span
              aria-hidden="true"
              className="inline-block w-0.5 h-[1em] bg-[var(--color-turmeric)] ml-0.5 align-text-bottom animate-pulse"
            />
          )}
        </pre>

        {/* Metadata footer — shown once streaming is complete */}
        {generatedAt && !isStreaming && (
          <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
            Generated at {new Date(generatedAt).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
