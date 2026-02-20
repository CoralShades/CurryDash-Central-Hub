# Phase 1: Next.js 16 Upgrade + Fumadocs Documentation Site

**Branch:** feat/fumadocs-integration
**Created:** 2026-02-20
**Author:** Demi + Claude
**Base:** feature/integration-wizards
**Status:** COMPLETE ✅

---

## Goal
Integrate Fumadocs into CurryDash Central Hub as a route group at `/docs`.
Prerequisite: Upgrade Next.js 15.5.12 → 16.x (requires Node.js 20.9+).

---

## Sub-phase A: Node.js + Next.js 16 Upgrade ✅

- [x] Node.js 20.20.0 installed via nvm
- [x] Next.js 16.1.6 installed (manual upgrade — codemod requires TTY)
- [x] middleware.ts → proxy.ts migration (export `const proxy = auth(...)`)
- [x] 7× revalidateTag(tag) → revalidateTag(tag, 'max')
- [x] Build passes, TypeScript zero errors
- [x] Committed: `chore: upgrade Next.js 15 → 16.1.6 with proxy.ts migration`

---

## Sub-phase B: Fumadocs Scaffold ✅

- [x] fumadocs-core@16.6.3, fumadocs-ui@16.6.3, fumadocs-mdx@14.2.7 installed
- [x] source.config.ts created (defineDocs, defineConfig)
- [x] content/docs/ structure: index.mdx, getting-started/, central-hub/
- [x] Per-folder meta.json (strings-only — fumadocs-core v16 schema)
- [x] next.config.ts wrapped with createMDX()
- [x] globals.css: fumadocs-ui CSS imports + spice palette → --color-fd-* mapping
- [x] src/lib/docs-source.ts imports from ../../.source/server (Turbopack fix)
- [x] src/app/docs/layout.tsx — DocsLayout with RootProvider
- [x] src/app/docs/[[...slug]]/page.tsx — SSG page renderer
- [x] src/app/docs/api/search/route.ts — Orama search endpoint
- [x] docs/ old guides archived to docs/_archive/
- [x] Dashboard sidebar: Docs link added (all roles, BookOpen icon)

---

## Sub-phase C: Custom MDX Components ✅

- [x] mermaid-diagram.tsx — client, lazy-load, spice palette
- [x] api-endpoint.tsx — method badge, role indicators, collapsible examples
- [x] role-badge.tsx — spice palette role pills
- [x] callout.tsx — info/warning/success/note variants
- [x] tech-stack-table.tsx — 3-repo comparison
- [x] architecture-diagram.tsx — SVG viewer with zoom Dialog
- [x] mdx-components.tsx — all registered in MDX map

---

## Sub-phase D: Verification ✅

- [x] `npm run build` — passes (22 routes, /docs SSG-prerendered)
- [x] `npx tsc --noEmit` — zero errors
- [x] `npm run lint` — zero errors (32 pre-existing warnings, 0 errors)
- [x] /docs route: SSG at /docs, /docs/getting-started, /docs/central-hub
- [x] /docs/api/search: dynamic route handler registered
- [x] Custom components created, registered in MDX map
- [x] Dashboard sidebar: Docs link present
- [x] Committed: `feat: add Fumadocs documentation site scaffold (Phase 1)`

---

## Errors Encountered

| Error | Attempt | Resolution |
|-------|---------|------------|
| @next/codemod requires TTY | 1 | Manual migration instead |
| fumadocs peer deps conflict | 1 | `--legacy-peer-deps` |
| `@/../.source` Turbopack can't resolve | 1 | Use relative `../../.source/server` |
| meta.json pages must be strings | 1 | Split into per-folder meta.json files |
| `next lint` removed in Next.js 16 | 1 | Changed to `eslint src/` in package.json |
| ESLint 9 flat config required | 1 | Created eslint.config.mjs with direct imports |
| FlatCompat circular JSON error | 1 | Import eslint-config-next directly as flat array |

---

## Key Decisions Made

| Decision | Rationale |
|----------|-----------|
| Next.js 16 before Fumadocs | Clean upgrade path, Turbopack stable |
| proxy.ts (Node.js runtime) | User preference, Auth.js v5 supports it |
| Tailwind v4 CSS-only | fumadocs-ui v16 requires v4, no tailwind.config.js |
| Public docs in Phase 1 | Simplest path; role-gating in Phase 4 |
| docs/_archive/ | Preserve old guides, recreate as MDX in Phase 2 |
| source.config.ts approach | Turbopack-compatible, fumadocs-mdx v14 |
| .source/ gitignored | Auto-generated at build time, not committed |
| ESLint 9 flat config | next lint removed from Next.js 16, use eslint directly |
| New react-hooks rules → warn | Pre-existing violations, clean up in separate sprint |

---

## Next: Phase 2 — Content Generation

Source material:
- docs/prd.md (3304-line consolidated PRD for all 3 repos)
- _bmad-output/planning-artifacts/architecture.md
- _bmad-output/planning-artifacts/ux-design-specification.md

Pages to generate (from meta.json navigation plan):
- getting-started/architecture-overview.mdx
- getting-started/tech-stack.mdx
- central-hub/architecture.mdx, auth-rbac.mdx, dashboard-widgets.mdx,
  jira-integration.mdx, github-integration.mdx, ai-assistant.mdx,
  webhook-pipeline.mdx, design-system.mdx
- admin-seller-portal/ (5 pages)
- customer-app/ (5 pages)
- integrations/ (4 pages)
- roles/ (4 pages)
