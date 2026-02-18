import { LoginForm } from '@/modules/auth/components/login-form'

export const metadata = {
  title: 'Sign In — CurryDash Central Hub',
}

export default function LoginPage() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'hsl(var(--background))' }}
    >
      {/* Logo / wordmark */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-cinnamon)' }}>
          CurryDash
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Central Hub
        </p>
      </div>

      {/* Auth card */}
      <div
        className="w-full rounded-xl p-8 shadow-lg"
        style={{
          maxWidth: '400px',
          backgroundColor: 'hsl(var(--card))',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <LoginForm />
      </div>
    </main>
  )
}
