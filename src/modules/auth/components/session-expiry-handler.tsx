'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'

const PUBLIC_PATHS = ['/login', '/register']
const SESSION_REDIRECT_KEY = 'redirectAfterLogin'
const TOAST_DURATION_MS = 2000

/**
 * Intercepts 401 responses from the global fetch to handle session expiry.
 * Shows a toast, stores the current path in sessionStorage, and redirects to /login.
 * Mount this inside the root layout (Client Component boundary).
 */
export function SessionExpiryHandler() {
  const router = useRouter()
  const pathname = usePathname()
  const handledRef = useRef(false)

  useEffect(() => {
    const originalFetch = globalThis.fetch

    globalThis.fetch = async (...args) => {
      const response = await originalFetch(...args)

      if (response.status === 401 && !handledRef.current) {
        const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
        if (!isPublic) {
          handledRef.current = true
          sessionStorage.setItem(SESSION_REDIRECT_KEY, pathname)
          showExpiryToast()
          setTimeout(() => {
            router.push('/login')
          }, TOAST_DURATION_MS)
        }
      }

      return response
    }

    return () => {
      globalThis.fetch = originalFetch
    }
  }, [pathname, router])

  return null
}

function showExpiryToast() {
  // Create and inject a lightweight toast without a toast library dependency.
  // The auth module's login form or a future Toaster provider can replace this
  // once shadcn/ui Sonner is wired up.
  const existing = document.getElementById('session-expiry-toast')
  if (existing) return

  const toast = document.createElement('div')
  toast.id = 'session-expiry-toast'
  toast.setAttribute('role', 'alert')
  toast.setAttribute('aria-live', 'assertive')
  toast.style.cssText = [
    'position:fixed',
    'bottom:1.5rem',
    'right:1.5rem',
    'z-index:9999',
    'background:var(--color-chili)',
    'color:white',
    'padding:0.75rem 1.25rem',
    'border-radius:0.5rem',
    'box-shadow:0 4px 12px rgba(0,0,0,0.25)',
    'font-size:0.875rem',
    'font-family:inherit',
    'max-width:20rem',
    'animation:slide-in-right 0.2s ease-out',
  ].join(';')
  toast.textContent = 'Your session has expired. Redirecting to login…'

  document.body.appendChild(toast)

  setTimeout(() => toast.remove(), TOAST_DURATION_MS + 500)
}
