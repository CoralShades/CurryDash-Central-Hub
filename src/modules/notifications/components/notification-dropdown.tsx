'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  type AppNotification,
} from '../actions/manage-notifications'

interface NotificationDropdownProps {
  userRole?: string | null
}

const NOTIFICATION_ICONS: Record<string, string> = {
  webhook_failure: '⚠',
  dead_letter_growth: '📬',
  integration_disconnect: '🔌',
  ai_budget: '💰',
  webhook_refresh_failure: '↺',
  rate_limit_warning: '⏱',
  info: 'ℹ',
}

function getNotificationIcon(type: string): string {
  return NOTIFICATION_ICONS[type] ?? 'ℹ'
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
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

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
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell icon button */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={`View notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          background: isOpen ? 'rgba(197, 53, 31, 0.1)' : 'transparent',
          cursor: 'pointer',
          color: 'hsl(var(--foreground))',
          position: 'relative',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          width="20"
          height="20"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {/* Unread count badge (Chili Red — admin alert color) */}
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              minWidth: '16px',
              height: '16px',
              backgroundColor: 'var(--color-chili)',
              color: '#fff',
              fontSize: '0.625rem',
              fontWeight: 700,
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 3px',
              lineHeight: 1,
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Notifications"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 0.5rem)',
            width: '360px',
            maxHeight: '480px',
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Panel header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderBottom: '1px solid hsl(var(--border))',
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'hsl(var(--foreground))',
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
              }}
            >
              Notifications
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: 'var(--color-chili)',
                    backgroundColor: 'rgba(197, 53, 31, 0.1)',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '999px',
                  }}
                >
                  {unreadCount} unread
                </span>
              )}
            </h2>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--color-coriander)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: '0.25rem 0',
                  fontWeight: 500,
                  flexShrink: 0,
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {isLoading ? (
              <div
                style={{
                  padding: '1.5rem 1rem',
                  textAlign: 'center',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.875rem',
                }}
              >
                Loading notifications…
              </div>
            ) : notifications.length === 0 ? (
              <div
                style={{
                  padding: '2rem 1rem',
                  textAlign: 'center',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.875rem',
                }}
              >
                No notifications
              </div>
            ) : (
              <ul role="list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        borderBottom: '1px solid hsl(var(--border))',
                        background: notification.isRead
                          ? 'transparent'
                          : 'rgba(197, 53, 31, 0.04)',
                        cursor: notification.actionUrl ? 'pointer' : 'default',
                        display: 'flex',
                        gap: '0.625rem',
                        alignItems: 'flex-start',
                      }}
                    >
                      {/* Type icon */}
                      <span
                        aria-hidden="true"
                        style={{
                          fontSize: '0.9375rem',
                          flexShrink: 0,
                          marginTop: '0.0625rem',
                          lineHeight: 1,
                          color: notification.isRead
                            ? 'hsl(var(--muted-foreground))'
                            : 'hsl(var(--foreground))',
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </span>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: notification.isRead ? 400 : 600,
                            color: notification.isRead
                              ? 'hsl(var(--muted-foreground))'
                              : 'hsl(var(--foreground))',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginBottom: '0.1875rem',
                          }}
                        >
                          {notification.title}
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-text-muted)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginBottom: '0.1875rem',
                          }}
                        >
                          {notification.message}
                        </div>
                        <div
                          style={{
                            fontSize: '0.6875rem',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          {formatRelativeTime(notification.createdAt)}
                        </div>
                      </div>

                      {/* Unread indicator dot */}
                      {!notification.isRead && (
                        <div
                          aria-hidden="true"
                          style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-chili)',
                            flexShrink: 0,
                            marginTop: '0.3125rem',
                          }}
                        />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
