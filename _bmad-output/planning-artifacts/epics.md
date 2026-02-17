---
stepsCompleted: ['step-01-validate-prerequisites']
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# CurryDash-Central-Hub - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for CurryDash-Central-Hub, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**1. Identity & Access Management (FR1-FR9)**

- FR1: Users can register for an account using email magic link, Google OAuth, or GitHub OAuth
- FR2: Users can log in and receive a role-appropriate session with JWT token
- FR3: The system can enforce route-level access control based on user role via edge middleware
- FR4: The system can enforce data-level access control based on user role via server-side authorization
- FR5: The system can enforce row-level data isolation based on user role via database policies
- FR6: Admin users can create new user accounts and assign roles (Admin, Developer, QA, Stakeholder)
- FR7: Admin users can view and manage all registered users and their role assignments
- FR8: Unauthenticated users are redirected to the login page when accessing protected routes
- FR9: Users with insufficient role privileges are redirected to their role-appropriate dashboard

**2. Dashboard & Data Visualization (FR10-FR19)**

- FR10: Authenticated users can view a unified dashboard displaying ecosystem-wide health data
- FR11: The dashboard can display sprint progress summaries across all connected Jira projects
- FR12: The dashboard can display GitHub pull request activity across all connected repositories
- FR13: The dashboard can display key metric cards (stories completed, PRs merged, bugs open, deployment status)
- FR14: The dashboard can display team activity summaries
- FR15: The dashboard can display blocker indicators with drill-down to issue details
- FR16: Users can click a dashboard item to view its full details without leaving Central Hub
- FR17: Stakeholder users can view the dashboard in read-only mode without admin controls
- FR18: The dashboard can display staleness indicators when data is older than 10 minutes
- FR19: The dashboard can isolate widget failures so one broken widget does not affect others

**3. Jira Integration (FR20-FR25)**

- FR20: The system can connect to Jira Cloud REST API v3 and authenticate via OAuth 2.0 or API token
- FR21: The system can fetch sprint data, issues, and epics across all 6 configured Jira projects (CUR, CAD, CAR, CPFP, PACK, CCW)
- FR22: The system can receive Jira webhook events for issue creation, update, and transition
- FR23: The system can validate incoming Jira webhook payloads using shared secret verification
- FR24: The system can automatically refresh Jira webhook registrations before their 30-day expiry
- FR25: The system can handle Jira API rate limit responses (429) with exponential backoff and retry

**4. GitHub Integration (FR26-FR29)**

- FR26: The system can connect to GitHub API via Octokit and authenticate using OAuth tokens
- FR27: The system can fetch repository data, pull requests, commits, and CI status for connected repositories
- FR28: The system can receive GitHub webhook events for push, pull request, and workflow run events
- FR29: The system can validate incoming GitHub webhook payloads using HMAC-SHA256 signature verification

**5. AI Assistant (FR30-FR37)**

- FR30: Users can interact with an AI chat assistant via a sidebar panel within the dashboard
- FR31: The AI assistant can stream responses in real-time using Server-Sent Events
- FR32: The AI assistant can query live Jira data through natural language (via MCP server connection)
- FR33: The AI assistant can query live GitHub data through natural language (via MCP server connection)
- FR34: The AI assistant can provide role-aware responses based on the current user's role and permissions
- FR35: The AI assistant can cite data sources in responses (e.g., Jira project, JQL query, document section)
- FR36: The AI assistant can continue to function with degraded capability when the AI provider is unavailable (dashboard remains fully functional)
- FR37: The AI assistant can display an unavailability status message when the AI provider is down

**6. AI Report & Widget Generation (FR38-FR44)**

- FR38: Users can request the AI to generate a sprint status report from live Jira data
- FR39: Users can request the AI to generate a stakeholder progress summary from live project data
- FR40: AI-generated reports can include a "data as of [timestamp]" footer indicating data freshness
- FR41: Users can request the AI to generate dashboard widgets by describing them in natural language
- FR42: AI-generated widgets can be rendered as metric cards, bar/line/pie charts, or data tables
- FR43: AI-generated widget configurations can be persisted to the database and displayed on the dashboard permanently
- FR44: The dashboard can render pre-built static widgets as a fallback when AI widget generation is unavailable

**7. Data Pipeline & Freshness (FR45-FR50)**

- FR45: The system can cache Jira and GitHub data in Supabase for fast dashboard queries
- FR46: The system can invalidate cached data via ISR cache tag revalidation when webhooks are received
- FR47: The system can push real-time data updates to connected dashboard clients via Supabase Realtime
- FR48: The system can process webhook events idempotently (duplicate deliveries produce the same result)
- FR49: The system can resolve out-of-order webhook events using event timestamps
- FR50: The system can log failed webhook payloads for manual investigation (dead letter logging)

**8. System Administration (FR51-FR56)**

- FR51: Admin users can view integration connection status (last successful sync per source)
- FR52: Admin users can view webhook health status (last received event per source with timestamp)
- FR53: Admin users can view AI API usage metrics (monthly cost, query count)
- FR54: Admin users can configure integration credentials (Jira, GitHub, Anthropic API keys)
- FR55: The system can cap individual AI requests at a configured token budget to prevent cost overruns
- FR56: The system can log rate limit events with remaining quota information and surface warnings when consumption exceeds 50%

### NonFunctional Requirements

**Performance (NFR-P1 to NFR-P10)**

- NFR-P1: Dashboard initial page load (cold) — <3 seconds TTFCP (MVP), <2 seconds (Production)
- NFR-P2: Dashboard navigation (warm, client-side) — <500ms TTI (MVP), <300ms (Production)
- NFR-P3: Dashboard widget render (individual) — <1 second (MVP), <500ms (Production)
- NFR-P4: AI chat response (text, first token) — <3 seconds (MVP), <2 seconds (Production)
- NFR-P5: AI chat response (text, complete) — <10 seconds (MVP), <5 seconds (Production)
- NFR-P6: AI widget generation (complete) — <20 seconds (MVP), <15 seconds (Production)
- NFR-P7: AI report generation (complete) — <15 seconds (MVP), <10 seconds (Production)
- NFR-P8: Webhook processing latency — <30 seconds (MVP), <10 seconds (Production)
- NFR-P9: Concurrent dashboard users — 5 simultaneous (MVP), 20 simultaneous (Production)
- NFR-P10: API route response time (non-AI) — <500ms p95 (MVP), <200ms p95 (Production)

**Security (NFR-S1 to NFR-S10)**

- NFR-S1: All authentication flows use HTTPS exclusively — no HTTP fallback; HSTS headers
- NFR-S2: JWT session tokens expire after 24 hours with sliding refresh
- NFR-S3: API keys (Jira, GitHub, Anthropic) are never exposed to the client — server-side only
- NFR-S4: GitHub webhook payloads validated via HMAC-SHA256 before processing
- NFR-S5: Jira webhook payloads validated via shared secret before processing
- NFR-S6: RBAC enforced at all three layers — no security-by-UI-hiding
- NFR-S7: Supabase RLS policies active on every table containing user or project data
- NFR-S8: AI assistant cannot access or return data beyond the user's role permissions
- NFR-S9: No sensitive data (API keys, tokens, PII) in client-side logs or browser console
- NFR-S10: CSRF protection on all state-mutating API routes

**Integration (NFR-I1 to NFR-I8)**

- NFR-I1: Webhook delivery success rate (after retries) — 95%+ (MVP), 99%+ (Production)
- NFR-I2: Webhook idempotency — 100% (duplicate deliveries produce identical state)
- NFR-I3: Data freshness after external event — <5 minutes (webhook path)
- NFR-I4: Jira API rate limit compliance — <5 direct API calls per minute
- NFR-I5: GitHub API consumption — <10% of 5,000/hour limit under normal operation
- NFR-I6: Failed webhook recovery — within 1 hour of manual investigation
- NFR-I7: MCP server connection resilience — automatic failover to cached Supabase data
- NFR-I8: Integration failure isolation — one integration down does not affect others

**Reliability (NFR-R1 to NFR-R7)**

- NFR-R1: Dashboard uptime — best effort on Vercel free tier (MVP), 99.5%+ (Production)
- NFR-R2: Widget failure isolation — one widget crash does not affect adjacent widgets
- NFR-R3: AI degradation graceful — dashboard functions fully with AI offline (100%)
- NFR-R4: Webhook retry on transient failure — up to 3 retries, 1s/5s/30s exponential backoff
- NFR-R5: Database connection resilience — auto-reconnect within 30 seconds (MVP)
- NFR-R6: Realtime subscription recovery — reconnect within 60 seconds (MVP)
- NFR-R7: Zero data loss on webhook burst — all events processed, overflow logged to dead letter

**Scalability (NFR-SC1 to NFR-SC5)**

- NFR-SC1: Monthly infrastructure cost — $0 free tiers (MVP), <$100/month at full team
- NFR-SC2: AI API monthly spend — <$50/month with model routing optimization
- NFR-SC3: Database row growth — <100K rows within Supabase 500MB free limit
- NFR-SC4: Webhook burst handling — support 50 events/minute without data loss (MVP)
- NFR-SC5: User capacity — 10 concurrent users (MVP), 50 without architecture changes

### Additional Requirements

**From Architecture Document:**

- ARCH-1: **Starter Template** — Initialize project using Vercel Supabase Starter (`npx create-next-app --example with-supabase`) plus composite scaffold (shadcn/ui, Auth.js, integration clients, AI stack, dev tooling). This MUST be Epic 1 Story 1.
- ARCH-2: **Pre-existing Codebase Migration** — Current scaffold has custom CSS and Prisma ORM. Migration to Supabase + shadcn/ui + Tailwind is a foundational shift required before any feature work.
- ARCH-3: **Hybrid Data Model** — Normalized core tables with JSONB metadata columns for extended/vendor-specific fields. Supabase migrations required: roles, users, teams, jira_tables, github_tables, webhook_events, dead_letter_events, dashboard_widgets, notifications, ai_chat_sessions, system_health, rls_policies.
- ARCH-4: **JWT Sessions with Role Claims** — Auth.js v5 with SupabaseAdapter. JWT callbacks inject role. Stateless JWT enables Edge Middleware RBAC without DB round-trip.
- ARCH-5: **Server Actions + Route Handlers Split** — Server Actions for all mutations. Route Handlers only for webhooks, AI streaming, and external callbacks.
- ARCH-6: **Config-Driven Widget Grid** — JSON config maps `role → widget[]`. Each widget self-contained with own error boundary, data fetching, loading state. CSS Grid layout via Tailwind.
- ARCH-7: **Event ID Dedup Table** — `webhook_events` table stores processed event IDs. Check-before-process pattern prevents duplicate processing.
- ARCH-8: **Structured Error Types** — `AuthError`, `IntegrationError`, `ValidationError`, `RateLimitError` extending base `AppError` in `src/lib/errors.ts`.
- ARCH-9: **ISR + Realtime Hybrid Caching** — ISR tag-based revalidation triggered by webhook handlers for Server Components. Supabase Realtime subscriptions in Client Components for live updates.
- ARCH-10: **CSS Variables Theming** — Override shadcn/ui CSS variables with spice palette. Role-specific colors via `data-role` attribute on `<body>`.
- ARCH-11: **Zustand for Client State** — Lightweight stores for UI state only (sidebar, filters, active role). No business logic in stores.
- ARCH-12: **CopilotKit + Mastra + MCP Architecture** — CopilotKit frontend (`CopilotSidebar`) → Mastra agent backend (`src/mastra/`) → MCP servers (Jira, GitHub) for AI features. AG-UI protocol between frontend and backend.
- ARCH-13: **CI/CD Pipeline** — GitHub Actions for lint, type-check, Vitest on PRs. Vercel auto-deploys on merge to main.
- ARCH-14: **Webhook Pipeline Pattern** — HMAC validate → Event ID dedup → Zod parse → Supabase upsert → revalidateTag() → Realtime broadcast → 200 OK. Shared by Jira and GitHub.
- ARCH-15: **MCP Failover Strategy** — MCP tools try live query with 5s timeout → fall back to Supabase cache → include source in AI citation.
- ARCH-16: **Token Budget Enforcement** — Per-request: `maxTokens: 4000`. Per-session: 8,000 cumulative. Per-month: tracking in `ai_usage` table. Model routing: Haiku default, Sonnet for reports/complex.
- ARCH-17: **Jira Webhook Refresh Automation** — `/api/cron/refresh-webhooks` cron route on 25-day cycle. Secured by `CRON_SECRET` header. Failed refreshes → dead letter.
- ARCH-18: **Feature Module Structure** — `src/modules/{feature}/` with components, hooks, actions, types, tests. Shared UI in `src/components/`, utilities in `src/lib/`.

**From UX Design Document:**

- UX-1: **Collapsible Sidebar Navigation** — 256px expanded / 64px collapsed. Keyboard toggle `[`. Role-conditional sections absent from DOM (not just hidden). Active item: Turmeric Gold 4px left border accent.
- UX-2: **Page Header Bar** — Page title, data freshness display, alerts badge with unread count, AI toggle button, user menu with role badge. 64px height.
- UX-3: **12-Column Dashboard Grid** — CSS Grid. Cards snap to columns: small=3col, medium=4col, large=6col, full=12col. Gap: 24px. Max content width: 1440px.
- UX-4: **Dashboard Section Layout** — Row 1: 4 Key Metric Cards. Row 2: Sprint Progress + Recent Activity. Row 3: Blockers & Alerts + PR Feed. Row 4: AI-Generated Widgets section.
- UX-5: **Spice Palette Design Tokens** — Full color system (brand, semantic, status, role badge colors), typography scale (Inter font stack), 4px-based spacing scale, warm-tinted shadows, border radius tokens, animation tokens.
- UX-6: **AI Sidebar Panel** — 400px width, slides from right, main content compresses. Chat messages, streaming responses, report rendering, widget preview with "Add to Dashboard" flow. Quick action chips contextual to current view.
- UX-7: **AI Widget Generation UX Flow** — 4-step process: request → processing stages → widget preview inline → confirm/edit/ignore. Persistent widgets get Turmeric Gold top-border accent.
- UX-8: **Login Page Layout** — Centered card (max-width 400px) on Cream background. Email magic link + Google OAuth + GitHub OAuth buttons. No sidebar/header.
- UX-9: **Responsive Breakpoints** — Desktop XL (1440px+), Desktop (1280px+), Desktop SM (1024px+), Tablet (768px+), Mobile (<768px, not supported in MVP).
- UX-10: **Loading States** — Per-widget skeletons with shimmer animation. `<WidgetSkeleton variant="chart|table|stats|list" />`. No full-page spinners.
- UX-11: **Error States** — Per-widget error boundaries with retry button. Integration-specific degradation with staleness badges. AI unavailable message (dashboard unaffected). Network offline overlay.
- UX-12: **Data Freshness Indicators** — Silent when current. "Last updated: X min ago" when >2min. Amber badge >10min. Chili Red badge >30min.
- UX-13: **Accessibility (WCAG 2.1 AA)** — Color contrast verified for all combinations. Keyboard navigation with visible focus indicators. Screen reader support with aria-live regions. Reduced motion support.
- UX-14: **Stakeholder Dashboard Variant** — Same layout, admin controls removed, individual dev metrics hidden, PR code links hidden, widget generation disabled, "Read-only" badge.
- UX-15: **Component Patterns** — Card variants (default, metric, alert, AI-generated, interactive). Button hierarchy (primary, secondary, ghost, destructive, AI action). Badge types. Data tables with sorting/filter/pagination. Form patterns. Modal/dialog. Toast notifications.
- UX-16: **Keyboard Shortcuts** — `[` sidebar toggle, `Cmd+K` AI sidebar, `Escape` close, `G then D/U/I/S` vim-style navigation.

### FR Coverage Map

{{requirements_coverage_map}}

## Epic List

{{epics_list}}
