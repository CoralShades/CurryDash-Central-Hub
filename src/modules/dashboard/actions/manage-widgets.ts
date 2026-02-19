'use server'

import { revalidateTag } from 'next/cache'
import { auth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { aiWidgetConfigSchema, type AiWidgetConfig } from '@/lib/schemas/ai-widget-schema'
import type { ApiResponse } from '@/types/api'
import type { Json } from '@/types/database'

export interface PersistedWidget {
  id: string
  config: AiWidgetConfig
  position: number
  createdAt: string
}

/**
 * deleteWidget — soft-deletes a persisted AI widget by setting deleted_at.
 * Only the owning user may delete their own widget (enforced by user_id check).
 */
export async function deleteWidget(widgetId: string): Promise<ApiResponse<{ id: string }>> {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      data: null,
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
    }
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('dashboard_widgets')
    .update({ deleted_at: new Date().toISOString(), is_visible: false })
    .eq('id', widgetId)
    .eq('user_id', session.user.id)
    .select('id')
    .single()

  if (error ?? !data) {
    return {
      data: null,
      error: { code: 'NOT_FOUND', message: 'Widget not found or access denied' },
    }
  }

  revalidateTag('dashboard-widgets')

  return { data: { id: data.id }, error: null }
}

/**
 * regenerateWidget — retrieves the config of a persisted widget so the
 * AI can generate a fresh version from the original parameters.
 */
export async function regenerateWidget(widgetId: string): Promise<ApiResponse<AiWidgetConfig>> {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      data: null,
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
    }
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('dashboard_widgets')
    .select('id, config')
    .eq('id', widgetId)
    .eq('user_id', session.user.id)
    .single()

  if (error ?? !data) {
    return {
      data: null,
      error: { code: 'NOT_FOUND', message: 'Widget not found or access denied' },
    }
  }

  const parsed = aiWidgetConfigSchema.safeParse(data.config)
  if (!parsed.success) {
    return {
      data: null,
      error: { code: 'VALIDATION_ERROR', message: 'Stored widget config is invalid' },
    }
  }

  return { data: parsed.data, error: null }
}

/**
 * getUserWidgets — loads all active (non-deleted) AI-generated widgets
 * for the specified user, ordered by position ascending.
 *
 * Only callable by the session owner — userId must match session.user.id.
 */
export async function getUserWidgets(userId: string): Promise<ApiResponse<PersistedWidget[]>> {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      data: null,
      error: { code: 'AUTH_REQUIRED', message: 'Authentication required' },
    }
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('dashboard_widgets')
    .select('id, config, position, created_at')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('position', { ascending: true })

  if (error) {
    return {
      data: null,
      error: { code: 'SERVER_ERROR', message: 'Failed to load widgets' },
    }
  }

  const widgets: PersistedWidget[] = (data ?? [])
    .map((row) => {
      const parsed = aiWidgetConfigSchema.safeParse(row.config as Json)
      if (!parsed.success) return null
      return {
        id: row.id,
        config: parsed.data,
        position: row.position,
        createdAt: row.created_at,
      }
    })
    .filter((w): w is PersistedWidget => w !== null)

  return { data: widgets, error: null }
}
