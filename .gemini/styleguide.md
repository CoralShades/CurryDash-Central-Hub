# CurryDash Code Review Style Guide

## TypeScript Standards
- Strict mode required — no `any` types unless wrapping untyped external APIs
- All imports use `@/` path alias
- Database columns `snake_case`, TypeScript properties `camelCase` — never mix within same layer
- Zod schemas named `camelCase` + `Schema` suffix

## Component Boundaries
- `"use client"` only at leaf nodes — never on pages, layouts, or wrappers
- Server Components for data fetching, auth checks, Supabase queries
- Client Components for charts, realtime, interactive forms, Zustand consumers

## CSS & Design Tokens
- No hardcoded hex colors — use spice-themed CSS custom properties
- Tailwind v4 with CSS variable theming
- shadcn/ui stone base overridden with spice palette
- Role colors via `data-role` attribute on `<body>`

## Data Patterns
- Server Actions return `{ data: T, error: null } | { data: null, error: { code, message } }`
- Route Handlers return `NextResponse.json({ data, error }, { status })`
- ISR via `revalidateTag()` — never `revalidatePath()`, never polling
- Supabase RLS on every table — service role only in webhooks/cron

## Error Handling
- Error classes extend base `AppError` in `src/lib/errors.ts`
- Never return raw Supabase errors to client
- Webhook failures → `dead_letter_events` table
- AI unavailability → graceful degradation, never crashes

## Naming Conventions
- Files: `kebab-case` (e.g., `issue-card.tsx`)
- Components: `PascalCase` (e.g., `IssueCard`)
- Functions/hooks: `camelCase` (e.g., `getIssues()`)
- Constants: `UPPER_SNAKE_CASE`
- Zustand stores: `use{Feature}Store`
- Server Actions: `{verb}{Resource}`
