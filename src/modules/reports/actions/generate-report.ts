'use server'

import { auth } from '@/lib/auth'
import { createReportAgent } from '@/mastra'
import { createErrorResponse, createSuccessResponse } from '@/types/api'
import type { ApiResponse } from '@/types/api'
import type { Role } from '@/types/roles'
import type { GeneratedReport } from '../types'

/**
 * Generates a role-appropriate progress summary using the Mastra report agent.
 *
 * Role is sourced from the JWT session (authoritative) — never from client-side state.
 * Returns the complete report text synchronously. SSE streaming is available via
 * the /api/reports/progress-summary route handler for the dedicated reports page.
 */
export async function generateProgressSummary(): Promise<ApiResponse<GeneratedReport>> {
  const session = await auth()

  if (!session?.user) {
    return createErrorResponse('AUTH_REQUIRED', 'Authentication required')
  }

  const role = (session.user.role ?? null) as Role | null

  if (!role) {
    return createErrorResponse('FORBIDDEN', 'User role not assigned')
  }

  const agent = createReportAgent(role)

  try {
    const result = await agent.generate([
      {
        role: 'user',
        content:
          'Generate a comprehensive progress summary for my role. Include overall project health, milestone progress, key achievements, risks, and outlook.',
      },
    ])

    return createSuccessResponse<GeneratedReport>({
      content: result.text,
      generatedAt: new Date().toISOString(),
      role,
    })
  } catch {
    return createErrorResponse('GENERATION_ERROR', "I couldn't generate the progress summary at this time")
  }
}
