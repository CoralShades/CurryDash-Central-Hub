'use server'

import { auth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { aiWidgetConfigSchema, type AiWidgetConfig } from '@/lib/schemas/ai-widget-schema'
import type { ApiResponse } from '@/types/api'
import type { Json } from '@/types/database'
import type { Role } from '@/types/roles'

/**
 * saveWidget — persists an AI-generated widget config to the dashboard_widgets table.
 *
 * Validates:
 * - JWT session with role claim (ARCH-12)
 * - Widget config against Zod schema before write (FR42)
 * Colors must use CSS custom properties — validated in aiWidgetConfigSchema.
 *
 * Uses service-role client (bypasses RLS) with session.user.id as user_id
 * so the write completes reliably from the Server Action context.
 */
export async function saveWidget(rawConfig: AiWidgetConfig): Promise<ApiResponse<{ id: string }>> {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      data: null,
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
    }
  }

  const role = (session.user.role ?? null) as Role | null

  if (!role) {
    return {
      data: null,
      error: { code: 'FORBIDDEN', message: 'User role not assigned' },
    }
  }

  const validation = aiWidgetConfigSchema.safeParse(rawConfig)

  if (!validation.success) {
    return {
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: validation.error.errors[0]?.message ?? 'Invalid widget configuration',
      },
    }
  }

  const supabase = createAdminClient()

  // Store the full widget config (including role) in the JSON config column.
  // widget_type stores the visual type (bar-chart, metric-card, etc.)
  const configWithRole = { ...validation.data, role } as unknown as Json

  const { data, error } = await supabase
    .from('dashboard_widgets')
    .insert({
      user_id: session.user.id,
      widget_type: validation.data.type,
      config: configWithRole,
      is_visible: true,
      is_ai_generated: true,
    })
    .select('id')
    .single()

  if (error ?? !data) {
    return {
      data: null,
      error: { code: 'SERVER_ERROR', message: 'Failed to save widget configuration' },
    }
  }

  return { data: { id: data.id }, error: null }
}
