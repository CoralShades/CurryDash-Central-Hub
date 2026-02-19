'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import type { ApiResponse } from '@/types/api'
import { markAsReadSchema, type MarkAsReadInput } from '../schemas/notification-schema'

export interface AppNotification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  actionUrl: string | null
  createdAt: string
  readAt: string | null
}

interface NotificationRow {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  action_url: string | null
  created_at: string
  read_at: string | null
}

function mapNotificationRow(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    isRead: row.is_read,
    actionUrl: row.action_url,
    createdAt: row.created_at,
    readAt: row.read_at,
  }
}

const NOTIFICATION_SELECT = 'id, type, title, message, is_read, action_url, created_at, read_at'

/**
 * Returns the last 50 notifications for the current user, newest first.
 */
export async function getNotifications(): Promise<ApiResponse<AppNotification[]>> {
  try {
    const session = await requireAuth()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('notifications')
      .select(NOTIFICATION_SELECT)
      .eq('user_id', session.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      logger.error('Failed to fetch notifications', { source: 'admin', data: { error } })
      return { data: null, error: { code: 'DATABASE_ERROR', message: 'Failed to load notifications' } }
    }

    return { data: (data ?? []).map((row) => mapNotificationRow(row as NotificationRow)), error: null }
  } catch (err) {
    logger.error('Unexpected error fetching notifications', { source: 'admin', data: { error: err } })
    return { data: null, error: { code: 'SERVER_ERROR', message: 'Failed to load notifications' } }
  }
}

/**
 * Returns the count of unread notifications for the current user.
 */
export async function getUnreadCount(): Promise<ApiResponse<number>> {
  try {
    const session = await requireAuth()
    const supabase = createAdminClient()

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.id)
      .eq('is_read', false)

    if (error) {
      return { data: null, error: { code: 'DATABASE_ERROR', message: 'Failed to get unread count' } }
    }

    return { data: count ?? 0, error: null }
  } catch (err) {
    logger.error('Unexpected error getting unread count', { source: 'admin', data: { error: err } })
    return { data: null, error: { code: 'SERVER_ERROR', message: 'Failed to get unread count' } }
  }
}

/**
 * Marks a single notification as read.
 */
export async function markAsRead(input: MarkAsReadInput): Promise<ApiResponse<AppNotification>> {
  try {
    const session = await requireAuth()

    const validation = markAsReadSchema.safeParse(input)
    if (!validation.success) {
      return {
        data: null,
        error: { code: 'VALIDATION_ERROR', message: validation.error.errors[0]?.message ?? 'Validation failed' },
      }
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', validation.data.notificationId)
      .eq('user_id', session.id)
      .select(NOTIFICATION_SELECT)
      .single()

    if (error ?? !data) {
      return { data: null, error: { code: 'NOT_FOUND', message: 'Notification not found' } }
    }

    return { data: mapNotificationRow(data as unknown as NotificationRow), error: null }
  } catch (err) {
    logger.error('Unexpected error marking notification as read', { source: 'admin', data: { error: err } })
    return { data: null, error: { code: 'SERVER_ERROR', message: 'Failed to mark notification as read' } }
  }
}

/**
 * Marks all notifications as read for the current user.
 */
export async function markAllRead(): Promise<ApiResponse<{ updated: boolean }>> {
  try {
    const session = await requireAuth()
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', session.id)
      .eq('is_read', false)

    if (error) {
      logger.error('Failed to mark all notifications as read', { source: 'admin', data: { error } })
      return { data: null, error: { code: 'DATABASE_ERROR', message: 'Failed to mark notifications as read' } }
    }

    return { data: { updated: true }, error: null }
  } catch (err) {
    logger.error('Unexpected error marking all notifications as read', { source: 'admin', data: { error: err } })
    return { data: null, error: { code: 'SERVER_ERROR', message: 'Failed to mark all notifications as read' } }
  }
}
