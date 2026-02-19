import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import type { NotificationType } from '../schemas/notification-schema'

interface SendNotificationParams {
  type: NotificationType
  title: string
  message: string
  actionUrl?: string | null
  /** If provided, sends only to this user; otherwise sends to all active admin users */
  targetUserId?: string
}

/**
 * Sends a notification to all admin users (or a specific target user).
 * Uses the admin Supabase client (service role) to bypass RLS.
 * Broadcasts to the `dashboard:admin` Realtime channel after inserting.
 *
 * This is a best-effort fire-and-forget operation — errors are logged but never thrown.
 * Callers should not await this for critical path logic.
 */
export async function sendAdminNotification(params: SendNotificationParams): Promise<void> {
  const { type, title, message, actionUrl = null, targetUserId } = params

  try {
    const supabase = createAdminClient()

    let adminUserIds: string[]

    if (targetUserId) {
      adminUserIds = [targetUserId]
    } else {
      // Resolve the 'admin' role ID first, then find active users with that role
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'admin')
        .single()

      if (roleError ?? !roleData) {
        logger.warn('Admin role not found for notification dispatch', {
          source: 'admin',
          data: { type, title },
        })
        return
      }

      const { data: adminUsers, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('role_id', roleData.id)
        .eq('is_active', true)

      if (usersError) {
        logger.error('Failed to fetch admin users for notification', {
          source: 'admin',
          data: { error: usersError.message },
        })
        return
      }

      adminUserIds = (adminUsers ?? []).map((u) => u.id)

      if (adminUserIds.length === 0) {
        logger.warn('No active admin users found for notification', {
          source: 'admin',
          data: { type, title },
        })
        return
      }
    }

    // Insert one notification record per admin user
    const notifications = adminUserIds.map((userId) => ({
      user_id: userId,
      type,
      title,
      message,
      action_url: actionUrl,
      is_read: false,
    }))

    const { error: insertError } = await supabase.from('notifications').insert(notifications)

    if (insertError) {
      logger.error('Failed to insert notification records', {
        source: 'admin',
        data: { type, title, error: insertError.message },
      })
      return
    }

    logger.info('Admin notifications created', {
      source: 'admin',
      data: { type, title, recipientCount: adminUserIds.length },
    })

    // Broadcast to dashboard:admin channel so connected clients refresh their notification list
    try {
      await supabase.channel('dashboard:admin').send({
        type: 'broadcast',
        event: 'notification.created',
        payload: { type, title },
      })
    } catch (broadcastErr) {
      logger.warn('Failed to broadcast notification to dashboard:admin', {
        source: 'admin',
        data: { error: broadcastErr instanceof Error ? broadcastErr.message : String(broadcastErr) },
      })
    }
  } catch (err) {
    logger.error('Unexpected error in sendAdminNotification', {
      source: 'admin',
      data: { type, title, error: err instanceof Error ? err.message : String(err) },
    })
  }
}
