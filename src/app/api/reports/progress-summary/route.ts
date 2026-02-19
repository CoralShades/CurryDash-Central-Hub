import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createReportAgent } from '@/mastra'
import type { Role } from '@/types/roles'

export const runtime = 'nodejs'

/**
 * POST /api/reports/progress-summary
 *
 * SSE streaming endpoint for progress summary generation (FR31, NFR-P7).
 * Streams Mastra report agent output as plain text chunks.
 *
 * Auth: requires valid session with role claim (ARCH-12).
 * Role: sourced from JWT — never from client request body (FR34).
 * Model: always Sonnet (complex report generation, ARCH-11, FR39).
 * Timeout: enforced by NFR-P7 (<15s); Mastra agent enforces 4,000 token cap.
 */
export async function POST(req: Request): Promise<Response> {
  // --- Authentication ---
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json(
      { data: null, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
      { status: 401 }
    )
  }

  const role = (session.user.role ?? null) as Role | null

  if (!role) {
    return NextResponse.json(
      { data: null, error: { code: 'FORBIDDEN', message: 'User role not assigned' } },
      { status: 403 }
    )
  }

  // --- Parse request body ---
  let message: string
  try {
    const body = (await req.json()) as { message?: string }
    message =
      body.message ??
      'Generate a comprehensive progress summary. Include overall project health, milestone progress, key achievements, risks and blockers, and a forward-looking outlook.'
  } catch {
    return NextResponse.json(
      { data: null, error: { code: 'VALIDATION_ERROR', message: 'Invalid request body' } },
      { status: 400 }
    )
  }

  // --- Stream from Mastra report agent ---
  const agent = createReportAgent(role)

  try {
    const result = await agent.stream([{ role: 'user', content: message }])
    // toTextStreamResponse returns a streaming Response with Content-Type: text/plain
    return result.toTextStreamResponse()
  } catch {
    return NextResponse.json(
      { data: null, error: { code: 'GENERATION_ERROR', message: "Report generation failed" } },
      { status: 500 }
    )
  }
}
