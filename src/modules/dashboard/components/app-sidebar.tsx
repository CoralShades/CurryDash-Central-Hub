'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Puzzle, Activity, ChevronsLeft, ChevronsRight, type LucideIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/stores/use-sidebar-store'
import type { Role } from '@/types/roles'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
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
        icon: LayoutDashboard,
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
        icon: Users,
      },
      {
        href: '/admin/integrations',
        label: 'Integrations',
        icon: Puzzle,
      },
      {
        href: '/admin/system-health',
        label: 'System Health',
        icon: Activity,
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

  const userInitial = (userName ?? userEmail ?? 'U')[0].toUpperCase()

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          'min-h-screen bg-card border-r border-border flex flex-col transition-[width] duration-200 ease-in-out shrink-0',
          isExpanded ? 'w-64' : 'w-16'
        )}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div
          className={cn(
            'flex items-center gap-3 border-b border-border',
            isExpanded ? 'px-4 py-5 justify-start' : 'px-0 py-5 justify-center'
          )}
        >
          <Link href={dashboardHref} className="flex items-center gap-2" aria-label="CurryDash Central Hub home">
            <div className="w-8 h-8 rounded-md bg-[var(--color-turmeric)] flex items-center justify-center shrink-0 font-bold text-white text-sm">
              CD
            </div>
            {isExpanded && (
              <span className="font-semibold text-sm text-foreground">
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
                  <div className="px-4 pb-1 text-[0.625rem] font-semibold tracking-[0.1em] uppercase text-muted-foreground">
                    {section.label}
                  </div>
                )}
                {isExpanded && section.roles && <Separator className="mb-2" />}
                <ul role="list" className="list-none p-0 m-0">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    const IconComponent = item.icon

                    const linkContent = (
                      <Link
                        href={item.href}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-3 text-sm font-normal no-underline transition-colors duration-150',
                          'border-l-4',
                          isExpanded ? 'px-4 py-2 justify-start' : 'px-0 py-2 justify-center',
                          isActive
                            ? 'text-[var(--color-turmeric)] bg-[rgba(230,176,75,0.08)] border-l-[var(--color-turmeric)] font-medium'
                            : 'text-foreground bg-transparent border-l-transparent hover:bg-muted'
                        )}
                      >
                        <IconComponent className="h-5 w-5 shrink-0" aria-hidden="true" />
                        {isExpanded && <span>{item.label}</span>}
                      </Link>
                    )

                    return (
                      <li key={item.href}>
                        {!isExpanded ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {linkContent}
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              {item.label}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          linkContent
                        )}
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
          className={cn(
            'border-t border-border p-3 flex items-center gap-3',
            isExpanded ? 'justify-between' : 'justify-center'
          )}
        >
          {isExpanded && (
            <div className="flex items-center gap-2 min-w-0">
              {/* Avatar */}
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={userAvatar ?? undefined} alt="" />
                <AvatarFallback className="bg-[var(--color-turmeric)] text-white text-xs font-semibold">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-[0.8125rem] font-medium text-foreground truncate">
                  {userName ?? userEmail}
                </div>
                {userRole && (
                  <div className="text-[0.6875rem] capitalize text-muted-foreground">
                    {userRole}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Collapse toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            title={isExpanded ? 'Collapse sidebar ([)' : 'Expand sidebar ([)'}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            className="h-8 w-8 shrink-0 text-muted-foreground"
          >
            {isExpanded ? (
              <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronsRight className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
