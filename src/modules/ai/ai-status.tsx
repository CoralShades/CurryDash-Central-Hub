'use client'

import { useEffect, useState } from 'react'

type AiAvailability = 'checking' | 'available' | 'unavailable'

/**
 * AiStatus — lightweight indicator showing whether the AI backend is reachable.
 *
 * Performs a HEAD request to /api/ai/copilotkit on mount and updates state.
 * On failure (network error, 401, 500, etc.) it shows an "AI unavailable" badge
 * so the user knows to expect no AI responses without crashing the dashboard.
 *
 * Per ARCH-12: AI is an enhancement layer — the dashboard works without it.
 */
export function AiStatus() {
  const [status, setStatus] = useState<AiAvailability>('checking')

  useEffect(() => {
    let cancelled = false

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    fetch('/api/ai/copilotkit', {
      method: 'HEAD',
      signal: controller.signal,
    })
      .then((res) => {
        if (!cancelled) {
          // 200 or 405 (method not allowed but endpoint exists) both mean available
          setStatus(res.status < 500 ? 'available' : 'unavailable')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('unavailable')
      })
      .finally(() => {
        clearTimeout(timeoutId)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  if (status === 'checking' || status === 'available') {
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
      AI unavailable
    </div>
  )
}
