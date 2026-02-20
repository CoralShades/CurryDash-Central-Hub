import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { MermaidDiagram } from './mermaid-diagram'
import { ApiEndpoint } from './api-endpoint'
import { RoleBadge } from './role-badge'
import { Callout } from './callout'
import { TechStackTable } from './tech-stack-table'
import { ArchitectureDiagram } from './architecture-diagram'

/**
 * getMDXComponents — returns the full MDX component map.
 * All components are available in every MDX file without explicit imports.
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    // Custom CurryDash doc components
    MermaidDiagram,
    ApiEndpoint,
    RoleBadge,
    Callout,
    TechStackTable,
    ArchitectureDiagram,
    ...components,
  }
}
