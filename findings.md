# Findings — BMAD Artifact Sync for Fumadocs

**Session:** 2026-02-21
**Task:** Retroactively update BMAD planning artifacts for Fumadocs documentation site

---

## Gap Analysis: BMAD Artifacts vs Actual Implementation

### Current Sprint Status (sprint-status.yaml)

- 8 epics, all marked `done` (stories 1-1 through 8-4)
- **No mention** of Fumadocs, docs site, Next.js 16 upgrade, or E2E test infrastructure
- Last updated: 2026-02-19 (from .ralph-plan.md)

### Current PRD (_bmad-output/planning-artifacts/prd.md)

- Covers FR1-FR56 for Central Hub (8 capability areas)
- **No documentation site requirements** (no FR for /docs route, MDX content, search)
- No NFRs for documentation freshness, search performance, or accessibility

### Current Architecture (architecture.md)

- Complete architecture for 8 FR categories
- Project structure section does NOT include:
  - `src/app/docs/` route group
  - `content/docs/` MDX content directory
  - `src/components/docs/` custom MDX components
  - `source.config.ts` Fumadocs loader
  - `.source/` auto-generated directory
- No mention of Fumadocs, MDX processing, or Orama search
- No mention of Next.js 16 (still references Next.js 15)

### Current Epics (epics.md)

- 8 epics with 36 stories
- **No Epic 9** for documentation
- No stories for Fumadocs scaffold, content generation, or visual content

### Consolidated PRD (docs/prd.md)

- 3304-line master PRD covering all 3 repos
- FR ranges: FR1-70 (Customer App), FR71-120 (Admin), FR121-160 (Vendor), FR161-200 (Backend), FR201-230 (Cross-cutting)
- **Fumadocs would need a new range** — suggest FR231+ (Cross-platform Documentation)
- This PRD is primarily a *content source* for the docs site, not a tracking doc for it

---

## What Was Actually Implemented

### Phase 1 Implementation Inventory (commit de5bb98)

**New packages installed:**
- fumadocs-core@16.6.3
- fumadocs-ui@16.6.3
- fumadocs-mdx@14.2.7
- @orama/orama (search)

**New routes created:**
- `src/app/docs/layout.tsx` — DocsLayout with RootProvider, spice palette
- `src/app/docs/[[...slug]]/page.tsx` — Dynamic SSG doc page renderer
- `src/app/docs/api/search/route.ts` — Orama full-text search endpoint

**New content:**
- `content/docs/index.mdx` — Welcome page (60 lines)
- `content/docs/getting-started/index.mdx` — Quick start (32 lines)
- `content/docs/central-hub/index.mdx` — Hub overview (45 lines)
- `content/docs/meta.json` — Top-level navigation
- `content/docs/getting-started/meta.json` — Section nav
- `content/docs/central-hub/meta.json` — Section nav

**New components (src/components/docs/):**
- mermaid-diagram.tsx — Client component, lazy-load mermaid.js, spice palette
- api-endpoint.tsx — Method badge, role indicators, collapsible examples
- role-badge.tsx — Spice palette role pills
- callout.tsx — info/warning/success/note variants
- tech-stack-table.tsx — 3-repo comparison table
- architecture-diagram.tsx — SVG viewer with zoom Dialog
- mdx-components.tsx — All components registered in MDX map

**Configuration changes:**
- `source.config.ts` — Fumadocs MDX loader config
- `next.config.ts` — Wrapped with createMDX()
- `src/app/globals.css` — Fumadocs CSS imports + spice palette mapping
- `tsconfig.json` — Updated for MDX support
- `eslint.config.mjs` — New ESLint 9 flat config (required by Next.js 16)
- `.gitignore` — Added .source/ directory

**Dashboard integration:**
- `src/modules/dashboard/components/app-sidebar.tsx` — Added Docs link (BookOpen icon, all roles)

### Phase 0 Prerequisite (commit a79b329)

**Next.js 15 → 16 upgrade:**
- middleware.ts → proxy.ts migration (Node.js runtime)
- 7x revalidateTag() → revalidateTag(tag, 'max') signature change
- Node.js 18 → 20.20.0 (nvm)
- ESLint 9 flat config migration

---

## Proposed New FRs for Central Hub PRD

| FR | Title | Phase | Status |
|----|-------|-------|--------|
| FR57 | Users can access a documentation site at /docs within Central Hub | 1 | DONE |
| FR58 | The documentation site provides full-text search across all doc pages | 1 | DONE |
| FR59 | The documentation site renders MDX content with custom components (diagrams, API endpoints, role badges) | 1 | DONE |
| FR60 | The documentation site auto-generates content from BMAD planning artifacts | 2 | BACKLOG |
| FR61 | The documentation site displays Mermaid diagrams for architecture flows | 3 | BACKLOG |
| FR62 | The documentation site provides role-specific landing pages for each user role | 4 | BACKLOG |
| FR63 | Admin users can configure which documentation sections are visible to each role | 4 | BACKLOG |
| FR64 | The system can regenerate documentation from BMAD artifacts via CLI script | 5 | BACKLOG |

---

## Proposed Epic 9 Stories

| Story | Title | Phase | Status |
|-------|-------|-------|--------|
| 9-0 | Next.js 16 upgrade + proxy.ts migration | 0 (prereq) | done |
| 9-1 | Fumadocs scaffold — routes, components, config, search | 1 | done |
| 9-2 | PRD-to-MDX content generation pipeline (~30 pages) | 2 | backlog |
| 9-3 | Mermaid diagrams and static visual assets | 3 | backlog |
| 9-4 | Role-based documentation views and access control | 4 | backlog |
| 9-5 | AI-powered doc maintenance script | 5 | backlog |

---

## Architecture Additions Needed

### New Project Structure Entries
```
content/docs/           # MDX documentation source files
  ├── meta.json         # Fumadocs navigation structure
  ├── index.mdx         # Docs landing page
  ├── getting-started/  # Quick start guides
  └── central-hub/      # Central Hub-specific docs

src/app/docs/           # Fumadocs route group
  ├── layout.tsx        # DocsLayout with RootProvider
  ├── [[...slug]]/page.tsx  # Dynamic SSG page renderer
  └── api/search/route.ts   # Orama search endpoint

src/components/docs/    # Custom MDX components
  ├── mdx-components.tsx    # Component registration map
  ├── mermaid-diagram.tsx   # Client-side Mermaid renderer
  ├── api-endpoint.tsx      # Styled API endpoint card
  ├── role-badge.tsx        # Inline role indicator
  ├── callout.tsx           # Enhanced callout/admonition
  ├── tech-stack-table.tsx  # 3-repo comparison table
  └── architecture-diagram.tsx  # SVG viewer with zoom

source.config.ts        # Fumadocs MDX loader configuration
.source/                # Auto-generated (gitignored)
```

### New Integration Points
- BMAD artifacts (`_bmad-output/`) → content source for docs generation (Phase 2)
- Consolidated PRD (`docs/prd.md`) → content source for cross-repo docs
- Dashboard sidebar → /docs navigation link
- Spice palette CSS vars → Fumadocs theme vars (`--color-fd-*`)

### New Cross-Cutting Concern
- **Documentation as Code** — Docs are co-located with the app, share auth system, share design tokens, deployed together on Vercel

---

## Password / Sensitive Data

- WSL sudo: (removed — should not be in planning files)
