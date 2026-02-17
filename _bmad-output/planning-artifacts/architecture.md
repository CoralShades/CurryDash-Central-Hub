---
stepsCompleted: [1, 2]
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
