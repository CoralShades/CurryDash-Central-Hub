'use client'

import { useState, useCallback } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WidgetSkeleton } from '@/components/shared/widget-skeleton'
import { ReportViewer } from './report-viewer'
import type { GeneratedReport } from '../types'

/** Default prompt sent to the SSE streaming endpoint. */
export const PROGRESS_SUMMARY_PROMPT =
  'Generate a comprehensive progress summary. Include overall project health indicator (On Track / At Risk / Behind), milestone completion percentage, key achievements this sprint, risks and blockers framed in business terms, and a forward-looking outlook.'

interface ReportGeneratorProps {
  /** Role label shown in the header — display only, auth is from JWT. */
  roleLabel?: string
}

/**
 * ReportGenerator — UI for requesting a progress summary from the Mastra report agent.
 *
 * Streams partial output via SSE from /api/reports/progress-summary (FR31).
 * Role-based content filtering is enforced server-side via JWT claims (FR34).
 * Report completes within 15 seconds (NFR-P7).
 */
export function ReportGenerator({ roleLabel }: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [completedReport, setCompletedReport] = useState<GeneratedReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    setStreamingContent('')
    setCompletedReport(null)
    setError(null)

    try {
      const response = await fetch('/api/reports/progress-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: PROGRESS_SUMMARY_PROMPT }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        setError(data.error ?? 'Report generation failed')
        return
      }

      // Stream chunks from the response body
      const reader = response.body?.getReader()
      if (!reader) {
        setError('Streaming not supported by this browser')
        return
      }

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullContent += chunk
        setStreamingContent(fullContent)
      }

      // Finalise: switch from streaming to completed report
      setCompletedReport({
        content: fullContent,
        generatedAt: new Date().toISOString(),
        role: 'developer', // placeholder — actual role is JWT-sourced on server
      })
      setStreamingContent('')
    } catch {
      setError('Unable to generate report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  return (
    <div>
      {/* Generate button */}
      {!isGenerating && !completedReport && (
        <div className="flex items-center gap-4 flex-wrap">
          <Button
            type="button"
            onClick={handleGenerate}
            aria-label="Generate progress summary report"
            className="bg-[var(--color-turmeric)] text-white hover:opacity-85 transition-opacity hover:bg-[var(--color-turmeric)]"
          >
            {/* Sparkle icon */}
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Generate Progress Summary
          </Button>
          {roleLabel && (
            <span className="text-[0.8125rem] text-muted-foreground">
              Tailored for {roleLabel} role
            </span>
          )}
        </div>
      )}

      {/* Generating — streaming in progress */}
      {isGenerating && !streamingContent && (
        <WidgetSkeleton variant="list" />
      )}

      {/* Streaming content */}
      {(isGenerating && streamingContent) && (
        <ReportViewer streamingContent={streamingContent} isStreaming report={null} />
      )}

      {/* Completed report */}
      {completedReport && (
        <>
          <ReportViewer report={completedReport} />
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerate}
            className="mt-4"
          >
            <Loader2 className="h-4 w-4" aria-hidden="true" />
            Regenerate
          </Button>
        </>
      )}

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="mt-3 px-4 py-3 rounded-md bg-destructive/10 text-destructive text-sm"
        >
          {error}
          <button
            type="button"
            onClick={handleGenerate}
            className="ml-3 underline bg-transparent border-0 cursor-pointer text-inherit text-[length:inherit]"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  )
}
