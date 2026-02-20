# Phase 1: Next.js 16 Upgrade + Fumadocs Documentation Site

**Branch:** feat/fumadocs-integration
**Created:** 2026-02-20
**Author:** Demi + Claude
**Base:** feature/integration-wizards

---

## Goal
Integrate Fumadocs into CurryDash Central Hub as a route group at `/docs`.
Prerequisite: Upgrade Next.js 15.5.12 → 16.x (requires Node.js 20.9+).

---

## Sub-phase A: Node.js + Next.js 16 Upgrade

### A1: Node.js 20 (WSL)
- [ ] Verify nvm is installed: `command -v nvm`
- [ ] Install Node.js 20: `nvm install 20`
- [ ] Set as default: `nvm alias default 20`
- [ ] Verify: `node --version` → must show v20.x

### A2: Run Official Codemod
- [ ] `npx @next/codemod@canary upgrade latest` (handles async params, React 19 types)
- [ ] Verify codemod output — review what it changed

### A3: Middleware → Proxy Migration
- [ ] Rename `src/middleware.ts` → `src/proxy.ts`
- [ ] Update export: `export default auth(...)` → `export async function proxy(request)`
- [ ] Keep same matcher config (copy from old middleware.ts)
- [ ] Update RBAC logic (same logic, different signature)
- [ ] Remove old `src/middleware.ts` if codemod didn't

### A4: revalidateTag Updates (7 call sites, 1-arg → 2-arg)
Files to update:
- [ ] `src/app/api/webhooks/github/route.ts` — 2 calls
- [ ] `src/app/api/webhooks/jira/route.ts` — 1 call
- [ ] `src/modules/admin/actions/retry-dead-letter.ts` — 2 calls
- [ ] `src/modules/admin/actions/sync-integration.ts` — 2 calls
- [ ] `src/modules/dashboard/actions/manage-widgets.ts` — 1 call
Pattern: `revalidateTag('tag')` → `revalidateTag('tag', 'max')`

### A5: Verify Upgrade
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run lint` — zero errors
- [ ] `npm run build` — builds successfully
- [ ] Manual smoke: `/login` page renders
- [ ] Commit: `chore: upgrade Next.js 15 → 16 with proxy.ts migration`

---

## Sub-phase B: Fumadocs Scaffold

### B1: Install Packages
- [ ] `npm install fumadocs-core fumadocs-ui fumadocs-mdx`
- [ ] Verify versions: fumadocs-core ~16.6.x, fumadocs-ui ~16.6.x, fumadocs-mdx ~14.2.x

### B2: source.config.ts (project root)
- [ ] Create `source.config.ts` with `defineDocs({ dir: 'content/docs' })`
- [ ] Export docs loader

### B3: content/docs/ Structure
- [ ] Create `content/docs/` directory
- [ ] Create `content/docs/index.mdx` (welcome page with ecosystem overview + Mermaid)
- [ ] Create `content/docs/meta.json` (initial navigation structure)
- [ ] Create `content/docs/getting-started/index.mdx`
- [ ] Create `content/docs/central-hub/index.mdx`

### B4: next.config.ts Update
- [ ] Import `createMDX` from `fumadocs-mdx/next`
- [ ] Wrap existing config: `export default createMDX()(nextConfig)`
- [ ] Verify Turbopack + fumadocs-mdx compatibility (test with `npm run dev`)
- [ ] Fallback: rename to next.config.mjs if .ts incompatible

### B5: Tailwind v4 / CSS Integration
- [ ] Add to `src/app/globals.css`:
  - `@import 'fumadocs-ui/css/neutral.css'`
  - `@import 'fumadocs-ui/css/preset.css'`
  - `@source '../node_modules/fumadocs-ui/dist/**/*.js'`
- [ ] Map spice palette to fd CSS variables via `@theme`:
  - `--color-fd-primary` → Turmeric #E6B04B
  - `--color-fd-background` → Cream #FFF8DC
  - `--color-fd-foreground` → Cinnamon #5D4037
  - `--color-fd-accent` → Coriander #4A7C59

### B6: Route Files
- [ ] `src/app/docs/layout.tsx` — DocsLayout from fumadocs-ui, CurryDash theming
- [ ] `src/app/docs/[[...slug]]/page.tsx` — dynamic page renderer
- [ ] `src/app/docs/api/search/route.ts` — Orama search endpoint

### B7: Archive Existing docs/ Folder
- [ ] Move `docs/*.md` → `docs/_archive/`
- [ ] Move `docs/jira/` → `docs/_archive/jira/`
- [ ] docs/ root is now only `_archive/` (Fumadocs uses `content/docs/`)

### B8: Dashboard Sidebar — Add "Docs" Link
- [ ] Find sidebar nav component
- [ ] Add `/docs` link (all roles, icon: BookOpen or similar)

---

## Sub-phase C: Custom MDX Components

### C1: mermaid-diagram.tsx
- [ ] Client component, lazy-load mermaid.js
- [ ] Spice palette theming for diagrams
- [ ] Props: `chart` (string), `title` (optional)

### C2: api-endpoint.tsx
- [ ] Props: method, path, description, auth roles
- [ ] Color-coded method badges (GET/POST/PUT/DELETE)
- [ ] Collapsible request/response examples

### C3: role-badge.tsx
- [ ] Props: role (admin/developer/qa/stakeholder)
- [ ] Uses role colors from design system CSS vars
- [ ] Renders as colored pill

### C4: callout.tsx
- [ ] Variants: info (Turmeric), warning (Chili), success (Coriander), note (Cinnamon)
- [ ] Props: variant, title, children

### C5: tech-stack-table.tsx
- [ ] Comparison: Flutter app | Laravel admin | Central Hub
- [ ] Sticky header, mobile scroll

### C6: architecture-diagram.tsx
- [ ] SVG viewer with click-to-zoom (Dialog/modal)
- [ ] Props: src, alt

### C7: Register MDX Components
- [ ] Create MDX components map
- [ ] All components available in MDX without explicit imports

---

## Sub-phase D: Verification

- [ ] `npm run build` — passes
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run lint` — zero errors
- [ ] `/docs` renders DocsLayout with spice palette
- [ ] `/docs/api/search` returns JSON
- [ ] Mermaid diagram renders in MDX page
- [ ] All custom components render without errors
- [ ] Dashboard sidebar shows "Docs" link
- [ ] Existing routes unaffected

---

## Errors Encountered

| Error | Attempt | Resolution |
|-------|---------|------------|
| — | — | — |

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
