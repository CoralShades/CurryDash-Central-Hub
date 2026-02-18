import { requireAuth } from '@/lib/auth'
import { WidgetGrid } from '@/modules/dashboard/components/widget-grid'

export const metadata = {
  title: 'Developer Dashboard | CurryDash',
}

export default async function DevDashboardPage() {
  await requireAuth('developer')

  return <WidgetGrid role="developer" />
}
