---
project_name: 'CurryDash-Central-Hub'
user_name: 'Demi'
date: '2026-02-17'
sections_completed:
  ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 48
optimized_for_llm: true
---

# Project Context for AI Agents

_Critical rules and patterns for implementing code in CurryDash Central Hub. Focus on unobvious details that agents might otherwise miss. Read this file before implementing any code._

---

## Technology Stack & Versions

| Package | Version | Notes |
|---|---|---|
| Next.js | 15.x | App Router, Turbopack dev, ISR tag-based revalidation |
| TypeScript | strict mode | `@/*` path alias, Node.js 20+ |
| Supabase | current | Auth, PostgreSQL, Realtime, RLS — 4 client variants |
| Auth.js | v5 (beta) | `next-auth@beta` + `@auth/supabase-adapter` — pin after testing |
| Tailwind CSS | v4 | CSS variable theming, shadcn stone base overridden with spice palette |
| shadcn/ui | latest | `shadcn@latest` (renamed from shadcn-ui), Radix primitives |
| Zustand | 5.x | UI state only — never server data |
| CopilotKit | v1.51.3 | `CopilotSidebar`, `useCopilotReadable`, `useCopilotAction` |
| Mastra | v1.2.0 | AI agent backend in `src/mastra/`, MCP client |
| Vercel AI SDK | 5.0 | Streaming, tool calling, `@ai-sdk/anthropic` provider |
| jira.js | current | Jira REST API v3 client |
| Octokit | current | GitHub REST client + webhook verification |
| Zod | 3.x | Runtime validation at all data boundaries |
| Vitest | current | Unit/integration tests |
| Playwright | current | E2E tests in `e2e/` |
| Recharts | current | Dashboard charts via shadcn/ui chart wrapper |

---

## Critical Implementation Rules

### TypeScript Rules

- **Strict mode required** — no `any` types unless wrapping external untyped APIs
- **Import alias:** Always use `@/` prefix — `import { logger } from '@/lib/logger'`
- **DB vs TS naming:** Database columns are `snake_case`, TypeScript properties are `camelCase` — never mix within the same layer. Supabase client handles mapping via column selection.
- **Server Actions never throw** — always return `{ data: T, error: null }` or `{ data: null, error: { code: string, message: string } }`
- **Route Handlers:** Return `NextResponse.json({ data, error }, { status })` with appropriate HTTP codes
- **Error classes:** `AuthError`, `IntegrationError`, `ValidationError`, `RateLimitError` all extend base `AppError` in `src/lib/errors.ts`
- **Zod at boundaries:** Every Server Action, Route Handler, and webhook handler validates input with Zod before any Supabase write. Use `.passthrough()` for vendor webhook payloads.
- **Zod schema naming:** `camelCase` + `Schema` suffix — `jiraIssueSchema`, `webhookEventSchema`

### Next.js 15 + React Rules

- **`"use client"` at leaf nodes only** — never on pages, layouts, or wrapper components. Push client boundary as deep as possible.
- **Server Components for:** data fetching, auth checks (`auth()` helper), Supabase server client queries, passing data as props to Client Components
- **Client Components for:** Recharts, Supabase Realtime subscriptions, CopilotKit sidebar, Zustand consumers, interactive forms, animations
- **App Router pages are thin wrappers** — compose components from `src/modules/{feature}/components/`. No business logic in page files.
- **ISR revalidation:** Use `revalidateTag('issues')` triggered by webhook handlers — never `revalidatePath()`, never polling
- **Route groups:** `(auth)` for login/register (centered card layout), `(dashboard)` for all authenticated views (sidebar + header shell)
- **Edge Middleware** (`src/middleware.ts`): Auth check + RBAC route gating + Supabase cookie refresh. No DB calls in middleware — role comes from JWT claims.

### Supabase Rules

- **4 client variants — use the correct one:**
  - `src/lib/supabase/client.ts` — Browser client (Client Components)
  - `src/lib/supabase/server.ts` — Server Component client (read-only queries)
  - `src/lib/supabase/middleware.ts` — Middleware client (cookie refresh)
  - `src/lib/supabase/admin.ts` — Service role client (webhooks, cron jobs — bypasses RLS)
- **RLS policies use `auth.jwt()->>'role'`** — never bypass RLS from client code. Service role client only in webhook handlers and cron jobs.
- **Realtime subscriptions in Client Components only** — channels named `dashboard:{role}` for role-filtered broadcasts
- **Database naming:** Tables plural `snake_case` (`jira_issues`), FKs as `{table_singular}_id` (`user_id`), indexes as `idx_{table}_{columns}`, JSONB columns as `metadata` or descriptive (`raw_payload`)
- **Enums:** `snake_case` type and values — `user_role` type with `admin`, `developer`, `qa`, `stakeholder`

### Three-Layer RBAC (Enforced Everywhere)

1. **Edge Middleware** — route-level gating from JWT role claims
2. **Server Components** — `auth()` helper checks role before rendering/querying
3. **Supabase RLS** — row-level policies on every table using JWT role

All three layers must agree. Zustand `activeRole` is display preference only — JWT is authoritative.

### Webhook Pipeline Pattern (Jira + GitHub)

Every webhook follows this exact sequence:
```
POST → HMAC-SHA256 validate → Event ID dedup check → Zod parse →
Supabase upsert → revalidateTag() → Realtime broadcast → 200 OK
```
- Failed at any step → write to `dead_letter_events` with raw payload + error
- Correlation ID generated per event, flows through entire pipeline
- HMAC validation in `src/modules/webhooks/validation/hmac.ts`
- Dedup in `src/modules/webhooks/dedup.ts`

### AI Integration Rules

- **AI is an enhancement layer** — dashboard, navigation, data, charts all work independently of AI availability
- **CopilotKit frontend** in `src/modules/ai/` — **Mastra backend** in `src/mastra/`
- **Model routing:** Haiku for simple queries, Sonnet for reports + complex multi-tool queries
- **Token cap:** `maxTokens: 4000` on every AI SDK completion call
- **MCP precedence:** Try live query (5s timeout) → fall back to Supabase cache → include source in citation
- **Tool errors:** Mastra tools return `{ data, error }` pattern. On failure, agent says "I couldn't retrieve that data" — never crashes.
- **AI unavailable:** Show `<AiStatus />` indicator, never crash the dashboard

### Dashboard Widget Rules

- **Every widget wrapped in `<ErrorBoundary fallback={<WidgetError />}>`** — one widget failure never crashes others
- **Loading:** Use `<WidgetSkeleton variant="chart|table|stats|list" />` — no custom spinners, no full-page loaders
- **Staleness:** `Date.now() - widget.updated_at` — amber badge >10min, red badge >30min
- **Config-driven:** Widget registry in `src/modules/dashboard/config/widget-registry.ts` maps `role → widget[]`
- **Grid layout:** 3-column CSS Grid (desktop 1280px+), 2-column (tablet 768px+)

### Testing Rules

- **Co-locate unit tests** next to source: `jira-client.test.ts` beside `jira-client.ts`
- **E2E tests** in top-level `e2e/` directory: `e2e/auth.spec.ts`, `e2e/dashboard.spec.ts`
- **Mocks** in `src/test-utils/mocks/` — Supabase, Jira, GitHub client mocks
- **Factories** in `src/test-utils/factories/` — user, issue, webhook event factories
- **Custom render** in `src/test-utils/render.tsx` — wraps with all required providers

### Code Quality & Naming

- **Files:** `kebab-case` — `issue-card.tsx`, `use-realtime.ts`, `jira-client.ts`
- **Components:** `PascalCase` — `IssueCard`, `DashboardGrid`, `WidgetSkeleton`
- **Functions/hooks:** `camelCase` — `getIssues()`, `useRealtimeUpdates()`, `validateWebhook()`
- **Constants:** `UPPER_SNAKE_CASE` — `MAX_JIRA_CALLS_PER_MINUTE`, `JWT_EXPIRY_HOURS`
- **Types/interfaces:** `PascalCase` — `JiraIssue`, `WebhookEvent`, `DashboardWidget`
- **Zustand stores:** `use{Feature}Store` — `useDashboardStore`, `useFilterStore`
- **Server Actions:** `{verb}{Resource}` — `createIssue()`, `updateWidget()`, `deleteNotification()`
- **API routes:** `/api/{resource}/{action}` — `/api/webhooks/jira`, `/api/ai/copilotkit`
- **Event names:** `{resource}.{action}` — `issue.created`, `sprint.updated`, `webhook.failed`

### Structured Logging

```typescript
log.info({
  message: "Webhook processed",
  correlationId: "wh_abc123",
  source: "webhook:jira",  // webhook:jira | webhook:github | auth | ai | realtime | admin
  data: { eventType: "issue.updated", issueKey: "CD-42" }
})
```
- Correlation ID required in all webhook processing logs
- Levels: `debug` (dev), `info` (ops), `warn` (degraded), `error` (failures)

### Spice Palette Theming

Override shadcn/ui CSS variables in `src/app/globals.css`:
- **Turmeric** (#E6B04B) — Primary accent, QA role
- **Chili** (#C5351F) — Danger states, Admin role
- **Coriander** (#4A7C59) — Success states, Developer role
- **Cinnamon** (#5D4037) — Secondary, Stakeholder role
- **Cream** (#FFF8DC) — Background

Role-specific colors applied via `data-role` attribute on `<body>`. Zero runtime cost.

---

## Critical Anti-Patterns

- **NEVER** read Jira/GitHub APIs on page load — always from Supabase cache
- **NEVER** return raw Supabase errors to client — map to typed `AppError`
- **NEVER** store server data in Zustand — use Server Components + ISR + Realtime
- **NEVER** skip HMAC validation on webhook endpoints
- **NEVER** put AI features in the critical dashboard rendering path
- **NEVER** create `utils.ts` or `helpers.ts` catch-all files — use descriptive names in `src/lib/`
- **NEVER** mix `snake_case` and `camelCase` in the same layer
- **NEVER** put `"use client"` on components that don't need interactivity
- **NEVER** use custom loading spinners — use `<WidgetSkeleton />`
- **NEVER** put business logic in Zustand stores — stores hold UI state only

---

## Project Structure (Key Directories)

```
src/
├── app/              # Thin route wrappers (App Router)
├── components/ui/    # shadcn/ui auto-generated
├── components/shared/# App-wide shared (WidgetSkeleton, WidgetError, RoleGate)
├── modules/          # Feature modules by domain capability
│   ├── auth/         # FR1-FR9
│   ├── dashboard/    # FR10-FR19
│   ├── jira/         # FR20-FR25
│   ├── github/       # FR26-FR29
│   ├── ai/           # FR30-FR37 (frontend)
│   ├── reports/      # FR38-FR44
│   ├── webhooks/     # FR45-FR50
│   └── admin/        # FR51-FR56
├── mastra/           # AI agent backend (agents/, tools/)
├── lib/              # Shared utils (supabase/, clients/, schemas/, errors.ts, logger.ts)
├── stores/           # Zustand stores (UI state only)
├── types/            # Cross-module shared types (database.ts, api.ts, roles.ts)
├── middleware.ts     # Edge Middleware: auth + RBAC + cookie refresh
└── test-utils/       # Mocks, factories, custom render
supabase/             # Migrations, seed, config (top-level)
e2e/                  # Playwright E2E tests (top-level)
```

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Reference `_bmad-output/planning-artifacts/architecture.md` for full architectural context

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-02-17
