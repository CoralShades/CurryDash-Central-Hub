---
stepsCompleted: [1, 2, 3]
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
