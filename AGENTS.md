# AGENTS.md — Operational Knowledge (keep under 60 lines)

## Build & Validate Commands
- Test: `npx vitest run`
- Typecheck: `npx tsc --noEmit`
- Lint: `npm run lint`
- Build: `npm run build`
- Single test: `npx vitest run path/to/file.test.ts`

## Installed Versions (differ from planned)
- Mastra: v0.10.15 (planned v1.2.0)
- Vercel AI SDK: v4.3.19 (planned v5.0)
- CopilotKit: v1.51.4 (planned v1.51.3)
- Auth.js: v5.0.0-beta.30

## Discovered Patterns
- Tailwind v4: use `@import "tailwindcss"` + `@theme {}` in globals.css
- No tailwind.config.ts — CSS-based config via @tailwindcss/postcss
- @radix-ui/react-badge does NOT exist — badge via shadcn/ui only
- Vitest config `__dirname` works because build resolves it

## Supabase Client Variants (use correct one!)
- `src/lib/supabase/client.ts` — Browser (Client Components)
- `src/lib/supabase/server.ts` — Server Components (read-only)
- `src/lib/supabase/middleware.ts` — Edge Middleware (cookie refresh)
- `src/lib/supabase/admin.ts` — Service role (webhooks, cron — bypasses RLS)

## Critical Rules
- Server Actions: return `{ data, error }` — NEVER throw
- Webhooks: use admin.ts (service role, bypasses RLS)
- CSS: custom properties from globals.css only — NEVER hardcoded hex
- `"use client"` at leaf nodes ONLY — never pages/layouts
- Widgets: wrap in `<ErrorBoundary>`, use `<WidgetSkeleton>` for loading
- ISR: `revalidateTag()` — NEVER `revalidatePath()` or polling

## File Conventions
- Components: `src/modules/{feature}/components/`
- Tests: co-located (e.g., `jira-client.test.ts` beside `jira-client.ts`)
- E2E: `e2e/` directory
- Schemas: `src/lib/schemas/`
