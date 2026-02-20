# Static Diagram Assets

Place SVG and image files here for use with the ArchitectureDiagram component.

## Naming Convention
- kebab-case filenames
- Optimized SVGs under 50KB each
- Include <title> and <desc> for accessibility

## Usage in MDX
```mdx
<ArchitectureDiagram 
  src="/docs/diagrams/rbac-matrix.svg" 
  alt="RBAC three-layer permission matrix"
  caption="Figure 1: Three-layer RBAC enforcement" 
/>
```

## Planned Diagrams
- ecosystem-overview.svg — High-level 3-repo architecture
- dashboard-layout.svg — Dashboard wireframe with widget grid
- rbac-matrix.svg — Visual RBAC permission matrix
- webhook-sequence.svg — Detailed webhook sequence diagram
- ai-sidebar-flow.svg — AI sidebar interaction flow

