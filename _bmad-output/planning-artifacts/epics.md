---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics']
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

FR1: Epic 2 - User registration (magic link, Google OAuth, GitHub OAuth)
FR2: Epic 2 - User login with role-appropriate JWT session
FR3: Epic 2 - Route-level access control via edge middleware
FR4: Epic 2 - Data-level access control via server-side authorization
FR5: Epic 2 - Row-level data isolation via Supabase RLS policies
FR6: Epic 2 - Admin creates user accounts and assigns roles
FR7: Epic 2 - Admin views and manages users and role assignments
FR8: Epic 2 - Unauthenticated users redirected to login
FR9: Epic 2 - Insufficient privileges redirected to role-appropriate dashboard
FR10: Epic 3 - Unified dashboard displaying ecosystem-wide health data
FR11: Epic 4 - Sprint progress summaries across all Jira projects
FR12: Epic 5 - GitHub PR activity across all connected repositories
FR13: Epic 3 - Key metric cards (stories, PRs, bugs, deployments)
FR14: Epic 3 - Team activity summaries
FR15: Epic 3 - Blocker indicators with drill-down
FR16: Epic 3 - Click dashboard item for full details
FR17: Epic 3 - Stakeholder read-only dashboard mode
FR18: Epic 3 - Staleness indicators when data >10 minutes old
FR19: Epic 3 - Widget failure isolation (per-widget error boundaries)
FR20: Epic 4 - Connect to Jira Cloud REST API v3
FR21: Epic 4 - Fetch sprint data, issues, epics across 6 projects
FR22: Epic 4 - Receive Jira webhook events
FR23: Epic 4 - Validate Jira webhook payloads (shared secret)
FR24: Epic 4 - Auto-refresh Jira webhook registrations (30-day expiry)
FR25: Epic 4 - Handle Jira API rate limits (429) with exponential backoff
FR26: Epic 5 - Connect to GitHub API via Octokit
FR27: Epic 5 - Fetch repos, PRs, commits, CI status
FR28: Epic 5 - Receive GitHub webhook events
FR29: Epic 5 - Validate GitHub webhooks (HMAC-SHA256)
FR30: Epic 6 - AI chat sidebar panel within dashboard
FR31: Epic 6 - AI streaming responses via SSE
FR32: Epic 6 - AI queries live Jira data via MCP
FR33: Epic 6 - AI queries live GitHub data via MCP
FR34: Epic 6 - AI role-aware responses
FR35: Epic 6 - AI source citations in responses
FR36: Epic 6 - AI graceful degradation (dashboard unaffected)
FR37: Epic 6 - AI unavailability status message
FR38: Epic 7 - AI sprint status report generation
FR39: Epic 7 - AI stakeholder progress summary generation
FR40: Epic 7 - AI reports include "data as of" timestamp
FR41: Epic 7 - AI widget generation via natural language
FR42: Epic 7 - AI widgets rendered as metric cards, charts, tables
FR43: Epic 7 - AI widget configs persisted to database
FR44: Epic 7 - Pre-built static widgets as fallback
FR45: Epic 4 - Cache Jira/GitHub data in Supabase
FR46: Epic 4 - ISR cache tag revalidation on webhook receipt
FR47: Epic 5 - Supabase Realtime pushes live updates to dashboards
FR48: Epic 4 - Idempotent webhook event processing
FR49: Epic 4 - Out-of-order webhook resolution via timestamps
FR50: Epic 4 - Dead letter logging for failed webhook payloads
FR51: Epic 8 - Admin views integration connection status
FR52: Epic 8 - Admin views webhook health status
FR53: Epic 8 - Admin views AI API usage metrics
FR54: Epic 8 - Admin configures integration credentials
FR55: Epic 8 - Token budget cap on AI requests
FR56: Epic 8 - Rate limit event logging with warnings at 50%

## Epic List

### Epic 1: Project Foundation & Design System
Users can access a professionally styled, properly scaffolded application with the CurryDash spice-themed design system, database schema, and shared infrastructure in place.
**FRs covered:** Foundational — enables all subsequent epics
**Additional reqs:** ARCH-1, ARCH-2, ARCH-3, ARCH-8, ARCH-10, ARCH-11, ARCH-18, UX-5, UX-15

### Epic 2: Identity & Access Management
Users can register, log in, and access role-appropriate content with security enforced at every layer — from routing to data queries.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9
**Additional reqs:** ARCH-4, NFR-S1, NFR-S2, NFR-S6, NFR-S7, NFR-S9, NFR-S10, UX-8, UX-16

### Epic 3: Dashboard Shell & Data Visualization
Authenticated users can view a unified dashboard with navigation, metric cards, widget grid, and drill-down capability — all role-filtered and failure-isolated.
**FRs covered:** FR10, FR13, FR14, FR15, FR16, FR17, FR18, FR19
**Additional reqs:** ARCH-6, UX-1, UX-2, UX-3, UX-4, UX-9, UX-10, UX-11, UX-12, UX-13, UX-14, NFR-P1, NFR-P2, NFR-P3, NFR-R2

### Epic 4: Jira Integration & Live Sprint Data
The dashboard displays live Jira sprint progress, issues, and blocker details — updated automatically via webhooks with rate-limit compliance and data freshness transparency.
**FRs covered:** FR11, FR20, FR21, FR22, FR23, FR24, FR25, FR45, FR46, FR48, FR49, FR50
**Additional reqs:** ARCH-7, ARCH-9, ARCH-14, ARCH-17, NFR-S5, NFR-I1, NFR-I2, NFR-I3, NFR-I4, NFR-I6, NFR-I8, NFR-R4, NFR-R7, NFR-SC4

### Epic 5: GitHub Integration & Repository Activity
The dashboard displays live GitHub PR activity, CI status, and commit feeds — updated via webhooks with signature validation and real-time push to connected clients.
**FRs covered:** FR12, FR26, FR27, FR28, FR29, FR47
**Additional reqs:** ARCH-9, ARCH-14, NFR-S4, NFR-I5, NFR-I8, NFR-R6

### Epic 6: AI Assistant & Project Intelligence
Users can interact with an AI chat sidebar that answers project questions using live Jira and GitHub data via MCP, with role-aware responses and source citations — while the dashboard continues to function independently of AI availability.
**FRs covered:** FR30, FR31, FR32, FR33, FR34, FR35, FR36, FR37
**Additional reqs:** ARCH-12, ARCH-15, ARCH-16, NFR-S3, NFR-S8, NFR-P4, NFR-P5, NFR-R3, NFR-SC2, NFR-I7, UX-6

### Epic 7: AI Reports & Widget Generation
Users can request AI-generated sprint reports and stakeholder summaries, and create persistent dashboard widgets through natural language — with pre-built static widgets as fallback.
**FRs covered:** FR38, FR39, FR40, FR41, FR42, FR43, FR44
**Additional reqs:** UX-7, NFR-P6, NFR-P7

### Epic 8: System Administration & Observability
Admin users can monitor integration health, webhook status, AI costs, and rate limit consumption — with visibility into system operations and the ability to investigate failures.
**FRs covered:** FR51, FR52, FR53, FR54, FR55, FR56
**Additional reqs:** ARCH-13, NFR-P9, NFR-P10, NFR-R1, NFR-R5, NFR-SC1, NFR-SC3, NFR-SC5

---

## Epic 1: Project Foundation & Design System

Users can access a professionally styled, properly scaffolded application with the CurryDash spice-themed design system, database schema, and shared infrastructure in place.

### Story 1.1: Project Scaffold & Dependency Installation

As a developer,
I want a properly initialized Next.js 15 project with all required dependencies installed and the project structure established,
So that all subsequent feature development has a consistent, production-ready foundation.

**Acceptance Criteria:**

**Given** the project repository exists with the current codebase
**When** the developer initializes the new scaffold using the Vercel Supabase Starter
**Then** a Next.js 15 App Router project is created with TypeScript strict mode enabled
**And** all core dependencies are installed (shadcn/ui, Auth.js, jira.js, Octokit, Zustand, Zod)
**And** all dev dependencies are installed (Vitest, Playwright, Prettier, ESLint, Husky, lint-staged)
**And** the `src/` directory structure matches the Architecture document (`src/app/`, `src/components/`, `src/modules/`, `src/lib/`, `src/stores/`, `src/types/`, `src/test-utils/`, `src/mastra/`)
**And** the `@/` import alias resolves to the `src/` directory
**And** `.env.example` is created with all required environment variable placeholders (Supabase, Auth.js, Jira, GitHub, Anthropic, Cron Secret)
**And** `.env.local` is gitignored
**And** `components.json` is configured for shadcn/ui with stone base
**And** shadcn/ui components are installed (button, card, input, table, badge, dialog, toast, sidebar, chart, data-table)
**And** the dev server starts without errors using `npm run dev`

### Story 1.2: Supabase Database Schema & Migrations

As a developer,
I want all database tables created with proper relationships, indexes, and JSONB metadata columns,
So that the application has a complete data model ready for feature development.

**Acceptance Criteria:**

**Given** a Supabase project is connected and the `supabase/` directory exists
**When** the developer runs the database migrations
**Then** the following tables are created with proper column types and constraints:
- `roles` table with the 4 MVP roles (admin, developer, qa, stakeholder)
- `users` table with auth fields, role FK, profile data, and `metadata` JSONB column
- `teams` and `team_members` tables for team organization
- `jira_projects`, `jira_sprints`, `jira_issues` tables with JSONB `raw_payload` columns
- `github_repos`, `github_pull_requests` tables with JSONB `raw_payload` columns
- `webhook_events` table for event ID deduplication (event_id unique, source, processed_at)
- `dead_letter_events` table for failed webhook payloads (raw_payload JSONB, error text, created_at)
- `dashboard_widgets` table for widget configs (user_id FK, widget_config JSONB, position, role)
- `notifications` table linked to users
- `ai_chat_sessions` table for conversation persistence
- `system_health` table for integration status tracking
**And** all tables use `snake_case` naming with `created_at` and `updated_at` timestamptz columns
**And** foreign keys follow `{table_singular}_id` convention
**And** indexes are created on frequently queried columns (`idx_issues_status`, `idx_webhook_events_event_id`)
**And** RLS is enabled on every table (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
**And** a seed file (`supabase/seed.sql`) creates the 4 default roles and a test admin user
**And** migrations can be applied cleanly to a fresh Supabase instance

### Story 1.3: Spice Palette Design System & Theme Configuration

As a user,
I want the application to have a warm, professional CurryDash spice-themed visual identity,
So that the interface feels approachable yet credible as an operations center.

**Acceptance Criteria:**

**Given** shadcn/ui is initialized with stone base
**When** the design system is applied via `src/app/globals.css`
**Then** all CSS custom properties from the UX spec are defined:
- Brand colors: `--color-turmeric` (#E6B04B), `--color-chili` (#C5351F), `--color-coriander` (#4A7C59), `--color-cinnamon` (#5D4037), `--color-cream` (#FFF8DC)
- Semantic colors: `--color-background`, `--color-surface`, `--color-text-primary`, `--color-text-secondary`, `--color-border`, etc.
- Status colors: `--color-status-done`, `--color-status-in-progress`, `--color-status-blocked`, `--color-status-to-do`, `--color-status-in-review`
- Role badge colors for all 4 roles
**And** shadcn/ui CSS variables (`--primary`, `--accent`, `--destructive`, etc.) are overridden with spice palette values
**And** the typography scale uses Inter font stack with sizes from `--text-xs` (12px) to `--text-4xl` (36px)
**And** the spacing scale uses 4px base unit from `--space-1` (4px) to `--space-12` (48px)
**And** elevation shadows use Cinnamon-tinted rgba (warm tone)
**And** border radius tokens are defined (`--radius-sm` through `--radius-full`)
**And** animation tokens are defined (`--transition-fast`, `--transition-normal`, `--transition-slow`, `--transition-spring`)
**And** role-specific theming works via `data-role` attribute on `<body>` element
**And** `prefers-reduced-motion: reduce` disables shimmer and slide animations
**And** body text (Cinnamon on Cream) passes WCAG AAA contrast (8.1:1)
**And** button text (white on brand colors) passes WCAG AA contrast

### Story 1.4: Shared UI Components & Error Handling Infrastructure

As a developer,
I want reusable shared components and a structured error handling system,
So that all features have consistent loading states, error recovery, and utility patterns.

**Acceptance Criteria:**

**Given** the design system tokens are in place
**When** the shared components are implemented in `src/components/shared/`
**Then** `<WidgetSkeleton variant="chart|table|stats|list" />` renders shimmer loading states matching widget card dimensions
**And** `<WidgetError />` displays an error message with a retry button styled with ghost button pattern
**And** `<ErrorBoundary fallback={<WidgetError />}>` wraps children and catches React render errors
**And** `<StalenessIndicator updatedAt={timestamp} />` displays nothing when <2min, secondary text when 2-10min, amber badge >10min, Chili Red badge >30min
**And** `<RoleGate allowedRoles={[...]}>` conditionally renders children based on user role (renders nothing for unauthorized, not greyed-out)
**And** `<RelativeTime timestamp={date} />` displays relative timestamps ("5 min ago", "1 hour ago")
**And** `src/lib/errors.ts` exports `AppError` base class with `AuthError`, `IntegrationError`, `ValidationError`, `RateLimitError` subclasses
**And** each error class includes `code` (string), `message` (string), and optional `data` properties
**And** `src/lib/logger.ts` exports a structured JSON logger with `{ level, message, correlationId, source, timestamp, data }` format
**And** logger supports levels: `debug`, `info`, `warn`, `error` with source tags (`webhook:jira`, `webhook:github`, `auth`, `ai`, `realtime`, `admin`)
**And** `src/lib/constants.ts` exports app-wide constants (`MAX_JIRA_CALLS_PER_MINUTE`, `JWT_EXPIRY_HOURS`, `STALENESS_AMBER_MS`, `STALENESS_RED_MS`)

### Story 1.5: Zustand Stores & Client State Infrastructure

As a developer,
I want lightweight client-side state stores for UI concerns and environment configuration documented,
So that dashboard interactivity has a consistent state management pattern separate from server data.

**Acceptance Criteria:**

**Given** Zustand is installed
**When** the stores are created in `src/stores/`
**Then** `useDashboardStore` manages `activeRole` (display preference) and dashboard view state
**And** `useFilterStore` manages dashboard filter selections (project, date range, status)
**And** `useSidebarStore` manages sidebar open/collapsed state
**And** all stores use `camelCase` action naming (e.g., `setActiveRole()`, `toggleSidebar()`, `updateFilter()`, `resetFilters()`)
**And** stores use `useShallow()` for multi-property selections to prevent unnecessary re-renders
**And** no business logic or server data is stored in Zustand — stores hold UI state only
**And** `src/types/roles.ts` exports the `Role` enum (`admin`, `developer`, `qa`, `stakeholder`) and `RolePermissions` type
**And** `src/types/api.ts` exports `ApiResponse<T>` (`{ data: T, error: null } | { data: null, error: ApiError }`) and `ApiError` types
**And** `src/types/database.ts` placeholder exists for Supabase generated types

---

## Epic 2: Identity & Access Management

Users can register, log in, and access role-appropriate content with security enforced at every layer — from routing to data queries.

### Story 2.1: Auth.js Configuration & Login Page

As a user,
I want to log in using email magic link, Google OAuth, or GitHub OAuth and land on my role-appropriate dashboard,
So that I can securely access Central Hub using my preferred authentication method.

**Acceptance Criteria:**

**Given** Auth.js v5 is configured with SupabaseAdapter
**When** a user navigates to `/login`
**Then** the login page renders a centered card (max-width 400px) on Cream background with the CurryDash logo above
**And** the card contains an email input with "Send Magic Link" button, an "or" divider, and Google OAuth and GitHub OAuth buttons
**And** no sidebar or header is rendered on the login page (authentication-focused layout)
**And** clicking "Send Magic Link" sends a magic link email to the provided address and shows a confirmation message
**And** clicking Google OAuth redirects to Google's consent screen and back to Central Hub on success
**And** clicking GitHub OAuth redirects to GitHub's authorization page and back to Central Hub on success
**And** on successful authentication, a JWT session is created with the user's role injected via JWT callback
**And** the JWT includes `role` claim from the user's database record
**And** the user is redirected to their role-appropriate dashboard: Admin → `/admin`, Developer → `/dev`, QA → `/qa`, Stakeholder → `/stakeholder`
**And** all authentication flows use HTTPS exclusively (NFR-S1)
**And** no sensitive data appears in browser console or client-side logs (NFR-S9)

### Story 2.2: Session Management & Security Hardening

As a user,
I want my session to remain active during my workday but expire securely when unused,
So that I have a seamless experience without compromising account security.

**Acceptance Criteria:**

**Given** a user has successfully authenticated
**When** a JWT session is created
**Then** the JWT expires after 24 hours (NFR-S2)
**And** a sliding refresh mechanism extends the session when the user is actively using the app
**And** session tokens are stored in HTTP-only cookies (not localStorage)
**And** CSRF protection is active on all state-mutating API routes (NFR-S10)
**And** HSTS headers are set on all responses
**And** when a session expires while a user is on a page, the next API call returns 401
**And** on 401, a toast displays "Your session has expired" and the user is redirected to `/login` after 2 seconds
**And** the page the user was on is stored in `sessionStorage` for post-login redirect
**And** after re-login, the user is returned to the page they were on before expiry
**And** the Supabase client variants are configured correctly:
  - `src/lib/supabase/client.ts` for browser (Client Components)
  - `src/lib/supabase/server.ts` for Server Components (read-only)
  - `src/lib/supabase/middleware.ts` for Middleware (cookie refresh)
  - `src/lib/supabase/admin.ts` for service role (webhooks, cron — bypasses RLS)

### Story 2.3: Edge Middleware & Route-Level RBAC

As a system administrator,
I want route-level access control enforced at the edge before any page renders,
So that unauthorized users never see content they shouldn't access, without any server round-trips for role checks.

**Acceptance Criteria:**

**Given** `src/middleware.ts` is configured as Edge Middleware
**When** any request hits a protected route
**Then** the middleware reads the JWT from the session cookie and extracts the `role` claim
**And** no database calls are made in middleware — role comes from JWT claims only
**And** unauthenticated users (no valid JWT) accessing any protected route are redirected to `/login` (FR8)
**And** authenticated users accessing routes outside their role scope are silently redirected to their role-appropriate dashboard — no error flash shown (FR9, UX principle P2)
**And** route-to-role mapping is enforced:
  - `/admin/*` — Admin role only
  - `/dev/*` — Developer role only
  - `/qa/*` — QA role only
  - `/stakeholder/*` — Stakeholder role only
**And** public routes (`/login`, `/register`, `/api/webhooks/*`) are accessible without authentication
**And** the Supabase cookie is refreshed on each middleware pass to keep the session alive

### Story 2.4: Server-Side Authorization & Supabase RLS Policies

As a system administrator,
I want data-level access control enforced at both the server component layer and database layer,
So that the three-layer RBAC model (edge + server + database) is complete with no gaps.

**Acceptance Criteria:**

**Given** Edge Middleware enforces route-level access (Story 2.3)
**When** a Server Component fetches data
**Then** an `auth()` helper function in `src/lib/auth.ts` reads the session and returns the current user with their role
**And** Server Components call `auth()` to verify role before rendering protected content or executing queries (FR4)
**And** Supabase RLS policies are created on every table containing user or project data (NFR-S7):
  - Admin role: read/write access to all rows
  - Developer role: read access to project data, read/write to own assignments
  - QA role: read access to project data, read/write to QA-related records
  - Stakeholder role: read-only access to aggregate project data (no individual developer metrics)
**And** RLS policies use `auth.jwt()->>'role'` to determine access level (FR5)
**And** the AI assistant cannot access or return data beyond the user's role permissions (NFR-S8)
**And** no security-by-UI-hiding — if data is forbidden, it's not in the query result, not just hidden in the UI (NFR-S6)
**And** API keys (Jira, GitHub, Anthropic) are only accessible from server-side code, never exposed to client components (NFR-S3)

### Story 2.5: Admin User Management

As an admin user,
I want to create, view, edit, and deactivate user accounts with role assignments,
So that I can control who has access to Central Hub and what they can do.

**Acceptance Criteria:**

**Given** an admin user navigates to `/admin/users`
**When** the page loads
**Then** a data table displays all registered users with columns: Name, Email, Role, Status, Actions (FR7)
**And** the table supports column sorting, search/filter bar, and pagination (10/25/50 per page)
**And** row hover shows a Cream tint highlight
**And** a "+" Add User" primary button is displayed above the table
**And** clicking "Add User" opens a modal dialog with: Email input (required), Role dropdown (Admin/Developer/QA/Stakeholder), Cancel and Create buttons
**And** on Create submission, the input is validated with Zod, a new user account is created via Server Action, and a toast confirms success (FR6)
**And** the new user appears in the table immediately without page refresh
**And** clicking "Edit" on an existing user opens a modal with prefilled fields and a role reassignment dropdown
**And** on Edit submission, changes are saved via Server Action, toast confirms, and the table updates
**And** clicking "Deactivate" shows a confirmation dialog: "Deactivate [name]? They will lose access."
**And** on confirmation, the user is deactivated (status changes to inactive, row shows muted state)
**And** the Server Action returns `{ data, error }` pattern — never throws (code-style rule)
**And** empty state shows "No team members yet." with an "Add User" button
**And** loading state shows skeleton rows (5 rows of grey bars)

---

## Epic 3: Dashboard Shell & Data Visualization

Authenticated users can view a unified dashboard with navigation, metric cards, widget grid, and drill-down capability — all role-filtered and failure-isolated.

### Story 3.1: App Shell Layout — Sidebar Navigation & Page Header

As an authenticated user,
I want a consistent application shell with collapsible sidebar navigation and an informative page header,
So that I can navigate Central Hub efficiently and always know where I am and how fresh the data is.

**Acceptance Criteria:**

**Given** an authenticated user lands on any dashboard page
**When** the app shell renders
**Then** a `(dashboard)` layout group wraps all authenticated views with sidebar + header shell
**And** the sidebar is pinned to the left edge at 256px width (expanded, default on desktop)
**And** the sidebar contains: CurryDash logo + "Central Hub" text at top, "Dashboard" nav item (always visible), "ADMIN" section label with Users/Integrations/System Health items (admin role only), user avatar + name + role badge + collapse toggle at bottom
**And** the ADMIN section is completely absent from the DOM for non-admin roles (not hidden, not disabled — absent)
**And** the active nav item shows a Turmeric Gold 4px left border accent with subtle background tint
**And** pressing `[` toggles the sidebar between expanded (256px) and collapsed (64px icon-only with tooltips)
**And** the collapsed state shows icons only with tooltip labels on hover
**And** keyboard navigation works: Tab/Shift+Tab between items, Enter/Space to activate
**And** the page header spans the content area (right of sidebar) at 64px height
**And** the header contains: page title (left), data freshness display, alerts bell with unread count badge (Chili Red), AI toggle button (Turmeric Gold when active), user dropdown menu (avatar + name + role badge → Profile, Theme toggle, Logout)
**And** data freshness shows "Last updated: just now" when <2min, "Last updated: X min ago" when >2min
**And** `Cmd+K` / `Ctrl+K` toggles the AI sidebar (placeholder for Epic 6)
**And** `G then D` navigates to Dashboard, `G then U` to Users, `G then I` to Integrations, `G then S` to System Health (vim-style 500ms timeout)
**And** `Escape` closes any open modal or sidebar
**And** a skip-to-content link is the first focusable element (visible on focus)
**And** focus indicators use 2px solid Turmeric Gold outline with 2px offset

### Story 3.2: Dashboard Grid & Config-Driven Widget System

As an authenticated user,
I want a responsive dashboard grid that displays widgets appropriate for my role with independent loading and error handling,
So that I see relevant information immediately and one broken widget never takes down my whole dashboard.

**Acceptance Criteria:**

**Given** a user navigates to their role-appropriate dashboard (`/admin`, `/dev`, `/qa`, `/stakeholder`)
**When** the dashboard page renders
**Then** the main content area uses a 12-column CSS Grid layout with `--space-6` (24px) gap
**And** max content width is 1440px, centered for ultra-wide screens, with `--space-6` padding on all sides
**And** a widget registry in `src/modules/dashboard/config/widget-registry.ts` maps `role → widget[]` configuration
**And** each widget config specifies: component, grid column span (3/4/6/12), data source, and refresh behavior
**And** each widget is wrapped in `<ErrorBoundary fallback={<WidgetError />}>` so one crash doesn't affect others (FR19, NFR-R2)
**And** each widget independently shows `<WidgetSkeleton>` while its data loads (no full-page loading state)
**And** fast widgets appear first while slow widgets continue to shimmer
**And** widget cards use white surface with `--shadow-sm`, `--radius-md`, and `--space-5` padding
**And** card hover elevates to `--shadow-md` with `--transition-fast`
**And** the dashboard page is a thin Server Component wrapper that composes from `src/modules/dashboard/components/`
**And** dashboard initial page load completes in <3 seconds TTFCP (NFR-P1)
**And** client-side navigation between dashboard views completes in <500ms (NFR-P2)

### Story 3.3: Key Metric Cards & Team Activity Feed

As a project manager,
I want to see key project metrics at a glance and a chronological feed of recent team activity,
So that I can assess project health within 5 seconds of opening the dashboard (Glanceable Truth principle).

**Acceptance Criteria:**

**Given** the dashboard grid is rendered with widget registry
**When** the key metrics row loads (Row 1: 4 x 3-column cards)
**Then** each metric card displays: metric label (text-sm, secondary color), metric value (text-3xl, semibold), trend indicator (arrow up/down + delta + period), and optional mini progress bar or sparkline (FR13)
**And** the 4 default metric cards are: "Stories Completed", "PRs Merged", "Bugs Open", "CI Status"
**And** trend colors use `--color-success` for positive, `--color-error` for negative, `--color-text-muted` for neutral
**And** metric cards use placeholder/mock data until Jira and GitHub integrations are connected (Epics 4-5)
**And** each card renders in <1 second independently (NFR-P3)
**When** the team activity feed loads (Row 2 right: 6-column card)
**Then** a chronological feed displays up to 10 recent events, scrollable within the card (FR14)
**And** each event shows: avatar/icon + actor name + action verb + target + relative timestamp
**And** event types include: PR merged, issue transitioned, commits pushed, webhook sync
**And** clicking any activity item navigates to the detail view for that item
**And** the feed uses placeholder data until integrations are connected
**And** `aria-live="polite"` is set on the feed container for screen reader updates

### Story 3.4: Blocker Indicators & Drill-Down Detail Views

As a project manager,
I want blocker and alert indicators with the ability to drill down into issue and PR details,
So that I can quickly identify and investigate problems without leaving Central Hub.

**Acceptance Criteria:**

**Given** the dashboard grid is rendered
**When** the Blockers & Alerts card loads (Row 3 left: 6-column card)
**Then** a priority-sorted list displays items requiring attention (FR15)
**And** blocker items show: Chili Red 4px left-border accent, issue key, title, "blocked · X days" duration
**And** warning items show: Turmeric Gold 4px left-border accent, description, source
**And** a critical count badge appears in the card header (e.g., "2 blockers")
**And** empty state displays "No blockers — all clear" with a Coriander Green checkmark
**And** staleness indicators appear on any widget whose data is >10 minutes old (amber badge) or >30 minutes old (Chili Red badge) (FR18)
**When** a user clicks any dashboard item (issue, PR, activity item)
**Then** a detail panel slides in or expands inline showing full context (FR16):
  - Jira issue detail: Key, Title, Status, Assignee, Priority, Description, Linked PRs. Actions: "Open in Jira" (external link), "Copy link"
  - PR detail: Number, Title, Repo, Author, Status, Reviewers, CI Status. Actions: "Open in GitHub" (external link), "Copy link"
**And** breadcrumbs appear below the header for detail views: "Dashboard > Sprint CUR-42 > CUR-312 (Payment Timeout)"
**And** browser back button returns to the dashboard with scroll position preserved
**And** detail data uses placeholder content until integrations are connected

### Story 3.5: Stakeholder Dashboard Variant & Responsive Behavior

As a stakeholder user,
I want a read-only dashboard view optimized for my oversight role, accessible across desktop and tablet,
So that I can monitor project progress without being overwhelmed by operational details I don't need.

**Acceptance Criteria:**

**Given** a user with the Stakeholder role logs in
**When** they are redirected to `/stakeholder`
**Then** the dashboard renders with the same grid layout as the admin dashboard (FR17)
**And** the sidebar does NOT contain Users, Integrations, or System Health nav items (completely absent from DOM)
**And** team activity shows aggregate data only ("5 PRs merged this week" not individual developer attribution)
**And** PR entries show titles but NOT code links (links to GitHub code are hidden)
**And** AI widget generation is not offered (chat and report generation remain available)
**And** a subtle "Read-only" badge appears in the header (text-xs, muted)
**And** individual developer metrics are not rendered anywhere on the stakeholder view

**Given** the viewport width is between 1024px-1279px (Desktop SM)
**When** the dashboard renders
**Then** the sidebar auto-collapses to 64px icon-only mode
**And** the AI sidebar (when implemented) overlays content instead of compressing the grid
**And** metric cards remain 4-across at compressed width
**And** the dashboard grid switches to 2-column layout

**Given** the viewport width is between 768px-1023px (Tablet)
**When** the dashboard renders
**Then** the sidebar is hidden behind a hamburger menu (top-left)
**And** metric cards display in a 2-column grid (2 per row)
**And** Sprint progress and activity cards stack full-width
**And** data tables enable horizontal scroll

**Given** the viewport width is below 768px (Mobile)
**When** the page loads
**Then** a friendly message displays: "CurryDash Central Hub is optimized for desktop. For the best experience, please use a laptop or tablet."
**And** key metrics are shown in a simplified view (no charts, no AI sidebar)

---

## Epic 4: Jira Integration & Live Sprint Data

Connect to Jira Cloud across all 6 configured projects, receive webhook events, cache data in Supabase, and display live sprint progress on the dashboard — with idempotent processing, rate-limit resilience, and automatic webhook refresh.

### Story 4.1: Jira API Client & Authenticated Data Fetching

As a system integrator,
I want a Jira Cloud API client that authenticates securely and fetches sprint data, issues, and epics across all 6 configured projects,
So that the dashboard can display accurate Jira data without direct API calls on every page load.

**Acceptance Criteria:**

**Given** the Jira environment variables (`JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`) are configured
**When** the Jira client initializes
**Then** it authenticates against Jira Cloud REST API v3 using API token authentication (FR20)
**And** the client is implemented at `src/lib/jira-client.ts` following the existing codebase convention
**And** TypeScript interfaces are defined for all Jira response types: `JiraIssue`, `JiraSprint`, `JiraEpic`, `JiraProject`, `JiraWebhookEvent`
**And** all interfaces use `camelCase` properties (DB columns use `snake_case`, never mixed within the same layer per code-style rules)

**Given** the client is authenticated
**When** a data fetch is requested
**Then** the client can fetch sprint data, issues, and epics across all 6 configured projects: CUR, CAD, CAR, CPFP, PACK, CCW (FR21)
**And** fetched data is upserted into Supabase tables for cached dashboard queries (FR45)
**And** the Supabase upsert uses the `admin` client (service role, bypasses RLS) since this is a system-level operation
**And** never reads Jira APIs on page load — always from Supabase cache (ARCH-9, integration rules)

**Given** the Jira API returns a 429 (rate limit) response
**When** the client processes the response
**Then** it retries with exponential backoff: 1s, 2s, 4s, 8s, max 4 retries (FR25)
**And** each retry is logged at `warn` level with `{ message, correlationId, source: "webhook:jira", data: { attempt, delay } }`
**And** after max retries, the error is logged at `error` level and an `IntegrationError` is thrown (per error class convention)

**Given** any Jira API call fails with a non-rate-limit error
**When** the error is caught
**Then** it is wrapped in `IntegrationError` with the original status code and message
**And** the function returns `{ data: null, error: { code, message } }` — never throws from public API surface (code-style rule)

### Story 4.2: Jira Webhook Receiver & Validation Pipeline

As a system integrator,
I want a secure webhook endpoint that receives Jira events, validates them cryptographically, deduplicates, parses, and persists them,
So that dashboard data stays fresh without polling and no invalid or duplicate events corrupt the cache.

**Acceptance Criteria:**

**Given** the webhook route handler exists at `/api/webhooks/jira`
**When** a POST request arrives
**Then** the handler executes the pipeline in this exact sequence: HMAC-SHA256 validate → Event ID dedup → Zod parse → Supabase upsert → `revalidateTag()` → Realtime broadcast → 200 OK (ARCH-7, ARCH-9, ARCH-14, integration rules)
**And** the handler returns `NextResponse.json({ data, error }, { status })` with appropriate HTTP codes (code-style rule)

**Given** a webhook payload arrives
**When** the HMAC-SHA256 signature is validated
**Then** the handler computes HMAC-SHA256 using the shared secret from `JIRA_WEBHOOK_SECRET` env var (FR23, NFR-S5)
**And** if the signature does not match, the handler returns 401 Unauthorized immediately — no further processing
**And** all payloads with invalid credentials are rejected (NFR-S5)

**Given** a valid webhook payload arrives
**When** the Event ID dedup check runs
**Then** the handler queries the `webhook_events` table for the event ID (ARCH-14)
**And** if the event ID already exists, the handler returns 200 OK without reprocessing (FR48 — idempotent)
**And** if the event ID is new, it is inserted into `webhook_events` with timestamp before processing continues

**Given** a new (non-duplicate) event
**When** the payload is parsed
**Then** Zod schemas validate the event structure at the API boundary (ARCH-17)
**And** Zod schema names follow convention: `jiraWebhookEventSchema`, `jiraIssuePayloadSchema`
**And** if validation fails, the raw payload + error is written to `dead_letter_events` table (FR50)
**And** the handler returns 400 Bad Request

**Given** a valid, non-duplicate, parsed event
**When** data is persisted
**Then** the event data is upserted to the appropriate Supabase table using the admin client
**And** `revalidateTag('issues')` is called to trigger ISR cache invalidation (ARCH-9, FR46)
**And** a Realtime broadcast is sent on the `dashboard:{role}` channel for connected clients (FR47)
**And** the handler returns 200 OK

**Given** any step in the pipeline fails with a transient error
**When** the error is caught
**Then** the raw payload + error details are written to `dead_letter_events` for manual investigation (FR50)
**And** structured log entry at `error` level: `{ message, correlationId, source: "webhook:jira", data: { eventId, step, error } }`
**And** a correlation ID is generated per event and flows through the entire pipeline (integration rules)

### Story 4.3: Webhook Idempotency, Event Ordering & Burst Handling

As a system integrator,
I want webhook processing that handles duplicates, out-of-order delivery, transient failures, and traffic bursts gracefully,
So that dashboard data remains consistent even when Jira delivers events unreliably.

**Acceptance Criteria:**

**Given** Jira delivers the same webhook event multiple times
**When** the duplicate events are processed
**Then** only the first delivery modifies data; subsequent deliveries return 200 OK with no side effects (FR48)
**And** the `webhook_events` dedup table is checked before any data mutation

**Given** Jira delivers events out of chronological order
**When** an older event arrives after a newer event for the same entity
**Then** the handler compares event timestamps and skips the older event if a newer one has already been processed (FR49)
**And** the skipped event is logged at `info` level with reason "out-of-order: newer event already processed"

**Given** a webhook processing step fails with a transient error (network timeout, DB connection)
**When** the retry logic activates
**Then** the handler retries up to 3 times with exponential backoff: 1s, 5s, 30s (NFR-R4)
**And** after all retries are exhausted, the event is written to `dead_letter_events` with the raw payload and all error details (FR50)
**And** the handler returns 500 with a structured error response

**Given** a burst of webhook events arrives (e.g., bulk Jira update)
**When** 50+ events arrive within 1 minute
**Then** all events are processed without data loss (NFR-SC4: 50 events/min MVP target)
**And** if the queue overflows, excess events are logged to `dead_letter_events` rather than dropped silently (NFR-R7)
**And** webhook delivery success rate remains ≥95% after retries (NFR-I1)

### Story 4.4: Sprint Progress Dashboard Widget & Cache Revalidation

As a project manager,
I want a sprint progress widget on the dashboard that shows live progress across all 6 Jira projects,
So that I can see at a glance how each team is tracking against their sprint commitments.

**Acceptance Criteria:**

**Given** the dashboard grid is rendered and Jira data is cached in Supabase
**When** the Sprint Progress widget loads (Row 2 left: 6-column card)
**Then** a sprint progress card displays data for the active sprint across all 6 projects (FR11, FR21)
**And** the card header shows "Sprint [name]" with the sprint date range (start — end)
**And** each project row shows: project key/name, progress bar (stories completed / total), percentage, and story point count
**And** progress bars use `--color-success` for completed portion, `--color-surface-alt` for remaining
**And** the 6 projects displayed are: CUR, CAD, CAR, CPFP, PACK, CCW (FR21)

**Given** a Jira webhook event is received and processed
**When** `revalidateTag('issues')` is called by the webhook handler
**Then** the next page request serves fresh ISR data with updated sprint progress (ARCH-9, FR46)
**And** connected dashboard clients receive a Realtime broadcast and update the widget without page reload (FR47)

**Given** the sprint progress data is stale
**When** data age exceeds thresholds
**Then** an amber staleness badge appears when data is >10 minutes old
**And** a Chili Red staleness badge appears when data is >30 minutes old (FR18 from Epic 3)

**Given** a user clicks on a project row in the sprint progress widget
**When** the drill-down activates
**Then** a detail view shows all issues in that project's active sprint: issue key, title, status, assignee, story points
**And** issues are grouped by status column (To Do, In Progress, Done)
**And** blocker issues show the Chili Red left-border accent (FR15 from Epic 3)

**Given** the Jira integration is not yet connected or has failed
**When** the widget renders
**Then** it shows a graceful empty state: "Connect Jira to see sprint progress" with a link to integration settings
**And** the widget does NOT crash — `<ErrorBoundary>` catches any errors and shows `<WidgetError />` (FR19)

### Story 4.5: Jira Webhook Auto-Refresh & Integration Health Monitoring

As a system administrator,
I want Jira webhook registrations to auto-refresh before expiry and integration health to be monitored,
So that the Jira data pipeline never silently breaks due to expired webhooks.

**Acceptance Criteria:**

**Given** Jira webhooks have a 30-day expiry
**When** a cron job runs on a 25-day cycle
**Then** a secured route handler at `/api/cron/refresh-webhooks` re-registers all Jira webhook subscriptions (FR24)
**And** the route is secured by `CRON_SECRET` header validation — unauthenticated requests return 401
**And** the cron handler uses the Supabase admin client (service role)

**Given** a webhook refresh succeeds
**When** the new registration is confirmed
**Then** the new webhook ID and expiry date are logged at `info` level
**And** the previous webhook registration is deregistered to avoid duplicates

**Given** a webhook refresh fails
**When** the error is caught
**Then** the failure is written to `dead_letter_events` with the error details (FR50)
**And** an `error` level log is emitted: `{ message: "Webhook refresh failed", correlationId, source: "webhook:jira", data: { projectKey, error } }`
**And** the system continues operating with the existing webhook until it expires (graceful degradation)

**Given** the Jira integration encounters a persistent failure (API unreachable, auth expired)
**When** the failure is detected
**Then** the integration failure is isolated — it does not affect GitHub integration or AI features (integration failure isolation)
**And** dashboard widgets that depend on Jira data show staleness badges and degrade gracefully
**And** the System Health page (admin-only) displays Jira integration status with last-successful-sync timestamp

---

## Epic 5: GitHub Integration & Repository Activity

Connect to GitHub via Octokit across all connected repositories, receive webhook events for push/PR/workflow activity, cache data in Supabase, and display PR status, CI/CD results, and commit activity on the dashboard.

### Story 5.1: GitHub API Client & Repository Data Fetching

As a system integrator,
I want a GitHub API client that authenticates via OAuth token and fetches repository data, pull requests, commits, and CI status,
So that the dashboard can display accurate GitHub data from Supabase cache without direct API calls on page load.

**Acceptance Criteria:**

**Given** the GitHub environment variable (`GITHUB_TOKEN`) is configured
**When** the GitHub client initializes
**Then** it authenticates against the GitHub API using Octokit SDK with OAuth token authentication (FR26)
**And** the client is implemented at `src/lib/clients/github-client.ts` per the architecture module structure
**And** TypeScript interfaces are defined: `GitHubRepo`, `PullRequest`, `CommitActivity`, `WorkflowRun`, `GitHubWebhookEvent`
**And** all interfaces use `camelCase` properties (code-style rule)

**Given** the client is authenticated
**When** a data fetch is requested
**Then** the client can fetch repository data, pull requests, commits, and CI status for all connected repositories (FR27)
**And** fetched data is upserted into Supabase tables for cached dashboard queries (FR45)
**And** the Supabase upsert uses the `admin` client (service role, bypasses RLS)
**And** page loads never call GitHub APIs directly — always read from Supabase cache (ARCH-9, integration rules)

**Given** the GitHub API rate limit is 5,000 requests/hour
**When** the client monitors usage
**Then** normal operation consumes <10% of the rate limit (NFR-I5: <500 requests/hour)
**And** the remaining rate limit is tracked via response headers (`X-RateLimit-Remaining`)
**And** if remaining requests drop below 100, the client logs a `warn` level entry and throttles non-critical requests
**And** if a 429 response is received, the client retries with exponential backoff: 1s, 2s, 4s, 8s, max 4 retries

**Given** any GitHub API call fails with a non-rate-limit error
**When** the error is caught
**Then** it is wrapped in `IntegrationError` with the original status code and message
**And** the function returns `{ data: null, error: { code, message } }` — never throws from public API surface

**Given** a manual sync is triggered
**When** the Server Action `sync-repos` at `src/modules/github/actions/sync-repos.ts` is invoked
**Then** it fetches latest data from GitHub and upserts to Supabase
**And** it returns `{ data: { synced: number }, error: null }` on success (code-style rule: Server Actions never throw)

### Story 5.2: GitHub Webhook Receiver & Validation Pipeline

As a system integrator,
I want a secure webhook endpoint that receives GitHub events for push, pull request, and workflow run activities,
So that dashboard data updates in real-time when developers push code, open PRs, or CI pipelines complete.

**Acceptance Criteria:**

**Given** the webhook route handler exists at `/api/webhooks/github`
**When** a POST request arrives
**Then** the handler executes the pipeline in this exact sequence: HMAC-SHA256 validate → Event ID dedup → Zod parse → Supabase upsert → `revalidateTag('github-prs')` → Realtime broadcast → 200 OK (ARCH-7, ARCH-9, ARCH-14, integration rules)
**And** the handler returns `NextResponse.json({ data, error }, { status })` with appropriate HTTP codes

**Given** a webhook payload arrives
**When** the HMAC-SHA256 signature is validated
**Then** the handler computes HMAC-SHA256 using `GITHUB_WEBHOOK_SECRET` env var against the raw payload body (FR29)
**And** the signature is compared from the `X-Hub-Signature-256` header
**And** if the signature does not match, the handler returns 401 Unauthorized immediately — no further processing
**And** all payloads with invalid credentials are rejected (NFR-S5)

**Given** a valid webhook payload arrives
**When** the event type is checked
**Then** the handler processes these GitHub event types: `push`, `pull_request`, `workflow_run` (FR28)
**And** unrecognized event types are logged at `info` level and return 200 OK (acknowledge but ignore)

**Given** a new (non-duplicate) event
**When** the payload is parsed
**Then** Zod schemas validate the event structure: `githubWebhookEventSchema`, `githubPushPayloadSchema`, `githubPrPayloadSchema`, `githubWorkflowRunPayloadSchema` (ARCH-17)
**And** if validation fails, the raw payload + error is written to `dead_letter_events` table (FR50)

**Given** a valid, parsed event is persisted
**When** the Supabase upsert completes
**Then** `revalidateTag('github-prs')` is called for PR events and `revalidateTag('github-ci')` for workflow_run events (FR46)
**And** a Realtime broadcast is sent on `dashboard:{role}` channel (FR47)
**And** webhook processing latency from receipt to dashboard update is <30 seconds (NFR-P8)

**Given** any pipeline step fails
**When** the error is caught
**Then** the raw payload + error details are written to `dead_letter_events` (FR50)
**And** structured log: `{ message, correlationId, source: "webhook:github", data: { eventId, eventType, step, error } }`
**And** idempotency, dedup, and retry behavior follow the same patterns established in Epic 4 Story 4.3

### Story 5.3: PR Status & Code Review Dashboard Widget

As a developer,
I want a dashboard widget showing open pull requests with review status, CI results, and age,
So that I can quickly identify PRs that need my attention or are blocking the team.

**Acceptance Criteria:**

**Given** the dashboard grid is rendered and GitHub data is cached in Supabase
**When** the Pull Requests widget loads (dashboard card, 6-column span)
**Then** the widget displays GitHub pull request activity across all connected repositories (FR12)
**And** each PR row shows: repo name (abbreviated), PR number + title (linked), author avatar + name, review status (approved/changes requested/pending), CI status icon (green check/red X/yellow spinner), and age ("2d ago")
**And** PRs are sorted by most recently updated first
**And** a filter row allows toggling: "Needs Review", "Changes Requested", "Ready to Merge", "All"

**Given** a PR has the review status "changes requested"
**When** the widget renders
**Then** the row shows a Turmeric Gold left-border accent and "Changes Requested" badge

**Given** a PR has been open for more than 3 days without review
**When** the widget renders
**Then** the row shows an amber "Stale" indicator next to the age

**Given** a user clicks on a PR row
**When** the drill-down activates
**Then** a detail view shows: PR number, title, repository, author, status, reviewer list with individual review status, CI pipeline status (each check), lines changed (+/-), and description excerpt
**And** action buttons: "Open in GitHub" (external link, opens new tab), "Copy link"
**And** breadcrumbs: "Dashboard > Pull Requests > repo/org#123 (PR Title)"

**Given** a user has the Stakeholder role
**When** the PR widget renders on the `/stakeholder` dashboard
**Then** PR titles are shown but code links to GitHub are hidden (FR17 from Epic 3, Story 3.5)
**And** individual developer attribution is not shown — aggregated view only ("5 PRs merged this week")

**Given** the GitHub integration is not connected or has failed
**When** the widget renders
**Then** it shows: "Connect GitHub to see pull request activity" with a link to integration settings
**And** the widget does NOT crash — `<ErrorBoundary>` shows `<WidgetError />`

### Story 5.4: CI/CD Pipeline Status & Commit Activity Widget

As a developer,
I want a dashboard widget showing CI/CD pipeline results and recent commit activity,
So that I can monitor build health and team velocity at a glance.

**Acceptance Criteria:**

**Given** the dashboard grid is rendered and GitHub data is cached in Supabase
**When** the CI/CD Status widget loads (dashboard card, 6-column span)
**Then** the widget displays recent workflow runs with: workflow name, triggering branch/PR, status (success/failure/in-progress/queued), duration, and timestamp
**And** status icons use: Coriander Green checkmark for success, Chili Red X for failure, Turmeric Gold spinner for in-progress
**And** the most recent run for each workflow is prominently displayed at the top
**And** a summary row shows: "X passed, Y failed, Z running" for the last 24 hours

**Given** a CI workflow has failed
**When** the widget renders
**Then** the failed run row shows a Chili Red left-border accent
**And** clicking the row shows: workflow name, failure step, error summary (if available), link to "Open in GitHub Actions"
**And** if the same workflow has failed 3+ times consecutively, a "Recurring Failure" badge appears

**Given** the dashboard grid is rendered
**When** the Commit Activity section loads (within CI/CD widget or as a sub-card)
**Then** a mini sparkline or bar chart shows commit frequency over the last 14 days
**And** the chart uses `--color-primary` for bars/line
**And** a tooltip on hover shows: date and commit count for that day
**And** below the chart: "X commits this week" summary text

**Given** a GitHub webhook `workflow_run` event is received
**When** the webhook pipeline completes and `revalidateTag('github-ci')` fires
**Then** the CI/CD widget updates on the next page request (ISR) and live for connected clients (Realtime)
**And** processing latency from webhook receipt to dashboard update is <30 seconds (NFR-P8)

**Given** the GitHub integration is not connected
**When** the widget renders
**Then** it shows: "Connect GitHub to see CI/CD status" with a link to integration settings
**And** the widget degrades gracefully within its `<ErrorBoundary>`

---

## Epic 6: AI Assistant & Project Intelligence

Integrate CopilotKit frontend with Mastra backend to provide a role-aware AI chat sidebar that queries live Jira and GitHub data via MCP tools, streams responses in real-time, cites data sources, and degrades gracefully when the AI provider is unavailable.

### Story 6.1: Mastra AI Backend & Agent Configuration

As a system integrator,
I want a Mastra agent backend configured with model routing, token budgets, and role-specific system prompts,
So that the AI assistant can serve different roles cost-effectively while maintaining quality for complex queries.

**Acceptance Criteria:**

**Given** the Mastra backend is being set up
**When** the agent modules are created
**Then** the following files exist per the architecture module structure:
  - `src/mastra/agents/dashboard-agent.ts` — main CopilotKit-connected agent
  - `src/mastra/agents/report-agent.ts` — report generation agent
  - `src/mastra/tools/jira-tools.ts` — Jira query tools for agents
  - `src/mastra/tools/github-tools.ts` — GitHub query tools for agents
  - `src/mastra/tools/supabase-tools.ts` — direct DB query tools
**And** packages are installed: `@mastra/core` v1.2.0, `ai` (Vercel AI SDK 5.0), `@copilotkit/react-core` v1.51.x

**Given** a user sends a chat message
**When** the model routing logic evaluates the query
**Then** simple queries (status checks, data lookups, Q&A) route to Claude Haiku (ARCH-11)
**And** complex queries (report generation, multi-tool analysis, widget creation) route to Claude Sonnet (ARCH-11)
**And** the `ANTHROPIC_API_KEY` environment variable is used for authentication (server-side only)

**Given** any AI SDK completion call
**When** the call is constructed
**Then** `maxTokens: 4000` is enforced on every individual completion call (ARCH-11, cost control)
**And** a cumulative session token counter tracks total usage, stopping tool invocations at 8,000 total session tokens (ARCH-11)

**Given** a user with a specific role initiates a chat session
**When** the agent system prompt is assembled
**Then** the system prompt includes role-specific context and instructions (FR34):
  - Admin: full system access context, user management capabilities
  - Developer: technical depth, code-level details, CI/CD context
  - QA: testing focus, bug tracking, quality metrics context
  - Stakeholder: business metrics, aggregate data only, no code details or individual developer attribution
**And** the role is sourced from JWT claims (authoritative), not client-side state

**Given** token usage is tracked
**When** a completion call finishes
**Then** the token count is recorded in the `ai_usage` Supabase table with date and cost estimate
**And** the admin dashboard can query monthly spend (tracked for $50/month budget ceiling, ARCH-11)
**And** an alert is logged at `warn` level when monthly spend reaches 80% ($40 threshold)

### Story 6.2: CopilotKit AI Sidebar & Chat Interface

As an authenticated user,
I want an AI chat sidebar that I can toggle with a keyboard shortcut, send messages, and receive streamed responses,
So that I can ask questions about my project without leaving the dashboard.

**Acceptance Criteria:**

**Given** the CopilotKit frontend module is set up
**When** the AI sidebar components are created
**Then** the following files exist per the architecture module structure:
  - `src/modules/ai/copilot-provider.tsx` — CopilotKit provider + configuration
  - `src/modules/ai/ai-sidebar.tsx` — CopilotSidebar customization
  - `src/modules/ai/ai-status.tsx` — AI availability indicator
  - `src/modules/ai/use-copilot-context.ts` — `useCopilotReadable` for dashboard data injection
  - `src/modules/ai/use-copilot-actions.ts` — `useCopilotAction` definitions
**And** all interactive components use `"use client"` directive at leaf nodes only (never on layouts or wrappers)

**Given** a user is on any dashboard page
**When** they press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
**Then** the AI sidebar toggles open/closed (FR30, UX from Epic 3 Story 3.1)
**And** the sidebar slides in from the right edge over the dashboard content
**And** the AI toggle button in the page header shows Turmeric Gold when the sidebar is active

**Given** the AI sidebar is open
**When** a user types a message and sends it
**Then** the response streams in real-time using Server-Sent Events via the `/api/ai/copilotkit` route handler (FR31)
**And** the route handler requires an authenticated session with role claims (ARCH-12)
**And** time to first streamed token is <3 seconds (NFR-P4)
**And** total response time is <10 seconds (NFR-P5)

**Given** the AI sidebar is open
**When** the chat renders
**Then** it shows a session-based message history (user messages + AI responses)
**And** the current dashboard context is injected via `useCopilotReadable` — the AI knows which page the user is on, active sprint data, and visible widget data
**And** a "New chat" button clears session history and starts fresh
**And** a text input with send button and `Enter` to submit is at the bottom

**Given** the viewport width is between 1024px-1279px (Desktop SM)
**When** the AI sidebar is open
**Then** it overlays content instead of compressing the dashboard grid (responsive behavior from Epic 3 Story 3.5)

### Story 6.3: MCP Tool Integration for Live Data Queries

As an authenticated user,
I want the AI assistant to query live Jira and GitHub data when I ask project questions,
So that I get accurate, up-to-date answers about sprints, issues, PRs, and project status.

**Acceptance Criteria:**

**Given** a user asks the AI about Jira data (e.g., "What issues are in the current sprint?")
**When** the Mastra agent processes the query
**Then** the agent invokes Jira MCP tools to query live data (FR32)
**And** the MCP query has a 5-second timeout (ARCH-10)
**And** if the live query succeeds, the response is labeled "Live query" in the citation
**And** if the live query times out or fails, the agent falls back to Supabase cached data (ARCH-10)
**And** if using cached data, the response is labeled "Cached data as of [timestamp]" in the citation

**Given** a user asks the AI about GitHub data (e.g., "Show me open PRs needing review")
**When** the Mastra agent processes the query
**Then** the agent invokes GitHub MCP tools to query live data (FR33)
**And** the same 5-second timeout → cache fallback → source citation pattern applies (ARCH-10)

**Given** any AI response references project data
**When** the response is rendered
**Then** it includes a source citation: e.g., "Based on Jira JQL query across CUR, CAD, CAR..." or "From GitHub API: org/repo" (FR35)
**And** citations help users verify accuracy and catch potential hallucinations

**Given** a Mastra tool call fails
**When** the error is caught
**Then** the tool returns `{ data: null, error: { code, message } }` following the `{ data, error }` pattern (ARCH-12)
**And** the agent responds to the user: "I couldn't retrieve that data — [error context]" (ARCH-12, integration rules)
**And** the failure is logged with correlation ID: `{ message, correlationId, source: "ai", data: { tool, error } }`
**And** Supabase query tools have a 3-second timeout; Jira/GitHub tools have a 5-second timeout (ARCH-12)

**Given** the token budget check runs before each tool invocation
**When** the cumulative session tokens have reached 8,000
**Then** the agent stops invoking tools and responds with available context only (ARCH-11)
**And** the agent informs the user: "I've reached the query limit for this session. Start a new chat for more questions."

### Story 6.4: Role-Specific AI Behavior & Graceful Degradation

As a system administrator,
I want the AI assistant to enforce role-based data filtering and degrade gracefully when unavailable,
So that users only see data appropriate to their role and the dashboard never breaks due to AI issues.

**Acceptance Criteria:**

**Given** a user with the Stakeholder role interacts with the AI
**When** the AI responds with project data
**Then** responses contain aggregate data only — no individual developer names, code snippets, or GitHub code links (FR34)
**And** MCP queries are filtered by the stakeholder role context (e.g., no developer-level issue assignment details)
**And** the AI system prompt enforces: "You are assisting a stakeholder. Provide business-level summaries only."

**Given** a user with the Developer role interacts with the AI
**When** the AI responds
**Then** responses include full technical depth: code references, specific PR details, CI/CD logs, individual issue assignments (FR34)
**And** the AI can reference specific Jira issue keys and GitHub PR numbers

**Given** a user with the QA role interacts with the AI
**When** the AI responds
**Then** responses emphasize testing context: test coverage, bug counts, regression risks, quality metrics (FR34)

**Given** the Anthropic API is unavailable (timeout, 5xx, network failure)
**When** a user opens the AI sidebar
**Then** the `<AiStatus />` indicator shows "AI assistant is temporarily unavailable" (FR37, NFR-R3)
**And** the AI sidebar does not crash — it displays the status message cleanly
**And** the dashboard continues to function fully: all Jira/GitHub data, charts, navigation, and widgets work without AI (FR36, NFR-R3)
**And** the AI toggle button in the header shows a muted/grey state instead of Turmeric Gold

**Given** the AI provider becomes available again after an outage
**When** the next user request is sent
**Then** the AI resumes normal operation without requiring a page reload
**And** failed report requests (not chat) are queued for retry when service recovers

**Given** the AI generates a response
**When** accuracy is evaluated
**Then** the system targets a 70% accuracy floor as a go/no-go gate
**And** below threshold: AI scope reduces to report generation only (structured output from structured data = higher accuracy)
**And** accuracy is measured by admin review of AI responses vs actual project data (manual process in MVP)

---

## Epic 7: AI Reports & Widget Generation

Enable AI-powered sprint status reports, stakeholder progress summaries, and natural-language widget generation — with data freshness timestamps, persistent widget configs, and pre-built fallbacks when AI is unavailable.

### Story 7.1: AI Sprint Status Report Generation

As a project manager,
I want to request a sprint status report via the AI chat and receive a structured report generated from live Jira data,
So that I can quickly produce accurate sprint updates without manually compiling data from multiple projects.

**Acceptance Criteria:**

**Given** a user sends a message like "Generate a sprint status report" in the AI sidebar
**When** the Mastra report agent processes the request
**Then** the request routes to Claude Sonnet (complex query, multi-tool analysis) per model routing rules (ARCH-11, FR38)
**And** the report agent is `src/mastra/agents/report-agent.ts` with dedicated report tools at `src/mastra/tools/report-tools.ts`
**And** the agent invokes Jira MCP tools to query current sprint data across all 6 projects (CUR, CAD, CAR, CPFP, PACK, CCW)
**And** the MCP query follows the 5s timeout → Supabase cache fallback → source citation pattern (ARCH-10)

**Given** the report agent has gathered sprint data
**When** the report is generated
**Then** the report includes: sprint name and date range, per-project story completion (done / total + percentage), overall velocity trend (current vs previous sprint), blocker summary (count + top 3 by age), and a brief narrative summary
**And** the report is formatted in structured markdown for readability
**And** total report generation time is <15 seconds (NFR-P7)

**Given** any AI-generated report references project data
**When** the report renders in the chat sidebar
**Then** a "Data as of [timestamp]" footer is appended indicating when the underlying data was last refreshed (FR40)
**And** the timestamp reflects either the live MCP query time or the Supabase cache timestamp, whichever was used
**And** the data source is cited: "Based on Jira JQL query across CUR, CAD, CAR, CPFP, PACK, CCW" (FR35)

**Given** the AI provider is unavailable when a report is requested
**When** the request fails
**Then** the failed report request is queued for retry when the service recovers (graceful degradation — reports only, not chat)
**And** the user sees: "Report generation is temporarily unavailable. Your request has been queued and will complete when the AI service recovers."
**And** queued requests are stored with the original parameters so they can be retried without user re-entry

**Given** the report is generated successfully
**When** the user views it in the sidebar
**Then** they can copy the full report text to clipboard via a "Copy report" button
**And** the report respects role-based filtering — stakeholder-generated reports show aggregate data only (no individual developer attribution)

### Story 7.2: AI Stakeholder Progress Summary

As a stakeholder,
I want to request a high-level progress summary via the AI chat that presents business metrics without technical details,
So that I can quickly understand project health and communicate status to executive leadership.

**Acceptance Criteria:**

**Given** a stakeholder sends a message like "Give me a progress summary" in the AI sidebar
**When** the Mastra report agent processes the request
**Then** the request routes to Claude Sonnet (complex report generation) (ARCH-11, FR39)
**And** the agent queries both Jira and GitHub data via MCP tools for a holistic view

**Given** the report agent generates the stakeholder summary
**When** the summary renders
**Then** it includes: overall project health indicator (on track / at risk / behind), milestone completion percentage, key achievements this sprint (aggregated — e.g., "12 features delivered, 8 bugs resolved"), risk items and blockers (business impact framing, not technical details), and a forward-looking outlook
**And** the summary does NOT include: individual developer names, code-level details, specific PR numbers, CI/CD pipeline details, or GitHub code links (FR34 — stakeholder role filtering)
**And** all data references include source citations (FR35)
**And** "Data as of [timestamp]" footer is present (FR40)

**Given** a user with Developer or QA role requests a progress summary
**When** the report generates
**Then** the summary includes technical details appropriate to their role (specific issue keys, PR numbers, CI status)
**And** role context comes from JWT claims, not client-side state

**Given** the report completes
**When** the total generation time is measured
**Then** it completes within <15 seconds (NFR-P7)
**And** the user sees streaming partial output as the report is generated (FR31 — SSE streaming)

### Story 7.3: AI Widget Generation via Natural Language

As an authenticated user,
I want to describe a dashboard widget in natural language and have the AI generate it,
So that I can create custom visualizations without writing code or filing requests to the development team.

**Acceptance Criteria:**

**Given** a user sends a message like "Show me a chart of bugs by priority" in the AI sidebar
**When** the Mastra dashboard agent processes the request
**Then** the agent interprets the natural language description and generates a widget configuration (FR41)
**And** the request routes to Claude Sonnet (complex generation task) (ARCH-11)

**Given** the AI generates a widget configuration
**When** the configuration is produced
**Then** it specifies: widget type (metric card, bar chart, line chart, pie chart, or data table), data source query (Jira JQL, GitHub API, or Supabase query), display properties (title, axis labels, colors using CSS custom properties, grid column span), and refresh behavior (FR42)
**And** the widget type is one of: metric card, bar chart, line chart, pie chart, or data table (FR42)
**And** chart colors use spice-theme CSS custom properties — never hardcoded hex values (design-system rules)

**Given** the AI has generated a widget config
**When** the widget preview renders
**Then** it appears inline in the AI sidebar as a live preview
**And** the user can interact with the preview (hover for tooltips, click for drill-down if applicable)
**And** the widget is wrapped in `<ErrorBoundary fallback={<WidgetError />}>` (FR19)
**And** total widget generation + render time is <20 seconds (NFR-P6)

**Given** the user is satisfied with the preview
**When** they click "Add to dashboard"
**Then** the widget configuration is validated with Zod before persistence
**And** a confirmation appears: "Widget added to your dashboard"
**And** the widget appears in the dashboard grid at the next available position

**Given** the AI generates an invalid or broken widget config
**When** the preview fails to render
**Then** the error boundary catches it and shows `<WidgetError />`
**And** the AI acknowledges: "The widget couldn't be rendered. Would you like me to try a different approach?"

### Story 7.4: Widget Persistence & Pre-Built Fallbacks

As an authenticated user,
I want AI-generated widgets to be saved permanently to my dashboard and have reliable pre-built widgets available when AI is unavailable,
So that my custom visualizations persist across sessions and my dashboard always has useful content.

**Acceptance Criteria:**

**Given** a user confirms adding an AI-generated widget to their dashboard
**When** the "Add to dashboard" action fires
**Then** the widget configuration is persisted to the Supabase `dashboard_widgets` table (FR43)
**And** the config includes: user ID, widget type, data source, display properties, grid position, and creation timestamp
**And** the Server Action returns `{ data: { widgetId }, error: null }` on success (code-style rule)
**And** the Supabase upsert respects RLS — users can only create widgets for their own dashboard

**Given** a user returns to their dashboard in a new session
**When** the dashboard page loads
**Then** all persisted AI-generated widgets are loaded from Supabase and rendered alongside default widgets
**And** AI-generated widgets are rendered using the same `<ErrorBoundary>` and `<WidgetSkeleton>` patterns as built-in widgets
**And** widget load order: built-in widgets first (from widget registry), then AI-generated widgets appended

**Given** a user wants to manage their AI-generated widgets
**When** they interact with a persisted widget
**Then** a small "..." menu on the widget card offers: "Remove from dashboard" and "Regenerate"
**And** "Remove" soft-deletes the widget config (sets `deleted_at` timestamp, does not hard-delete)
**And** "Regenerate" sends the original natural-language prompt back to the AI for a fresh generation

**Given** AI widget generation is unavailable (AI provider down)
**When** the dashboard renders
**Then** pre-built static widgets serve as fallback content so the dashboard is never empty (FR44)
**And** the widget registry in `src/modules/dashboard/config/widget-registry.ts` includes default static widgets for each role
**And** static widgets display current data from Supabase cache (not dependent on AI)
**And** previously persisted AI-generated widgets continue to render from their saved config (they don't require AI to display)

**Given** the AI becomes available after an outage
**When** a user opens the AI sidebar
**Then** widget generation resumes normally without manual intervention
**And** previously queued report requests (from Story 7.1) are retried automatically

---

## Epic 8: System Administration & Observability

Admin-only pages for integration configuration, system health monitoring, AI usage tracking, dead letter event investigation, and in-app notifications — ensuring administrators can diagnose, configure, and maintain all external integrations from within the dashboard.

### Story 8.1: Integration Configuration Admin Page

As an admin user,
I want a page to configure, test, and monitor Jira and GitHub integration connections,
So that I can set up integrations, rotate credentials, and verify connectivity without touching environment variables or server config.

**Acceptance Criteria:**

**Given** an admin user navigates to `/admin/integrations`
**When** the page renders
**Then** the page is protected by Edge Middleware RBAC — only users with the `admin` role (from JWT claims) can access it
**And** non-admin users are redirected to their role-appropriate dashboard (never shown a 403 page)
**And** the page uses a Server Component wrapper composing from `src/modules/admin/components/integration-health.tsx`

**Given** the integrations page is displayed
**When** the integration cards render
**Then** a card is shown for each integration: Jira, GitHub, and Anthropic AI (FR54)
**And** each card displays: integration name + logo, connection status (Connected / Disconnected / Error), last successful sync timestamp (FR51), last webhook received timestamp with "last seen" relative time (FR52), and a status indicator (Coriander Green for connected, Turmeric Gold for degraded, Chili Red for error)

**Given** an admin wants to configure integration credentials
**When** they click "Configure" on an integration card
**Then** a form appears for entering/updating credentials:
  - Jira: Base URL, email, API token, webhook secret
  - GitHub: OAuth token, webhook secret
  - Anthropic: API key
**And** credentials are validated with Zod at the form boundary before submission
**And** API keys are never exposed to the client — only masked hints are shown (e.g., "sk-...a3f7") (NFR-S3, NFR-S9)
**And** the Server Action returns `{ data: { updated: true }, error: null }` on success — never throws (code-style rule)

**Given** an admin clicks "Test Connection" for an integration
**When** the connectivity test runs
**Then** the system makes a lightweight API call to verify credentials (e.g., Jira: fetch current user, GitHub: fetch authenticated user)
**And** success shows a Coriander Green "Connection verified" toast
**And** failure shows a Chili Red error message with the specific error (e.g., "401 Unauthorized — check your API token")
**And** credentials are stored server-side only — environment variables or encrypted Supabase secrets (NFR-S3)

**Given** one integration is down
**When** the page renders
**Then** the failed integration shows its error state but does NOT affect the status display of other integrations (NFR-I8 — integration failure isolation)

### Story 8.2: System Health Dashboard & Dead Letter Monitor

As an admin user,
I want a system health page showing webhook pipeline health, dead letter events, and the ability to inspect and retry failed events,
So that I can diagnose data pipeline issues and ensure no webhook events are permanently lost.

**Acceptance Criteria:**

**Given** an admin user navigates to `/admin/system-health` (or `/admin/system`)
**When** the page renders
**Then** the page is admin-only (Edge Middleware RBAC, JWT role check)
**And** the page composes from `src/modules/admin/components/webhook-monitor.tsx`

**Given** the system health overview section renders
**When** webhook pipeline metrics are displayed
**Then** the following metrics are shown:
  - Webhook success rate: processed / total received, displayed as percentage with color coding (≥99% green, ≥95% amber, <95% red) (NFR-I1)
  - Events processed today: count with trend vs yesterday
  - Average processing latency: time from receipt to dashboard update (NFR-I3: target <5 min)
  - Dead letter queue depth: count of unresolved failed events
**And** each metric uses the standard metric card format from Epic 3 Story 3.3

**Given** the dead letter events section renders
**When** failed events are listed
**Then** a table displays: event ID, source (Jira/GitHub), event type, failure reason, failure timestamp, retry count, and status (pending/retried/resolved)
**And** rows are sorted by most recent failure first
**And** clicking a row expands to show: raw payload (JSON, syntax highlighted), full error stack trace, correlation ID, and pipeline step where failure occurred
**And** dead letter events are available for investigation within 1 hour of failure (NFR-I6)

**Given** an admin wants to retry a dead letter event
**When** they click "Retry" on a failed event
**Then** the Server Action at `src/modules/admin/actions/retry-dead-letter.ts` reprocesses the raw payload through the full webhook pipeline (validate → dedup → parse → upsert → revalidate → broadcast)
**And** the action returns `{ data: { retried: true, eventId }, error: null }` on success
**And** on retry failure, the error is appended to the event's retry history (not overwritten)
**And** a "Retry All" button is available for bulk retry of all pending dead letter events

**Given** rate limit events are logged
**When** the rate limit section renders
**Then** it shows: recent 429 responses with remaining quota and retry timing (FR56)
**And** a warning banner appears when API consumption exceeds 50% of limits (FR56)
**And** Jira shows calls/minute vs limit; GitHub shows requests/hour vs 5,000 limit (NFR-I4, NFR-I5)

### Story 8.3: AI Usage Tracking & Cost Dashboard

As an admin user,
I want a dashboard widget showing AI API costs, query counts, and model usage breakdown,
So that I can monitor spending against the $50/month budget and adjust model routing if costs are trending high.

**Acceptance Criteria:**

**Given** an admin views the system health page or admin dashboard
**When** the AI cost tracker widget renders
**Then** the widget composes from `src/modules/admin/components/ai-cost-tracker.tsx`
**And** it displays: current month total spend (dollar amount, large text), budget consumption bar ($0–$50 range with fill), daily spend trend (sparkline or bar chart for last 30 days), total query count this month, and model split breakdown (Haiku vs Sonnet query counts + cost per model) (FR53)

**Given** the monthly AI spend data is loaded from the `ai_usage` Supabase table
**When** the budget bar renders
**Then** the fill color is Coriander Green when <60%, Turmeric Gold when 60-80%, and Chili Red when >80%
**And** at 80% ($40), a `warn` level log is emitted and an in-app notification is generated (ARCH-11 budget alert)
**And** the $50 ceiling and 80% threshold are referenced from configuration, not hardcoded

**Given** individual AI request costs are tracked
**When** an admin drills into the cost breakdown
**Then** a table shows: date, query count, Haiku queries, Sonnet queries, total tokens, estimated cost
**And** the most expensive individual requests are highlighted (top 5 by token count)

**Given** the token budget enforcement is active (FR55)
**When** the widget renders
**Then** it shows the per-request cap (4,000 tokens) and per-session cap (8,000 tokens) as reference
**And** a count of requests that hit the token cap is displayed ("X requests capped this month")

**Given** the AI provider has been unavailable during the month
**When** the widget renders
**Then** downtime periods are shown as gaps in the daily trend chart
**And** a "AI Availability" percentage is displayed (uptime / total hours this month)

### Story 8.4: Notification System & Admin Alerting

As an admin user,
I want in-app notifications for critical system events like webhook failures, integration disconnections, and AI budget thresholds,
So that I am immediately aware of issues requiring my attention without monitoring dashboards continuously.

**Acceptance Criteria:**

**Given** the notification bell icon exists in the page header (Epic 3 Story 3.1)
**When** unread notifications exist
**Then** a Chili Red badge shows the unread count on the bell icon
**And** clicking the bell opens a dropdown panel with a chronological list of notifications
**And** each notification shows: icon (type-specific), title, description, relative timestamp, and read/unread state

**Given** a system event occurs that warrants admin notification
**When** the event is processed
**Then** a notification record is created in the Supabase `notifications` table (linked to admin user IDs)
**And** the following events generate notifications:
  - Webhook failure: "Jira webhook processing failed — [event type] — [error summary]"
  - Dead letter queue growth: "X failed events in dead letter queue — review required"
  - Integration disconnection: "[Integration] connection lost — last successful sync [timestamp]"
  - AI budget threshold: "AI spend has reached 80% ($40) of monthly budget ($50)"
  - Webhook refresh failure: "Jira webhook auto-refresh failed — [project key] — manual re-registration may be required" (GAP-C1: two consecutive failures trigger notification)
  - Rate limit warning: "[Integration] API consumption exceeds 50% — [current/limit]" (FR56)

**Given** an admin reads a notification
**When** they click on it
**Then** the notification is marked as read (visual state changes to muted)
**And** if the notification is actionable (e.g., dead letter failure), clicking navigates to the relevant admin page (e.g., `/admin/system-health`)
**And** a "Mark all as read" button is available at the top of the dropdown

**Given** the notification system operates
**When** notifications are created
**Then** they are written using the Supabase admin client (service role)
**And** RLS policies ensure only the target user can read their own notifications
**And** Supabase Realtime pushes new notifications to connected admin clients on the `dashboard:admin` channel
**And** notifications older than 30 days are eligible for cleanup (soft delete)

**Given** a non-admin user is logged in
**When** system-level events occur
**Then** admin notifications are NOT visible to non-admin users (completely absent from their notification feed)
**And** non-admin users only see notifications relevant to their role (e.g., "Your assigned issue CUR-42 was updated")
