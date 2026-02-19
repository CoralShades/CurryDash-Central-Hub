import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AppSidebar } from '@/modules/dashboard/components/app-sidebar'
import { PageHeader } from '@/modules/dashboard/components/page-header'
import { CopilotProvider } from '@/modules/ai/copilot-provider'
import { AiSidebar } from '@/modules/ai/ai-sidebar'
import type { Role } from '@/types/roles'

/**
 * Dashboard layout — wraps all authenticated views with sidebar + header shell.
 * Verifies session at the layout level as a second layer after middleware.
 * CopilotProvider wraps the entire layout so all dashboard pages have access
 * to CopilotKit context (useCopilotReadable, useCopilotAction, AiSidebar).
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const { user } = session
  const userRole = user.role as Role | null

  return (
    <CopilotProvider>
      <div className="flex min-h-screen bg-background">
        {/* Skip to content — first focusable element for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--color-turmeric)] focus:text-white focus:font-semibold focus:no-underline focus:rounded-br-md"
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
        <div className="flex flex-1 flex-col min-w-0">
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
            className="flex-1 p-6 max-w-[1440px] w-full mx-auto outline-none"
          >
            {children}
          </main>
        </div>

        {/* AI Sidebar — slides in from the right, controlled by useDashboardStore */}
        <AiSidebar />
      </div>
    </CopilotProvider>
  )
}
