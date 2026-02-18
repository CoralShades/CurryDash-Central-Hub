import { requireAuth } from '@/lib/auth'
import { WidgetGrid } from '@/modules/dashboard/components/widget-grid'

export const metadata = {
  title: 'Stakeholder Dashboard | CurryDash',
}

export default async function StakeholderDashboardPage() {
  await requireAuth('stakeholder')

  return <WidgetGrid role="stakeholder" />
}
