import { requireAuth } from '@/lib/auth'

export default async function StakeholderDashboardPage() {
  await requireAuth('stakeholder')

  return (
    <div>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
        Stakeholder dashboard — widgets coming in Story 3.2
      </p>
    </div>
  )
}
