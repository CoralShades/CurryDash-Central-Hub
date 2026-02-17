import Link from 'next/link'

export default function DevDashboard() {
  return (
    <main style={{ padding: 'var(--space-2xl)', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ 
        marginBottom: 'var(--space-2xl)',
        paddingBottom: 'var(--space-lg)',
        borderBottom: `3px solid var(--role-dev)`
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: 'var(--space-sm)',
          color: 'var(--role-dev)'
        }}>
          Developer Dashboard
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--spice-cinnamon)', opacity: 0.8 }}>
          Code, commits, and development workflows
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
          borderTop: `4px solid var(--role-dev)`
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: 'var(--space-md)',
            color: 'var(--spice-cinnamon)'
          }}>
            GitHub Integration
          </h2>
          <p style={{ marginBottom: 'var(--space-md)', color: 'var(--spice-cinnamon)', opacity: 0.7 }}>
            View pull requests and code reviews
          </p>
          <button style={{
            padding: 'var(--space-md) var(--space-lg)',
            background: 'var(--role-dev)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            View PRs
          </button>
        </div>

        <div style={{
          padding: 'var(--space-xl)',
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          borderTop: `4px solid var(--role-dev)`
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: 'var(--space-md)',
            color: 'var(--spice-cinnamon)'
          }}>
            Jira Tickets
          </h2>
          <p style={{ marginBottom: 'var(--space-md)', color: 'var(--spice-cinnamon)', opacity: 0.7 }}>
            Track assigned development tasks
          </p>
          <button style={{
            padding: 'var(--space-md) var(--space-lg)',
            background: 'var(--role-dev)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            View Tickets
          </button>
        </div>

        <div style={{
          padding: 'var(--space-xl)',
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          borderTop: `4px solid var(--role-dev)`
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: 'var(--space-md)',
            color: 'var(--spice-cinnamon)'
          }}>
            AI Assistant
          </h2>
          <p style={{ marginBottom: 'var(--space-md)', color: 'var(--spice-cinnamon)', opacity: 0.7 }}>
            Get help with coding questions
          </p>
          <button style={{
            padding: 'var(--space-md) var(--space-lg)',
            background: 'var(--role-dev)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            Open Chat
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
