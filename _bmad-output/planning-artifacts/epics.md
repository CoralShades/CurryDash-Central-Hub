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
