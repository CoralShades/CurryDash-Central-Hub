import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{ padding: 'var(--space-2xl)', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ 
        fontSize: '3rem', 
        marginBottom: 'var(--space-lg)',
        color: 'var(--spice-cinnamon)'
      }}>
        Welcome to CurryDash Central Hub
      </h1>
      
      <p style={{ 
        fontSize: '1.25rem', 
        marginBottom: 'var(--space-xl)',
        color: 'var(--spice-cinnamon)',
        opacity: 0.8
      }}>
        Your role-based project management portal
      </p>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 'var(--space-lg)',
        marginBottom: 'var(--space-2xl)'
      }}>
        <Link href="/login" style={{
          padding: 'var(--space-lg)',
          background: 'var(--spice-turmeric)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          fontSize: '1.125rem',
          fontWeight: '600',
          boxShadow: 'var(--shadow-md)',
          transition: 'transform 0.2s',
        }}>
          Login
        </Link>
        
        <Link href="/register" style={{
          padding: 'var(--space-lg)',
          background: 'var(--spice-coriander)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          fontSize: '1.125rem',
          fontWeight: '600',
          boxShadow: 'var(--shadow-md)',
          transition: 'transform 0.2s',
        }}>
          Register
        </Link>
      </div>

      <section style={{ marginTop: 'var(--space-2xl)' }}>
        <h2 style={{ 
          fontSize: '2rem', 
          marginBottom: 'var(--space-lg)',
          color: 'var(--spice-cinnamon)'
        }}>
          Dashboards by Role
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-md)'
        }}>
          <Link href="/admin" style={{
            padding: 'var(--space-lg)',
            background: 'var(--role-admin)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            Admin Dashboard
          </Link>
          
          <Link href="/dev" style={{
            padding: 'var(--space-lg)',
            background: 'var(--role-dev)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            Developer Dashboard
          </Link>
          
          <Link href="/qa" style={{
            padding: 'var(--space-lg)',
            background: 'var(--role-qa)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            QA Dashboard
          </Link>
          
          <Link href="/stakeholder" style={{
            padding: 'var(--space-lg)',
            background: 'var(--role-stakeholder)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}>
            Stakeholder Dashboard
          </Link>
        </div>
      </section>
    </main>
  )
}
