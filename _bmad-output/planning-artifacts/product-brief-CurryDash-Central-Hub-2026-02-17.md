---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - CurryDash_Central_Hub_Action_Plan.md
  - _bmad-output/planning-artifacts/research/technical-currydash-mvp-architecture-research-2026-02-17.md
date: 2026-02-17
author: Demi
---

# Product Brief: CurryDash-Central-Hub

## Executive Summary

CurryDash Central Hub is a unified operations center purpose-built for the CurryDash ecosystem — replacing the fragmented patchwork of Jira, GitHub, Slack, spreadsheets, and ad-hoc AI tools with a single, intelligent, role-aware platform. It is the first AI-native project management portal designed specifically for a multi-repo, multi-project food delivery startup, where every team member — from founder to developer to vendor — gets a tailored experience backed by live data and AI-powered automation.

Built on a modern AI-native architecture (Next.js 15, Supabase, CopilotKit, Mastra, MCP), Central Hub transforms scattered project signals into ecosystem-wide visibility. It answers the question every growing startup eventually faces: "How do we keep everyone aligned when our tools, teams, and projects have outgrown manual coordination?"

---

## Core Vision

### Problem Statement

CurryDash has grown into a complex ecosystem spanning 6 Jira projects, multiple GitHub repositories, an expanding team of developers, QA engineers, stakeholders, vendors, and customers — yet the operational tooling remains fragmented across disconnected platforms. Every team member experiences a different slice of the same problem: **no single source of truth exists for the CurryDash ecosystem.**

The founder/PM spends hours manually creating status updates, sprint reports, and stakeholder summaries by piecing together data from Jira, GitHub, and Slack. Developers lack a unified view connecting their assigned tickets to pull requests, CI status, and architecture documentation. QA engineers track test coverage and bugs across tools that don't talk to each other. Stakeholders and investors must wait for manually curated progress reports. Vendors and customers have no self-service portal — every question requires human intervention.

### Problem Impact

The compounding effects of ecosystem fragmentation are severe:

- **Operational overhead:** Manual reporting and cross-tool coordination consume time that should go toward building the product.
- **Knowledge decay:** Critical decisions, architectural rationale, and context dissipate into Slack threads and meeting notes that no one can find later.
- **Onboarding friction:** New team members, vendors, and stakeholders face a steep ramp-up with no guided path through the ecosystem.
- **Scaling bottleneck:** As CurryDash grows, the current patchwork approach creates an O(n²) coordination problem — every new person, repo, or project multiplies the fragmentation.
- **Competitive drag:** Operational overhead directly slows feature delivery, putting CurryDash at a disadvantage in a fast-moving market.

### Why Existing Solutions Fall Short

No existing tool solves this problem because none was designed to:

- **Jira** excels at issue tracking but provides no cross-repository visibility, no AI-powered reporting, and no role-tailored dashboards. Every user sees the same generic board regardless of their role.
- **GitHub** manages code but cannot connect sprint context, business metrics, or stakeholder views to pull requests and deployments.
- **Slack** enables communication but becomes a black hole for decisions and context — information enters but never resurfaces when needed.
- **Notion/Docs** can organize documentation but cannot pull live data from Jira, GitHub, or AI services, and requires constant manual maintenance.
- **Generic dashboards (Retool, Grafana)** can visualize data but lack RBAC, AI assistance, domain-specific integrations, and the opinionated workflow CurryDash needs.

The fundamental gap: **no tool provides ecosystem-wide visibility across all CurryDash projects, repos, and teams with role-specific views and AI-native intelligence.**

### Proposed Solution

CurryDash Central Hub is a role-based, AI-native operations center that unifies the entire CurryDash ecosystem into one intelligent platform:

1. **Unified Dashboard Engine** — A single screen showing sprint status, PR activity, deployment health, and key metrics across ALL CurryDash projects and repositories. Live data flows from Jira and GitHub via webhooks, eliminating manual data gathering.

2. **Role-Based Portals** — Every user gets a tailored home experience. The Admin sees system health and team management. Developers see their sprint board, PRs, and architecture docs. QA sees test coverage and bug trackers. Stakeholders see progress dashboards and KPIs. Vendors and customers get guided self-service portals.

3. **AI Operations Assistant** — A context-aware AI assistant powered by CopilotKit + Mastra that can answer "What shipped this week?", generate sprint reports from live Jira data, create custom dashboard widgets on demand, and search across all project documentation — all through natural language.

4. **Living Documentation Hub** — Architecture docs, onboarding guides, API references, and decision logs that stay current through GitHub webhook-driven sync, are searchable, and are contextually relevant to each user's role.

### Key Differentiators

1. **Domain-Specific by Design** — Not a generic tool forced to fit. Central Hub is purpose-built for CurryDash's exact workflow, roles, Jira projects, and GitHub repositories. Every feature maps to a real operational pain point.

2. **AI-Native Architecture** — Built with AI from the ground up using production-ready protocols (MCP for tool access, AG-UI for agent-user interaction, Vercel AI SDK 5.0 for streaming). AI isn't bolted on — it's the foundation. The AI assistant can query Jira, check GitHub status, search documentation, and generate dashboard widgets through standardized MCP servers.

3. **Single-Team Velocity** — The combination of a small focused team, BMAD methodology, and Claude Code AI-assisted development enables iteration speed that no enterprise tool vendor can match. CurryDash can ship features to Central Hub in days, not quarters.

4. **Perfect Timing** — Three forces are converging simultaneously: the AI agent ecosystem has matured (MCP, CopilotKit, Mastra are all production-ready in 2026), CurryDash has grown past the point where manual coordination scales, and competitive pressure demands faster shipping velocity. Central Hub is only possible now because the AI infrastructure finally exists.

5. **Three-Layer Security** — Defense-in-depth RBAC (Edge Middleware + Server Component authorization + Supabase Row Level Security) ensures each of the 7 roles sees only what they're authorized to see — enforced at every layer from routing to database.

---

## Target Users

### Primary Users

#### Persona 1: Demi — Founder / PM / Super Admin
**Role:** Founder and Product Manager coordinating the entire CurryDash ecosystem
**Usage:** Daily (primary coordination hub)

**Context:** Demi runs a 4-6 person team building a multi-service food delivery platform. Her day is a blend of planned coordination (sprint planning, story writing, architecture decisions), reactive firefighting (answering "where is X?" questions, unblocking people, chasing status), and manual reporting (compiling updates from Jira, GitHub, and Slack for stakeholders). She's the only person with the full picture of what's happening across CurryDash — and that knowledge lives entirely in her head.

**Current Pain:**
- Starts every morning hopping between Jira → GitHub → Slack → manual reports
- Manually compiles stakeholder updates by cross-referencing sprint data, PR status, and deployment health
- Personally walks every new team member through the ecosystem (no self-service onboarding)
- Answers the same context questions repeatedly because information isn't centralized

**Success Looks Like:** Opening Central Hub and seeing the health of the entire CurryDash ecosystem on one screen — sprint progress, open PRs, deployment status, team activity — without touching Jira or GitHub directly. Generating a stakeholder report in seconds by asking the AI assistant instead of spending hours compiling one manually.

**Aha! Moment:** The first time she sees ALL CurryDash projects, PRs, and sprint data on a single unified dashboard.

---

#### Persona 2: Arjun — Fullstack Developer
**Role:** Fullstack developer building CurryDash's web platform and APIs
**Usage:** Daily (development workflow hub)

**Context:** Arjun works across multiple CurryDash repositories (Admin-Seller Portal, Central Hub) and multiple Jira projects. He needs to know what's assigned to him, what PRs need review, what the current sprint priorities are, and how his work connects to the bigger picture. He also needs architecture documentation to make informed technical decisions.

**Current Pain:**
- Wastes time finding which Jira ticket maps to which PR and what the sprint priorities are
- Has no visibility into related changes happening in other CurryDash repos that could affect his work
- Gets interrupted to report status — standup prep, PR updates, blocker reporting
- Architecture docs are scattered across repo READMEs, Notion pages, and Slack threads

**Success Looks Like:** Logging into Central Hub and immediately seeing his sprint board, open PRs, CI status, and relevant architecture docs — all in one developer-tailored view. Asking the AI assistant "what's the auth architecture?" and getting the answer instantly from indexed documentation instead of hunting through repos.

**Aha! Moment:** The first time he asks the AI assistant a technical question and gets an instant, accurate answer pulled from actual project documentation.

---

#### Persona 3: Priya — QA Engineer
**Role:** Quality assurance engineer managing test plans, bug tracking, and coverage across CurryDash services
**Usage:** Daily (quality tracking hub)

**Context:** Priya tests across multiple CurryDash services and needs to track test coverage, regression status, and bug severity across Jira projects that don't naturally connect. She creates test plans, files bugs, and tracks quality metrics — but the data lives in separate Jira boards with no unified quality view.

**Current Pain:**
- Tracks test coverage and bugs across disconnected Jira projects with no aggregated quality dashboard
- Cannot easily see how code changes in GitHub relate to test requirements in Jira
- Bug severity and regression status require manual cross-referencing across projects
- No single view showing the quality health of the entire CurryDash ecosystem

**Success Looks Like:** A QA-specific dashboard showing test coverage percentages, bugs by severity, regression tracker, and test execution status across ALL CurryDash projects. Being able to trace from a failed test to the responsible code change to the original Jira story.

**Aha! Moment:** The first time she sees a unified quality dashboard aggregating test metrics across all 6 Jira projects.

---

### Secondary Users

#### Persona 4: Marcus — Investor / Advisor
**Role:** Stakeholder monitoring CurryDash progress and making strategic decisions
**Usage:** Weekly to monthly (progress monitoring)

**Context:** Marcus is an investor or advisor who needs to understand CurryDash's progress, business health, and technical trajectory without being embedded in the day-to-day. He currently relies on manually compiled reports from Demi, which are always somewhat out of date by the time he reads them.

**Current Pain:**
- Questions go unanswered until Demi has time to compile a manual update: "Are we on track? What shipped? What's the timeline for feature X?"
- Business metrics (vendor count, order volume, growth) require manual extraction
- Technical health (platform stability, tech debt, architecture quality) is opaque without developer context
- No self-service way to check progress — always requires asking someone

**Success Looks Like:** Logging into a stakeholder-specific portal showing progress against roadmap, key business metrics, and a high-level technical health summary — all automatically updated from live data. Receiving an AI-generated weekly digest without anyone having to write it.

**Aha! Moment:** The first time he receives an auto-generated sprint report in seconds that would have taken Demi hours to compile manually.

---

### Future Users (Post-MVP)

#### Vendors / Restaurants
Self-service onboarding portal with guided setup, menu configuration, and order management tutorials. Currently requires manual handholding for every vendor interaction.

#### Customers
Public-facing help center with FAQs, order tracking guides, and subscription management. Currently no self-service documentation exists.

---

### User Journey

#### Discovery & Onboarding
- **Today:** Demi personally walks new team members through Jira, GitHub, architecture, and team conventions. This takes days and must be repeated for each person.
- **With Central Hub:** New members receive a role-specific onboarding tour (Driver.js guided walkthrough) that shows them their dashboard, relevant docs, and key tools. Self-service from day one.

#### Core Daily Usage
| Role | Morning Ritual | Key Actions | End of Day |
|------|---------------|-------------|------------|
| **Demi (PM)** | Open unified dashboard, scan ecosystem health | Triage blockers, review PRs, generate stakeholder reports via AI | Check sprint burndown, plan next day |
| **Arjun (Dev)** | Check assigned tickets + open PRs on dev dashboard | Code, reference architecture docs, update ticket status | Review CI status, check for new reviews |
| **Priya (QA)** | Check QA dashboard for bug queue and test status | Execute tests, file bugs, track regression status | Review coverage metrics, update test plans |
| **Marcus (Stakeholder)** | (Weekly) Open stakeholder portal | Review progress dashboard, check KPIs, read AI digest | Flag concerns or approve direction |

#### Success Moments
1. **PM:** "I didn't open Jira or GitHub directly today — everything I needed was in Central Hub."
2. **Dev:** "I asked the AI 'what does the payment flow look like?' and got the exact architecture doc in 2 seconds."
3. **QA:** "I can finally see test health across all 6 projects without manually compiling a spreadsheet."
4. **Stakeholder:** "I got my weekly update without asking anyone — it was just there in my portal."

#### Long-Term Value
Central Hub becomes the default "open in morning" tab for the entire CurryDash team. New members onboard in hours instead of days. Stakeholders stop asking "what's the status?" because the answer is always visible. The AI assistant becomes the team's institutional memory — capturing and surfacing knowledge that would otherwise be lost.

---

## Success Metrics

### User Success Metrics

Success is proven when three signals converge:

**1. Tool Consolidation (No More Tool-Hopping)**
| Metric | Baseline (Today) | Target (3 months) | Measurement |
|--------|------------------|--------------------|-------------|
| Central Hub as first-open morning tab | 0% | 100% internal team | Analytics: daily active users + session start source |
| Direct Jira/GitHub logins for status checks | 100% | <20% (only for editing) | Self-reported + login frequency tracking |
| Tools used daily per team member | 4-5 (Jira, GitHub, Slack, Docs, Spreadsheets) | 1-2 (Central Hub + Slack) | Tool usage survey |

**2. Self-Service Answers (Reduced "Where is X?" Questions)**
| Metric | Baseline (Today) | Target (3 months) | Measurement |
|--------|------------------|--------------------|-------------|
| Context questions directed to Demi per week | 10-15+ | <3 | Tracked via Slack/DM frequency |
| Time to find any project document | Minutes (hunting) | <10 seconds (search) | AI assistant + search analytics |
| AI assistant queries resolved without escalation | N/A | 80%+ | AI conversation completion rate |

**3. Onboarding Speed**
| Metric | Baseline (Today) | Target (3 months) | Measurement |
|--------|------------------|--------------------|-------------|
| Time to first productive contribution (new member) | 3-5 days | <1 day | Tracked per new team member |
| Demi's onboarding time investment per person | 4-8 hours | <30 minutes | Self-reported |
| Onboarding tour completion rate | N/A | 90%+ | Driver.js completion tracking |

---

### Business Objectives

**3-Month Targets (Post-MVP Launch)**

| Objective | Target | Measurement |
|-----------|--------|-------------|
| **Team velocity increase** | 20-30% more stories completed per sprint | Jira velocity charts (sprint-over-sprint) |
| **Time savings (Demi)** | Reclaim 5-8 hours/week from manual reporting/coordination | Time tracking: before vs after |
| **Time savings (team-wide)** | Save 2-3 hours/week per developer on context-switching | Developer self-reported survey |
| **Stakeholder satisfaction** | Stakeholders self-serve 90%+ of their status inquiries | Stakeholder question frequency tracking |
| **Adoption** | 100% internal team using Central Hub daily within 2 weeks | Daily active user analytics |

**12-Month Targets**

| Objective | Target | Measurement |
|-----------|--------|-------------|
| **Team scalability** | Onboard 2-3 new team members with zero increase in Demi's coordination overhead | Onboarding time tracking |
| **Feature velocity** | 2x sprint throughput compared to pre-Central Hub baseline | Jira velocity trend |
| **Operational cost** | Central Hub running cost <$100/month while supporting full team | Infrastructure billing |
| **Knowledge retention** | Zero critical knowledge lost when team members change | AI assistant answer accuracy over time |

---

### Key Performance Indicators

#### Core Platform KPIs

| KPI | Target | Frequency | Owner |
|-----|--------|-----------|-------|
| Daily Active Users (DAU) | 100% internal team | Daily | PM |
| Dashboard load time | <2 seconds | Continuous | Engineering |
| Data freshness (Jira/GitHub) | <5 minutes via webhooks | Continuous | Engineering |
| Uptime | 99.5%+ | Monthly | Engineering |
| Sprint report generation time | <30 seconds (AI-generated) | Per use | PM |

#### AI Assistant KPIs (Separate Dashboard)

| KPI | Target | Frequency | Owner |
|-----|--------|-----------|-------|
| AI queries per day (team-wide) | 10+ within first month | Daily | PM |
| Query resolution rate (no escalation needed) | 80%+ | Weekly | PM |
| AI-generated reports per week | 3+ (sprint, stakeholder, quality) | Weekly | PM |
| Dashboard widgets created via AI | 5+ unique widgets in first month | Monthly | PM |
| AI response accuracy (user-rated) | 4+/5 satisfaction | Monthly | PM |
| Average AI response time | <5 seconds for text, <15 seconds for widgets | Continuous | Engineering |

#### Integration Health KPIs

| KPI | Target | Frequency | Owner |
|-----|--------|-----------|-------|
| Jira sync success rate | 99%+ | Daily | Engineering |
| GitHub webhook delivery rate | 99%+ | Daily | Engineering |
| API rate limit headroom | >50% remaining | Daily | Engineering |
| Webhook-to-dashboard latency | <10 seconds | Continuous | Engineering |

### Strategic Alignment

Every metric connects back to the core vision:

- **Tool consolidation** → solves ecosystem fragmentation (Problem Statement)
- **Self-service answers** → eliminates knowledge decay and PM bottleneck (Problem Impact)
- **Onboarding speed** → removes scaling bottleneck (Problem Impact)
- **Team velocity** → eliminates competitive drag (Problem Impact)
- **AI metrics** → validates the key differentiator (AI-Native Architecture)

**Anti-Vanity Metric Commitment:** We measure outcomes (time saved, questions resolved, velocity gained), not vanity metrics (page views, sign-ups, feature count). Every metric must drive a decision or it gets removed.

---

## MVP Scope

### Core Features

**Timeline:** 4 weeks (aggressive, AI-assisted development with BMAD methodology)

#### Week 1-2: Foundation + Admin Dashboard

**Auth & Role System**
- User registration and login (email magic link + Google + GitHub OAuth)
- Auth.js v5 with SupabaseAdapter for session management
- Role-based middleware (route protection by role)
- Supabase RLS policies for database-level enforcement
- Basic user management (admin can assign roles)

**Admin/PM Unified Dashboard**
- Single unified dashboard showing ecosystem-wide health
- Sprint status overview (across all 6 Jira projects)
- PR activity feed (across all CurryDash repos)
- Key metrics cards (stories completed, PRs merged, bugs open, deployment status)
- Team activity summary
- Navigation shell with sidebar, header, and role-aware routing

**Design System Foundation**
- shadcn/ui components customized with CurryDash spice palette
- Tailwind CSS with design tokens (Turmeric Gold, Chili Red, Coriander Green, Cinnamon Brown, Coconut Cream)
- Responsive layout supporting desktop primary, tablet secondary

#### Week 3: External Integrations

**Jira Integration**
- Jira Cloud REST API v3 client with typed TypeScript SDK (jira.js)
- Fetch sprint data, issues, epics across all 6 projects (CUR, CAD, CAR, CPFP, PACK, CCW)
- Webhook receiver for real-time issue updates
- ISR cache with webhook-triggered revalidation (`revalidateTag('jira-issues')`)
- Rate limit awareness with exponential backoff (pre-March 2026 enforcement)

**GitHub Integration**
- Octokit client for repository data, PR status, commit activity
- Connected repositories: Admin-Seller_Portal, User-Web-Mobile, CurryDash-Central-Hub
- Webhook receiver for push, PR, and workflow events
- ISR cache with webhook-triggered revalidation (`revalidateTag('github-prs')`)

**Data Pipeline**
- Supabase tables for cached Jira/GitHub data (fast dashboard queries)
- Supabase Realtime subscriptions for live dashboard updates
- Webhook → Supabase → Realtime → Dashboard update flow

#### Week 4: AI Features

**AI Chat Assistant**
- CopilotKit sidebar integrated into dashboard layout
- Vercel AI SDK 5.0 with Anthropic Claude provider (SSE streaming)
- Role-aware system prompts (PM gets full ecosystem context)
- Context injection via `useCopilotReadable` (current dashboard data, user role, active view)

**AI Report Generation**
- "Generate sprint report" → Claude analyzes Jira data → formatted markdown report
- "Generate stakeholder update" → Claude summarizes progress, blockers, metrics
- Reports saved to Supabase for history and sharing

**AI Dashboard Widget Generation**
- `useCopilotAction("generate_widget")` → Claude produces widget config (JSON)
- Widget configs specify: chart type, data source, filters, layout
- Pre-built widget renderers: metric cards, bar/line/pie charts (Recharts), data tables (shadcn/ui)
- Generated widgets persist to Supabase → appear on dashboard permanently

**MCP Server Connections**
- Official Atlassian MCP server (Jira + Confluence data access for AI)
- GitHub MCP server (repo, PR, issue data access for AI)
- AI assistant can query live project data through natural language

---

### Out of Scope for MVP

**Explicitly Deferred (Post-MVP):**

| Feature | Reason for Deferral | Target Phase |
|---------|---------------------|--------------|
| **Role-specific dashboards** (Dev, QA, Stakeholder) | Admin/PM dashboard ships first; role views iterate from there | Phase 2 (Weeks 5-6) |
| **Documentation Hub** (MDX, auto-sync, search) | Core dashboards + AI provide more immediate value | Phase 3 |
| **Remotion Video System** | High effort, lower priority than core operations features | Phase 4+ |
| **Driver.js Onboarding Tours** | Team is small enough for direct onboarding initially | Phase 3 |
| **Vendor/Customer Portals** | External user portals are post-MVP; internal team first | Phase 4+ |
| **Multi-language Support (i18n)** | English-only for internal team MVP | Phase 4+ |
| **Mastra Standalone Server** | Embed AI in Next.js API routes for MVP simplicity; extract later | Phase 3 |
| **A2A Protocol Integration** | Forward-looking multi-agent standard; not needed for MVP | Phase 5+ |
| **Advanced RAG Pipeline** | MVP uses direct API context; vector search comes with docs hub | Phase 3 |
| **Dashboard Drag-and-Drop** | Fixed layout for MVP; customizable grid in future iteration | Phase 2 |
| **Environment Status Board** | Deploy health monitoring is a future ops feature | Phase 3 |
| **Competitive Intelligence Board** | Nice-to-have strategic feature, not core operations | Phase 5+ |

**Intentional Constraints:**
- **One dashboard type** (Admin/PM) — proves the concept before building 4 variants
- **No mobile optimization** — desktop-first for MVP; internal team uses laptops
- **No real-time collaboration** — single-user dashboard views; collaborative features post-MVP
- **Embedded AI only** — AI routes inside Next.js; no standalone Mastra server yet

---

### MVP Success Criteria

**Go/No-Go Gates (4-week checkpoint):**

| Gate | Criteria | Pass/Fail |
|------|----------|-----------|
| **Auth works** | Users can register, login, and see role-appropriate content | Must pass |
| **Dashboard loads real data** | Admin dashboard shows live Jira sprint data + GitHub PR data | Must pass |
| **Webhooks deliver** | Jira/GitHub changes appear on dashboard within 5 minutes | Must pass |
| **AI chat responds** | AI assistant answers project questions with streamed responses | Must pass |
| **AI generates reports** | "Generate sprint report" produces a meaningful, accurate report | Must pass |
| **AI creates widgets** | AI can generate at least 3 widget types (metric card, chart, table) | Should pass |
| **Team adopts** | Demi uses Central Hub as primary dashboard for 3+ consecutive days | Must pass |

**Proceed Beyond MVP When:**
- All "must pass" gates are met
- Demi is using Central Hub daily as primary coordination tool
- At least one other team member finds it useful enough to check daily
- AI assistant accuracy is above 70% for project-related queries

---

### Future Vision

**Phase 2 (Weeks 5-8): Role Expansion**
- Developer-specific dashboard (sprint board, PR queue, architecture docs)
- QA-specific dashboard (test coverage, bug tracker, regression status)
- Stakeholder read-only portal (progress, KPIs, AI-generated digests)
- Dashboard customization (drag-and-drop widget arrangement)

**Phase 3 (Months 2-3): Knowledge Platform**
- Living Documentation Hub (MDX engine, GitHub auto-sync, full-text search)
- Driver.js onboarding tours (role-specific guided walkthroughs)
- Advanced RAG pipeline (vector search over all project documentation)
- Standalone Mastra agent server (extracted from embedded API routes)

**Phase 4 (Months 3-6): External Portals**
- Vendor self-service portal (onboarding, menu setup, order management)
- Customer help center (FAQs, order tracking, contact)
- Remotion video system (onboarding videos, sprint recap generator)
- Multi-language support (English, Sinhala, Tamil)

**Phase 5 (6-12 Months): Platform Intelligence**
- A2A multi-agent orchestration
- Competitive intelligence board
- Cost & infrastructure dashboard (GCP billing, API usage)
- Sprint ceremony automation (planning views, retrospective templates)
- Design system showcase (interactive component gallery)

**North Star (2-3 Years):**
CurryDash Central Hub evolves from an internal operations tool into a white-label AI-native project management platform that other startups can deploy for their own ecosystems. The domain-specific design patterns, AI architecture, and role-based portal system become a reusable product.

---

*Product Brief completed 2026-02-17 through collaborative BMAD workflow.*
*Input documents: CurryDash_Central_Hub_Action_Plan.md, technical-currydash-mvp-architecture-research-2026-02-17.md*
