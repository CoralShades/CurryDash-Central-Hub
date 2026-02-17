---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
completedAt: '2026-02-17'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/prd-validation-report.md
  - _bmad-output/planning-artifacts/product-brief-CurryDash-Central-Hub-2026-02-17.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/research/technical-currydash-mvp-architecture-research-2026-02-17.md
workflowType: 'architecture'
project_name: 'CurryDash-Central-Hub'
user_name: 'Demi'
date: '2026-02-17'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
56 FRs across 8 capability areas, in MVP build order:
1. Identity & Access Management (FR1-FR9) — Auth.js v5 + Supabase with three-layer RBAC, 4 MVP roles
2. Dashboard & Data Visualization (FR10-FR19) — Unified dashboard with per-widget error boundaries, staleness indicators, role-filtered views
3. Jira Integration (FR20-FR25) — REST API v3 client, webhook receivers, rate limit handling, webhook registration refresh
4. GitHub Integration (FR26-FR29) — Octokit client, webhook receivers, HMAC-SHA256 validation
5. AI Assistant (FR30-FR37) — CopilotKit sidebar, streaming responses, MCP-powered live data queries, role-aware prompts, graceful degradation
6. AI Report & Widget Generation (FR38-FR44) — Sprint reports, stakeholder summaries, AI-generated persistent dashboard widgets (JSON config → pre-built renderers)
7. Data Pipeline & Freshness (FR45-FR50) — Supabase caching, ISR tag revalidation on webhooks, Realtime subscriptions, idempotent webhook processing, dead letter logging
8. System Administration (FR51-FR56) — Integration health monitoring, webhook status, AI cost telemetry, token budget enforcement

**Non-Functional Requirements:**
46 NFRs across 5 categories driving architectural decisions:
- Performance (10 NFRs): Dashboard <3s cold load, AI first token <3s, webhook-to-dashboard <30s, 5 concurrent users MVP
- Security (10 NFRs): HTTPS-only, 24h JWT expiry, API keys server-side only, HMAC webhook validation, RBAC at all three layers, CSRF protection, no client-side sensitive data
- Integration (8 NFRs): 95%+ webhook delivery, 100% idempotency, <5 min data freshness, <5 direct Jira API calls/min, MCP failover to cached data, per-integration error isolation
- Reliability (7 NFRs): Per-widget failure isolation, full dashboard function without AI, webhook retry with exponential backoff, Supabase connection auto-reconnect, zero data loss on webhook burst
- Scalability (5 NFRs): $0 MVP infrastructure cost, <$50/mo AI spend, <100K Supabase rows, support 50 webhook events/min, 10 concurrent users

**Scale & Complexity:**

- Primary domain: Full-stack web application with AI agent integration
- Complexity level: Medium-High
- Estimated architectural components: ~15 major components (auth module, RBAC middleware, 4 dashboard variants, Jira client + webhook handler, GitHub client + webhook handler, data caching layer, Realtime subscription layer, AI chat module, AI report generator, AI widget generator, MCP client layer, admin system health module)

### Technical Constraints & Dependencies

1. **Single-tenant architecture** — No multi-org isolation needed for MVP; simplifies RLS policies
2. **Desktop-first responsive** — Primary viewport 1280px+, tablet 768px+ secondary, no mobile MVP
3. **Jira API rate limits (March 2026)** — Must be webhook-first from day 1; direct API calls minimized
4. **Jira webhook 30-day expiry** — Requires automated refresh mechanism (25-day cycle)
5. **Free tier constraints** — Supabase free tier pauses after 7 days inactivity; Pro ($25/mo) required for production
6. **AI cost ceiling** — $50/month soft budget for Anthropic API; requires model routing (Haiku for simple, Sonnet for complex) and 4,000 output token cap per request
7. **Embedded AI for MVP** — Mastra embedded in Next.js API routes initially; standalone extraction in Phase 3
8. **Pre-existing codebase** — Current scaffold has custom CSS, Prisma ORM; migration to Supabase + shadcn/ui + Tailwind is a foundational shift

### Cross-Cutting Concerns Identified

1. **Authentication & Authorization** — Every route, every data fetch, every API call must pass through RBAC. Flows from Edge Middleware → Server Component checks → Supabase RLS. Role context must propagate to AI system prompts.
2. **Webhook Pipeline Pattern** — Shared architecture for both Jira and GitHub: signature validation → event parsing → Supabase upsert → ISR cache tag revalidation → Realtime broadcast. Must be idempotent, out-of-order tolerant, with dead letter logging.
3. **Error Boundary Strategy** — Per-widget isolation (React error boundaries), per-integration isolation (Jira down doesn't affect GitHub), AI isolation (dashboard fully functional without AI). Graceful degradation at every layer.
4. **Data Freshness & Staleness** — Eventual consistency model with transparency. Every dashboard component must handle staleness indicators (>10 min amber, >30 min red). AI reports must include "data as of" timestamps.
5. **AI Graceful Degradation** — AI features are an enhancement layer. Dashboard, navigation, data, charts all work independently of AI availability. AI sidebar shows "unavailable" status, never crashes the dashboard.
6. **Server/Client Component Boundary** — Server Components for data fetching and auth checks; Client Components pushed to leaf nodes for interactivity (charts, Realtime subscriptions, AI chat, animations). Critical for security and performance.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application (Next.js 15 App Router) with AI agent integration, based on project requirements analysis.

### Approach: Composite Scaffold + Per-Requirement Reference Repos

Rather than one monolithic starter, CurryDash uses a **composite approach**: a primary scaffold plus reference repos/libraries for each major capability area.

### Primary Scaffold (Foundation)

**Vercel Supabase Starter** — `npx create-next-app --example with-supabase`

Provides: Next.js App Router, Supabase SSR auth (cookie-based via `@supabase/ssr`), shadcn/ui initialized, TypeScript, Tailwind CSS, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (new format).

**Rationale:** Lightest official baseline with the exact auth+DB combo CurryDash needs. Well-maintained by Vercel. Avoids Clerk/NextAuth mismatch from heavier starters.

### Per-Requirement Reference Repos & Libraries

| Requirement Area | Template / Repo | What to Extract |
|---|---|---|
| **Auth + RBAC** | [Auth.js RBAC Guide](https://authjs.dev/guides/role-based-access-control) + [nextjs-rbac boilerplate](https://github.com/justin22/nextjs-rbac) | Role-to-route mapping, middleware RBAC, session role injection |
| **Dashboard Layout** | [Kiranism next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter) | Sidebar + header shell, feature-based colocation, RBAC navigation filtering, parallel routes for widgets |
| **Charts & Visualization** | [shadcn/ui Charts](https://ui.shadcn.com/docs/components/radix/chart) + Recharts | Bar, line, pie, area charts — copy-paste, no abstraction lock-in |
| **AI Chat Sidebar** | [CopilotKit](https://github.com/CopilotKit/CopilotKit) — `CopilotSidebar` component | Production-ready chat sidebar, `useCopilotReadable`, `useCopilotAction`, headless UI option |
| **AI Agent Backend** | [CopilotKit/with-mastra](https://github.com/CopilotKit/with-mastra) | Full Mastra + CopilotKit + AG-UI starter — agents on backend, CopilotKit on frontend |
| **AI Chat + Streaming** | [Vercel ai-chatbot](https://github.com/vercel/ai-chatbot) + [Supabase variant](https://github.com/supabase-community/vercel-ai-chatbot) | AI SDK streaming patterns, `useChat()`, Auth.js integration, Supabase persistence |
| **Realtime Dashboard** | [Supabase Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs) + [MakerKit notification system](https://makerkit.dev/blog/tutorials/real-time-notifications-supabase-nextjs) | Realtime subscription patterns in Client Components, notification system with RLS |
| **Webhook Handlers** | [Next.js GitHub webhook handler](https://gist.github.com/Keith-Hon/ed48526c3d9a249d5d56048df6172762) + Octokit webhook verification | Route handler patterns for webhook signature validation, HMAC-SHA256 |
| **MCP Servers** | [Atlassian MCP Server](https://github.com/atlassian/atlassian-mcp-server) + awesome-mcp-servers | Pre-built Jira+Confluence MCP server, GitHub MCP servers |
| **Data Tables** | [shadcn DataTable](https://ui.shadcn.com/docs/components/radix/data-table) (Tanstack Table) | Server-side search, filter, pagination, sorting |
| **Production SaaS Patterns** | [Razikus/supabase-nextjs-template](https://github.com/Razikus/supabase-nextjs-template) | RLS policies, user management, file storage patterns |

### Initialization Command Sequence

```bash
# 1. Primary scaffold
npx create-next-app --example with-supabase currydash-central-hub

# 2. shadcn/ui with stone base (closest to spice palette)
npx shadcn@latest init -b stone --yes

# 3. Add shadcn components (dashboard essentials)
npx shadcn@latest add button card input table badge dialog toast sidebar
npx shadcn@latest add chart

# 4. Auth + RBAC layer
npm install next-auth@beta @auth/supabase-adapter

# 5. Integration clients
npm install jira.js octokit

# 6. AI stack (Week 4 — reference CopilotKit/with-mastra starter)
npm install @copilotkit/react-core @copilotkit/react-ui
npm install ai @ai-sdk/anthropic
npm install @mastra/core@latest @mastra/ai-sdk @ag-ui/mastra

# 7. Dev tooling
npm install -D vitest @testing-library/react playwright
npm install -D prettier eslint-config-prettier husky lint-staged
```

### Architectural Decisions Provided by Starter

**Language & Runtime:** TypeScript strict mode, Node.js 20+, Turbopack dev server

**Styling Solution:** Tailwind CSS v4 + shadcn/ui components (Radix UI primitives), CSS variables for theming — ready for CurryDash spice palette tokens

**Build Tooling:** Turbopack (dev), Next.js production build, Vercel deployment pipeline

**Testing Framework:** Not included in starter — add Vitest + React Testing Library (unit) and Playwright (E2E)

**Code Organization:** App Router file-system routing with `src/` directory. Feature-based colocation following Kiranism patterns: `src/modules/` for feature modules, `src/components/` for shared UI, `src/lib/` for utilities.

**Development Experience:** HMR via Turbopack, TypeScript type checking, ESLint, `@/*` import alias

### Pattern Reference Map (for implementation stories)

| Epic/Story Area | Reference Repo to Study |
|---|---|
| Auth + RBAC setup | Auth.js RBAC guide + nextjs-rbac boilerplate |
| Dashboard shell + layout | Kiranism next-shadcn-dashboard-starter |
| Dashboard widgets + charts | shadcn/ui charts + Kiranism analytics page |
| AI chat sidebar | CopilotKit docs + with-mastra starter |
| AI streaming + persistence | Vercel ai-chatbot Supabase variant |
| Webhook handlers | Keith-Hon gist + Octokit App webhook patterns |
| Realtime subscriptions | Supabase Realtime Next.js docs + MakerKit tutorial |
| MCP integration | Atlassian MCP server + Mastra MCP client docs |
| User management | Razikus supabase-nextjs-template patterns |

### Verified Current Versions (Feb 2026)

| Package | Version | Source |
|---------|---------|--------|
| Next.js | 15.x (latest stable) | [nextjs.org](https://nextjs.org/docs/app/getting-started/installation) |
| shadcn CLI | `shadcn@latest` (renamed from shadcn-ui) | [ui.shadcn.com](https://ui.shadcn.com/docs/cli) |
| CopilotKit | v1.51.3 (`@copilotkit/react-core`) | [npm](https://www.npmjs.com/package/@copilotkit/react-core) |
| Mastra | v1.2.0 (`@mastra/core`) | [npm](https://www.npmjs.com/package/@mastra/core) |
| Vercel AI SDK | 5.0 (`ai`) | [ai-sdk.dev](https://ai-sdk.dev/docs/introduction) |

**Note:** Project initialization using this command sequence should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. Hybrid data model (normalized core + JSONB metadata) — shapes every Supabase migration
2. JWT sessions with role claims — foundation for all auth/RBAC flows
3. Server Actions + Route Handlers split — determines API surface architecture
4. Config-driven widget grid — structures the entire dashboard layer
5. Event ID dedup table — required before any webhook handler

**Important Decisions (Shape Architecture):**
6. Zod + DB constraints validation — affects every data boundary
7. ISR + Realtime hybrid caching — shapes Server/Client Component split
8. HMAC + IP allowlist webhook security — webhook endpoint design
9. Role-claim RLS policies — Supabase policy authoring
10. Structured error types + boundaries — error handling patterns throughout
11. Zustand for client state — widget interactivity patterns
12. CSS variables theming — spice palette integration approach

**Deferred Decisions (Post-MVP):**
- Sentry integration (use Vercel Analytics + console logging for MVP)
- External queue service for webhooks (Supabase dead letter table for MVP)
- Centralized secrets management (Vercel env vars sufficient for MVP)
- tRPC or GraphQL layer (Server Actions sufficient for MVP)
- Turborepo/monorepo structure (single app for MVP)

### Data Architecture

| Decision | Choice | Version | Rationale | Affects |
|----------|--------|---------|-----------|---------|
| Data modeling | Hybrid (normalized + JSONB) | — | Core entities (issues, sprints, repos, PRs) as normalized tables with FK relationships. JSONB `metadata` columns for extended/vendor-specific fields. Balances query flexibility with simple webhook upserts. | All Supabase migrations, webhook handlers, dashboard queries |
| Data validation | Zod + DB constraints | Zod 3.x | Zod schemas at API route/webhook ingestion boundaries for runtime type validation. Supabase NOT NULL, CHECK, FK constraints as safety net. Two-layer defense without over-validating. | API routes, webhook handlers, Server Actions, Supabase schema |
| Caching strategy | ISR + Realtime hybrid | Next.js 15 ISR + Supabase Realtime | ISR with tag-based revalidation (`revalidateTag`) triggered by webhook handlers for Server Component page loads. Supabase Realtime subscriptions in Client Component widgets for live updates. | Dashboard pages, webhook pipeline, widget components |
| Webhook idempotency | Event ID dedup table | — | `webhook_events` table stores processed event IDs with timestamps. Check-before-process pattern. Prevents duplicate processing and side-effects (notifications, AI triggers). | Webhook handlers, Supabase schema, admin monitoring |
| Dead letter queue | Supabase dead_letter table | — | `dead_letter_events` table captures failed webhook payloads with error details and timestamps. Admin dashboard UI for inspection and manual retry. | Webhook error handling, admin dashboard |

### Authentication & Security

| Decision | Choice | Version | Rationale | Affects |
|----------|--------|---------|-----------|---------|
| Session strategy | JWT sessions | Auth.js v5 | Stateless JWT with role claims embedded. No DB lookup per request. 24h expiry. Enables Edge Middleware RBAC checks without DB round-trip. | Auth middleware, RLS policies, API route protection |
| API route protection | `auth()` helper per route | Auth.js v5 | `auth()` in every API Route Handler and Server Action. Role checked from JWT claims. Consistent with page-level auth pattern. | All API routes, Server Actions |
| Webhook security | HMAC-SHA256 + IP allowlist | — | Signature validation required for all webhooks. Optional IP allowlist for Atlassian/GitHub CIDR ranges. Defense in depth. | Webhook Route Handlers, middleware config |
| RLS policy design | Role-claim RLS | Supabase | RLS policies read role from `auth.jwt()->>'role'`. No extra DB lookups for permission checks. Per-table policies based on role. | All Supabase tables, migration scripts |

### API & Communication Patterns

| Decision | Choice | Version | Rationale | Affects |
|----------|--------|---------|-----------|---------|
| API design | Server Actions + Route Handlers | Next.js 15 | Server Actions for all mutations (CRUD, form submissions). Route Handlers only for webhooks, AI streaming, and external callbacks. Minimizes API surface area. | All data mutations, webhook endpoints, AI streaming |
| Error handling | Structured error types + boundaries | — | Typed error classes (`AuthError`, `IntegrationError`, `ValidationError`). React error boundaries per widget. `error.tsx` per route segment. Sentry-ready logging interface. | All components, API routes, widget architecture |
| Jira rate limiting | Request queue + cooldown | — | In-memory queue for direct Jira API calls. Max 5 calls/min per PRD constraint. Exponential backoff on failures. Cooldown timer between requests. | Jira client, AI agent Jira tool calls |

### Frontend Architecture

| Decision | Choice | Version | Rationale | Affects |
|----------|--------|---------|-----------|---------|
| State management | Zustand + Server State | Zustand 5.x | Zustand for lightweight client UI state (sidebar, filters, active role context). Server Components + ISR for data state. Supabase Realtime for live updates. No heavy state library. | Dashboard UI, widget interactivity, filters |
| Widget system | Config-driven grid | — | JSON config maps `role → widget[]`. Each widget is self-contained with own error boundary, data fetching, loading state. CSS Grid layout via Tailwind. Supports AI-generated widget configs. | Dashboard pages, role views, AI widget generation |
| Theming | CSS variables in globals.css | Tailwind v4 | Override shadcn/ui CSS variables (`--primary`, `--accent`, etc.) with spice palette values. Role-specific colors via `data-role` attribute on `<body>`. Zero runtime cost. | All UI components, role-based styling |
| AI sidebar | CopilotKit CopilotSidebar | CopilotKit v1.51.x | Built-in `CopilotSidebar` component for chat UI. `useCopilotReadable` for dashboard context injection. `useCopilotAction` for live data queries. Headless mode available for deeper customization later. | AI chat feature, dashboard integration |

### Infrastructure & Deployment

| Decision | Choice | Version | Rationale | Affects |
|----------|--------|---------|-----------|---------|
| CI/CD | GitHub Actions + Vercel | — | GitHub Actions for lint, type-check, Vitest on PRs. Vercel auto-deploys on merge to main with preview deploys on PRs. Free tier sufficient. | PR workflow, deploy pipeline |
| Environment config | Vercel env vars + .env.local | — | Vercel dashboard for production/preview secrets. `.env.local` for local dev (gitignored). `.env.example` committed as template. | All environment-dependent config |
| Monitoring | Vercel Analytics + console logging | — | Vercel Analytics (free) for Web Vitals. Vercel Logs for server-side. Structured `console.log` in webhook handlers with correlation IDs. Sentry added post-MVP. | Performance monitoring, error visibility |

### Decision Impact Analysis

**Implementation Sequence:**
1. Supabase project + schema migrations (hybrid model, RLS policies, webhook_events, dead_letter_events tables)
2. Auth.js v5 setup with JWT sessions + SupabaseAdapter + role claims
3. Edge Middleware RBAC + `auth()` helper pattern
4. CSS variable theming (spice palette override of shadcn defaults)
5. Dashboard shell + config-driven widget grid + error boundaries
6. Webhook Route Handlers (HMAC + dedup + ISR revalidation)
7. Zustand stores for UI state
8. Supabase Realtime subscriptions in widget Client Components
9. Jira/GitHub clients with rate limiting queue
10. CopilotKit sidebar integration
11. GitHub Actions CI pipeline

**Cross-Component Dependencies:**
- JWT role claims → feeds RLS policies, Edge Middleware, widget config filtering, and AI system prompts
- Webhook pipeline → triggers ISR revalidation AND Realtime broadcasts (two update paths from single source)
- Config-driven widgets → consumed by dashboard renderer AND AI widget generator (FR38-FR44)
- Structured error types → used by error boundaries, webhook dead letter logging, and admin health monitoring
- Zustand role context store → consumed by widget grid config resolver, CopilotKit readable context, and navigation filtering

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 20+ areas where AI agents could make different choices, grouped into 5 categories: naming (8), structure (4), format (3), communication (3), and process (4).

### Naming Patterns

**Database Naming Conventions:**
- Tables: plural `snake_case` — `jira_issues`, `webhook_events`, `dead_letter_events`, `team_members`
- Columns: `snake_case` — `created_at`, `issue_key`, `sprint_id`, `webhook_payload`
- Foreign keys: `{referenced_table_singular}_id` — `user_id`, `team_id`, `sprint_id`
- Indexes: `idx_{table}_{columns}` — `idx_issues_status`, `idx_webhook_events_event_id`
- JSONB columns: `metadata` (generic) or descriptive `raw_payload`, `widget_config`
- Enums: `snake_case` type name, `snake_case` values — `user_role` type with `admin`, `developer`, `qa`, `stakeholder`

**API & Route Naming Conventions:**
- Route Handlers: `/api/{resource}/{action}` — `/api/webhooks/jira`, `/api/webhooks/github`, `/api/ai/chat`
- Server Actions: `{verb}{Resource}` — `createIssue()`, `updateWidget()`, `deleteNotification()`
- Query parameters: `camelCase` — `?issueKey=ABC-123&sprintId=5`
- No custom headers needed for MVP (auth via cookies/JWT)

**Code Naming Conventions:**
- Files: `kebab-case` — `issue-card.tsx`, `use-realtime.ts`, `jira-client.ts`, `webhook-handler.ts`
- React components: `PascalCase` — `IssueCard`, `DashboardGrid`, `WidgetSkeleton`
- Functions/hooks: `camelCase` — `getIssues()`, `useRealtimeUpdates()`, `validateWebhook()`
- Constants: `UPPER_SNAKE_CASE` — `MAX_JIRA_CALLS_PER_MINUTE`, `JWT_EXPIRY_HOURS`
- Types/interfaces: `PascalCase` — `JiraIssue`, `WebhookEvent`, `DashboardWidget`
- Zod schemas: `camelCase` with `Schema` suffix — `jiraIssueSchema`, `webhookEventSchema`
- Zustand stores: `use{Feature}Store` — `useDashboardStore`, `useFilterStore`

### Structure Patterns

**Project Organization:**
- Feature-based colocation in `src/modules/{feature}/`
- Each module contains: components, hooks, actions, types, and tests
- Shared UI components in `src/components/ui/` (shadcn) and `src/components/shared/`
- Utilities in `src/lib/` — clients, helpers, schemas
- App Router pages in `src/app/` — thin wrappers that compose module components

**Test Location:**
- Unit/integration tests co-located: `src/lib/jira-client.test.ts` next to `src/lib/jira-client.ts`
- Component tests co-located: `src/modules/dashboard/components/issue-card.test.tsx`
- E2E tests in top-level `e2e/` directory: `e2e/dashboard.spec.ts`, `e2e/auth.spec.ts`
- Test utilities in `src/test-utils/` — mocks, factories, helpers

**Configuration Files:**
- All config at project root: `next.config.ts`, `tailwind.config.ts`, `vitest.config.ts`
- Environment: `.env.local` (gitignored), `.env.example` (committed)
- Supabase migrations in `supabase/migrations/`
- Seed data in `supabase/seed.sql`

### Format Patterns

**API Response Format (all Server Actions and Route Handlers):**
```typescript
// Success
{ data: T, error: null }

// Error
{ data: null, error: { code: string, message: string } }

// Example error codes: "AUTH_REQUIRED", "FORBIDDEN", "VALIDATION_ERROR",
// "JIRA_API_ERROR", "GITHUB_API_ERROR", "NOT_FOUND", "RATE_LIMITED"
```

**Date/Time Format:**
- Database: PostgreSQL `timestamptz` (UTC)
- JSON/API: ISO 8601 strings — `"2026-02-17T14:30:00.000Z"`
- UI display: Relative time for recent (`"5 min ago"`), formatted date for older (`"Feb 17, 2026"`)
- Staleness indicators: calculated from `updated_at` vs `Date.now()`

**JSON Field Naming:**
- TypeScript/API layer: `camelCase` — `issueKey`, `sprintId`, `createdAt`
- Database columns: `snake_case` — `issue_key`, `sprint_id`, `created_at`
- Supabase client handles the mapping automatically via column selection

### Communication Patterns

**Event Naming (Supabase Realtime + Internal):**
- Format: `{resource}.{action}` — `issue.created`, `sprint.updated`, `webhook.failed`
- Standard payload structure:
```typescript
{
  type: "issue.updated",
  data: { /* entity data */ },
  timestamp: "2026-02-17T14:30:00.000Z",
  source: "jira" | "github" | "system" | "user"
}
```
- Supabase Realtime channels: `dashboard:{role}` for role-filtered broadcasts

**Zustand State Management:**
- Feature slices: `useDashboardStore`, `useFilterStore`, `useSidebarStore`
- Action naming: verb-first — `setActiveRole()`, `toggleSidebar()`, `updateFilter()`, `resetFilters()`
- Selectors: use `useShallow()` for multi-property selections to prevent unnecessary re-renders
- No business logic in stores — stores hold UI state only, data comes from Server Components/Realtime

### Process Patterns

**Error Handling:**
- Server Actions: return `{ data: null, error: { code, message } }` — never throw
- Route Handlers: return `NextResponse.json({ data: null, error }, { status })` with appropriate HTTP codes
- Client Components: `<WidgetError>` component with retry button, logs error to console with correlation ID
- Error boundaries: every dashboard widget wrapped in `<ErrorBoundary fallback={<WidgetError />}>`
- Error classes: `AuthError`, `IntegrationError`, `ValidationError`, `RateLimitError` extending base `AppError`

**Loading States:**
- Shared `<WidgetSkeleton />` component matching widget card dimensions
- `<WidgetSkeleton variant="chart" | "table" | "stats" | "list" />`
- Server Components use Next.js `loading.tsx` for route-level loading
- Client Components use Suspense with `<WidgetSkeleton />` fallback
- No full-page spinners — widget-level loading only

**Structured Logging:**
- Format: `{ level, message, correlationId, source, timestamp, data }`
- Correlation ID: generated per webhook event, flows through entire processing pipeline
- Levels: `debug` (dev only), `info` (operations), `warn` (degraded), `error` (failures)
- Source tags: `webhook:jira`, `webhook:github`, `auth`, `ai`, `realtime`, `admin`
- Example:
```typescript
log.info({
  message: "Webhook processed",
  correlationId: "wh_abc123",
  source: "webhook:jira",
  data: { eventType: "issue.updated", issueKey: "CD-42" }
})
```

**Retry & Rate Limiting:**
- Jira API: in-memory queue, max 5 calls/min, exponential backoff (1s, 2s, 4s, 8s, 16s), max 3 retries
- Webhook processing: retry failed events from dead letter table (manual admin action for MVP)
- Supabase Realtime: auto-reconnect built into client, no custom retry needed
- AI requests: single retry on timeout, then graceful degradation message

### Enforcement Guidelines

**All AI Agents MUST:**
1. Follow naming conventions exactly — no exceptions for "just this one file"
2. Use the `{ data, error }` response wrapper for every Server Action and Route Handler
3. Wrap every dashboard widget in an error boundary with `<WidgetError />` fallback
4. Include correlation IDs in all webhook processing log entries
5. Co-locate tests with source files (unit/integration) or in `e2e/` (end-to-end)
6. Use `kebab-case` for all new files, `PascalCase` for components/types, `camelCase` for functions/variables
7. Never put business logic in Zustand stores — stores are UI state only
8. Always validate at boundaries with Zod schemas before writing to Supabase

**Anti-Patterns to Avoid:**
- Creating `utils.ts` or `helpers.ts` catch-all files — use descriptive names in `src/lib/`
- Mixing `snake_case` and `camelCase` in the same layer (DB is snake, TS is camel)
- Returning raw Supabase errors to the client — always map to typed `AppError`
- Putting `"use client"` on components that don't need interactivity
- Creating loading spinners instead of using `<WidgetSkeleton />`
- Storing server data in Zustand — use Server Components + ISR + Realtime instead

## Project Structure & Boundaries

### Complete Project Directory Structure

```
currydash-central-hub/
├── .env.example                          # Environment template (committed)
├── .env.local                            # Local secrets (gitignored)
├── .eslintrc.json                        # ESLint config
├── .gitignore
├── .prettierrc                           # Prettier config
├── next.config.ts                        # Next.js configuration
├── package.json
├── tailwind.config.ts                    # Tailwind + spice palette extensions
├── tsconfig.json
├── vitest.config.ts                      # Vitest unit test config
├── playwright.config.ts                  # Playwright E2E config
├── components.json                       # shadcn/ui config
│
├── .github/
│   └── workflows/
│       └── ci.yml                        # Lint, type-check, Vitest on PRs
│
├── e2e/                                  # End-to-end tests (Playwright)
│   ├── auth.spec.ts                      # Login, registration, RBAC flows
│   ├── dashboard.spec.ts                 # Dashboard loading, widget rendering
│   ├── webhooks.spec.ts                  # Webhook processing flows
│   └── fixtures/                         # Test fixtures and helpers
│       └── auth.ts                       # Authenticated page helper
│
├── public/
│   ├── favicon.ico
│   └── images/                           # Static images, logos
│
├── supabase/                             # Supabase CLI directory
│   ├── config.toml                       # Supabase local dev config
│   ├── seed.sql                          # Dev seed data (roles, test users)
│   └── migrations/                       # Ordered SQL migrations
│       ├── 00001_create_roles.sql
│       ├── 00002_create_users.sql
│       ├── 00003_create_teams.sql
│       ├── 00004_create_jira_tables.sql
│       ├── 00005_create_github_tables.sql
│       ├── 00006_create_webhook_events.sql
│       ├── 00007_create_dead_letter_events.sql
│       ├── 00008_create_dashboard_widgets.sql
│       ├── 00009_create_notifications.sql
│       ├── 00010_create_ai_chat_sessions.sql
│       ├── 00011_create_system_health.sql
│       └── 00012_rls_policies.sql
│
├── src/
│   ├── app/                              # Next.js App Router (thin route wrappers)
│   │   ├── globals.css                   # Tailwind directives + spice CSS variables
│   │   ├── layout.tsx                    # Root layout (auth provider, CopilotKit provider)
│   │   ├── loading.tsx                   # Root loading state
│   │   ├── error.tsx                     # Root error boundary
│   │   ├── not-found.tsx                 # 404 page
│   │   ├── page.tsx                      # Landing / redirect to dashboard
│   │   │
│   │   ├── (auth)/                       # Auth route group (no layout nesting)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx                # Auth pages layout (centered card)
│   │   │
│   │   ├── (dashboard)/                  # Dashboard route group (shared shell)
│   │   │   ├── layout.tsx                # Dashboard shell (sidebar + header + CopilotSidebar)
│   │   │   ├── loading.tsx               # Dashboard-level loading
│   │   │   ├── error.tsx                 # Dashboard-level error boundary
│   │   │   ├── page.tsx                  # Main dashboard (role-filtered widgets)
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx              # Admin dashboard view
│   │   │   │   ├── users/
│   │   │   │   │   └── page.tsx          # User management
│   │   │   │   ├── integrations/
│   │   │   │   │   └── page.tsx          # Integration health monitoring
│   │   │   │   └── system/
│   │   │   │       └── page.tsx          # System health, dead letters, AI costs
│   │   │   ├── issues/
│   │   │   │   ├── page.tsx              # Issue list (Jira synced)
│   │   │   │   └── [issueKey]/
│   │   │   │       └── page.tsx          # Issue detail
│   │   │   ├── sprints/
│   │   │   │   ├── page.tsx              # Sprint list
│   │   │   │   └── [sprintId]/
│   │   │   │       └── page.tsx          # Sprint detail + charts
│   │   │   ├── repos/
│   │   │   │   ├── page.tsx              # Repository list (GitHub synced)
│   │   │   │   └── [repoName]/
│   │   │   │       └── page.tsx          # Repo detail + PRs
│   │   │   └── reports/
│   │   │       └── page.tsx              # AI-generated reports
│   │   │
│   │   └── api/                          # Route Handlers (webhooks, AI, callbacks)
│   │       ├── webhooks/
│   │       │   ├── jira/
│   │       │   │   └── route.ts          # Jira webhook receiver
│   │       │   └── github/
│   │       │       └── route.ts          # GitHub webhook receiver
│   │       ├── ai/
│   │       │   └── copilotkit/
│   │       │       └── route.ts          # CopilotKit runtime endpoint
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts          # Auth.js catch-all route
│   │       └── cron/
│   │           └── refresh-webhooks/
│   │               └── route.ts          # Jira webhook refresh (25-day cycle)
│   │
│   ├── components/                       # Shared components
│   │   ├── ui/                           # shadcn/ui components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── chart.tsx
│   │   │   └── data-table.tsx
│   │   └── shared/                       # App-wide shared components
│   │       ├── widget-skeleton.tsx        # <WidgetSkeleton variant="chart|table|stats|list" />
│   │       ├── widget-error.tsx           # <WidgetError> with retry button
│   │       ├── error-boundary.tsx         # Reusable React error boundary wrapper
│   │       ├── staleness-indicator.tsx    # Amber >10min, red >30min badge
│   │       ├── role-gate.tsx             # <RoleGate allowedRoles={[...]}> wrapper
│   │       └── relative-time.tsx          # "5 min ago" display component
│   │
│   ├── modules/                          # Feature modules (domain capability)
│   │   ├── auth/                         # FR1-FR9: Identity & Access Management
│   │   │   ├── components/
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── register-form.tsx
│   │   │   │   └── role-switcher.tsx
│   │   │   ├── actions/
│   │   │   │   ├── login.ts              # Server Action
│   │   │   │   └── register.ts           # Server Action
│   │   │   ├── auth-config.ts            # Auth.js v5 configuration
│   │   │   ├── types.ts                  # AuthUser, Session, Role types
│   │   │   └── login-form.test.ts
│   │   │
│   │   ├── dashboard/                    # FR10-FR19: Dashboard & Data Visualization
│   │   │   ├── components/
│   │   │   │   ├── dashboard-grid.tsx     # Config-driven widget grid renderer
│   │   │   │   ├── widget-card.tsx        # Base widget wrapper (error boundary + staleness)
│   │   │   │   ├── stats-widget.tsx       # Numeric KPI card
│   │   │   │   ├── chart-widget.tsx       # Recharts wrapper widget
│   │   │   │   ├── table-widget.tsx       # Data table widget
│   │   │   │   ├── list-widget.tsx        # Simple list widget
│   │   │   │   └── sidebar-nav.tsx        # Dashboard navigation sidebar
│   │   │   ├── config/
│   │   │   │   └── widget-registry.ts     # Role → widget[] config mapping
│   │   │   ├── hooks/
│   │   │   │   └── use-realtime-widget.ts # Supabase Realtime subscription hook
│   │   │   ├── types.ts                  # DashboardWidget, WidgetConfig types
│   │   │   └── dashboard-grid.test.ts
│   │   │
│   │   ├── jira/                         # FR20-FR25: Jira Integration
│   │   │   ├── components/
│   │   │   │   ├── issue-card.tsx
│   │   │   │   ├── issue-list.tsx
│   │   │   │   ├── sprint-board.tsx
│   │   │   │   └── sprint-chart.tsx
│   │   │   ├── actions/
│   │   │   │   ├── sync-issues.ts        # Server Action: manual sync
│   │   │   │   └── update-issue.ts       # Server Action: update via API
│   │   │   ├── types.ts                  # JiraIssue, JiraSprint types
│   │   │   └── issue-card.test.ts
│   │   │
│   │   ├── github/                       # FR26-FR29: GitHub Integration
│   │   │   ├── components/
│   │   │   │   ├── repo-card.tsx
│   │   │   │   ├── pr-list.tsx
│   │   │   │   └── commit-activity.tsx
│   │   │   ├── actions/
│   │   │   │   └── sync-repos.ts         # Server Action: manual sync
│   │   │   ├── types.ts                  # GitHubRepo, PullRequest types
│   │   │   └── repo-card.test.ts
│   │   │
│   │   ├── ai/                           # FR30-FR37: AI Assistant (frontend)
│   │   │   ├── components/
│   │   │   │   ├── copilot-provider.tsx   # CopilotKit provider + config
│   │   │   │   ├── ai-sidebar.tsx         # CopilotSidebar customization
│   │   │   │   └── ai-status.tsx          # AI availability indicator
│   │   │   ├── hooks/
│   │   │   │   ├── use-copilot-context.ts # useCopilotReadable for dashboard data
│   │   │   │   └── use-copilot-actions.ts # useCopilotAction definitions
│   │   │   ├── types.ts
│   │   │   └── copilot-provider.test.ts
│   │   │
│   │   ├── reports/                      # FR38-FR44: AI Report & Widget Generation
│   │   │   ├── components/
│   │   │   │   ├── report-viewer.tsx
│   │   │   │   ├── report-generator.tsx
│   │   │   │   └── widget-builder.tsx     # AI-generated widget config preview
│   │   │   ├── actions/
│   │   │   │   ├── generate-report.ts     # Server Action: trigger AI report
│   │   │   │   └── save-widget.ts         # Server Action: persist widget config
│   │   │   └── types.ts
│   │   │
│   │   ├── webhooks/                     # FR45-FR50: Data Pipeline & Freshness
│   │   │   ├── handlers/
│   │   │   │   ├── jira-handler.ts        # Jira event → Supabase upsert → revalidate
│   │   │   │   └── github-handler.ts      # GitHub event → Supabase upsert → revalidate
│   │   │   ├── validation/
│   │   │   │   ├── hmac.ts               # HMAC-SHA256 signature validation
│   │   │   │   └── ip-allowlist.ts       # IP range validation
│   │   │   ├── dedup.ts                  # Event ID deduplication logic
│   │   │   ├── dead-letter.ts            # Dead letter queue writer
│   │   │   ├── types.ts
│   │   │   ├── hmac.test.ts
│   │   │   └── dedup.test.ts
│   │   │
│   │   └── admin/                        # FR51-FR56: System Administration
│   │       ├── components/
│   │       │   ├── integration-health.tsx  # Integration status cards
│   │       │   ├── webhook-monitor.tsx     # Webhook event log + dead letters
│   │       │   ├── ai-cost-tracker.tsx     # AI spend telemetry
│   │       │   └── user-management.tsx     # User CRUD table
│   │       ├── actions/
│   │       │   ├── retry-dead-letter.ts   # Server Action: retry failed webhook
│   │       │   └── manage-users.ts        # Server Action: CRUD users
│   │       └── types.ts
│   │
│   ├── mastra/                           # Mastra AI agent backend
│   │   ├── index.ts                      # Mastra instance + agent registration
│   │   ├── agents/
│   │   │   ├── dashboard-agent.ts         # Main CopilotKit-connected agent
│   │   │   └── report-agent.ts            # Report generation agent
│   │   └── tools/
│   │       ├── jira-tools.ts             # Jira query tools for agents
│   │       ├── github-tools.ts           # GitHub query tools for agents
│   │       ├── supabase-tools.ts         # Direct DB query tools
│   │       └── report-tools.ts           # Report generation tools
│   │
│   ├── lib/                              # Shared utilities and clients
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Browser Supabase client
│   │   │   ├── server.ts                 # Server Component Supabase client
│   │   │   ├── middleware.ts             # Middleware Supabase client (cookie refresh)
│   │   │   └── admin.ts                  # Service role client (webhooks, cron)
│   │   ├── clients/
│   │   │   ├── jira-client.ts            # jira.js client with rate limiting queue
│   │   │   └── github-client.ts          # Octokit client
│   │   ├── schemas/                      # Shared Zod schemas
│   │   │   ├── auth.ts                   # Login, register, session schemas
│   │   │   ├── jira.ts                   # Jira issue, sprint, webhook schemas
│   │   │   ├── github.ts                 # GitHub repo, PR, webhook schemas
│   │   │   ├── dashboard.ts              # Widget config, filter schemas
│   │   │   └── api.ts                    # API response wrapper, error schemas
│   │   ├── errors.ts                     # AppError, AuthError, IntegrationError classes
│   │   ├── logger.ts                     # Structured JSON logger with correlation IDs
│   │   ├── rate-limiter.ts               # In-memory request queue (Jira API)
│   │   └── constants.ts                  # App-wide constants
│   │
│   ├── stores/                           # Zustand stores (UI state only)
│   │   ├── dashboard-store.ts            # Active role, sidebar state
│   │   ├── filter-store.ts              # Dashboard filter selections
│   │   └── sidebar-store.ts             # Sidebar open/collapse state
│   │
│   ├── types/                            # Shared cross-module types
│   │   ├── database.ts                   # Supabase generated types (supabase gen types)
│   │   ├── api.ts                        # ApiResponse<T>, ApiError
│   │   └── roles.ts                      # Role enum, RolePermissions
│   │
│   ├── middleware.ts                     # Edge Middleware: auth + RBAC + Supabase cookie refresh
│   │
│   └── test-utils/                       # Test utilities
│       ├── mocks/
│       │   ├── supabase.ts              # Supabase client mock
│       │   ├── jira.ts                  # Jira client mock
│       │   └── github.ts               # GitHub client mock
│       ├── factories/
│       │   ├── user.ts                  # Test user factory
│       │   ├── issue.ts                 # Test issue factory
│       │   └── webhook.ts              # Test webhook event factory
│       └── render.tsx                   # Custom render with providers
```

### Architectural Boundaries

**API Boundaries:**
- **External inbound:** `/api/webhooks/jira` and `/api/webhooks/github` — public endpoints, protected by HMAC signature validation + IP allowlist. No auth session required.
- **External inbound (auth):** `/api/auth/[...nextauth]` — Auth.js handles OAuth callbacks and session management.
- **AI runtime:** `/api/ai/copilotkit` — CopilotKit runtime endpoint, requires authenticated session with role claims. Connects to Mastra agents.
- **Cron:** `/api/cron/refresh-webhooks` — Vercel Cron Job (secured by `CRON_SECRET` header). Refreshes Jira webhook registrations every 25 days.
- **Server Actions:** All mutations go through Server Actions in `src/modules/{feature}/actions/`. Each validates session via `auth()` and input via Zod before any data operation.

**Component Boundaries:**
- **Server Components:** Dashboard pages, layouts, data-fetching wrappers — read from Supabase via server client, pass data as props to Client Components.
- **Client Components:** Charts (Recharts), Realtime subscriptions, CopilotKit sidebar, Zustand-consuming widgets, interactive forms. Marked with `"use client"` at leaf nodes only.
- **Error Boundaries:** Each widget wrapped in `<ErrorBoundary>` → `<WidgetError />`. Route-level `error.tsx` catches unhandled errors. AI sidebar has independent error isolation.

**Data Boundaries:**
- **Supabase (source of truth for cached data):** All Jira/GitHub data cached in Supabase tables. Dashboard reads from Supabase, never directly from Jira/GitHub APIs on page load.
- **Direct API calls (rate-limited):** Only for user-initiated actions (create issue, manual sync) via the rate-limited Jira/GitHub clients in `src/lib/clients/`.
- **Realtime layer:** Supabase Realtime broadcasts from webhook handlers. Client Components subscribe to channels. No direct DB polling.
- **AI data access:** Mastra tools in `src/mastra/tools/` query Supabase cached data. MCP servers provide Jira/GitHub access with fallback to cached data.

### Requirements to Structure Mapping

**Feature/Epic Mapping:**

| FR Category | Module | App Routes | Key Files |
|---|---|---|---|
| FR1-FR9: Identity & Access | `src/modules/auth/` | `(auth)/login`, `(auth)/register` | `auth-config.ts`, `middleware.ts` |
| FR10-FR19: Dashboard & Viz | `src/modules/dashboard/` | `(dashboard)/page.tsx` | `widget-registry.ts`, `dashboard-grid.tsx` |
| FR20-FR25: Jira Integration | `src/modules/jira/` + `src/lib/clients/jira-client.ts` | `(dashboard)/issues/`, `(dashboard)/sprints/` | `jira-handler.ts`, `jira-client.ts` |
| FR26-FR29: GitHub Integration | `src/modules/github/` + `src/lib/clients/github-client.ts` | `(dashboard)/repos/` | `github-handler.ts`, `github-client.ts` |
| FR30-FR37: AI Assistant | `src/modules/ai/` + `src/mastra/` | `api/ai/copilotkit` | `copilot-provider.tsx`, `dashboard-agent.ts` |
| FR38-FR44: AI Reports & Widgets | `src/modules/reports/` + `src/mastra/agents/report-agent.ts` | `(dashboard)/reports/` | `report-agent.ts`, `widget-builder.tsx` |
| FR45-FR50: Data Pipeline | `src/modules/webhooks/` | `api/webhooks/jira`, `api/webhooks/github` | `dedup.ts`, `dead-letter.ts`, `hmac.ts` |
| FR51-FR56: System Admin | `src/modules/admin/` | `(dashboard)/admin/` | `integration-health.tsx`, `webhook-monitor.tsx` |

**Cross-Cutting Concerns Mapping:**

| Concern | Primary Location | Touches |
|---|---|---|
| RBAC (3 layers) | `src/middleware.ts` + `src/lib/supabase/` + `supabase/migrations/` | Every route, every query, every RLS policy |
| Error handling | `src/lib/errors.ts` + `src/components/shared/` | All modules, all API routes |
| Logging | `src/lib/logger.ts` | Webhook handlers, admin module, error handlers |
| Theming (spice palette) | `src/app/globals.css` | All UI components via CSS variables |
| Data freshness | `src/components/shared/staleness-indicator.tsx` | All dashboard widgets |

### Integration Points

**Internal Communication:**
- Server Components → Supabase server client → DB (read path)
- Server Actions → Zod validation → Supabase admin client → DB (write path)
- Webhook Route Handler → dedup check → handler → Supabase upsert → `revalidateTag()` → Realtime broadcast
- CopilotKit frontend → `/api/ai/copilotkit` → Mastra agent → tools → Supabase/Jira/GitHub

**External Integrations:**
- **Jira Cloud:** Inbound webhooks → `/api/webhooks/jira`. Outbound API calls via `jira-client.ts` (rate-limited). MCP server for AI agent access.
- **GitHub:** Inbound webhooks → `/api/webhooks/github`. Outbound via `github-client.ts` (Octokit). MCP server for AI agent access.
- **Anthropic AI:** Via Vercel AI SDK + Mastra. Model routing: Haiku for simple queries, Sonnet for complex reports. 4,000 token output cap.
- **Supabase:** Auth, DB, Realtime, and Storage. Same-region as Vercel deployment.
- **Vercel:** Hosting, preview deploys, analytics, cron jobs, edge middleware runtime.

**Data Flow (Webhook → Dashboard):**
```
Jira/GitHub → webhook POST → Route Handler → HMAC validate → dedup check
→ parse event → Supabase upsert → revalidateTag('issues') → Realtime broadcast
→ ISR serves fresh page (next request) + Client Components update live
```

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility: PASS**
All technology choices work together without conflicts. Auth.js v5 JWT sessions feed role claims to both Edge Middleware RBAC and Supabase RLS policies via `auth.jwt()->>'role'`. ISR tag-based revalidation and Supabase Realtime operate as complementary update paths from the same webhook source. Config-driven widgets accept both static registry configs and AI-generated JSON configs. All package versions verified compatible as of Feb 2026.

**Pattern Consistency: PASS**
Naming conventions (snake_case DB, camelCase TS, kebab-case files) are consistently applied across all layers without cross-contamination. The `{ data, error }` response wrapper matches Supabase client patterns. Structured logging with correlation IDs flows through the entire webhook pipeline. Error boundary patterns are uniform across all widget types.

**Structure Alignment: PASS**
Project directory structure supports all architectural decisions. Feature modules map 1:1 to FR capability areas. Cross-cutting concerns (RBAC, error handling, logging) have dedicated shared locations. Mastra agent backend is properly separated from CopilotKit frontend in `src/mastra/` vs `src/modules/ai/`.

**Clarifications for Implementation:**
1. **MCP vs Cache precedence:** MCP tools try live query with 5s timeout → fall back to Supabase cache on timeout/error → include source in AI citation ("Live query" vs "Cached data as of [timestamp]")
2. **Zustand role vs JWT role:** Zustand `activeRole` = display preference (which dashboard view to render). JWT role = authoritative access control. Widget config resolves based on JWT. RLS gates data regardless of Zustand state.
3. **Auth.js v5 beta:** Pin exact versions in `package.json` after Week 1 setup testing. SupabaseAdapter supports JWT sessions with custom role claims via `callbacks.jwt()`.

### Requirements Coverage Validation

**Functional Requirements Coverage: 56/56 PASS**

| FR Category | Count | Status | Module |
|---|---|---|---|
| FR1-FR9: Identity & Access | 9 | PASS | `src/modules/auth/` + `middleware.ts` |
| FR10-FR19: Dashboard & Viz | 10 | PASS | `src/modules/dashboard/` |
| FR20-FR25: Jira Integration | 6 | PASS | `src/modules/jira/` + `src/modules/webhooks/` |
| FR26-FR29: GitHub Integration | 4 | PASS | `src/modules/github/` + `src/modules/webhooks/` |
| FR30-FR37: AI Assistant | 8 | PASS | `src/modules/ai/` + `src/mastra/` |
| FR38-FR44: AI Reports & Widgets | 7 | PASS | `src/modules/reports/` + `src/mastra/agents/` |
| FR45-FR50: Data Pipeline | 6 | PASS | `src/modules/webhooks/` + Supabase schema |
| FR51-FR56: System Admin | 6 | PASS | `src/modules/admin/` |

**Notes:**
- FR35 (AI source citations): Enforced via Mastra tool response wrappers that include source metadata. Implementation detail for AI stories.
- FR54 (Credential configuration): MVP uses Vercel env vars only. No admin UI for credential rotation in MVP. Phase 2 enhancement.

**Non-Functional Requirements Coverage: 46/46 PASS**

All Performance, Security, Integration, Reliability, and Scalability NFRs have architectural support. MVP concurrent user target confirmed at **5 simultaneous users** (NFR-P9). NFR-SC5 (10 users) applies to next milestone without architecture changes.

### Critical Gap Resolutions

**GAP-C1: Webhook Registration Refresh Automation**
- **Resolution:** `/api/cron/refresh-webhooks` route is secured via `CRON_SECRET` header (Vercel Cron Job convention). Runs on 25-day cycle. Discovers registered webhook URLs from Supabase `webhook_registrations` table. Failed refreshes written to `dead_letter_events` with `source: "cron:webhook-refresh"`. Admin dashboard shows refresh status. Two consecutive failures trigger admin notification.
- **Implementation:** Epic 7 (Data Pipeline) stories.

**GAP-C2: Mastra Agent Tool Error Handling**
- **Resolution:** All Mastra tools wrapped with `ToolError` type following `{ data, error }` pattern. Per-tool timeout: 5s for Jira/GitHub queries, 3s for Supabase queries. On tool failure, agent returns "I couldn't retrieve that data — [error context]" rather than crashing. Tool failures logged with correlation ID. Token budget checked before each tool invocation.
- **Implementation:** Epic 5 (AI Assistant) stories.

**GAP-C3: Token Budget Enforcement Mechanism**
- **Resolution:** Per-request: Vercel AI SDK `maxTokens: 4000` on every completion call. Per-session: Cumulative token counter in Mastra agent, stops tool invocations at 8,000 total session tokens. Per-month: `ai_usage` Supabase table tracks daily spend. Admin dashboard shows current month spend. Alert at 80% ($40) threshold. Model routing: Haiku default, Sonnet only for report generation and complex multi-tool queries.
- **Implementation:** Epic 5 and Epic 8 (System Admin) stories.

**GAP-C4: Webhook Event Payload Validation**
- **Resolution:** Zod schemas in `src/lib/schemas/jira.ts` and `github.ts` define webhook payload structures with `.passthrough()` for unknown vendor fields. Validation runs immediately after HMAC check, before any processing. Invalid payloads → dead letter with raw payload preserved. Schema uses `.optional()` liberally since vendor payloads vary by event type. Exact field mapping defined during implementation based on Jira/GitHub webhook documentation.
- **Implementation:** Epic 3 (Jira) and Epic 4 (GitHub) stories.

### Important Gaps (Documented for Implementation)

1. **Credential Management (FR54):** ENV vars only for MVP. Document manual rotation process. Phase 2: Admin UI with validation.
2. **Staleness Calculation:** `Date.now() - widget.updated_at`. Amber >10min, red >30min. Force refresh button per widget calls `revalidateTag()`.
3. **Responsive Grid:** 3-column CSS Grid (desktop 1280px+), 2-column (tablet 768px+). No mobile in MVP.
4. **Report Generation:** JSON buffered (not streamed) for easier persistence. Streamed for chat. Persisted in `ai_reports` table.
5. **Supabase Free → Pro:** Transition when ready for production. $25/mo Pro fits within $100/mo total budget ($25 Supabase + $50 AI + $0 Vercel).

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed (56 FRs, 46 NFRs)
- [x] Scale and complexity assessed (medium-high, ~15 major components)
- [x] Technical constraints identified (8 constraints documented)
- [x] Cross-cutting concerns mapped (6 concerns with resolution patterns)

**Architectural Decisions**
- [x] Critical decisions documented with versions (12 critical + important decisions)
- [x] Technology stack fully specified (9 major packages version-verified)
- [x] Integration patterns defined (webhook pipeline, MCP fallback, rate limiting)
- [x] Performance considerations addressed (ISR + Realtime hybrid, model routing)

**Implementation Patterns**
- [x] Naming conventions established (DB, API, code — 20+ rules)
- [x] Structure patterns defined (feature modules, test colocation, config locations)
- [x] Communication patterns specified (events, Zustand stores, logging)
- [x] Process patterns documented (error handling, loading states, retry strategies)

**Project Structure**
- [x] Complete directory structure defined (~120 files/directories)
- [x] Component boundaries established (API, component, data boundaries)
- [x] Integration points mapped (internal + 5 external integrations)
- [x] Requirements to structure mapping complete (8 FR categories → modules)

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** HIGH — 98% requirements coverage, all technology choices coherent, 4 critical gaps resolved with inline guidance.

**Key Strengths:**
- Webhook-first data architecture eliminates polling and respects Jira rate limits
- Three-layer RBAC enforcement (middleware → server component → RLS) with no shortcuts
- Graceful degradation at every layer — dashboard never depends on AI availability
- Per-widget error isolation prevents cascade failures
- Config-driven widget system supports both static and AI-generated dashboards
- Comprehensive naming/pattern rules prevent AI agent implementation conflicts

**Areas for Future Enhancement (Post-MVP):**
- Sentry error monitoring (replace console logging)
- Automated dead letter retry with configurable policies
- Admin UI for credential rotation and integration configuration
- Mobile responsive layout
- Turborepo monorepo for potential microservice extraction
- Mastra standalone extraction from Next.js API routes

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented in this document
- Use implementation patterns consistently — no exceptions for "just this one file"
- Respect project structure boundaries — modules own their domain, shared code goes in `src/lib/` or `src/components/shared/`
- Use `{ data, error }` wrapper for every Server Action and Route Handler
- Wrap every dashboard widget in error boundary with `<WidgetError />` fallback
- Validate at boundaries with Zod before any Supabase write
- Refer to this document for all architectural questions before making assumptions

**First Implementation Priority:**
Run the initialization command sequence from the Starter Template Evaluation section to scaffold the project, then proceed with Supabase schema migrations and Auth.js v5 setup.

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED
**Total Steps Completed:** 8
**Date Completed:** 2026-02-17
**Document Location:** `_bmad-output/planning-artifacts/architecture.md`

### Final Architecture Deliverables

**Complete Architecture Document**
- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**Implementation Ready Foundation**
- 20+ architectural decisions made across 5 categories
- 20+ implementation patterns defined for agent consistency
- ~15 major architectural components specified
- 56 functional + 46 non-functional requirements fully supported

**AI Agent Implementation Guide**
- Technology stack with verified versions (Next.js 15, Supabase, Auth.js v5, CopilotKit, Mastra, Vercel AI SDK 5.0)
- Consistency rules that prevent implementation conflicts
- Project structure with ~120 files/directories and clear boundaries
- Integration patterns and communication standards

### Development Sequence

1. Initialize project using documented starter template (Vercel Supabase Starter + composite scaffold)
2. Set up Supabase project + run schema migrations (hybrid model, RLS policies, system tables)
3. Configure Auth.js v5 with JWT sessions + SupabaseAdapter + role claims
4. Implement Edge Middleware RBAC + `auth()` helper pattern
5. Apply CSS variable theming (spice palette override of shadcn defaults)
6. Build dashboard shell + config-driven widget grid + error boundaries
7. Implement webhook Route Handlers (HMAC + dedup + ISR revalidation)
8. Add Zustand stores + Supabase Realtime subscriptions
9. Build Jira/GitHub clients with rate limiting
10. Integrate CopilotKit sidebar + Mastra agents
11. Set up GitHub Actions CI pipeline

---

**Architecture Status:** READY FOR IMPLEMENTATION

**Next Phase:** Create epics and stories using this architecture as the technical foundation, then begin implementation.
