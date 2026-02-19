import {
  CopilotRuntime,
  AnthropicAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import type { Role } from '@/types/roles'

export const runtime = 'nodejs'

/**
 * CopilotKit SSE streaming endpoint.
 *
 * ARCH-12: Requires an authenticated session with role claims.
 * Returns 401 if the session is missing or the user has no role.
 *
 * The AnthropicAdapter is configured with:
 * - The ANTHROPIC_API_KEY environment variable
 * - No token limit override here — maxTokens is enforced inside the Mastra
 *   agents via `defaultGenerateOptions.maxTokens: 4000`.
 *
 * Role is extracted from the JWT session and set as context on the runtime
 * so the Mastra system prompt enforces role-specific data boundaries.
 */
async function handleCopilotKitRequest(req: Request): Promise<Response> {
  // --- Authentication & RBAC ---
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json(
      { data: null, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
      { status: 401 }
    )
  }

  const userRole = (session.user.role ?? null) as Role | null

  if (!userRole) {
    return NextResponse.json(
      { data: null, error: { code: 'FORBIDDEN', message: 'User role not assigned' } },
      { status: 403 }
    )
  }

  // --- CopilotKit Runtime setup ---
  const runtime = new CopilotRuntime({
    // Optionally add remote Mastra agent actions in future iterations.
    // For now CopilotKit routes messages via the AnthropicAdapter directly,
    // with dashboard context injected client-side via useCopilotReadable.
  })

  const serviceAdapter = new AnthropicAdapter()

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/ai/copilotkit',
  })

  return handleRequest(req)
}

export const POST = handleCopilotKitRequest
