'use client'

import { useEffect, useState } from 'react'
import { STALENESS_AMBER_MS, STALENESS_RED_MS, STALENESS_SECONDARY_MS } from '@/lib/constants'

interface StalenessIndicatorProps {
  updatedAt: Date | string | null
}

export function StalenessIndicator({ updatedAt }: StalenessIndicatorProps) {
  const [age, setAge] = useState(0)

  useEffect(() => {
    if (!updatedAt) return

    const update = () => setAge(Date.now() - new Date(updatedAt).getTime())
    update()
    const interval = setInterval(update, 30_000)
    return () => clearInterval(interval)
  }, [updatedAt])

  if (!updatedAt || age < STALENESS_SECONDARY_MS) return null

  if (age >= STALENESS_RED_MS) {
    return (
      <span
        className="rounded-full px-2 py-0.5 text-xs font-medium"
        style={{ backgroundColor: 'var(--color-chili)', color: '#fff' }}
        title={`Last updated: ${Math.round(age / 60000)} min ago`}
      >
        {Math.round(age / 60000)}m old
      </span>
    )
  }

  if (age >= STALENESS_AMBER_MS) {
    return (
      <span
        className="rounded-full px-2 py-0.5 text-xs font-medium"
        style={{ backgroundColor: 'var(--color-turmeric)', color: '#fff' }}
        title={`Last updated: ${Math.round(age / 60000)} min ago`}
      >
        {Math.round(age / 60000)}m old
      </span>
    )
  }

  return (
    <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
      Updated {Math.round(age / 60000)}m ago
    </span>
  )
}
