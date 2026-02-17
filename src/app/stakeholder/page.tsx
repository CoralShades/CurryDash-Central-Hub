import Link from 'next/link'

export default function StakeholderDashboard() {
  return (
    <main style={{ padding: 'var(--space-2xl)', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ 
        marginBottom: 'var(--space-2xl)',
        paddingBottom: 'var(--space-lg)',
        borderBottom: `3px solid var(--role-stakeholder)`
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: 'var(--space-sm)',
          color: 'var(--role-stakeholder)'
        }}>
          Stakeholder Dashboard
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--spice-cinnamon)', opacity: 0.8 }}>
          Project overview and business metrics
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
          borderTop: `4px solid var(--role-stakeholder)`
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: 'var(--space-md)',
            color: 'var(--spice-cinnamon)'
          }}>
            Project Status
          </h2>
          <p style={{ marginBottom: 'var(--space-md)', color: 'var(--spice-cinnamon)', opacity: 0.7 }}>
            View overall project progress
          </p>
          <button style={{
            padding: 'var(--space-md) var(--space-lg)',
            background: 'var(--role-stakeholder)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            View Status
          </button>
        </div>

        <div style={{
          padding: 'var(--space-xl)',
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          borderTop: `4px solid var(--role-stakeholder)`
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: 'var(--space-md)',
            color: 'var(--spice-cinnamon)'
          }}>
            Analytics
          </h2>
          <p style={{ marginBottom: 'var(--space-md)', color: 'var(--spice-cinnamon)', opacity: 0.7 }}>
            Business metrics and insights
          </p>
          <button style={{
            padding: 'var(--space-md) var(--space-lg)',
            background: 'var(--role-stakeholder)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            View Analytics
          </button>
        </div>

        <div style={{
          padding: 'var(--space-xl)',
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          borderTop: `4px solid var(--role-stakeholder)`
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: 'var(--space-md)',
            color: 'var(--spice-cinnamon)'
          }}>
            Reports
          </h2>
          <p style={{ marginBottom: 'var(--space-md)', color: 'var(--spice-cinnamon)', opacity: 0.7 }}>
            Generate executive reports
          </p>
          <button style={{
            padding: 'var(--space-md) var(--space-lg)',
            background: 'var(--role-stakeholder)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            View Reports
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
