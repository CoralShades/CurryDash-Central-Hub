import type { WidgetConfig } from '../config/widget-registry'

interface WidgetPlaceholderProps {
  config: WidgetConfig
}

/**
 * Temporary placeholder rendered by WidgetGrid for widgets not yet implemented.
 * Replaced widget-by-widget as Epic 3/4/5 stories ship real components.
 */
export function WidgetPlaceholder({ config }: WidgetPlaceholderProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', height: '100%' }}>
      <p
        style={{
          margin: 0,
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--color-text-muted)',
        }}
      >
        {config.title}
      </p>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-surface)',
          border: '1px dashed var(--color-border)',
        }}
      >
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
          Coming soon · {config.dataSource}
        </span>
      </div>
    </div>
  )
}
