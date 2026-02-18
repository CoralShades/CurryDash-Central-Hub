'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useDashboardStore } from '@/stores/use-dashboard-store'
import type { Role } from '@/types/roles'

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Admin Dashboard',
  '/admin/users': 'User Management',
  '/admin/integrations': 'Integrations',
  '/admin/system-health': 'System Health',
  '/dev': 'Developer Dashboard',
  '/qa': 'QA Dashboard',
  '/stakeholder': 'Stakeholder Dashboard',
}

interface PageHeaderProps {
  userRole: Role | null
  userName: string | null | undefined
  userEmail: string | null | undefined
  userAvatar?: string | null
  lastUpdated?: Date | null
}

function useRelativeTime(date: Date | null | undefined) {
  const [label, setLabel] = useState('never')

  useEffect(() => {
    if (!date) return

    function update() {
      if (!date) return
      const diffMs = Date.now() - date.getTime()
      const diffMin = Math.floor(diffMs / 60000)
      if (diffMin < 2) {
        setLabel('just now')
      } else {
        setLabel(`${diffMin} min ago`)
      }
    }

    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [date])

  return label
}

export function PageHeader({ userRole, userName, userEmail, userAvatar, lastUpdated }: PageHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAiSidebarOpen, toggleAiSidebar } = useDashboardStore()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const freshnessLabel = useRelativeTime(lastUpdated)

  const pageTitle = Object.entries(PAGE_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? 'Dashboard'

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard shortcuts
  const gKeyRef = useRef(false)
  const gTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as Element
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target as HTMLElement).isContentEditable
      if (isInput) return

      // Cmd+K / Ctrl+K — toggle AI sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggleAiSidebar()
        return
      }

      // Escape — close menus/modals
      if (e.key === 'Escape') {
        setUserMenuOpen(false)
        return
      }

      // Vim-style G+{D,U,I,S} navigation (500ms timeout)
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        gKeyRef.current = true
        if (gTimeoutRef.current) clearTimeout(gTimeoutRef.current)
        gTimeoutRef.current = setTimeout(() => {
          gKeyRef.current = false
        }, 500)
        return
      }

      if (gKeyRef.current) {
        gKeyRef.current = false
        if (gTimeoutRef.current) clearTimeout(gTimeoutRef.current)

        const navMap: Record<string, string> = {
          d: userRole ? `/${userRole === 'developer' ? 'dev' : userRole === 'admin' ? 'admin' : userRole}` : '/',
          u: '/admin/users',
          i: '/admin/integrations',
          s: '/admin/system-health',
        }

        const dest = navMap[e.key.toLowerCase()]
        if (dest) {
          e.preventDefault()
          router.push(dest)
        }
      }
    },
    [router, toggleAiSidebar, userRole]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const roleDashboardHref: Record<NonNullable<Role>, string> = {
    admin: '/admin',
    developer: '/dev',
    qa: '/qa',
    stakeholder: '/stakeholder',
  }

  async function handleLogout() {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <header
      style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        backgroundColor: 'hsl(var(--background))',
        borderBottom: '1px solid hsl(var(--border))',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        gap: '1rem',
      }}
    >
      {/* Page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
        <h1 style={{ fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--foreground))', margin: 0, whiteSpace: 'nowrap' }}>
          {pageTitle}
        </h1>
        {userRole === 'stakeholder' && (
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.375rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'hsl(var(--muted))',
              color: 'var(--color-text-muted)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Read-only
          </span>
        )}
      </div>

      {/* Right side controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        {/* Data freshness */}
        {lastUpdated && (
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            Last updated: {freshnessLabel}
          </span>
        )}

        {/* Alerts bell (placeholder — Epic 8 Story 8.4 wires unread count) */}
        <button
          type="button"
          aria-label="View notifications"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'hsl(var(--foreground))',
            position: 'relative',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>

        {/* AI toggle (Turmeric Gold when active) */}
        <button
          type="button"
          onClick={toggleAiSidebar}
          aria-label={isAiSidebarOpen ? 'Close AI assistant (Cmd+K)' : 'Open AI assistant (Cmd+K)'}
          aria-pressed={isAiSidebarOpen}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: isAiSidebarOpen ? 'rgba(230, 176, 75, 0.15)' : 'transparent',
            cursor: 'pointer',
            color: isAiSidebarOpen ? 'var(--color-turmeric)' : 'hsl(var(--foreground))',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
        </button>

        {/* User dropdown */}
        <div ref={userMenuRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((v) => !v)}
            aria-label="User menu"
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-turmeric)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {userAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.75rem' }}>
                  {(userName ?? userEmail ?? 'U')[0].toUpperCase()}
                </span>
              )}
            </div>
            {userRole && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(230, 176, 75, 0.15)',
                  color: 'var(--color-turmeric)',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {userRole}
              </span>
            )}
          </button>

          {userMenuOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 0.5rem)',
                minWidth: '180px',
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                zIndex: 50,
                padding: '0.25rem 0',
              }}
            >
              <div
                style={{
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.75rem',
                  color: 'var(--color-text-muted)',
                  borderBottom: '1px solid hsl(var(--border))',
                  marginBottom: '0.25rem',
                }}
              >
                {userEmail}
              </div>

              {userRole && (
                <a
                  href={roleDashboardHref[userRole]}
                  role="menuitem"
                  style={{
                    display: 'block',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    color: 'hsl(var(--foreground))',
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                >
                  My Dashboard
                </a>
              )}

              <button
                role="menuitem"
                onClick={handleLogout}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  color: 'var(--color-chili)',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
