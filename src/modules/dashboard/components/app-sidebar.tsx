'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebarStore } from '@/stores/use-sidebar-store'
import type { Role } from '@/types/roles'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

interface NavSection {
  label: string
  items: NavItem[]
  roles?: Role[] // if set, section only shows for these roles
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Main',
    items: [
      {
        href: '/dev',
        label: 'Dashboard',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Admin',
    roles: ['admin'],
    items: [
      {
        href: '/admin/users',
        label: 'Users',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        ),
      },
      {
        href: '/admin/integrations',
        label: 'Integrations',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
          </svg>
        ),
      },
      {
        href: '/admin/system-health',
        label: 'System Health',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
        ),
      },
    ],
  },
]

interface AppSidebarProps {
  userRole: Role | null
  userName: string | null | undefined
  userEmail: string | null | undefined
  userAvatar?: string | null
}

export function AppSidebar({ userRole, userName, userEmail, userAvatar }: AppSidebarProps) {
  const { isExpanded, toggleSidebar } = useSidebarStore()
  const pathname = usePathname()

  // Keyboard shortcut: `[` toggles sidebar
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === '[' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as Element
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target as HTMLElement).isContentEditable
        if (!isInput) {
          e.preventDefault()
          toggleSidebar()
        }
      }
    },
    [toggleSidebar]
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

  const dashboardHref = userRole ? roleDashboardHref[userRole] : '/'

  return (
    <aside
      style={{
        width: isExpanded ? '256px' : '64px',
        minHeight: '100vh',
        backgroundColor: 'hsl(var(--card))',
        borderRight: '1px solid hsl(var(--border))',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 200ms ease',
        flexShrink: 0,
      }}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div
        style={{
          padding: isExpanded ? '1.25rem 1rem' : '1.25rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          justifyContent: isExpanded ? 'flex-start' : 'center',
          borderBottom: '1px solid hsl(var(--border))',
        }}
      >
        <Link href={dashboardHref} className="flex items-center gap-2" aria-label="CurryDash Central Hub home">
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-turmeric)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontWeight: 700,
              color: '#fff',
              fontSize: '0.875rem',
            }}
          >
            CD
          </div>
          {isExpanded && (
            <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'hsl(var(--foreground))' }}>
              Central Hub
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4" aria-label="Site navigation">
        {NAV_SECTIONS.map((section) => {
          // ADMIN section completely absent from DOM for non-admin roles
          if (section.roles && (!userRole || !section.roles.includes(userRole))) {
            return null
          }

          return (
            <div key={section.label} className="mb-4">
              {isExpanded && section.roles && (
                <div
                  style={{
                    padding: '0 1rem 0.25rem',
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {section.label}
                </div>
              )}
              <ul role="list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        title={!isExpanded ? item.label : undefined}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: isExpanded ? '0.5rem 1rem' : '0.5rem 0',
                          justifyContent: isExpanded ? 'flex-start' : 'center',
                          color: isActive ? 'var(--color-turmeric)' : 'hsl(var(--foreground))',
                          backgroundColor: isActive ? 'rgba(230, 176, 75, 0.08)' : 'transparent',
                          borderLeft: isActive ? '4px solid var(--color-turmeric)' : '4px solid transparent',
                          fontWeight: isActive ? 500 : 400,
                          fontSize: '0.875rem',
                          textDecoration: 'none',
                          transition: 'background-color 150ms, color 150ms',
                        }}
                      >
                        {item.icon}
                        {isExpanded && <span>{item.label}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* User section + collapse toggle */}
      <div
        style={{
          borderTop: '1px solid hsl(var(--border))',
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          justifyContent: isExpanded ? 'space-between' : 'center',
        }}
      >
        {isExpanded && (
          <div className="flex items-center gap-2 min-w-0">
            {/* Avatar */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-turmeric)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {userAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userAvatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.75rem' }}>
                  {(userName ?? userEmail ?? 'U')[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'hsl(var(--foreground))',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {userName ?? userEmail}
              </div>
              {userRole && (
                <div
                  style={{
                    fontSize: '0.6875rem',
                    textTransform: 'capitalize',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {userRole}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          title={isExpanded ? 'Collapse sidebar ([)' : 'Expand sidebar ([)'}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4" aria-hidden="true">
            {isExpanded ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
            )}
          </svg>
        </button>
      </div>
    </aside>
  )
}
