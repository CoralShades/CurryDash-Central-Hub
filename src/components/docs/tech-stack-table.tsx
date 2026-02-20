interface TechRow {
  feature: string
  adminPortal: string
  customerApp: string
  centralHub: string
}

interface TechStackTableProps {
  rows?: TechRow[]
}

const DEFAULT_ROWS: TechRow[] = [
  { feature: 'Language', adminPortal: 'PHP 8.2+', customerApp: 'Dart 3.x', centralHub: 'TypeScript 5.x' },
  { feature: 'Framework', adminPortal: 'Laravel 10.x', customerApp: 'Flutter 3.x', centralHub: 'Next.js 16' },
  { feature: 'UI Library', adminPortal: 'Blade + Filament 3.x', customerApp: 'Material 3 + Custom', centralHub: 'shadcn/ui + Tailwind v4' },
  { feature: 'Database', adminPortal: 'MySQL 8.x + Eloquent', customerApp: 'SQLite (local cache)', centralHub: 'Supabase (PostgreSQL)' },
  { feature: 'Auth', adminPortal: 'Laravel Sanctum', customerApp: 'JWT + Sanctum', centralHub: 'Auth.js v5 + Supabase' },
  { feature: 'State', adminPortal: 'Livewire + Alpine.js', customerApp: 'BLoC / Provider', centralHub: 'Zustand 5' },
  { feature: 'API', adminPortal: 'REST (Laravel + Sanctum)', customerApp: 'REST consumer', centralHub: 'Next.js API Routes' },
  { feature: 'Testing', adminPortal: 'PHPUnit + Pest', customerApp: 'Flutter test + Mockito', centralHub: 'Vitest + Playwright' },
  { feature: 'Deployment', adminPortal: 'Laravel Forge / Docker', customerApp: 'App Store + Web', centralHub: 'Vercel' },
]

/**
 * TechStackTable — side-by-side comparison of all 3 repos.
 * Usage in MDX: <TechStackTable /> or <TechStackTable rows={[...]} />
 */
export function TechStackTable({ rows = DEFAULT_ROWS }: TechStackTableProps) {
  return (
    <div className="my-6 overflow-x-auto rounded-lg border border-[var(--color-border)]">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-cream)]">
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-text-primary)] sticky left-0 bg-[var(--color-cream)] min-w-[120px]">
              Feature
            </th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-cinnamon)] whitespace-nowrap">
              Admin-Seller Portal
              <span className="ml-1 text-[0.65rem] font-normal text-[var(--color-text-muted)]">(Laravel)</span>
            </th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-coriander)] whitespace-nowrap">
              Customer App
              <span className="ml-1 text-[0.65rem] font-normal text-[var(--color-text-muted)]">(Flutter)</span>
            </th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-turmeric-dark)] whitespace-nowrap">
              Central Hub
              <span className="ml-1 text-[0.65rem] font-normal text-[var(--color-text-muted)]">(Next.js)</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.feature}
              className={i % 2 === 0 ? 'bg-white' : 'bg-[rgba(255,248,220,0.4)]'}
            >
              <td className="px-4 py-2.5 font-medium text-[var(--color-text-primary)] sticky left-0 bg-inherit border-r border-[var(--color-border-subtle)]">
                {row.feature}
              </td>
              <td className="px-4 py-2.5 text-[var(--color-text-secondary)]">{row.adminPortal}</td>
              <td className="px-4 py-2.5 text-[var(--color-text-secondary)]">{row.customerApp}</td>
              <td className="px-4 py-2.5 text-[var(--color-text-secondary)]">{row.centralHub}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
