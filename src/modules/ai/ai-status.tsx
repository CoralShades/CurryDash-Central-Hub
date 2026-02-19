'use client'

import { useEffect, useRef } from 'react'
import { useDashboardStore } from '@/stores/use-dashboard-store'

/** Message shown when the AI backend is unreachable. */
export const AI_UNAVAILABLE_MESSAGE = 'AI assistant is temporarily unavailable'

/** Interval (ms) at which to re-check the AI endpoint when it was last unavailable. */
const RECOVERY_POLL_INTERVAL_MS = 30_000

/** Timeout (ms) for the health check request. */
const HEALTH_CHECK_TIMEOUT_MS = 5_000

/**
 * AiStatus — lightweight indicator showing whether the AI backend is reachable.
 *
 * On mount it performs a HEAD request to /api/ai/copilotkit to determine
 * availability, and writes the result to `useDashboardStore.isAiAvailable`.
 * When unavailable it shows a badge and starts polling every 30 seconds to
 * detect recovery — allowing the sidebar to resume without a page reload.
 *
 * Per ARCH-12: AI is an enhancement layer — the dashboard works without it.
 */
export function AiStatus() {
  const { isAiAvailable, setAiAvailable } = useDashboardStore()
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function clearPoll() {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  async function checkAvailability(): Promise<boolean> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT_MS)
    try {
      const res = await fetch('/api/ai/copilotkit', {
        method: 'HEAD',
        signal: controller.signal,
      })
      // 200 or 405 (method not allowed but endpoint exists) both mean available
      return res.status < 500
    } catch {
      return false
    } finally {
      clearTimeout(timeoutId)
    }
  }

  useEffect(() => {
    let cancelled = false

    checkAvailability().then((available) => {
      if (cancelled) return
      setAiAvailable(available)

      if (!available) {
        // Poll until recovery
        pollRef.current = setInterval(async () => {
          const recovered = await checkAvailability()
          if (cancelled) return
          if (recovered) {
            setAiAvailable(true)
            clearPoll()
          }
        }, RECOVERY_POLL_INTERVAL_MS)
      }
    })

    return () => {
      cancelled = true
      clearPoll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isAiAvailable) {
    return null
  }

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.25rem 0.625rem',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'rgba(197, 53, 31, 0.1)',
        color: 'var(--color-chili)',
        fontSize: '0.75rem',
        fontWeight: 500,
      }}
    >
      {/* Red dot */}
      <span
        aria-hidden="true"
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-chili)',
          flexShrink: 0,
        }}
      />
      {AI_UNAVAILABLE_MESSAGE}
    </div>
  )
}
