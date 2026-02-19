import { Suspense } from 'react'
import type { Metadata } from 'next'
import { LoginForm } from '@/modules/auth/components/login-form'
import { Card } from '@/components/ui/card'
import { WidgetSkeleton } from '@/components/shared/widget-skeleton'

export const metadata: Metadata = {
  title: 'Sign In — CurryDash Central Hub',
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Logo / wordmark */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-cinnamon">
          CurryDash
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Central Hub
        </p>
      </div>

      {/* Auth card */}
      <Card className="w-full max-w-[400px] p-8 shadow-lg">
        <Suspense fallback={<WidgetSkeleton variant="list" />}>
          <LoginForm />
        </Suspense>
      </Card>
    </main>
  )
}
