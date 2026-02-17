import Link from 'next/link'

export default function RegisterPage() {
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
          Register for CurryDash
        </h1>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div>
            <label htmlFor="name" style={{ 
              display: 'block', 
              marginBottom: 'var(--space-sm)',
              color: 'var(--spice-cinnamon)',
              fontWeight: '500'
            }}>
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                border: '2px solid var(--spice-coriander)',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
              }}
            />
          </div>
          
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
                border: '2px solid var(--spice-coriander)',
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
                border: '2px solid var(--spice-coriander)',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
              }}
            />
          </div>
          
          <div>
            <label htmlFor="role" style={{ 
              display: 'block', 
              marginBottom: 'var(--space-sm)',
              color: 'var(--spice-cinnamon)',
              fontWeight: '500'
            }}>
              Role
            </label>
            <select
              id="role"
              name="role"
              required
              style={{
                width: '100%',
                padding: 'var(--space-md)',
                border: '2px solid var(--spice-coriander)',
                borderRadius: 'var(--radius-md)',
                fontSize: '1rem',
              }}
            >
              <option value="">Select a role...</option>
              <option value="dev">Developer</option>
              <option value="qa">QA Engineer</option>
              <option value="stakeholder">Stakeholder</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <button
            type="submit"
            style={{
              padding: 'var(--space-lg)',
              background: 'var(--spice-coriander)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '1.125rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            Create Account
          </button>
        </form>
        
        <p style={{ 
          marginTop: 'var(--space-lg)', 
          textAlign: 'center',
          color: 'var(--spice-cinnamon)'
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{ 
            color: 'var(--spice-turmeric)', 
            fontWeight: '600' 
          }}>
            Login
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
