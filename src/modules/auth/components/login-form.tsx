'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

const SESSION_REDIRECT_KEY = 'redirectAfterLogin'

function getAndClearRedirect(): string {
  if (typeof window === 'undefined') return '/'
  const stored = sessionStorage.getItem(SESSION_REDIRECT_KEY)
  if (stored) sessionStorage.removeItem(SESSION_REDIRECT_KEY)
  return stored ?? '/'
}

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [callbackUrl, setCallbackUrl] = useState('/')
  const searchParams = useSearchParams()

  useEffect(() => {
    setCallbackUrl(getAndClearRedirect())
    // Display Auth.js error from URL query params (e.g. ?error=OAuthCallbackError)
    const urlError = searchParams.get('error')
    if (urlError) {
      setError(`Authentication failed: ${urlError}`)
    }
  }, [searchParams])

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setIsLoading('email')
    setError(null)
    try {
      const result = await signIn('resend', { email, redirect: false })
      if (result?.error) {
        setError('Failed to send magic link. Please try again.')
      } else {
        setMagicLinkSent(true)
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(null)
    }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    setIsLoading(provider)
    setError(null)
    try {
      await signIn(provider, { callbackUrl })
    } catch {
      setError('Failed to connect. Please try again.')
      setIsLoading(null)
    }
  }

  if (magicLinkSent) {
    return (
      <div className="text-center">
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: 'var(--color-coriander-bg, #f0f7f2)' }}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'var(--color-coriander)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Check your email
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          We sent a magic link to <strong>{email}</strong>. Click the link to sign in.
        </p>
        <button
          onClick={() => setMagicLinkSent(false)}
          className="mt-4 text-sm underline"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-1 text-center text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        Sign in to your account
      </h2>
      <p className="mb-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
        Choose your preferred sign-in method
      </p>

      {error && (
        <div
          className="mb-4 rounded-md px-3 py-2 text-sm"
          role="alert"
          style={{ backgroundColor: '#fef2f0', color: 'var(--color-chili)' }}
        >
          {error}
        </div>
      )}

      {/* Magic link form */}
      <form onSubmit={handleMagicLink} className="space-y-3">
        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors focus:ring-2"
            style={{
              borderColor: 'hsl(var(--border))',
              backgroundColor: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading !== null}
          className="w-full rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: 'var(--color-turmeric)' }}
        >
          {isLoading === 'email' ? 'Sending…' : 'Send Magic Link'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: 'hsl(var(--border))' }} />
        </div>
        <div className="relative flex justify-center">
          <span
            className="px-3 text-xs uppercase tracking-wider"
            style={{ backgroundColor: 'hsl(var(--card))', color: 'var(--color-text-muted)' }}
          >
            or continue with
          </span>
        </div>
      </div>

      {/* OAuth buttons */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => handleOAuth('google')}
          disabled={isLoading !== null}
          className="flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:opacity-80 disabled:opacity-60"
          style={{
            borderColor: 'hsl(var(--border))',
            color: 'hsl(var(--foreground))',
            backgroundColor: 'hsl(var(--background))',
          }}
        >
          {/* Google icon */}
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {isLoading === 'google' ? 'Connecting…' : 'Continue with Google'}
        </button>

        <button
          type="button"
          onClick={() => handleOAuth('github')}
          disabled={isLoading !== null}
          className="flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:opacity-80 disabled:opacity-60"
          style={{
            borderColor: 'hsl(var(--border))',
            color: 'hsl(var(--foreground))',
            backgroundColor: 'hsl(var(--background))',
          }}
        >
          {/* GitHub icon */}
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
          {isLoading === 'github' ? 'Connecting…' : 'Continue with GitHub'}
        </button>
      </div>

      <p className="mt-6 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
        By signing in, you agree to the CurryDash team&apos;s usage policies.
      </p>
    </div>
  )
}
