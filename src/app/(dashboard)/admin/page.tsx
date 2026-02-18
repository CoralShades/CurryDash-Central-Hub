import { requireAuth } from '@/lib/auth'

export default async function AdminDashboardPage() {
  await requireAuth('admin')

  return (
    <div>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
        Admin dashboard — widgets coming in Story 3.2
      </p>
    </div>
  )
}
