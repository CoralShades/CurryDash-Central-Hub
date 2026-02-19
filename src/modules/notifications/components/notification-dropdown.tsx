'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, AlertTriangle, Inbox, Unplug, DollarSign, Timer, Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  type AppNotification,
} from '../actions/manage-notifications'
import type { LucideIcon } from 'lucide-react'

interface NotificationDropdownProps {
  userRole?: string | null
}

const NOTIFICATION_ICON_MAP: Record<string, LucideIcon> = {
  webhook_failure: AlertTriangle,
  dead_letter_growth: Inbox,
  integration_disconnect: Unplug,
  ai_budget: DollarSign,
  webhook_refresh_failure: Timer,
  rate_limit_warning: Timer,
  info: Info,
}

function getNotificationIconComponent(type: string): LucideIcon {
  return NOTIFICATION_ICON_MAP[type] ?? Info
}

function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 2) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  return `${diffDays}d ago`
}

export function NotificationDropdown({ userRole }: NotificationDropdownProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const loadNotifications = useCallback(async () => {
    setIsLoading(true)
    const [notifResult, countResult] = await Promise.all([
      getNotifications(),
      getUnreadCount(),
    ])
    if (notifResult.data) setNotifications(notifResult.data)
    if (countResult.data !== null && countResult.data !== undefined) setUnreadCount(countResult.data)
    setIsLoading(false)
  }, [])

  // Load notifications on mount
  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Subscribe to Realtime for new notifications on the role-specific dashboard channel
  useEffect(() => {
    if (!userRole) return

    const supabase = createClient()
    const channelName = `dashboard:${userRole}`

    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'notification.created' }, () => {
        loadNotifications()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [userRole, loadNotifications])

  async function handleNotificationClick(notification: AppNotification) {
    if (!notification.isRead) {
      const result = await markAsRead({ notificationId: notification.id })
      if (result.data) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? result.data! : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    }
    if (notification.actionUrl) {
      setIsOpen(false)
      router.push(notification.actionUrl)
    }
  }

  async function handleMarkAllRead() {
    const result = await markAllRead()
    if (result.data) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: n.readAt ?? new Date().toISOString() }))
      )
      setUnreadCount(0)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`View notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
          aria-haspopup="dialog"
          className={cn('h-9 w-9 relative', isOpen && 'bg-[rgba(197,53,31,0.1)]')}
        >
          <Bell className="h-5 w-5" aria-hidden="true" />

          {/* Unread count badge (Chili Red — admin alert color) */}
          {unreadCount > 0 && (
            <Badge
              aria-hidden="true"
              className="absolute top-1 right-1 min-w-[16px] h-4 bg-[var(--color-chili)] text-white text-[0.625rem] font-bold rounded-full flex items-center justify-center px-[3px] leading-none pointer-events-none"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[360px] p-0"
        role="dialog"
        aria-label="Notifications"
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h2 className="m-0 text-[0.9375rem] font-semibold text-foreground flex items-center gap-1.5">
            Notifications
            {unreadCount > 0 && (
              <span className="text-[0.6875rem] font-semibold text-[var(--color-chili)] bg-[rgba(197,53,31,0.1)] px-1.5 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </h2>

          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs text-[var(--color-coriander)] h-auto py-1 px-0 font-medium shrink-0"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notification list */}
        {isLoading ? (
          <div className="py-6 px-4 text-center text-muted-foreground text-sm">
            Loading notifications…
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 px-4 text-center text-muted-foreground text-sm">
            No notifications
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <ul role="list" className="list-none m-0 p-0">
              {notifications.map((notification) => {
                const IconComponent = getNotificationIconComponent(notification.type)
                return (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        'w-full text-left px-4 py-3 border-none border-b border-border flex gap-2.5 items-start',
                        notification.isRead ? 'bg-transparent' : 'bg-[rgba(197,53,31,0.04)]',
                        notification.actionUrl ? 'cursor-pointer hover:bg-muted' : 'cursor-default'
                      )}
                    >
                      {/* Type icon */}
                      <span aria-hidden="true" className="shrink-0 mt-0.5">
                        <IconComponent
                          className={cn(
                            'h-4 w-4',
                            notification.isRead ? 'text-muted-foreground' : 'text-foreground'
                          )}
                        />
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div
                          className={cn(
                            'text-[0.8125rem] truncate mb-0.5',
                            notification.isRead
                              ? 'font-normal text-muted-foreground'
                              : 'font-semibold text-foreground'
                          )}
                        >
                          {notification.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate mb-0.5">
                          {notification.message}
                        </div>
                        <div className="text-[0.6875rem] text-muted-foreground">
                          {formatRelativeTime(notification.createdAt)}
                        </div>
                      </div>

                      {/* Unread indicator dot */}
                      {!notification.isRead && (
                        <div
                          aria-hidden="true"
                          className="w-[7px] h-[7px] rounded-full bg-[var(--color-chili)] shrink-0 mt-1.5"
                        />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}
