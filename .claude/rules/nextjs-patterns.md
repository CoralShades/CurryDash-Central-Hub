# Next.js 15 + React Patterns

## Server vs Client Components
- `"use client"` at leaf nodes only — never on pages, layouts, or wrapper components
- **Server Components for:** data fetching, auth checks (`auth()` helper), Supabase server queries, passing data as props
- **Client Components for:** Recharts, Supabase Realtime, CopilotKit sidebar, Zustand consumers, interactive forms
- App Router pages are thin wrappers — compose from `src/modules/{feature}/components/`

## ISR & Revalidation
- Use `revalidateTag('issues')` triggered by webhook handlers
- Never `revalidatePath()`, never polling

## Route Groups
- `(auth)` for login/register (centered card layout)
- `(dashboard)` for all authenticated views (sidebar + header shell)

## Edge Middleware (`src/middleware.ts`)
- Auth check + RBAC route gating + Supabase cookie refresh
- No DB calls in middleware — role comes from JWT claims

## Project Structure
```
src/app/              # Thin route wrappers (App Router)
src/components/ui/    # shadcn/ui auto-generated
src/components/shared/# App-wide shared (WidgetSkeleton, WidgetError, RoleGate)
src/modules/          # Feature modules by domain capability
src/mastra/           # AI agent backend (agents/, tools/)
src/lib/              # Shared utils (supabase/, clients/, schemas/, errors.ts)
src/stores/           # Zustand stores (UI state only)
src/types/            # Cross-module shared types
e2e/                  # Playwright E2E tests (top-level)
```
