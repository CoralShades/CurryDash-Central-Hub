import { requireAuth } from '@/lib/auth'

export default async function DevDashboardPage() {
  await requireAuth('developer')

  return (
    <div>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
        Developer dashboard — widgets coming in Story 3.2
      </p>
    </div>
  )
}
