'use client'

import { CopilotKit } from '@copilotkit/react-core'
import type { ReactNode } from 'react'

/** Runtime URL for the CopilotKit backend endpoint. */
export const COPILOTKIT_RUNTIME_URL = '/api/ai/copilotkit'

interface CopilotProviderProps {
  children: ReactNode
}

/**
 * CopilotProvider — wraps dashboard content with the CopilotKit context.
 *
 * Placed in the dashboard layout so all authenticated pages have access to
 * the CopilotKit context (useCopilotReadable, useCopilotAction, etc.).
 *
 * runtimeUrl points to the authenticated SSE endpoint that validates the
 * session and connects to the Mastra agent backend.
 */
export function CopilotProvider({ children }: CopilotProviderProps) {
  return (
    <CopilotKit runtimeUrl={COPILOTKIT_RUNTIME_URL}>
      {children}
    </CopilotKit>
  )
}
