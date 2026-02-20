import type { ReactNode } from 'react'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { RootProvider } from 'fumadocs-ui/provider/next'
import { docsSource } from '@/lib/docs-source'
import { BookOpen } from 'lucide-react'

interface DocsRootLayoutProps {
  children: ReactNode
}

export default function DocsRootLayout({ children }: DocsRootLayoutProps) {
  return (
    <RootProvider>
      <DocsLayout
        tree={docsSource.pageTree}
        nav={{
          title: (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[var(--color-turmeric)] flex items-center justify-center shrink-0">
                <BookOpen className="w-3.5 h-3.5 text-white" aria-hidden="true" />
              </div>
              <span className="font-semibold text-sm">CurryDash Docs</span>
            </div>
          ),
        }}
        sidebar={{
          banner: (
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-cream)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
              <span className="font-medium text-[var(--color-cinnamon)]">CurryDash</span> — Internal documentation for the development team.
            </div>
          ),
        }}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  )
}
