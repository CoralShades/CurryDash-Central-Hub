'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Sparkles } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/stores/use-dashboard-store'
import type { Role } from '@/types/roles'
import { NotificationDropdown } from '@/modules/notifications/components/notification-dropdown'

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
  const { isAiSidebarOpen, isAiAvailable, toggleAiSidebar } = useDashboardStore()
  const freshnessLabel = useRelativeTime(lastUpdated)

  const pageTitle = Object.entries(PAGE_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? 'Dashboard'

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

  const userInitial = (userName ?? userEmail ?? 'U')[0].toUpperCase()

  return (
    <TooltipProvider>
      <header className="h-16 flex items-center justify-between px-6 bg-background border-b border-border sticky top-0 z-40 gap-4">
        {/* Page title */}
        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-base font-semibold text-foreground m-0 whitespace-nowrap">
            {pageTitle}
          </h1>
          {userRole === 'stakeholder' && (
            <Badge variant="secondary" className="whitespace-nowrap shrink-0 text-xs">
              Read-only
            </Badge>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Data freshness */}
          {lastUpdated && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              Last updated: {freshnessLabel}
            </span>
          )}

          {/* Notification bell — Story 8.4: live unread badge + dropdown */}
          <NotificationDropdown userRole={userRole} />

          {/* AI toggle — Turmeric Gold when active, muted/grey when AI unavailable */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleAiSidebar}
                aria-label={isAiSidebarOpen ? 'Close AI assistant (Cmd+K)' : 'Open AI assistant (Cmd+K)'}
                aria-pressed={isAiSidebarOpen}
                aria-disabled={!isAiAvailable}
                title={!isAiAvailable ? 'AI assistant is temporarily unavailable' : undefined}
                className={cn(
                  'h-9 w-9',
                  !isAiAvailable && 'opacity-50',
                  isAiAvailable && isAiSidebarOpen && 'bg-[rgba(230,176,75,0.15)] text-[var(--color-turmeric)]'
                )}
              >
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            {!isAiAvailable && (
              <TooltipContent>AI assistant is temporarily unavailable</TooltipContent>
            )}
          </Tooltip>

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                aria-label="User menu"
                aria-haspopup="menu"
                className="flex items-center gap-2 px-2 py-1 h-auto"
              >
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={userAvatar ?? undefined} alt="" />
                  <AvatarFallback className="bg-[var(--color-turmeric)] text-white text-xs font-semibold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
                {userRole && (
                  <Badge
                    variant="secondary"
                    className="text-[0.6875rem] bg-[rgba(230,176,75,0.15)] text-[var(--color-turmeric)] font-semibold capitalize"
                  >
                    {userRole}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border mb-1">
                {userEmail}
              </div>

              {userRole && (
                <DropdownMenuItem asChild>
                  <a href={roleDashboardHref[userRole]} className="cursor-pointer">
                    My Dashboard
                  </a>
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-[var(--color-chili)] focus:text-[var(--color-chili)] cursor-pointer"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </TooltipProvider>
  )
}
