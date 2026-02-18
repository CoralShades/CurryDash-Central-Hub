import { requireAuth } from '@/lib/auth'
import { WidgetGrid } from '@/modules/dashboard/components/widget-grid'

export const metadata = {
  title: 'QA Dashboard | CurryDash',
}

export default async function QaDashboardPage() {
  await requireAuth('qa')

  return <WidgetGrid role="qa" />
}
