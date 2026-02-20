'use client'

import { useEffect, useRef, useState } from 'react'

interface MermaidDiagramProps {
  /** Raw mermaid diagram syntax */
  chart: string
  /** Accessible title for the diagram */
  title?: string
}

/**
 * MermaidDiagram — renders a Mermaid.js diagram using the spice palette.
 * Lazy-loads the mermaid library to avoid SSR issues.
 * Compatible with Tailwind v4 dark mode via CSS variables.
 */
export function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const id = useRef(`mermaid-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default

        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            // Spice palette via CSS custom properties
            primaryColor: '#E6B04B',       // Turmeric
            primaryTextColor: '#3e2723',   // Cinnamon Dark
            primaryBorderColor: '#c4921f', // Turmeric Dark
            lineColor: '#5d4037',          // Cinnamon
            secondaryColor: '#4A7C59',     // Coriander
            tertiaryColor: '#FFF8DC',      // Cream
            background: '#FFF8DC',         // Cream
            mainBkg: '#FFF8DC',
            nodeBorder: '#c4921f',
            clusterBkg: '#f5e6a3',         // Cream Dark
            titleColor: '#3e2723',
            edgeLabelBackground: '#ffffff',
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
          },
          securityLevel: 'loose',
          fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        })

        const { svg: renderedSvg } = await mermaid.render(id.current, chart)
        if (!cancelled) {
          setSvg(renderedSvg)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram')
        }
      }
    }

    render()
    return () => { cancelled = true }
  }, [chart])

  if (error) {
    return (
      <div className="rounded-lg border border-[var(--color-chili)] bg-[rgba(197,53,31,0.05)] p-4 text-sm text-[var(--color-chili)]">
        <strong>Diagram error:</strong> {error}
        <pre className="mt-2 text-xs opacity-70 overflow-auto">{chart}</pre>
      </div>
    )
  }

  return (
    <figure className="my-6 overflow-x-auto" aria-label={title ?? 'Architecture diagram'}>
      {title && (
        <figcaption className="text-xs text-center text-[var(--color-text-muted)] mb-2 font-medium">
          {title}
        </figcaption>
      )}
      <div
        ref={containerRef}
        className="flex justify-center min-h-[120px] rounded-lg border border-[var(--color-border)] bg-[var(--color-cream)] p-4"
        role="img"
        aria-label={title ?? 'Mermaid diagram'}
        // Pending SVG: show loading state
        data-loading={!svg ? 'true' : undefined}
      >
        {svg ? (
          <div dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <div className="flex items-center justify-center text-sm text-[var(--color-text-muted)] animate-pulse">
            Rendering diagram…
          </div>
        )}
      </div>
    </figure>
  )
}
