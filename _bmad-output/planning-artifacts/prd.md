---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish']
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-CurryDash-Central-Hub-2026-02-17.md
  - _bmad-output/planning-artifacts/research/technical-currydash-mvp-architecture-research-2026-02-17.md
  - CurryDash_Central_Hub_Action_Plan.md
documentCounts:
  briefs: 1
  research: 1
  brainstorming: 0
  projectDocs: 1
classification:
  projectType: saas_b2b
  domain: general
  complexity: medium
  projectContext: greenfield
workflowType: 'prd'
date: 2026-02-17
author: Demi
---

# Product Requirements Document - CurryDash-Central-Hub

**Author:** Demi
**Date:** 2026-02-17

## Executive Summary

**Vision:** CurryDash Central Hub is a unified, AI-native operations center that eliminates daily tool-hopping across Jira, GitHub, and Slack for the CurryDash food delivery ecosystem team.

**Differentiator:** Three innovations distinguish Central Hub from existing project management tools:
1. **AI-generated persistent dashboard widgets** — users describe what they want in natural language; the AI builds permanent UI components, not ephemeral text answers
2. **MCP-powered live project intelligence** — natural language queries against live Jira and GitHub data with source-cited responses, applied to PM operations (a novel domain for MCP)
3. **AI-assisted solo founder development** — a 4-week MVP built by one person using Claude Code + BMAD methodology, validating the AI-augmented product development thesis

**Target Users (MVP):** 4 roles — Admin/PM (Demi), Developer (Arjun), QA (Priya), Stakeholder (Marcus). Single-tenant deployment for the CurryDash internal team.

**Tech Stack:** Next.js 15 (App Router), Supabase (PostgreSQL + Realtime + RLS), Auth.js v5, CopilotKit + Vercel AI SDK 5.0 + Claude, MCP servers (Jira, GitHub), shadcn/ui with CurryDash spice palette.

**Timeline:** 4-week MVP. Weeks 1-2: Auth + Dashboard. Week 3: Integrations. Week 4: AI features (explicit cut line if timeline slips).

## Success Criteria

### User Success

**Primary measure: Tool consolidation — Central Hub replaces the daily tool-hopping workflow.**

| Outcome | Metric | MVP Target | 3-Month Target |
|---------|--------|------------|----------------|
| Central Hub is the morning default | DAU as % of internal team | 1 user (Demi) for 3+ consecutive days | 100% internal team |
| Direct Jira/GitHub logins for status checks | Login frequency | Baseline established | <20% (editing only) |
| Context questions directed to Demi | Questions per week | Baseline established | <3 (from 10-15) |
| Time to find any project document | Search-to-answer time | <30 seconds via AI | <10 seconds via search + AI |
| New member time-to-productive | Days to first contribution | N/A (no new hires in MVP) | <1 day |

**Aha! Moments (one per persona):**
- **Demi (PM):** First time seeing ALL CurryDash projects, PRs, and sprint data on one unified dashboard
- **Arjun (Dev):** First time asking the AI assistant a technical question and getting an instant, accurate answer from project docs
- **Priya (QA):** First time seeing unified quality metrics across all 6 Jira projects (Phase 2)
- **Marcus (Stakeholder):** First time receiving an auto-generated sprint report in seconds (MVP — via shared dashboard access)

### Business Success

| Objective | MVP Target (4 weeks) | 3-Month Target | 12-Month Target |
|-----------|---------------------|----------------|-----------------|
| Time savings (Demi) | Manual report time reduced by any amount | Reclaim 5-8 hrs/week | Maintain with team 2x size |
| Team velocity | Baseline sprint established | 20-30% more stories/sprint | 2x sprint throughput |
| Stakeholder self-service | Marcus can view dashboard without asking | 90%+ status inquiries self-served | Zero manual stakeholder reports |
| Operational cost | $0 (free tiers) | <$100/month | <$100/month at full team |
| Adoption | Demi uses daily for 3+ days | 100% team within 2 weeks | Default tool for all roles |

### Technical Success

| Metric | MVP Target | Production Target |
|--------|------------|-------------------|
| Dashboard load time | <3 seconds | <2 seconds |
| Data freshness (Jira/GitHub) | <5 minutes via webhooks | <1 minute |
| Uptime | Best effort | 99.5%+ |
| AI response time (text) | <10 seconds | <5 seconds |
| AI response time (widgets) | <20 seconds | <15 seconds |
| AI query resolution (no escalation) | 70%+ (go/no-go floor) | 80%+ |
| AI user satisfaction | Not measured in MVP | 4+/5 rating |
| Jira sync success rate | 95%+ | 99%+ |
| GitHub webhook delivery | 95%+ | 99%+ |

### Measurable Outcomes

**MVP Go/No-Go Gates (4-week checkpoint):**

| Gate | Criteria | Priority |
|------|----------|----------|
| Auth works | Users register, login, see role-appropriate content | Must pass |
| Dashboard loads real data | Admin dashboard shows live Jira sprint + GitHub PR data | Must pass |
| Webhooks deliver | Jira/GitHub changes appear on dashboard within 5 minutes | Must pass |
| AI chat responds | AI assistant answers project questions with streamed responses | Must pass |
| AI generates reports | "Generate sprint report" produces meaningful, accurate output | Must pass |
| AI creates widgets | AI generates at least 3 widget types (metric card, chart, table) | Should pass |
| Team adopts | Demi uses Central Hub as primary dashboard for 3+ consecutive days | Must pass |

**Proceed beyond MVP when:** All "must pass" gates met + Demi using daily + at least one other team member checking daily + AI accuracy above 70%.

## Product Scope

### MVP — Minimum Viable Product (4 Weeks)

**Week 1-2: Foundation + Admin Dashboard**
- Auth system (Auth.js v5 + Supabase, email magic link + Google + GitHub OAuth)
- Three-layer RBAC (Edge Middleware + Server Components + Supabase RLS)
- Admin/PM unified dashboard with live ecosystem health
- Stakeholder read-only dashboard access (same view, no admin controls)
- Design system foundation (shadcn/ui + CurryDash spice palette)
- Navigation shell with role-aware routing

**Week 3: External Integrations**
- Jira Cloud REST API v3 integration (sprint data, issues, epics across 6 projects)
- GitHub Octokit integration (PRs, commits, CI status across connected repos)
- Webhook receivers with ISR cache revalidation
- Supabase Realtime for live dashboard updates

**Week 4: AI Features**
- CopilotKit sidebar with AI chat assistant
- Vercel AI SDK 5.0 + Claude streaming
- Role-aware system prompts
- AI sprint report generation
- AI dashboard widget generation (metric cards, charts, tables)
- MCP server connections (Jira, GitHub)

### Growth Features (Post-MVP, Weeks 5-8)

Role-specific dashboards (Developer, QA, Stakeholder), dashboard customization, and onboarding tours. See **Project Scoping & Phased Development** for full phase breakdown with dependencies.

### Vision (Future, Months 2-12)

Living Documentation Hub, advanced RAG, vendor/customer portals, multi-language support, A2A multi-agent orchestration. **North Star:** White-label AI-native project management platform. See **Project Scoping & Phased Development** Phases 3-5 for details.

## User Journeys

### Journey 1: Demi's Monday Morning — The PM Who Stopped Tool-Hopping

**Persona:** Demi, Founder/PM/Super Admin | Daily user

**Opening Scene:**
It's Monday 8:30am. Demi used to start every week the same way — open Jira in one tab, GitHub in another, Slack in a third, then a spreadsheet to compile it all. She'd spend the first 90 minutes just figuring out *where things stand*: which sprint stories moved over the weekend, whether Arjun's PR got merged, if the CI pipeline is green, and what to tell Marcus in Thursday's stakeholder call. By 10am she'd have a rough picture. By noon, three people had Slacked her asking "what's the status of X?"

**Rising Action:**
Demi opens Central Hub. The unified dashboard loads in under 2 seconds. She sees:
- Sprint progress across all 6 Jira projects in one view — 3 stories completed since Friday, 2 in review, 1 blocked
- GitHub activity feed showing Arjun's PR was merged, CI is green across all repos
- A red indicator: the Jira webhook flagged a blocker on the payment integration story 20 minutes ago

She clicks the blocker card — full context appears without leaving Central Hub. She sees the Jira issue details, the linked PR, and the CI failure log.

**Climax:**
Demi opens the AI assistant sidebar. She types: *"Generate a sprint status report for this week's stakeholder call."* In 8 seconds, Claude analyzes live Jira sprint data + GitHub merge activity and produces a formatted report: stories completed, velocity trend, blockers, and a progress-against-roadmap summary. She reviews it, tweaks one sentence, and saves it. What used to take 2 hours took 3 minutes.

**Resolution:**
It's 9:15am. Demi has full ecosystem visibility, a stakeholder report ready for Thursday, and the blocker identified before standup. Nobody Slacks her asking "what's the status?" — the dashboard is the status. She spends the rest of her morning on product work instead of coordination overhead.

**Capabilities Revealed:**
- Unified cross-project dashboard (Jira + GitHub data aggregation)
- Webhook-driven real-time data freshness
- AI-powered report generation from live data
- Blocker visibility and cross-tool traceability (Jira issue → PR → CI)
- Role-aware navigation and admin controls

---

### Journey 2: Arjun's Deep Work Day — The Developer Who Stopped Context-Switching

**Persona:** Arjun, Fullstack Developer | Daily user

**Opening Scene:**
Arjun is mid-sprint, working across the Admin-Seller Portal and Central Hub repos. He has a story assigned in Jira about implementing webhook receivers, but he can't remember the exact architecture decision about ISR cache invalidation — was it tag-based or path-based? He vaguely remembers a Slack thread from last week, but searching Slack for "ISR" returns 47 results across 12 channels.

**Rising Action:**
Arjun opens Central Hub's developer view. Even though role-specific dashboards are Phase 2, he has access to the shared dashboard showing his assigned Jira issues and open PRs. He sees his 3 assigned stories for this sprint, their priorities, and that one PR is awaiting his review.

He opens the AI assistant sidebar and asks: *"What's the caching architecture for webhook-triggered data? ISR with tags or path-based?"*

**Climax:**
The AI assistant, connected to Jira and GitHub via MCP, searches the project documentation and the architecture research. Within 5 seconds it responds: *"Webhook-triggered ISR uses tag-based revalidation. Jira webhooks call revalidateTag('jira-issues') and GitHub webhooks call revalidateTag('github-prs'). This was decided in the MVP Architecture Research document — see section 'Data Fetching & Caching Architecture'."* Arjun has his answer without leaving his workflow.

**Resolution:**
Arjun implements the webhook receiver with the correct caching pattern on the first attempt. He didn't interrupt Demi, didn't search Slack, and didn't re-read the 1,100-line architecture doc. The AI assistant served as his architectural memory. He updates his Jira ticket status, and the dashboard reflects the change within minutes.

**Capabilities Revealed:**
- AI assistant with project documentation context (MCP servers)
- Developer-relevant data on shared dashboard (assigned issues, open PRs)
- Natural language search across architecture decisions
- Real-time Jira status reflection on dashboard
- Cross-tool linking (Jira story → relevant documentation)

---

### Journey 3: Priya's Quality Audit — The QA Who Got a Unified View

**Persona:** Priya, QA Engineer | Daily user (Phase 2 journey, limited MVP)

**Opening Scene:**
Priya is preparing for a release quality gate. She needs to know: how many open bugs exist across all CurryDash projects, what's the severity breakdown, and are there any regressions from this sprint's changes? Today, she opens 6 separate Jira boards (CUR, CAD, CAR, CPFP, PACK, CCW), manually filters for bug type, exports to a spreadsheet, and compiles a quality summary. It takes 45 minutes and is already stale by the time she finishes.

**Rising Action:**
In MVP, Priya accesses the shared Admin/PM dashboard. She can see sprint status and open issues across projects, but the data isn't QA-specific yet. She opens the AI assistant and asks: *"How many open bugs are there across all CurryDash Jira projects, broken down by severity?"*

**Climax:**
The AI queries Jira via MCP with a JQL search across all 6 projects for issue type = Bug and status != Done. In 10 seconds it returns: *"23 open bugs total: 2 Critical (CUR, CAD), 7 High, 11 Medium, 3 Low. The 2 critical bugs are both in the payment flow — CUR-245 (payment timeout) and CAD-118 (merchant payout calculation)."*

Priya immediately has the cross-project quality picture that used to take 45 minutes. She asks a follow-up: *"Generate a quality gate report for the current sprint."* The AI produces a formatted summary she can share with the team.

**Resolution:**
Priya flags the 2 critical bugs to Demi before the release meeting. The quality gate decision happens with real data, not gut feel. In Phase 2, Priya will get a dedicated QA dashboard with persistent quality metrics, regression tracking, and test coverage visualization — but even MVP's AI assistant dramatically cuts her manual compilation time.

**Capabilities Revealed:**
- AI-powered cross-project Jira querying (JQL via MCP)
- Bug severity aggregation across multiple projects
- AI report generation for quality gates
- Foundation for Phase 2 QA-specific dashboard
- Real-time data for release decision-making

---

### Journey 4: Marcus's Thursday Check-In — The Stakeholder Who Stopped Waiting

**Persona:** Marcus, Investor/Advisor | Weekly user

**Opening Scene:**
Marcus checks in on CurryDash progress every Thursday afternoon. Until now, this meant sending Demi a Slack message — "Hey, what's the latest?" — and waiting hours (sometimes a day) for her to compile a manual update. He has no visibility into whether the team is on track, what shipped, or what's blocking progress. Every interaction is a human bottleneck.

**Rising Action:**
Marcus receives an email with his Central Hub login (read-only stakeholder access). He opens the dashboard and sees the same unified view Demi uses — sprint progress, PR activity, key metrics — but without admin controls. He can see that 8 of 12 sprint stories are complete, velocity is trending up, and CI is green.

He wants more context. He opens the AI assistant and types: *"Summarize what shipped this week and any risks to the roadmap."*

**Climax:**
The AI generates a stakeholder-friendly summary: *"This week: 5 stories completed (auth system, dashboard layout, Jira integration base). 2 in review. 1 blocked (payment webhook — pending Jira API rate limit investigation). Velocity: 13 points this sprint vs 10 last sprint. Roadmap: on track for Week 3 integrations. Key risk: Jira API rate limit changes in March 2026 — team is building with rate limit awareness."*

Marcus has his answer in 15 seconds. He didn't message Demi. He didn't wait.

**Resolution:**
Marcus forwards the AI-generated summary to the advisory board. Demi doesn't even know he checked in — and that's the point. The stakeholder update that used to cost Demi 2 hours of compilation now costs zero. Marcus checks Central Hub every Thursday and only reaches out when he has a strategic question, not a status question.

**Capabilities Revealed:**
- Read-only stakeholder dashboard access (same data, no admin controls)
- AI-generated stakeholder summaries from live data
- Self-service progress visibility without PM bottleneck
- Sprint velocity and roadmap tracking
- Risk identification in AI reports

---

### Journey 5: Kai's First Day — The New Developer Who Onboarded Themselves

**Persona:** Kai, New Fullstack Developer | Onboarding journey (partial MVP, full in Phase 2)

**Opening Scene:**
Kai joins the CurryDash team on a Monday. In the old world, Demi would spend 4-8 hours over the first week walking Kai through: where the repos are, how Jira boards are organized, what the architecture looks like, who does what, and how the development workflow runs. Meanwhile, Kai would open 15 browser tabs trying to piece it all together.

**Rising Action:**
Demi sends Kai a Central Hub invite with Developer role access. Kai logs in and sees the shared dashboard with sprint data, open PRs, and project activity. They open the AI assistant and ask: *"I'm new to the team. What's the CurryDash architecture and how are the repos organized?"*

**Climax:**
The AI assistant, with full project context via MCP, responds with a structured overview: the tech stack, how the 3 connected repositories relate to each other, the current sprint priorities, and where architecture documentation lives. Kai follows up: *"What's assigned to me this sprint?"* The AI pulls their Jira assignments. Within 30 minutes, Kai has more context than a full day of manual onboarding would have provided.

In Phase 2, Kai would also get a Driver.js guided tour walking them through the developer dashboard step-by-step — but even in MVP, the AI assistant serves as an always-available onboarding buddy.

**Resolution:**
Kai submits their first PR by end of day one. Demi spent 15 minutes setting up their account instead of 8 hours of manual walkthroughs. The institutional knowledge that used to live only in Demi's head is now accessible through the AI assistant to anyone, anytime.

**Capabilities Revealed:**
- Role-based account provisioning (admin creates developer account)
- AI assistant as onboarding knowledge base
- Project context accessible via natural language
- Jira assignment visibility for new team members
- Foundation for Phase 2 Driver.js guided tours

---

### Journey 6: The Webhook Pipeline — When Systems Talk to Each Other

**Persona:** System actors (Jira Cloud, GitHub, Supabase) | Continuous

**Opening Scene:**
A developer merges a PR in GitHub. A QA engineer transitions a Jira ticket to "Done." These events happen dozens of times per day across the CurryDash ecosystem. Without Central Hub, these signals dissipate — no one sees the full picture unless they manually check each tool.

**Rising Action:**
The GitHub webhook fires on PR merge: `POST /api/webhooks/github` with the event payload. Central Hub's route handler:
1. Validates the webhook signature (security)
2. Parses the event (PR merged, repo: Admin-Seller_Portal)
3. Upserts the PR data into Supabase
4. Calls `revalidateTag('github-prs')` to invalidate the ISR cache

Simultaneously, the Jira webhook fires on ticket transition: `POST /api/webhooks/jira` with the issue update payload. The handler:
1. Validates the webhook (Jira's shared secret)
2. Parses the event (CUR-312 moved to Done)
3. Upserts the issue data into Supabase
4. Calls `revalidateTag('jira-issues')` to invalidate the ISR cache

**Climax — Error Recovery:**
The Jira webhook returns a 429 (rate limit). The handler:
1. Logs the rate limit event with `Retry-After` header value
2. Queues the update for retry with exponential backoff
3. The dashboard continues showing the last known state (stale but not broken)
4. On retry success, Supabase updates and Realtime pushes the change to connected dashboards

**Resolution:**
Within 60 seconds of both events, Demi's dashboard reflects the merged PR and completed story — without anyone manually refreshing, polling, or checking. The system is self-healing: webhook failures are retried, rate limits are respected, and the dashboard degrades gracefully (stale data over no data).

**Capabilities Revealed:**
- Webhook signature validation (security)
- Jira and GitHub webhook route handlers
- ISR cache tag invalidation on external events
- Supabase upsert + Realtime broadcast pipeline
- Rate limit handling with exponential backoff
- Graceful degradation (stale data over errors)
- Self-healing retry logic

---

### Journey Requirements Summary

| Journey | Key Capability Areas |
|---------|---------------------|
| **Demi (PM daily)** | Unified dashboard, AI report generation, blocker visibility, cross-tool tracing |
| **Arjun (Dev daily)** | AI documentation search, assigned issues view, PR status, MCP integration |
| **Priya (QA audit)** | AI cross-project querying, JQL via MCP, quality gate reports |
| **Marcus (Stakeholder)** | Read-only access, AI stakeholder summaries, self-service progress |
| **Kai (Onboarding)** | Account provisioning, AI as knowledge base, role-based access |
| **Webhooks (System)** | Webhook handlers, signature validation, ISR revalidation, rate limit handling, retry logic, Supabase Realtime |

## Domain-Specific Requirements

### Third-Party API Dependency Management

**Strategy: Conservative (webhook-first, heavy caching, minimal direct API calls)**

| Constraint | Requirement | Rationale |
|-----------|-------------|-----------|
| Jira rate limits (March 2026) | Webhook-driven data ingestion as primary path; direct API calls only for initial sync and on-demand user actions | Points-based rate limit model is still being finalized; conservative approach avoids hitting limits during enforcement rollout |
| Jira webhook expiry | Automated webhook registration refresh every 25 days (30-day expiry with 5-day buffer) | Webhook registrations expire silently — must be proactively refreshed |
| GitHub API limits | 5,000 requests/hour per authenticated user; use webhook-first pattern to stay well within limits | GitHub limits are generous but should not be relied upon for polling |
| API failure isolation | External API failures must not crash the dashboard; show last-known data with staleness indicator | Central Hub must remain usable even when Jira or GitHub APIs are temporarily unavailable |
| Rate limit telemetry | Log all 429 responses with remaining quota and retry timing; surface rate limit warnings in admin view when >50% consumed | Early warning prevents silent degradation |

### AI/LLM Operational Requirements

**Source Citation & Accuracy:**
- All AI responses referencing project data **must cite the data source** (e.g., "Based on Jira JQL query across CUR, CAD, CAR..." or "From architecture research document, section X")
- AI-generated reports must include a "Data as of [timestamp]" footer showing when the underlying data was last refreshed
- No confidence indicator in MVP (adds UI complexity without clear user value); revisit in Phase 2 if accuracy issues emerge

**Cost Control:**
- Soft budget ceiling: **$50/month** for Anthropic API usage during MVP
- Model routing: Claude Haiku for simple queries (status checks, data lookups), Claude Sonnet for complex queries (report generation, widget creation)
- Token budget per request: Cap individual requests at 4,000 output tokens to prevent runaway costs
- Usage tracking: Admin dashboard widget showing monthly API cost and query count

**Graceful Degradation:**
- If Anthropic API is unavailable, the dashboard **continues to function fully** — all Jira/GitHub data, charts, and navigation work without AI
- AI sidebar shows "AI assistant is temporarily unavailable" status instead of error
- AI features are an enhancement layer, not a dependency for core dashboard functionality
- Queue failed AI requests for retry when service recovers (reports only, not chat)

### Data Freshness & Consistency

**Consistency Model: Eventual consistency with staleness transparency**

| Scenario | Acceptable Staleness | Handling |
|----------|---------------------|----------|
| Sprint status / issue counts | Up to 5 minutes | Webhook-driven; ISR cache tag invalidation |
| PR merge / CI status | Up to 5 minutes | GitHub webhook-driven; ISR cache tag invalidation |
| AI-generated reports | Data as of query time | Reports stamped with data timestamp |
| Dashboard metrics cards | Up to 5 minutes | Staleness indicator if data older than 10 minutes |

**Webhook Reliability:**
- Idempotent webhook handlers — duplicate deliveries produce the same result (upsert, not insert)
- Out-of-order tolerance — use event timestamps for conflict resolution, not arrival order
- Dead letter logging — log failed webhook payloads for manual investigation; do not silently drop events
- Health check — admin view showing last successful webhook receipt per source (Jira, GitHub) with "last seen" timestamp

**No dangerous stale data scenarios identified:** CurryDash Central Hub is an operational visibility tool, not a transactional system. Stale data may lead to slightly outdated status views but cannot cause financial loss, data corruption, or safety issues.

### Multi-Role Data Isolation

**Stakeholder Data Boundary:**

| Data Category | Admin (Demi) | Developer (Arjun) | QA (Priya) | Stakeholder (Marcus) |
|--------------|-------------|-------------------|------------|---------------------|
| Sprint progress (aggregate) | Full | Full | Full | Full |
| Individual issue details | Full | Assigned + team | QA-relevant | Summary only |
| Individual developer metrics | Full | Own only | N/A | **Aggregate team only** |
| PR details and code links | Full | Full | Read-only | Hidden |
| AI assistant access | Full | Full | Full | Full (read-only context) |
| Admin controls (user mgmt) | Full | Hidden | Hidden | Hidden |
| Integration settings | Full | Hidden | Hidden | Hidden |
| API cost / rate limit telemetry | Full | Hidden | Hidden | Hidden |

**Key decision:** Stakeholders see **aggregate team velocity and sprint metrics only** — not individual developer performance, commit frequency, or PR review speed. This protects team dynamics and prevents misuse of granular developer metrics as performance evaluation tools.

**RLS enforcement:** These boundaries are enforced at the Supabase RLS layer, not just UI hiding. Even if a stakeholder inspects API responses, they cannot access developer-level granular data.

## Innovation & Novel Patterns

Beyond standard SaaS patterns, Central Hub introduces three novel approaches that carry both opportunity and risk.

### Detected Innovation Areas

**1. AI-Generated Persistent Dashboard Widgets**
Most AI integrations in SaaS tools produce ephemeral text responses — you ask, you get an answer, it disappears. CurryDash's AI generates *permanent UI components*: the user describes what they want in natural language, Claude produces a widget configuration (JSON), and the widget renders as a real dashboard component that persists in Supabase. The AI doesn't just answer questions — it collaboratively builds the dashboard.

**Innovation type:** Novel interaction pattern (AI as UI builder, not just chatbot)
**Closest comparable:** Microsoft Data Formulator (research project), Retool AI (limited to queries, not persistent widgets)

**2. MCP-Powered Live Project Intelligence**
The AI assistant connects to Jira and GitHub through standardized MCP servers, enabling natural language queries against live project data with source-cited responses. "How many open bugs across all projects?" returns a real-time JQL query result, not a hallucinated guess. This is the Model Context Protocol's intended use case — but applied to PM operations rather than developer tooling.

**Innovation type:** Early adoption of emerging standard (MCP) in a novel domain
**Closest comparable:** Cursor/Claude Code (MCP for development), but no PM dashboard equivalent exists

**3. AI-Assisted Solo Founder Development Model**
CurryDash Central Hub is being built by a single founder using Claude Code + BMAD methodology, targeting a 4-week MVP that would traditionally require a 3-4 person team working 3+ months. The project itself is a validation of the AI-assisted product development thesis — if it ships on time, it demonstrates that AI tooling has crossed the threshold where solo founders can build enterprise-grade SaaS.

**Innovation type:** Process innovation (AI-augmented development methodology)

### Validation Approach

| Innovation | Validation Method | Success Signal |
|-----------|-------------------|----------------|
| AI Widget Generation | MVP go/no-go gate: AI creates 3+ widget types (metric card, chart, table) | Users prefer AI-generated widgets over manually configured ones |
| MCP Project Intelligence | AI accuracy >70% on project queries with source citations | Users ask AI instead of opening Jira/GitHub directly |
| Solo Founder Model | Ship MVP in 4 weeks with all "must pass" gates met | Demi uses Central Hub daily as primary tool |

### Risk Mitigation

| Innovation Risk | Fallback Strategy |
|----------------|-------------------|
| **AI widget generation quality is poor** | Pre-built static widgets covering 80% of use cases (sprint status, PR activity, bug counts, velocity chart). AI generation becomes a "power user" feature, not the primary path. Dashboard is fully functional without AI-generated widgets. |
| **MCP server reliability issues** | Direct API calls as fallback. AI assistant falls back to cached Supabase data if MCP servers are unavailable. Core dashboard data never depends on MCP — only the AI assistant's live query capability does. |
| **AI responses are inaccurate** | Source citation requirement catches hallucinations (user can verify). 70% accuracy floor as go/no-go gate. If accuracy is below threshold, reduce AI scope to report generation only (structured output from structured data = higher accuracy than open-ended Q&A). |
| **4-week timeline overrun** | AI features (Week 4) are the cut line. Auth + Dashboard + Integrations (Weeks 1-3) ship regardless. AI features can slip to Week 5-6 without blocking core value delivery. |

## SaaS B2B Platform Requirements

### Tenant Model

**Single-tenant architecture for MVP.** CurryDash Central Hub serves one organization (the CurryDash ecosystem). No multi-org isolation, no tenant switching, no per-tenant configuration.

| Aspect | MVP Decision | Future (White-Label) |
|--------|-------------|---------------------|
| Tenant isolation | Single org, single database | Per-org Supabase projects or RLS-based isolation |
| User provisioning | Admin manually creates accounts | Self-service invite links with org-scoped registration |
| Data isolation | All users share one data pool, filtered by RBAC | Per-tenant data partitioning |
| Branding | CurryDash spice palette only | Per-org theme configuration |

### RBAC Matrix (Consolidated)

**4 active roles in MVP, 7 total planned:**

| Permission | Admin | Developer | QA | Stakeholder | Vendor* | Customer* | System* |
|-----------|-------|-----------|-----|-------------|---------|-----------|---------|
| **Dashboard — view unified** | Full | Full | Full | Read-only | — | — | — |
| **Dashboard — admin controls** | Full | — | — | — | — | — | — |
| **Jira data — all projects** | Full | Full | Full | Aggregate only | — | — | — |
| **Jira data — individual issues** | Full | Assigned + team | QA-relevant | Summary | — | — | — |
| **GitHub data — PRs/commits** | Full | Full | Read-only | — | — | — | — |
| **GitHub data — code links** | Full | Full | — | — | — | — | — |
| **AI assistant — chat** | Full | Full | Full | Full | — | — | — |
| **AI assistant — report gen** | Full | Full | Full | Full | — | — | — |
| **AI assistant — widget gen** | Full | Full | Full | — | — | — | — |
| **User management** | Full | — | — | — | — | — | — |
| **Integration settings** | Full | — | — | — | — | — | — |
| **API cost telemetry** | Full | — | — | — | — | — | — |
| **Individual dev metrics** | Full | Own only | — | — | — | — | — |

*Vendor, Customer, System roles are post-MVP (Phase 4+)

**Enforcement layers:**
1. **Edge Middleware** — Route-level protection (`/admin/*` → Admin only, etc.)
2. **Server Components** — Data-level filtering (role checked before any data fetch)
3. **Supabase RLS** — Database-level enforcement (policies on every table)

### Integration Specification

| Integration | Provider | Auth Method | Protocol | Data Direction | Data Types | Refresh Strategy | MVP Priority |
|------------|----------|-------------|----------|---------------|------------|-----------------|-------------|
| **Jira Cloud** | Atlassian | OAuth 2.0 (3LO) or API Token | REST API v3 | Inbound (read) | Sprints, issues, epics, boards, projects | Webhook-driven + ISR cache tags | Must have |
| **Jira Webhooks** | Atlassian | Shared secret validation | HTTP POST → `/api/webhooks/jira` | Inbound (push) | Issue created/updated/transitioned | Real-time on event | Must have |
| **GitHub REST** | GitHub | OAuth token (via Auth.js) | Octokit SDK | Inbound (read) | Repos, PRs, commits, CI status, issues | Webhook-driven + ISR cache tags | Must have |
| **GitHub Webhooks** | GitHub | HMAC-SHA256 signature | HTTP POST → `/api/webhooks/github` | Inbound (push) | Push, PR, workflow_run events | Real-time on event | Must have |
| **Anthropic Claude** | Anthropic | API key (server-side) | Vercel AI SDK 5.0 (SSE) | Bidirectional | Chat messages, tool calls, streaming responses | On-demand per user request | Must have |
| **Supabase** | Supabase | Service role key (server) + anon key (client) | PostgreSQL + Realtime (WebSocket) | Bidirectional | All application data, cached integration data | Realtime subscriptions + RLS | Must have |
| **Auth.js (NextAuth)** | Multiple | Provider-specific OAuth flows | Auth.js v5 protocol | Bidirectional | Sessions, JWT tokens, user profiles | Session-based with refresh | Must have |
| **Jira MCP Server** | Atlassian (official) | OAuth 2.0 / API Token | MCP protocol | Inbound (AI reads) | Issues, JQL queries, project data | On-demand per AI query | Must have |
| **GitHub MCP Server** | Community | Personal access token | MCP protocol | Inbound (AI reads) | Repos, PRs, issues, code search | On-demand per AI query | Must have |
| **CopilotKit** | CopilotKit (OSS) | Self-hosted (no auth needed) | AG-UI protocol | Frontend ↔ Agent | Chat UI, actions, readable context | Real-time streaming | Must have |
| **Mastra** | Mastra (OSS) | Self-hosted (no auth needed) | AG-UI + MCP client | Agent ↔ Tools | Agent workflows, tool calls, memory | On-demand per agent invocation | Should have |

**Integration dependency chain:**
```
Auth.js → Supabase (session storage)
Jira REST API → Supabase (cached data) → Dashboard (ISR)
GitHub REST API → Supabase (cached data) → Dashboard (ISR)
Jira Webhook → Supabase (upsert) → Realtime → Dashboard (live update)
GitHub Webhook → Supabase (upsert) → Realtime → Dashboard (live update)
CopilotKit → Mastra Agent → MCP Servers (Jira, GitHub) → Live data
CopilotKit → Vercel AI SDK → Claude API → Streaming response
```

### Subscription Tiers

**Not applicable for MVP.** CurryDash Central Hub is an internal operations tool with no billing, no subscription plans, and no usage-based pricing.

**Future consideration (white-label Phase 5+):** If Central Hub evolves into a reusable platform product, tiers would likely follow: Free (1 project, 3 users) → Pro (unlimited projects, 10 users, AI features) → Enterprise (SSO, audit logs, custom integrations).

### Implementation Considerations

**Desktop-first responsive strategy:**
- Primary viewport: 1280px+ (laptop/desktop)
- Secondary viewport: 768px+ (tablet — stakeholder use case)
- No mobile optimization in MVP (skip_section: mobile_first confirmed)
- No CLI interface (skip_section: cli_interface confirmed)

**State management:**
- Server state: React Server Components + ISR for dashboard data
- Client state: Minimal — React `useState` for UI interactions, no global state library needed
- Real-time state: Supabase Realtime subscriptions in client components
- AI state: CopilotKit manages AI conversation state internally

**Error boundary strategy:**
- Per-widget error boundaries on dashboard (one failing widget doesn't crash others)
- Integration-level error boundaries (Jira down doesn't affect GitHub widgets)
- AI error boundary (Claude API down doesn't affect dashboard data)
- Global error boundary with branded error page as last resort

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-solving MVP — deliver the minimum product that eliminates Demi's daily tool-hopping across Jira, GitHub, and Slack.

**Resource Requirements:** Solo founder (Demi) using AI-assisted development (Claude Code + BMAD). No additional team members required for MVP. AI tooling is the force multiplier.

**Timeline:** 4 weeks, with Week 4 (AI features) as the explicit cut line if timeline slips.

### MVP Feature Set (Phase 1 — Weeks 1-4)

**Core User Journeys Supported:**
- Demi's Monday Morning (full journey)
- Arjun's Deep Work Day (partial — shared dashboard + AI assistant)
- Marcus's Thursday Check-In (partial — read-only dashboard access)
- Kai's First Day (partial — account provisioning + AI as onboarding buddy)
- Webhook Pipeline (full journey including error recovery)
- Priya's Quality Audit (partial — AI assistant queries only, no dedicated QA dashboard)

**Must-Have Capabilities (in build order):**

| # | Capability | Week | Depends On |
|---|-----------|------|------------|
| 1 | Next.js 15 project scaffold + Supabase setup | 1 | — |
| 2 | Auth.js v5 + Supabase (email magic link, Google, GitHub OAuth) | 1 | #1 |
| 3 | Three-layer RBAC (middleware + server components + RLS) | 1 | #2 |
| 4 | Database schema + RLS policies for all MVP roles | 1 | #2 |
| 5 | shadcn/ui design system with CurryDash spice palette | 1 | #1 |
| 6 | Navigation shell + role-aware routing | 1-2 | #3, #5 |
| 7 | Admin/PM unified dashboard layout | 2 | #6 |
| 8 | Admin user management (create accounts, assign roles) | 2 | #3, #7 |
| 9 | Jira REST API v3 client (sprint data, issues, epics) | 2-3 | #1 |
| 10 | GitHub Octokit client (repos, PRs, commits, CI status) | 2-3 | #1 |
| 11 | Dashboard data widgets (sprint status, PR feed, metrics cards) | 3 | #7, #9, #10 |
| 12 | Jira webhook receiver + ISR cache revalidation | 3 | #9 |
| 13 | GitHub webhook receiver + ISR cache revalidation | 3 | #10 |
| 14 | Supabase Realtime subscriptions for live updates | 3 | #12, #13 |
| 15 | Rate limit handling + exponential backoff | 3 | #9 |
| 16 | CopilotKit sidebar + Vercel AI SDK 5.0 + Claude streaming | 4 | #7 |
| 17 | MCP server connections (Jira + GitHub) | 4 | #16 |
| 18 | AI sprint report generation | 4 | #16, #17 |
| 19 | Role-aware AI system prompts | 4 | #16, #3 |

**Should-Have (MVP stretch goals):**

| # | Capability | Week | Fallback |
|---|-----------|------|----------|
| 20 | AI dashboard widget generation | 4 | Pre-built static widgets |
| 21 | Mastra agent framework | 4 | Direct AI SDK API routes |
| 22 | Stakeholder read-only view | 2 | Share screen / export |
| 23 | Webhook health monitoring (admin) | 3 | Check logs manually |
| 24 | API cost telemetry widget | 4 | Anthropic dashboard |

### Post-MVP Features

**Phase 2 — Role Expansion (Weeks 5-8):**
- Developer-specific dashboard (sprint board, PR queue, architecture docs)
- QA-specific dashboard (test coverage, bug tracker, regression status)
- Full stakeholder portal (progress KPIs, AI-generated weekly digests)
- Dashboard customization (drag-and-drop widget arrangement)
- Driver.js onboarding tours (role-specific guided walkthroughs)
- Mastra standalone agent server (if not shipped in MVP)

**Phase 3 — Knowledge Platform (Months 2-3):**
- Living Documentation Hub (MDX engine, GitHub auto-sync, full-text search)
- Advanced RAG pipeline (vector search over all project documentation)
- Standalone Mastra agent server (extracted from embedded API routes)

**Phase 4 — External Portals (Months 3-6):**
- Vendor self-service portal (onboarding, menu setup, order management)
- Customer help center (FAQs, order tracking, contact)
- Remotion video system (onboarding videos, sprint recap generator)
- Multi-language support (English, Sinhala, Tamil)

**Phase 5 — Platform Intelligence (6-12 Months):**
- A2A multi-agent orchestration
- Competitive intelligence board
- Cost & infrastructure dashboard
- Sprint ceremony automation
- White-label platform capabilities

### Risk Mitigation Strategy

**Technical Risks:**
- AI widget gen quality → Fallback to pre-built static widgets (80% coverage)
- Mastra complexity → Fallback to direct Vercel AI SDK routes
- MCP server reliability → Fallback to direct API calls + cached Supabase data
- Jira rate limits (March 2026) → Built-in from day 1: webhook-first, exponential backoff, aggressive caching

**Market Risks:**
- Team doesn't adopt → MVP optimized for Demi's workflow first. If the founder uses it daily, adoption follows.
- AI accuracy insufficient → 70% floor as go/no-go gate. Below threshold, reduce scope to structured report generation only.

**Resource Risks:**
- Timeline slips → Week 4 (AI) is the cut line. Weeks 1-3 deliver standalone value.
- Absolute minimum viable: Auth + Dashboard + Jira integration = 2-week core that proves the concept.

## Functional Requirements

The following 56 requirements translate all user journeys, domain constraints, and architectural decisions into discrete, testable system capabilities. Organized by capability area in MVP build order.

### 1. Identity & Access Management

- **FR1:** Users can register for an account using email magic link, Google OAuth, or GitHub OAuth
- **FR2:** Users can log in and receive a role-appropriate session with JWT token
- **FR3:** The system can enforce route-level access control based on user role via edge middleware
- **FR4:** The system can enforce data-level access control based on user role via server-side authorization
- **FR5:** The system can enforce row-level data isolation based on user role via database policies
- **FR6:** Admin users can create new user accounts and assign roles (Admin, Developer, QA, Stakeholder)
- **FR7:** Admin users can view and manage all registered users and their role assignments
- **FR8:** Unauthenticated users are redirected to the login page when accessing protected routes
- **FR9:** Users with insufficient role privileges are redirected to their role-appropriate dashboard

### 2. Dashboard & Data Visualization

- **FR10:** Authenticated users can view a unified dashboard displaying ecosystem-wide health data
- **FR11:** The dashboard can display sprint progress summaries across all connected Jira projects
- **FR12:** The dashboard can display GitHub pull request activity across all connected repositories
- **FR13:** The dashboard can display key metric cards (stories completed, PRs merged, bugs open, deployment status)
- **FR14:** The dashboard can display team activity summaries
- **FR15:** The dashboard can display blocker indicators with drill-down to issue details
- **FR16:** Users can click a dashboard item to view its full details without leaving Central Hub
- **FR17:** Stakeholder users can view the dashboard in read-only mode without admin controls
- **FR18:** The dashboard can display staleness indicators when data is older than 10 minutes
- **FR19:** The dashboard can isolate widget failures so one broken widget does not affect others

### 3. Jira Integration

- **FR20:** The system can connect to Jira Cloud REST API v3 and authenticate via OAuth 2.0 or API token
- **FR21:** The system can fetch sprint data, issues, and epics across all 6 configured Jira projects (CUR, CAD, CAR, CPFP, PACK, CCW)
- **FR22:** The system can receive Jira webhook events for issue creation, update, and transition
- **FR23:** The system can validate incoming Jira webhook payloads using shared secret verification
- **FR24:** The system can automatically refresh Jira webhook registrations before their 30-day expiry
- **FR25:** The system can handle Jira API rate limit responses (429) with exponential backoff and retry

### 4. GitHub Integration

- **FR26:** The system can connect to GitHub API via Octokit and authenticate using OAuth tokens
- **FR27:** The system can fetch repository data, pull requests, commits, and CI status for connected repositories
- **FR28:** The system can receive GitHub webhook events for push, pull request, and workflow run events
- **FR29:** The system can validate incoming GitHub webhook payloads using HMAC-SHA256 signature verification

### 5. AI Assistant

- **FR30:** Users can interact with an AI chat assistant via a sidebar panel within the dashboard
- **FR31:** The AI assistant can stream responses in real-time using Server-Sent Events
- **FR32:** The AI assistant can query live Jira data through natural language (via MCP server connection)
- **FR33:** The AI assistant can query live GitHub data through natural language (via MCP server connection)
- **FR34:** The AI assistant can provide role-aware responses based on the current user's role and permissions
- **FR35:** The AI assistant can cite data sources in responses (e.g., Jira project, JQL query, document section)
- **FR36:** The AI assistant can continue to function with degraded capability when the AI provider is unavailable (dashboard remains fully functional)
- **FR37:** The AI assistant can display an unavailability status message when the AI provider is down

### 6. AI Report & Widget Generation

- **FR38:** Users can request the AI to generate a sprint status report from live Jira data
- **FR39:** Users can request the AI to generate a stakeholder progress summary from live project data
- **FR40:** AI-generated reports can include a "data as of [timestamp]" footer indicating data freshness
- **FR41:** Users can request the AI to generate dashboard widgets by describing them in natural language
- **FR42:** AI-generated widgets can be rendered as metric cards, bar/line/pie charts, or data tables
- **FR43:** AI-generated widget configurations can be persisted to the database and displayed on the dashboard permanently
- **FR44:** The dashboard can render pre-built static widgets as a fallback when AI widget generation is unavailable

### 7. Data Pipeline & Freshness

- **FR45:** The system can cache Jira and GitHub data in Supabase for fast dashboard queries
- **FR46:** The system can invalidate cached data via ISR cache tag revalidation when webhooks are received
- **FR47:** The system can push real-time data updates to connected dashboard clients via Supabase Realtime
- **FR48:** The system can process webhook events idempotently (duplicate deliveries produce the same result)
- **FR49:** The system can resolve out-of-order webhook events using event timestamps
- **FR50:** The system can log failed webhook payloads for manual investigation (dead letter logging)

### 8. System Administration

- **FR51:** Admin users can view integration connection status (last successful sync per source)
- **FR52:** Admin users can view webhook health status (last received event per source with timestamp)
- **FR53:** Admin users can view AI API usage metrics (monthly cost, query count)
- **FR54:** Admin users can configure integration credentials (Jira, GitHub, Anthropic API keys)
- **FR55:** The system can cap individual AI requests at a configured token budget to prevent cost overruns
- **FR56:** The system can log rate limit events with remaining quota information and surface warnings when consumption exceeds 50%

## Non-Functional Requirements

Quality attributes specifying how well the system must perform. Only categories relevant to CurryDash are included; Accessibility is deferred to Phase 4+ (external portals).

### Performance

| NFR | Metric | MVP Target | Production Target |
|-----|--------|------------|-------------------|
| **NFR-P1:** Dashboard initial page load (cold) | Time to First Contentful Paint | <3 seconds | <2 seconds |
| **NFR-P2:** Dashboard navigation (warm, client-side) | Time to interactive | <500ms | <300ms |
| **NFR-P3:** Dashboard widget render (individual) | Time from data fetch to render | <1 second | <500ms |
| **NFR-P4:** AI chat response (text, first token) | Time to first streamed token | <3 seconds | <2 seconds |
| **NFR-P5:** AI chat response (text, complete) | Total response time | <10 seconds | <5 seconds |
| **NFR-P6:** AI widget generation (complete) | Total generation + render time | <20 seconds | <15 seconds |
| **NFR-P7:** AI report generation (complete) | Total generation time | <15 seconds | <10 seconds |
| **NFR-P8:** Webhook processing latency | Time from receipt to dashboard update | <30 seconds | <10 seconds |
| **NFR-P9:** Concurrent dashboard users | Supported without degradation | 5 simultaneous | 20 simultaneous |
| **NFR-P10:** API route response time (non-AI) | Server response time | <500ms (p95) | <200ms (p95) |

### Security

| NFR | Requirement | Enforcement |
|-----|-------------|-------------|
| **NFR-S1:** All authentication flows use HTTPS exclusively | No HTTP fallback; HSTS headers on all responses | Infrastructure + middleware |
| **NFR-S2:** JWT session tokens expire after 24 hours with sliding refresh | Configurable via Auth.js session strategy | Auth.js v5 configuration |
| **NFR-S3:** API keys (Jira, GitHub, Anthropic) are never exposed to the client | Server-side only; environment variables; no client-side fetches to provider APIs | Server Components + API routes |
| **NFR-S4:** GitHub webhook payloads validated via HMAC-SHA256 before processing | Reject all payloads with invalid or missing signatures | Webhook route handler |
| **NFR-S5:** Jira webhook payloads validated via shared secret before processing | Reject all payloads with invalid credentials | Webhook route handler |
| **NFR-S6:** RBAC enforced at all three layers — no security-by-UI-hiding | Middleware (route) + Server Component (data) + RLS (database) must independently enforce role boundaries | Full stack |
| **NFR-S7:** Supabase RLS policies active on every table containing user or project data | No table accessible without a policy; `ENABLE ROW LEVEL SECURITY` on all tables | Database migration |
| **NFR-S8:** AI assistant cannot access or return data beyond the user's role permissions | Role context passed to system prompt; MCP queries filtered by role | AI middleware layer |
| **NFR-S9:** No sensitive data (API keys, tokens, PII) in client-side logs or browser console | Server-side logging only for sensitive operations | Code review + CSP policy |
| **NFR-S10:** CSRF protection on all state-mutating API routes | Auth.js built-in CSRF + SameSite cookie attributes | Auth.js v5 defaults |

### Integration

| NFR | Metric | Target |
|-----|--------|--------|
| **NFR-I1:** Webhook delivery success rate (after retries) | Successful processing / total received | 95%+ MVP, 99%+ production |
| **NFR-I2:** Webhook idempotency | Duplicate deliveries produce identical state | 100% (upsert, not insert) |
| **NFR-I3:** Data freshness after external event | Time from event to dashboard reflection | <5 minutes (webhook path) |
| **NFR-I4:** Jira API rate limit compliance | Zero 429 responses from polling (webhooks are primary) | <5 direct API calls per minute |
| **NFR-I5:** GitHub API consumption | Requests per hour vs 5,000 limit | <10% of limit under normal operation |
| **NFR-I6:** Failed webhook recovery | Dead-lettered events successfully reprocessed | Within 1 hour of manual investigation |
| **NFR-I7:** MCP server connection resilience | AI falls back to cached Supabase data if MCP unavailable | Automatic failover, no user-visible error |
| **NFR-I8:** Integration failure isolation | One integration down does not affect others | Per-integration error boundaries |

### Reliability

| NFR | Metric | MVP Target | Production Target |
|-----|--------|------------|-------------------|
| **NFR-R1:** Dashboard uptime | Availability percentage | Best effort (Vercel free tier) | 99.5%+ |
| **NFR-R2:** Widget failure isolation | Failing widget contained to its boundary | One widget crash does not affect adjacent widgets | Same + auto-recovery on re-render |
| **NFR-R3:** AI degradation graceful | Dashboard functions fully without AI | 100% — all data, charts, navigation work with AI offline | Same |
| **NFR-R4:** Webhook retry on transient failure | Retries with exponential backoff | Up to 3 retries, 1s/5s/30s backoff | Up to 5 retries, configurable |
| **NFR-R5:** Database connection resilience | Supabase connection pool recovery | Auto-reconnect within 30 seconds | Auto-reconnect within 10 seconds |
| **NFR-R6:** Realtime subscription recovery | Supabase Realtime auto-reconnect on disconnect | Reconnect within 60 seconds | Reconnect within 15 seconds |
| **NFR-R7:** Zero data loss on webhook burst | All events processed during burst periods | Queue overflow logged to dead letter | Same + alerting |

### Scalability

| NFR | Metric | MVP Target | Growth Target |
|-----|--------|------------|---------------|
| **NFR-SC1:** Monthly infrastructure cost | Total hosting + services | $0 (free tiers: Vercel, Supabase, Anthropic trial) | <$100/month at full team |
| **NFR-SC2:** AI API monthly spend | Anthropic API costs | <$50/month | <$50/month (model routing optimization) |
| **NFR-SC3:** Database row growth | Supabase free tier limits | <100K rows (well within 500MB free limit) | Monitor at 50% threshold |
| **NFR-SC4:** Webhook burst handling | Events queued during spike | Support 50 events/minute without data loss | Support 200 events/minute |
| **NFR-SC5:** User capacity | Concurrent authenticated users | 10 users | 50 users without architecture changes |
