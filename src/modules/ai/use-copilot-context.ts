'use client'

import { useCopilotReadable } from '@copilotkit/react-core'
import { usePathname } from 'next/navigation'

interface DashboardContext {
  /** Current page path (e.g. "/dev", "/admin/users") */
  currentPage: string
  /** Active sprint name if on a sprint page */
  activeSprint?: string
  /** Visible widget types on the current page */
  visibleWidgets?: string[]
}

/**
 * useCopilotContext — injects dashboard context into the CopilotKit context.
 *
 * Wraps `useCopilotReadable` to provide the AI agent with awareness of:
 * - Which dashboard page the user is currently viewing
 * - Active sprint context (populated by parent components when available)
 * - Visible widget types on the current page
 *
 * This hook must be called inside a component that is a descendant of
 * `CopilotProvider` and is rendered in the dashboard layout.
 */
export function useCopilotContext(context?: Partial<DashboardContext>) {
  const pathname = usePathname()

  const fullContext: DashboardContext = {
    currentPage: pathname,
    activeSprint: context?.activeSprint,
    visibleWidgets: context?.visibleWidgets,
  }

  useCopilotReadable({
    description:
      'Current dashboard context — the page the user is viewing, the active sprint, and visible widget types.',
    value: fullContext,
  })
}
