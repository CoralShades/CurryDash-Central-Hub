import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { ReportGenerator } from '@/modules/reports/components/report-generator'
import type { Role } from '@/types/roles'

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  developer: 'Developer',
  qa: 'QA',
  stakeholder: 'Stakeholder',
}

/**
 * Reports page — AI-generated progress summaries.
 *
 * Stakeholders receive a high-level business summary (health indicator, milestone %,
 * aggregate achievements, risks, outlook). Developers and QA receive role-appropriate
 * technical detail. Role filtering is enforced server-side via JWT claims (FR34).
 *
 * Streaming via SSE from /api/reports/progress-summary satisfies FR31 (NFR-P7).
 */
export default async function ReportsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const role = (session.user.role ?? null) as Role | null
  const roleLabel = role ? ROLE_LABELS[role] : undefined

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Page header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'hsl(var(--foreground))',
            margin: '0 0 0.375rem',
          }}
        >
          Progress Reports
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>
          AI-generated project status summaries tailored to your role. Data sourced from Jira and
          GitHub.
        </p>
      </div>

      {/* Report generator — client component with SSE streaming */}
      <ReportGenerator roleLabel={roleLabel} />
    </div>
  )
}
