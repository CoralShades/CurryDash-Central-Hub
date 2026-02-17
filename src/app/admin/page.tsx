import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <main style={{ padding: 'var(--space-2xl)', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ 
        marginBottom: 'var(--space-2xl)',
        paddingBottom: 'var(--space-lg)',
        borderBottom: `3px solid var(--role-admin)`
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: 'var(--space-sm)',
          color: 'var(--role-admin)'
        }}>
          Admin Dashboard
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--spice-cinnamon)', opacity: 0.8 }}>
          System administration and user management
        </p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'var(--space-lg)',
        marginBottom: 'var(--space-2xl)'
      }}>
        <div style={{
          padding: 'var(--space-xl)',
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          borderTop: `4px solid var(--role-admin)`
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: 'var(--space-md)',
            color: 'var(--spice-cinnamon)'
          }}>
            User Management
          </h2>
          <p style={{ marginBottom: 'var(--space-md)', color: 'var(--spice-cinnamon)', opacity: 0.7 }}>
            Manage users, roles, and permissions
          </p>
          <button style={{
            padding: 'var(--space-md) var(--space-lg)',
            background: 'var(--role-admin)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            Manage Users
          </button>
        </div>

        <div style={{
          padding: 'var(--space-xl)',
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          borderTop: `4px solid var(--role-admin)`
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: 'var(--space-md)',
            color: 'var(--spice-cinnamon)'
          }}>
            Team Overview
          </h2>
          <p style={{ marginBottom: 'var(--space-md)', color: 'var(--spice-cinnamon)', opacity: 0.7 }}>
            View and manage team structures
          </p>
          <button style={{
            padding: 'var(--space-md) var(--space-lg)',
            background: 'var(--role-admin)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            View Teams
          </button>
        </div>

        <div style={{
          padding: 'var(--space-xl)',
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          borderTop: `4px solid var(--role-admin)`
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: 'var(--space-md)',
            color: 'var(--spice-cinnamon)'
          }}>
            System Settings
          </h2>
          <p style={{ marginBottom: 'var(--space-md)', color: 'var(--spice-cinnamon)', opacity: 0.7 }}>
            Configure integrations and settings
          </p>
          <button style={{
            padding: 'var(--space-md) var(--space-lg)',
            background: 'var(--role-admin)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            Settings
          </button>
        </div>
      </div>

      <Link href="/" style={{ 
        display: 'inline-block',
        padding: 'var(--space-md) var(--space-lg)',
        background: 'var(--spice-cinnamon)',
        color: 'white',
        borderRadius: 'var(--radius-md)',
        fontWeight: '600'
      }}>
        ← Back to Home
      </Link>
    </main>
  )
}
