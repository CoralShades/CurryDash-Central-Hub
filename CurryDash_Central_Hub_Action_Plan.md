# CurryDash Central Hub — Project Action Plan
**Project Name**: `currydash-central` (repo name suggestion)
**Type**: Next.js 14+ Full-Stack Application (React + TypeScript)
**Development Stack**: Claude Code + BMAD v6 + Cowork
**Version**: 1.0 Draft
**Date**: February 17, 2026

---

## 1. Project Vision & Analysis

### What You Described
A centralized management portal with role-based access serving as the single source of truth for the entire CurryDash ecosystem — documentation, dashboards, guides, AI chatbots, and project management integration.

### What This Actually Is
This is a **CurryDash Mission Control** — a unified operations center that replaces scattered docs, Jira tabs, GitHub browsing, and Slack updates with one intelligent, role-aware platform. Think of it as Notion + Linear + Vercel Dashboard + AI copilot, purpose-built for CurryDash.

### Stakeholder Roles Identified

| Role | Access Level | Primary View |
|------|-------------|--------------|
| **Demi (Founder/PM)** | Super Admin | Everything — dashboards, all docs, AI tools, config |
| **Fullstack Dev** | Developer | Architecture docs, API specs, sprint board, code links |
| **Mobile Dev** | Developer | Flutter docs, mobile epics, build status, design specs |
| **Tester 1 & 2** | QA | Test plans, bug tracking, QA dashboards, test guides |
| **Vendors/Restaurants** | External (Limited) | Onboarding guide, FAQs, video tutorials, status updates |
| **Customers** | External (Public) | Help center, order guides, FAQs, status page |
| **Investors/Advisors** | Stakeholder | Progress dashboards, KPIs, roadmap, executive summaries |

---

## 2. Proposed Upgrades & Enhancements Beyond Your Request

### 2.1 Features You Mentioned → Enhanced Versions

| Your Request | Enhanced Version |
|---|---|
| Role-based access | **RBAC + Team Spaces** — each role gets a curated home dashboard, not just filtered views. Custom layouts per persona. |
| Documentation | **Living Docs System** — auto-syncs from GitHub repos via webhooks. Versioned. Searchable. MDX with interactive code examples. |
| Remotion videos | **Video Pipeline** — Remotion compositions for onboarding, feature demos, sprint reviews. Auto-generated sprint recap videos from Jira data. Data-driven, parameterized. |
| Interactive guides | **Driver.js + Wizard Engine** — onboarding wizards per role, contextual help overlays, "Getting Started" flows that track completion. |
| AI chatbots | **Multi-Model AI Assistant** — Claude (primary) + fallback model routing. Context-aware: knows the user's role, current page, and can search project docs. RAG over your documentation. |
| Dashboards | **Dashboard Builder** — leveraging Claude artifacts/skills to generate dashboards on-demand. Pre-built dashboards for dev, QA, stakeholder views. Real-time via Jira + GitHub APIs. |
| Jira integration | **Bi-directional Jira Sync** — pull tickets, statuses, sprint data. Display burndown charts, epic progress, velocity. Optionally push updates from the hub back to Jira. |
| GitHub repo links | **Repository Command Center** — live status cards per repo showing last commit, open PRs, CI status, deployment state. Deep links to relevant code sections. |

### 2.2 Additional Features Recommended

| Feature | Why |
|---|---|
| **Changelog & Release Notes** | Auto-generated from GitHub releases/tags. Stakeholders see what shipped without asking. |
| **Environment Status Board** | Live status of dev/staging/prod for each service (currydash.au, merchants.currydash.au). Health checks, uptime. |
| **Design System Showcase** | Interactive component gallery showing CurryDash UI components with the spice palette. Live Storybook-style preview. |
| **Meeting Notes & Decisions Log** | Searchable archive of decisions (ADRs). "Why did we choose Filament over Nova?" — answer is always findable. |
| **Notification Center** | Unified alerts: deployment complete, PR merged, Jira ticket moved, test suite failed. Per-role filtering. |
| **Cost & Infrastructure Dashboard** | GCP billing, API usage, storage consumption. Critical for a bootstrapped startup. |
| **Vendor Onboarding Tracker** | Visual pipeline: applied → reviewing → approved → live. Admin sees all vendors, vendors see their own status. |
| **Competitive Intelligence Board** | Track competitor features, pricing changes. Updated via AI-assisted web research. |
| **Sprint Ceremony Automation** | Sprint planning view pulls unfinished stories, retrospective template auto-populated with sprint data. |
| **Multi-Language Support (i18n)** | English, Sinhala, Tamil — aligned with CurryDash's diaspora-first positioning. At minimum for vendor/customer-facing docs. |

---

## 3. Technical Architecture

### 3.1 Recommended Stack

```
Framework:        Next.js 14+ (App Router, RSC, API Routes)
Language:         TypeScript (strict mode)
Styling:          Tailwind CSS + CurryDash Design Tokens
UI Components:    shadcn/ui (customized with spice palette)
Auth:             NextAuth.js (multi-provider: email, Google, GitHub)
Database:         PostgreSQL (via Prisma ORM) on Cloud SQL
Cache:            Redis (Memorystore) for session + real-time data
Video:            Remotion (React-based video generation)
Interactive Tours: Driver.js
AI Chat:          Anthropic Claude API (primary) + OpenRouter (multi-model)
Docs Engine:      MDX + next-mdx-remote (or Contentlayer)
Dashboards:       Recharts + Tremor (React dashboard components)
Real-time:        Server-Sent Events or Pusher
Deployment:       Vercel (primary) or GCP Cloud Run
CI/CD:            GitHub Actions
Monorepo:         Turborepo (if needed for Remotion + main app)
```

### 3.2 System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  CurryDash Central Hub                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Auth &     │  │  Dashboard  │  │  AI Chat   │            │
│  │  RBAC       │  │  Engine     │  │  Engine    │            │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘            │
│        │               │               │                     │
│  ┌─────┴───────────────┴───────────────┴──────┐             │
│  │              Next.js API Layer               │             │
│  └─────┬───────────┬──────────┬───────────────┘             │
│        │           │          │                               │
│  ┌─────┴──┐  ┌────┴───┐  ┌──┴────────┐  ┌──────────┐      │
│  │ Jira   │  │ GitHub │  │ Anthropic │  │ Remotion │      │
│  │ Cloud  │  │ API    │  │ Claude    │  │ Renderer │      │
│  │ API    │  │ v4     │  │ API       │  │          │      │
│  └────────┘  └────────┘  └───────────┘  └──────────┘      │
│                                                              │
│  Connected Repositories:                                     │
│  ├── CoralShades/Admin-Seller_Portal (Laravel backend)       │
│  ├── CoralShades/User-Web-Mobile (Flutter apps)              │
│  ├── CoralShades/currydash-ux (UX/design ops) [NEW]          │
│  ├── CoralShades/currydash-delivery (delivery app) [PENDING] │
│  └── CoralShades/currydash-merchant (merchant app) [PENDING] │
│                                                              │
│  Jira Projects: CUR | CAD | CAR | CPFP | PACK | CCW         │
└──────────────────────────────────────────────────────────────┘
```

### 3.3 Role-Based View Architecture

```
/                           → Landing/login
/dashboard                  → Role-aware home (redirects to role-specific view)
/dashboard/admin            → Super admin overview (all KPIs, all repos)
/dashboard/dev              → Developer view (sprints, PRs, architecture)
/dashboard/qa               → QA view (test status, bug tracker, coverage)
/dashboard/stakeholder      → Investor/advisor view (KPIs, roadmap, progress)

/docs                       → Documentation hub (MDX-powered)
/docs/architecture          → Technical architecture docs
/docs/brand                 → Brand guidelines, color system, assets
/docs/api                   → API reference (auto-generated from OpenAPI)
/docs/guides/vendor         → Vendor onboarding guides
/docs/guides/customer       → Customer help center

/projects                   → Repository command center
/projects/[repo-slug]       → Individual repo status (PRs, CI, deploys)

/sprints                    → Sprint board (Jira-synced)
/sprints/current            → Active sprint with burndown
/sprints/[sprint-id]        → Historical sprint data

/epics                      → Epic progress tracker (11 epics)
/epics/[epic-id]            → Epic detail with stories, requirements mapping

/ai                         → AI assistant (Claude-powered, context-aware)
/ai/chat                    → Conversational interface
/ai/generate-dashboard      → On-demand dashboard generation
/ai/generate-report         → Sprint/status report generation

/videos                     → Remotion video library
/videos/onboarding          → Role-specific onboarding videos
/videos/features            → Feature demo videos
/videos/sprint-recaps       → Auto-generated sprint recap videos

/settings                   → Hub configuration
/settings/integrations      → Jira, GitHub, Anthropic API keys
/settings/team              → User management, role assignment
/settings/notifications     → Alert preferences per role

/vendor-portal              → Public-facing vendor section
/help                       → Public-facing customer help center
/status                     → System status page (all environments)
```

---

## 4. Step-by-Step Action Plan

### Phase 0: Foundation & BMAD Setup (Week 1)

**Goal**: Repository creation, BMAD v6 initialization, tooling setup.

| Step | Action | Tool | Output |
|------|--------|------|--------|
| 0.1 | Create `currydash-central` repo on GitHub (CoralShades org, Private) | GitHub | Empty repo with README |
| 0.2 | Clone locally, initialize Next.js 14+ with TypeScript | Claude Code | `npx create-next-app@latest --typescript --tailwind --app` |
| 0.3 | Install BMAD v6 alpha | Claude Code | `npx bmad-method@alpha install` |
| 0.4 | Run BMAD initialization workflow | Claude Code | `*workflow-init` → generates `_bmad/` structure |
| 0.5 | Create PRD using BMAD analyst agent | Claude Code | `*create-prd` → `_bmad-output/PRD.md` |
| 0.6 | Create architecture doc using BMAD | Claude Code | `*create-architecture` → `_bmad-output/architecture.md` |
| 0.7 | Generate epics and stories | Claude Code | `*create-epics-and-stories` |
| 0.8 | Set up `.github/copilot-instructions.md` and `AGENTS.md` | Claude Code | Agent-ready repo |
| 0.9 | Set up `CLAUDE.md` for Claude Code context | Claude Code | Project context file |
| 0.10 | Configure Claude Cowork locally | Cowork | Desktop automation ready |
| 0.11 | Copy brand guidelines and design tokens into repo | Manual + Claude Code | `/src/styles/brand-tokens.css` |

### Phase 1: Auth, Layout & Role System (Week 2)

**Goal**: Working skeleton with login and role-based routing.

| Step | Action | Details |
|------|--------|---------|
| 1.1 | Set up PostgreSQL schema (Prisma) | Users, Roles, Teams, Sessions, Permissions tables |
| 1.2 | Implement NextAuth.js | Email magic link + Google OAuth + GitHub OAuth |
| 1.3 | Create RBAC middleware | Role-checking on API routes and pages |
| 1.4 | Build app shell layout | Sidebar navigation, header, breadcrumbs (shadcn/ui) |
| 1.5 | Implement role-based dashboard routing | `/dashboard` redirects to role-specific home |
| 1.6 | Apply CurryDash design tokens | Turmeric Gold primary, Cinnamon Brown text, spice palette across shadcn |
| 1.7 | Create team/user management page (admin only) | Invite users, assign roles |
| 1.8 | Set up notification center skeleton | Bell icon, notification drawer, read/unread state |

### Phase 2: Integrations Layer (Week 3)

**Goal**: Connect Jira, GitHub, and establish the data pipeline.

| Step | Action | Details |
|------|--------|---------|
| 2.1 | Jira Cloud API integration | OAuth 2.0 setup, fetch projects (CUR, CAD, CAR, CPFP, PACK, CCW) |
| 2.2 | Jira data models | Cache tickets, sprints, epics locally in PostgreSQL for fast queries |
| 2.3 | Jira webhook receiver | Real-time updates when tickets change status |
| 2.4 | GitHub API v4 (GraphQL) integration | Repo stats, PRs, commits, CI status, deployments |
| 2.5 | GitHub webhook receiver | Push events, PR events, workflow run events |
| 2.6 | Repository registry | Config file mapping all CurryDash repos with metadata |
| 2.7 | Integration settings page | Admin UI to configure API keys, webhook URLs, sync intervals |
| 2.8 | Data sync scheduler | Cron jobs (Vercel Cron or node-cron) for periodic full sync |

### Phase 3: Dashboard Engine (Week 4-5)

**Goal**: Build the dashboard system leveraging Claude's artifact generation capabilities.

| Step | Action | Details |
|------|--------|---------|
| 3.1 | Dashboard framework | Reusable dashboard grid layout with drag-and-drop widget placement |
| 3.2 | **Admin Dashboard** | KPIs: active vendors, orders today, revenue MTD, system health, deployment status |
| 3.3 | **Developer Dashboard** | Open PRs, failing CI, current sprint stories, blocked tickets, recent commits |
| 3.4 | **QA Dashboard** | Test coverage %, bugs by severity, test execution status, regression tracker |
| 3.5 | **Stakeholder Dashboard** | Progress against roadmap, burn-up chart, feature completion %, key milestones |
| 3.6 | **Epic Progress Dashboard** | All 11 epics with story completion, FR/NFR mapping (98 FRs, 53 NFRs) |
| 3.7 | Sprint analytics | Velocity chart, burndown, cycle time, sprint-over-sprint comparison |
| 3.8 | **AI Dashboard Generator** | Integration with Claude API to generate custom dashboard widgets on-demand |
| 3.9 | Model switcher | Dropdown to switch between Claude Opus/Sonnet/Haiku, plus OpenRouter for other providers |
| 3.10 | Dashboard export | PDF/PNG export for stakeholder reports |

### Phase 4: Documentation Hub (Week 5-6)

**Goal**: Living documentation system that stays in sync with code.

| Step | Action | Details |
|------|--------|---------|
| 4.1 | MDX documentation engine | next-mdx-remote with custom components, syntax highlighting, live code |
| 4.2 | Auto-sync from GitHub | Webhook-triggered: when docs change in any repo, pull and rebuild |
| 4.3 | **Architecture docs** | Import existing architecture.md, architecture-solution.md, integration docs |
| 4.4 | **Brand guidelines** | Interactive color palette viewer, typography showcase, spacing calculator |
| 4.5 | **API reference** | Auto-generated from Laravel routes/OpenAPI spec, interactive "Try It" panels |
| 4.6 | **PRD browser** | Navigable PRD with FR/NFR search, epic cross-references |
| 4.7 | **Vendor documentation** | Onboarding guide, menu setup, package configuration, order management |
| 4.8 | **Customer help center** | FAQ, order tracking guide, subscription management, contact info |
| 4.9 | Search (full-text) | Algolia or Pagefind for instant search across all documentation |
| 4.10 | Version history | Track doc versions tied to Git commits, "last updated" timestamps |

### Phase 5: AI Assistant (Week 6-7)

**Goal**: Context-aware AI chatbot that understands CurryDash inside out.

| Step | Action | Details |
|------|--------|---------|
| 5.1 | Chat UI component | Streaming responses, markdown rendering, code highlighting |
| 5.2 | Claude API integration | Messages API with streaming, system prompt with CurryDash context |
| 5.3 | RAG pipeline | Embed all docs into vector store (pgvector or Pinecone), retrieve relevant context |
| 5.4 | Role-aware system prompts | Different context/permissions per role (dev gets architecture, vendor gets guides) |
| 5.5 | **Multi-model routing** | Primary: Claude Sonnet (speed). Escalate: Claude Opus (complex). Budget: Haiku (simple). Via OpenRouter for non-Anthropic models. |
| 5.6 | Tool use integration | Claude can query Jira, check GitHub status, search docs via tool calling |
| 5.7 | Dashboard generation tool | User describes what they want → Claude generates a Recharts/Tremor dashboard component |
| 5.8 | Report generation | "Generate this week's sprint report" → Claude creates formatted report from Jira data |
| 5.9 | Conversation history | Persist chat history per user, enable "continue where I left off" |

### Phase 6: Remotion Video System (Week 7-8)

**Goal**: Programmatic video generation for guides, onboarding, and sprint recaps.

| Step | Action | Details |
|------|--------|---------|
| 6.1 | Remotion project setup | Turborepo package or separate `/video` directory in monorepo |
| 6.2 | CurryDash video template | Branded intro/outro, Turmeric Gold motion graphics, spice palette transitions |
| 6.3 | **Vendor onboarding video** | Parameterized: "Welcome [VendorName]!" → walks through portal setup |
| 6.4 | **Feature demo compositions** | Package builder demo, order management demo, analytics demo |
| 6.5 | **Sprint recap generator** | Input: sprint data from Jira → Output: animated video showing completed stories, velocity, highlights |
| 6.6 | Remotion Player embedding | Embed interactive video players in documentation pages |
| 6.7 | Video rendering pipeline | Server-side rendering via Remotion Lambda or local rendering via Claude Code |
| 6.8 | Video library page | Browse, search, filter videos by role and topic |

### Phase 7: Interactive Guides & Wizards (Week 8-9)

**Goal**: Role-specific onboarding and contextual help.

| Step | Action | Details |
|------|--------|---------|
| 7.1 | Driver.js integration | Install, configure with CurryDash brand styling |
| 7.2 | **Admin onboarding tour** | 5-step tour: dashboard overview → integrations → team management → docs → AI assistant |
| 7.3 | **Developer onboarding tour** | Architecture overview → sprint board → repo links → CI status → docs search |
| 7.4 | **QA onboarding tour** | Test dashboard → bug reporting → test plans → coverage metrics |
| 7.5 | **Vendor onboarding wizard** | Multi-step wizard: account setup → restaurant profile → menu creation → first order simulation |
| 7.6 | Contextual tooltips | `?` icons on complex dashboard widgets with explanation popovers |
| 7.7 | Progress tracking | Database table tracking tour completion per user, "restart tour" option |
| 7.8 | Completion celebrations | Confetti/badge modals on milestone completion (gamification) |

### Phase 8: Polish, Testing & Launch (Week 9-10)

| Step | Action | Details |
|------|--------|---------|
| 8.1 | WCAG accessibility audit | Verify spice palette contrast ratios (Cinnamon Brown on Coconut Cream = AAA ✓) |
| 8.2 | Performance optimization | ISR for docs, SWR for dashboard data, lazy loading for Remotion |
| 8.3 | Mobile responsiveness | Ensure all views work on tablet/mobile for on-the-go stakeholders |
| 8.4 | Security hardening | Rate limiting, input sanitization, API key encryption, CORS config |
| 8.5 | E2E testing | Playwright tests for critical flows: login → dashboard → docs → AI chat |
| 8.6 | Deployment | Vercel (preferred) or GCP Cloud Run with Cloud SQL |
| 8.7 | Custom domain | `hub.currydash.au` or `central.currydash.au` |
| 8.8 | Team onboarding | Send invites, run guided tours, gather feedback |

---

## 5. BMAD v6 Epic Structure (Suggested)

For Claude Code + BMAD workflow, here's how to break this into epics:

| Epic | Name | Stories (Est.) |
|------|------|---------------|
| E1 | **Auth & Role System** | 6 stories |
| E2 | **App Shell & Navigation** | 5 stories |
| E3 | **Jira Integration** | 7 stories |
| E4 | **GitHub Integration** | 5 stories |
| E5 | **Dashboard Engine** | 10 stories |
| E6 | **Documentation Hub** | 8 stories |
| E7 | **AI Assistant** | 8 stories |
| E8 | **Remotion Video System** | 6 stories |
| E9 | **Interactive Guides** | 5 stories |
| E10 | **Vendor/Customer Portal** | 6 stories |
| E11 | **Settings & Admin** | 4 stories |
| **Total** | | **~70 stories** |

---

## 6. Development Workflow with Claude Code + BMAD

```
┌─────────────────────────────────────────────────┐
│           Daily Development Loop                 │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. /sm (Scrum Master)                          │
│     → Pick next story from sprint backlog       │
│                                                  │
│  2. /dev (Developer Agent)                      │
│     → Implement ONE story at a time             │
│     → Claude Code writes code, tests, commits   │
│                                                  │
│  3. /qa (QA Agent)                              │
│     → Run tests, check WCAG, verify behavior    │
│                                                  │
│  4. Claude Cowork (Desktop)                     │
│     → File management, multi-repo coordination  │
│     → Automated screenshot testing              │
│     → Design token validation                   │
│                                                  │
│  5. Push → GitHub Actions → Auto-deploy         │
│     → Vercel preview for PRs                    │
│     → Production deploy on main merge           │
│                                                  │
│  Model Routing (Cost Optimization):             │
│  ├── Opus 4.5  → Architecture decisions, PRD    │
│  ├── Sonnet 4.5 → Default coding (60-80% work) │
│  └── Haiku 4.5  → Tests, linting, bulk tasks    │
└─────────────────────────────────────────────────┘
```

---

## 7. Key Files to Create First

When you initialize the repo with Claude Code, create these foundation files:

```
currydash-central/
├── CLAUDE.md                    # Claude Code project context
├── AGENTS.md                    # GitHub Copilot agent instructions
├── .github/
│   ├── copilot-instructions.md  # Copilot coding agent context
│   └── workflows/
│       ├── ci.yml               # Lint + test + type-check
│       └── deploy.yml           # Vercel deployment
├── _bmad/                       # BMAD v6 framework
│   ├── bmm/
│   │   ├── agents/
│   │   ├── workflows/
│   │   └── config.yaml
│   └── core/
├── _bmad-output/                # BMAD planning artifacts
│   ├── PRD.md
│   ├── architecture.md
│   ├── epics/
│   └── stories/
├── src/
│   ├── app/                     # Next.js App Router
│   ├── components/              # Shared UI components
│   ├── lib/                     # Utilities, API clients
│   │   ├── jira/                # Jira API client
│   │   ├── github/              # GitHub API client
│   │   ├── ai/                  # Claude/OpenRouter client
│   │   └── auth/                # NextAuth config
│   ├── styles/
│   │   └── brand-tokens.css     # CurryDash spice palette tokens
│   └── content/                 # MDX documentation files
├── video/                       # Remotion compositions
│   ├── src/
│   │   ├── Root.tsx
│   │   ├── templates/
│   │   └── compositions/
│   └── package.json
├── prisma/
│   └── schema.prisma            # Database schema
└── docs/                        # Project-level docs (non-rendered)
    ├── decisions/               # ADRs (Architecture Decision Records)
    └── setup.md                 # Local dev setup guide
```

---

## 8. GitHub Copilot Prompt (for the new repo)

Since you're also setting up Copilot for this repo, here's the prompt:

```
Scaffold a Next.js 14 TypeScript app for CurryDash Central Hub — a role-based
project management portal. Create: /src/app with App Router layout, auth pages,
dashboard routes (/admin, /dev, /qa, /stakeholder). Add /src/lib for Jira API
client, GitHub API client, AI chat engine. Add /prisma/schema.prisma with User,
Role, Team, Notification models. Add /src/styles/brand-tokens.css with spice
palette (#E6B04B gold, #C5351F red, #4A7C59 green, #5D4037 brown, #FFF8DC cream).
Include CLAUDE.md, AGENTS.md, .github/copilot-instructions.md. Add README.
```

---

## 9. Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Scope creep (70+ stories) | BMAD enforces plan→build→verify. Strict MVP: Phase 1-3 first, then iterate. |
| Jira API rate limits | Cache aggressively in PostgreSQL. Webhook-driven updates, not polling. |
| Remotion licensing cost | Free for teams ≤3 people. Evaluate if team grows. Alternative: use Remotion Player only (embeds are free). |
| AI API costs | Model routing: Haiku for 80% of queries, Sonnet for complex, Opus only for architecture. Budget ~$50-100/month initially. |
| Too many integrations at once | Build integration layer as plugins. Start with Jira + GitHub. Add AI and Remotion in later phases. |
| Vendor/customer access security | Separate auth flows. External users get isolated views with no access to internal dashboards or code. |

---

## 10. Success Metrics

| Metric | Target |
|--------|--------|
| Team members actively using hub daily | 100% within 2 weeks of launch |
| Time to find any project document | < 10 seconds (via search) |
| Sprint report generation time | < 30 seconds (AI-generated) |
| Vendor onboarding guide completion rate | 85%+ |
| Dashboard load time | < 2 seconds |
| Stakeholder satisfaction (manual survey) | 8+/10 |

---

## Next Immediate Actions

1. **Create `currydash-central` repo** on GitHub (CoralShades org)
2. **Initialize with Claude Code** — `npx create-next-app@latest`
3. **Install BMAD v6** — `npx bmad-method@alpha install`
4. **Run `*workflow-init`** to generate planning structure
5. **Create PRD with BMAD** — `*create-prd` (use this document as input)
6. **Start Phase 1** — Auth + Layout + Role system

---

*This action plan was generated based on analysis of the existing CurryDash ecosystem: 6 Jira projects (CUR, CAD, CAR, CPFP, PACK, CCW), 11 epics, 98 FRs, 53 NFRs, 2 active repositories (Admin-Seller_Portal, User-Web-Mobile), brand guidelines v2.0, and prior conversations about branding, BMAD v6 workflows, Driver.js tours, Filament modernization, and GCP migration.*
