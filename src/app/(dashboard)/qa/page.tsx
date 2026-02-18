import { requireAuth } from '@/lib/auth'

export default async function QaDashboardPage() {
  await requireAuth('qa')

  return (
    <div>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
        QA dashboard — widgets coming in Story 3.2
      </p>
    </div>
  )
}
