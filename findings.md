# Findings — Phase 1: Next.js 16 + Fumadocs

**Session:** 2026-02-20
**Task:** Fumadocs documentation site integration

---

## Package Versions (Confirmed 2026-02-20)

| Package | Version | Notes |
|---------|---------|-------|
| fumadocs-core | ~16.6.2 | Latest stable |
| fumadocs-ui | ~16.6.3 | Last published 2026-02-17 |
| fumadocs-mdx | ~14.2.7 | Turbopack-compatible via source.config.ts |
| Next.js (current) | 15.5.12 | package.json says ^15.0.0 |
| Next.js (target) | 16.x | Oct 21, 2025 release |
| Node.js (WSL) | v18.19.1 | MUST upgrade to ≥20.9 |
| Tailwind CSS | 4.1.18 | @tailwindcss/postcss, no tailwind.config.js |

---

## Next.js 16 Breaking Changes (This Codebase)

### 1. middleware.ts → proxy.ts
- `proxy.ts` runs on **Node.js runtime** (not Edge)
- Edge runtime: keep `middleware.ts` (both still work in Next.js 16)
- User decision: use proxy.ts (Node.js runtime)
- Current middleware: Auth.js v5 `auth()` + Supabase cookie refresh
- Auth.js v5 supports Node.js runtime ✅

### 2. revalidateTag() — 7 call sites
- Old: `revalidateTag('tag')`
- New: `revalidateTag('tag', 'max')` (or use `updateTag()` for Server Actions)
- Call sites:
  - `src/app/api/webhooks/github/route.ts` — lines ~325, ~327
  - `src/app/api/webhooks/jira/route.ts` — line ~386
  - `src/modules/admin/actions/retry-dead-letter.ts` — lines ~465, ~466
  - `src/modules/admin/actions/sync-integration.ts` — lines ~192, ~368
  - `src/modules/dashboard/actions/manage-widgets.ts` — line ~48
- Test mocks: update vi.mock signatures in manage-widgets.test.ts + ai-widget-card.test.ts

### 3. Async params — enforced in v16
- Official codemod handles automatically

### 4. Node.js 20.9+ required
- Current WSL: v18.19.1 → upgrade via nvm

---

## Fumadocs Technical Findings

### fumadocs-mdx + Turbopack
- ✅ Supported via source.config.ts architecture (v10+)
- Functions defined in source.config.ts, bundled by esbuild
- createMDX() configures BOTH webpack + Turbopack loaders

### fumadocs-ui + Tailwind v4
- ✅ v15+ is CSS-import only, Tailwind v4 required
- Import pattern for globals.css:
  ```css
  @import 'fumadocs-ui/css/neutral.css';
  @import 'fumadocs-ui/css/preset.css';
  @source '../node_modules/fumadocs-ui/dist/**/*.js';
  ```
- Variable namespace: `--color-fd-*` (no conflict with project vars)

### CSS Variable Mapping (Spice Palette → fd vars)
```css
@theme {
  --color-fd-primary: #E6B04B;    /* Turmeric Gold */
  --color-fd-background: #FFF8DC; /* Cream */
  --color-fd-foreground: #5D4037; /* Cinnamon */
  --color-fd-accent: #4A7C59;     /* Coriander Green */
}
```

### next.config.ts vs .mjs
- Next.js 15+ supports .ts natively — keep .ts
- Fallback: rename to next.config.mjs if incompatible

---

## Existing Codebase State

### docs/ Folder (archive plan)
- guide-*.md → docs/_archive/ (obsolete, recreate as MDX in Phase 2)
- jira/ → docs/_archive/jira/
- prd.md → KEEP in docs/ (3304-line consolidated PRD, source for Phase 2)

### Sidebar Nav Component
- Need to locate dashboard sidebar component for adding /docs link

---

## Sudo Password
- WSL sudo: demi1234
