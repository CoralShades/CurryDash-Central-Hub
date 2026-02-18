import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AppSidebar } from '@/modules/dashboard/components/app-sidebar'
import { PageHeader } from '@/modules/dashboard/components/page-header'
import type { Role } from '@/types/roles'

/**
 * Dashboard layout — wraps all authenticated views with sidebar + header shell.
 * Verifies session at the layout level as a second layer after middleware.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const { user } = session
  const userRole = user.role as Role | null

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
      {/* Skip to content — first focusable element for accessibility */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          top: '-100%',
          left: '0',
          zIndex: 100,
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--color-turmeric)',
          color: '#fff',
          fontWeight: 600,
          textDecoration: 'none',
          borderRadius: '0 0 var(--radius-md) 0',
        }}
        onFocus={(e) => {
          e.currentTarget.style.top = '0'
        }}
        onBlur={(e) => {
          e.currentTarget.style.top = '-100%'
        }}
      >
        Skip to main content
      </a>

      {/* Sidebar */}
      <AppSidebar
        userRole={userRole}
        userName={user.name}
        userEmail={user.email}
        userAvatar={user.image}
      />

      {/* Main column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <PageHeader
          userRole={userRole}
          userName={user.name}
          userEmail={user.email}
          userAvatar={user.image}
          lastUpdated={null}
        />
        <main
          id="main-content"
          tabIndex={-1}
          style={{
            flex: 1,
            padding: 'var(--spacing-6, 1.5rem)',
            maxWidth: '1440px',
            width: '100%',
            margin: '0 auto',
            outline: 'none',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
