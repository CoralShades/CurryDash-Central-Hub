'use client'

import { useState } from 'react'
import type { Role } from '@/types/roles'
import { RoleBadge } from './role-badge'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp } from 'lucide-react'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ApiEndpointProps {
  method: HttpMethod
  path: string
  description: string
  auth?: Role[]
  requestExample?: string
  responseExample?: string
}

const METHOD_STYLES: Record<HttpMethod, string> = {
  GET: 'bg-[rgba(74,124,89,0.15)] text-[var(--color-coriander-dark)] border-[var(--color-coriander)]',
  POST: 'bg-[rgba(230,176,75,0.15)] text-[var(--color-turmeric-dark)] border-[var(--color-turmeric)]',
  PUT: 'bg-[rgba(93,64,55,0.15)] text-[var(--color-cinnamon)] border-[var(--color-cinnamon)]',
  PATCH: 'bg-[rgba(93,138,173,0.15)] text-[#3a6080] border-[#5d8aad]',
  DELETE: 'bg-[rgba(197,53,31,0.15)] text-[var(--color-chili-dark)] border-[var(--color-chili)]',
}

/**
 * ApiEndpoint — styled API endpoint card with method badge, auth roles, and collapsible examples.
 * Usage in MDX: <ApiEndpoint method="POST" path="/api/webhooks/jira" description="..." />
 */
export function ApiEndpoint({
  method,
  path,
  description,
  auth,
  requestExample,
  responseExample,
}: ApiEndpointProps) {
  const [showExamples, setShowExamples] = useState(false)
  const hasExamples = Boolean(requestExample ?? responseExample)

  return (
    <div className="my-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <span
          className={cn(
            'shrink-0 rounded border px-2 py-0.5 text-xs font-bold font-mono tracking-wide',
            METHOD_STYLES[method]
          )}
        >
          {method}
        </span>
        <div className="flex-1 min-w-0">
          <code className="text-sm font-mono text-[var(--color-text-primary)] break-all">
            {path}
          </code>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>
          {auth && auth.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-xs text-[var(--color-text-muted)]">Auth:</span>
              {auth.map((role) => (
                <RoleBadge key={role} role={role} />
              ))}
            </div>
          )}
        </div>
        {hasExamples && (
          <button
            onClick={() => setShowExamples((v) => !v)}
            className="shrink-0 flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            aria-expanded={showExamples}
            aria-label={showExamples ? 'Hide examples' : 'Show examples'}
          >
            {showExamples ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showExamples ? 'Hide' : 'Examples'}
          </button>
        )}
      </div>

      {/* Collapsible examples */}
      {hasExamples && showExamples && (
        <div className="border-t border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          {requestExample && (
            <div className="p-4">
              <p className="mb-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                Request
              </p>
              <pre className="text-xs overflow-auto rounded bg-[var(--color-cream)] p-3 text-[var(--color-text-primary)]">
                <code>{requestExample}</code>
              </pre>
            </div>
          )}
          {responseExample && (
            <div className="p-4">
              <p className="mb-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                Response
              </p>
              <pre className="text-xs overflow-auto rounded bg-[var(--color-cream)] p-3 text-[var(--color-text-primary)]">
                <code>{responseExample}</code>
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
