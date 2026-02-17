import Link from 'next/link'

export default function LoginPage() {
  return (
    <main style={{ 
      padding: 'var(--space-2xl)', 
      maxWidth: '500px', 
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        padding: 'var(--space-2xl)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          marginBottom: 'var(--space-lg)',
          color: 'var(--spice-cinnamon)',
          textAlign: 'center'
        }}>
          Login to CurryDash
        </h1>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div>
            <label htmlFor="email" style={{ 
              display: 'block', 
              marginBottom: 'var(--space-sm)',
              color: 'var(--spice-cinnamon)',
              fontWeight: '500'
            }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                border: '2px solid var(--spice-turmeric)',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
              }}
            />
          </div>
          
          <div>
            <label htmlFor="password" style={{ 
              display: 'block', 
              marginBottom: 'var(--space-sm)',
              color: 'var(--spice-cinnamon)',
              fontWeight: '500'
            }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                border: '2px solid var(--spice-turmeric)',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
              }}
            />
          </div>
          
          <button
            type="submit"
            style={{
              padding: 'var(--space-lg)',
              background: 'var(--spice-turmeric)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '1.125rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            Sign In
          </button>
        </form>
        
        <p style={{ 
          marginTop: 'var(--space-lg)', 
          textAlign: 'center',
          color: 'var(--spice-cinnamon)'
        }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ 
            color: 'var(--spice-turmeric)', 
            fontWeight: '600' 
          }}>
            Register
          </Link>
        </p>
        
        <Link href="/" style={{ 
          display: 'block',
          marginTop: 'var(--space-md)',
          textAlign: 'center',
          color: 'var(--spice-coriander)',
          fontSize: '0.875rem'
        }}>
          ← Back to Home
        </Link>
      </div>
    </main>
  )
}
