import { requireAuth } from '@/lib/auth'
import { WidgetGrid } from '@/modules/dashboard/components/widget-grid'

export const metadata = {
  title: 'Admin Dashboard | CurryDash',
}

export default async function AdminDashboardPage() {
  await requireAuth('admin')

  return <WidgetGrid role="admin" />
}
