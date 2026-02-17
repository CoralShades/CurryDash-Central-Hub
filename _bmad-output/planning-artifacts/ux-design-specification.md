---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-CurryDash-Central-Hub-2026-02-17.md
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/prd-validation-report.md
  - _bmad-output/planning-artifacts/research/technical-currydash-mvp-architecture-research-2026-02-17.md
  - CurryDash_Central_Hub_Action_Plan.md
date: 2026-02-17
author: Demi
visualDensity: balanced-hybrid
scope: full-comprehensive
---

# UX Design Specification: CurryDash Central Hub

**Author:** Demi
**Date:** 2026-02-17
**Visual Density:** Balanced Hybrid (key metrics at a glance, expandable sections for deep dives)
**Primary Viewport:** Desktop-first (1280px+), tablet secondary (768px+), no mobile MVP

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Information Architecture](#2-information-architecture)
3. [Navigation System](#3-navigation-system)
4. [Design Tokens & Theme](#4-design-tokens--theme)
5. [Page Layouts](#5-page-layouts)
6. [Dashboard Design](#6-dashboard-design)
7. [Component Patterns](#7-component-patterns)
8. [AI UX Patterns](#8-ai-ux-patterns)
9. [Interaction Flows](#9-interaction-flows)
10. [System States & Feedback](#10-system-states--feedback)
11. [Responsive Behavior](#11-responsive-behavior)
12. [Accessibility](#12-accessibility)

---

## 1. Design Principles

Six principles guide every UX decision in Central Hub. When trade-offs arise, earlier principles take priority.

### P1: Glanceable Truth

The dashboard must answer "where do things stand?" within 5 seconds of page load. Key metrics are always visible without scrolling. Data summaries come first; detail is one click away, never zero clicks (which would create clutter).

**Applied:** Sprint progress bars, PR count badges, and blocker indicators are all above the fold. Individual issue details are behind a click or hover expansion.

### P2: Role-Appropriate Depth

Every user sees the same platform, but the depth of information matches their needs. A stakeholder sees summaries and trends. A PM sees summaries plus operational detail. A developer sees their assignments and technical context. No role gets data they don't need.

**Applied:** The RBAC matrix from the PRD (4 MVP roles x 13 permission categories) drives what appears in the UI, not just what's accessible. Hidden is not the same as forbidden — stakeholders don't see individual developer metrics at all, not as greyed-out elements.

### P3: AI as Co-Pilot, Not Gatekeeper

AI features enhance the experience but never block it. Every piece of data the AI can surface is also accessible through the direct dashboard UI. The AI sidebar is a power shortcut, not a required path. Dashboard functions fully with AI offline.

**Applied:** FR36/FR37 — graceful degradation. The AI sidebar shows "temporarily unavailable" but the dashboard never shows an error state because of AI. Report generation via AI complements the dashboard data that's already visible.

### P4: Data Freshness Transparency

Users must trust the data. When data is current, say nothing (no "updated 2s ago" noise). When data is stale, say so clearly but calmly. The system never displays stale data without acknowledgment and never hides freshness problems.

**Applied:** FR18 — staleness indicators appear only when data is >10 minutes old. Webhook health status is visible in admin view. AI reports include "data as of [timestamp]" footers.

### P5: Warm Professionalism

Central Hub uses the CurryDash spice palette — warm golds, earthy browns, natural greens — to create an interface that feels approachable but professional. It's an operations center, not a consumer app. Avoid playfulness that undermines credibility; avoid coldness that discourages daily use.

**Applied:** The spice palette provides visual warmth without being whimsical. Typography is clean and functional. Spacing is generous but not wasteful. The overall feel should evoke a well-organized kitchen command station.

### P6: Progressive Complexity

Start simple, reveal complexity on demand. New users (Kai's onboarding journey) should not be overwhelmed. Power users (Demi's daily workflow) should not be limited. Use expandable sections, drill-downs, and progressive disclosure to serve both.

**Applied:** Dashboard widgets show summary state by default. Click to expand. AI assistant starts with simple chat; advanced features (widget generation, report generation) are discoverable through conversation, not UI clutter.

---

## 2. Information Architecture

### Site Map

```
CurryDash Central Hub
│
├── /login                          # Authentication
│   ├── Email magic link
│   ├── Google OAuth
│   └── GitHub OAuth
│
├── /register                       # Account creation (admin-invited only)
│
├── / (redirect)                    # Redirects to role-appropriate dashboard
│
├── /admin                          # Admin/PM Dashboard [Admin role]
│   ├── Overview (unified dashboard)
│   ├── /admin/users                # User management
│   ├── /admin/integrations         # Integration settings (Jira, GitHub, API keys)
│   └── /admin/system               # System health, webhook status, API costs
│
├── /dev                            # Developer Dashboard [Developer role] (Phase 2)
│   └── (shared dashboard in MVP)
│
├── /qa                             # QA Dashboard [QA role] (Phase 2)
│   └── (shared dashboard in MVP)
│
├── /stakeholder                    # Stakeholder Dashboard [Stakeholder role]
│   └── Read-only unified dashboard (no admin controls)
│
└── AI Sidebar (overlay)            # Available on all dashboard pages
    ├── Chat
    ├── Report Generation
    └── Widget Generation
```

### Content Hierarchy (MVP)

**Level 1 — Navigation destinations** (sidebar items):
- Dashboard (home for each role)
- Users (admin only)
- Integrations (admin only)
- System Health (admin only)

**Level 2 — Dashboard sections** (content zones on dashboard page):
- Sprint Overview (Jira data)
- Repository Activity (GitHub data)
- Key Metrics (aggregated cards)
- Team Activity (recent actions)
- Blockers & Alerts (attention-requiring items)
- AI-Generated Widgets (persistent, user-created)

**Level 3 — Detail views** (accessible via drill-down):
- Individual Jira issue detail
- Individual PR detail
- Individual team member activity
- Full report view (AI-generated)

### Information Priority Matrix

| Information | PM/Admin | Developer | QA | Stakeholder |
|------------|----------|-----------|-----|-------------|
| Sprint progress (all projects) | **Primary** | Secondary | Secondary | **Primary** |
| Blockers/alerts | **Primary** | Own only | QA-relevant | Hidden |
| PR activity | **Primary** | **Primary** | Read-only | Hidden |
| Key metrics cards | **Primary** | Secondary | Secondary | **Primary** |
| Team activity | **Primary** | Own only | Hidden | Aggregate only |
| Bug counts by severity | Secondary | Hidden | **Primary** | Hidden |
| AI assistant | Available | Available | Available | Available |
| Admin controls | **Primary** | Hidden | Hidden | Hidden |

---

## 3. Navigation System

### Primary Navigation: Collapsible Sidebar

The sidebar is the primary navigation element, pinned to the left edge of the viewport.

**Anatomy:**
```
┌──────────────────────┐
│  [CurryDash Logo]    │  ← Brand mark + "Central Hub" text
│  ──────────────────  │
│                      │
│  📊 Dashboard        │  ← Always visible, active state
│                      │
│  ── ADMIN ────────── │  ← Section label (admin-only, hidden for other roles)
│  👥 Users            │
│  🔗 Integrations     │
│  ⚙️ System Health     │
│                      │
│                      │
│                      │
│                      │
│  ──────────────────  │
│  [User Avatar]       │  ← User menu (profile, role badge, logout)
│  Demi · Admin        │
│  [Collapse ‹]        │  ← Toggle to icon-only mode
└──────────────────────┘
```

**Behavior:**
- **Expanded state** (default on desktop): 256px wide. Shows icons + labels + section headers.
- **Collapsed state** (toggle or responsive): 64px wide. Shows icons only with tooltips on hover.
- **Active item**: Turmeric Gold left border accent (4px) + subtle background tint.
- **Role-conditional sections**: Admin section (Users, Integrations, System Health) is not rendered for non-admin roles — not hidden, not disabled, simply absent from the DOM.
- **Keyboard**: `[` to toggle collapse. Arrow keys to navigate items. Enter to select.

### Secondary Navigation: Page Header

A top bar spanning the content area (to the right of sidebar).

**Anatomy:**
```
┌──────────────────────────────────────────────────────────────┐
│  Dashboard                    🔍 Search    🔔 Alerts    [AI] │
│  Last updated: just now                         ▼ Demi       │
└──────────────────────────────────────────────────────────────┘
```

**Elements:**
- **Page title**: Current page name (e.g., "Dashboard", "User Management")
- **Data freshness**: "Last updated: just now" or "Last updated: 8 min ago" (only shows elapsed time when >2 min)
- **Search** (Phase 2): Global search across Jira issues, PRs, docs
- **Alerts badge**: Notification bell with unread count badge (Chili Red). Clicking opens a dropdown with recent alerts (webhook failures, blockers, rate limit warnings).
- **AI toggle button**: Opens/closes the AI sidebar panel. Turmeric Gold icon when active.
- **User menu**: Avatar + name + role badge. Dropdown with: Profile, Theme toggle (light/dark), Logout.

### Breadcrumbs

Displayed below the page header for pages deeper than Level 1:

```
Dashboard  >  Sprint CUR-42  >  CUR-312 (Payment Timeout)
```

Breadcrumbs are not shown on the main dashboard view (it's the root).

### Navigation State Management

| Scenario | Behavior |
|----------|----------|
| User logs in | Redirect to role-appropriate root: Admin → `/admin`, Dev → `/dev`, Stakeholder → `/stakeholder` |
| User manually navigates to unauthorized route | Redirect to their dashboard with no error flash (principle P2 — role-appropriate depth, not error messaging) |
| User clicks dashboard item drill-down | Push to detail route (e.g., `/admin/issues/CUR-312`). Back button returns to dashboard with scroll position preserved. |
| Session expires | Redirect to `/login` with "Session expired" message. After re-login, return to the page they were on. |

---

## 4. Design Tokens & Theme

### Color System

Built on the CurryDash spice palette, extended for UI use cases:

**Brand Colors:**

| Token | Value | Usage |
|-------|-------|-------|
| `--color-turmeric` | `#E6B04B` | Primary actions, active states, AI elements, QA role accent |
| `--color-chili` | `#C5351F` | Destructive actions, errors, critical alerts, Admin role accent |
| `--color-coriander` | `#4A7C59` | Success states, positive trends, Developer role accent |
| `--color-cinnamon` | `#5D4037` | Secondary text, borders, Stakeholder role accent |
| `--color-cream` | `#FFF8DC` | Page background (light mode) |

**Semantic Colors:**

| Token | Light Mode | Usage |
|-------|-----------|-------|
| `--color-background` | `#FFF8DC` (Cream) | Page background |
| `--color-surface` | `#FFFFFF` | Cards, modals, sidebar |
| `--color-surface-raised` | `#FFFFFF` + shadow | Elevated cards, dropdowns |
| `--color-text-primary` | `#5D4037` (Cinnamon) | Body text, headings |
| `--color-text-secondary` | `#8D6E63` | Secondary text, labels, captions |
| `--color-text-muted` | `#BCAAA4` | Placeholder text, disabled states |
| `--color-border` | `#D7CCC8` | Card borders, dividers |
| `--color-border-subtle` | `#EFEBE9` | Subtle separators within cards |
| `--color-success` | `#4A7C59` (Coriander) | Success states, positive metrics |
| `--color-warning` | `#E6B04B` (Turmeric) | Warnings, attention needed |
| `--color-error` | `#C5351F` (Chili) | Errors, critical issues |
| `--color-info` | `#5C6BC0` | Informational states, links |

**Status Colors (for data visualization):**

| Token | Value | Usage |
|-------|-------|-------|
| `--color-status-done` | `#4A7C59` | Completed items |
| `--color-status-in-progress` | `#E6B04B` | Active/in-progress items |
| `--color-status-blocked` | `#C5351F` | Blocked items |
| `--color-status-to-do` | `#8D6E63` | Not started items |
| `--color-status-in-review` | `#5C6BC0` | Review/QA items |

**Role Badge Colors:**

| Role | Background | Text |
|------|-----------|------|
| Admin | `#C5351F` (Chili) | White |
| Developer | `#4A7C59` (Coriander) | White |
| QA | `#E6B04B` (Turmeric) | `#5D4037` (Cinnamon) |
| Stakeholder | `#5D4037` (Cinnamon) | White |

### Typography

Using the system font stack (no custom font loading for performance):

| Token | Value | Usage |
|-------|-------|-------|
| `--font-family` | `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | All text |
| `--font-mono` | `"JetBrains Mono", "Fira Code", "Consolas", monospace` | Code, metrics, IDs |
| `--text-xs` | `12px / 1.5` | Labels, badges, timestamps |
| `--text-sm` | `14px / 1.5` | Secondary text, table cells, captions |
| `--text-base` | `16px / 1.5` | Body text, form inputs |
| `--text-lg` | `18px / 1.5` | Section headings within cards |
| `--text-xl` | `20px / 1.5` | Page sub-headings |
| `--text-2xl` | `24px / 1.3` | Page headings |
| `--text-3xl` | `30px / 1.2` | Dashboard metric values |
| `--text-4xl` | `36px / 1.1` | Hero metric numbers |
| `--font-weight-normal` | `400` | Body text |
| `--font-weight-medium` | `500` | Labels, navigation items |
| `--font-weight-semibold` | `600` | Headings, metric values |
| `--font-weight-bold` | `700` | Hero metrics, emphasis |

### Spacing Scale

Consistent 4px base unit:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Tight internal spacing (badge padding) |
| `--space-2` | `8px` | Compact elements (icon gaps, inline spacing) |
| `--space-3` | `12px` | Default internal padding (card content) |
| `--space-4` | `16px` | Standard gap between elements |
| `--space-5` | `20px` | Section padding within cards |
| `--space-6` | `24px` | Card padding, gap between cards |
| `--space-8` | `32px` | Section gaps on page |
| `--space-10` | `40px` | Major section separators |
| `--space-12` | `48px` | Page-level top/bottom margins |

### Elevation & Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(93, 64, 55, 0.05)` | Subtle lift (cards at rest) |
| `--shadow-md` | `0 4px 6px rgba(93, 64, 55, 0.07)` | Active cards, sidebar |
| `--shadow-lg` | `0 10px 15px rgba(93, 64, 55, 0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(93, 64, 55, 0.12)` | AI sidebar panel |

Note: Shadows use Cinnamon-tinted rgba (warm tone) rather than pure black, maintaining palette cohesion.

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `6px` | Badges, small buttons |
| `--radius-md` | `8px` | Cards, inputs, standard buttons |
| `--radius-lg` | `12px` | Modals, major containers |
| `--radius-xl` | `16px` | AI sidebar, large panels |
| `--radius-full` | `9999px` | Avatars, circular badges |

### Animation

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | `150ms ease` | Hover states, button feedback |
| `--transition-normal` | `250ms ease` | Sidebar collapse, panel slides |
| `--transition-slow` | `350ms ease` | Modal open/close, page transitions |
| `--transition-spring` | `300ms cubic-bezier(0.34, 1.56, 0.64, 1)` | AI widget appearance, celebrations |

---

## 5. Page Layouts

### Shell Layout (All Authenticated Pages)

Every authenticated page shares the same shell:

```
┌─────────┬──────────────────────────────────────────────────────┐
│         │  [Header Bar]                                        │
│         ├──────────────────────────────────────────────────────┤
│ Sidebar │                                                      │
│  (nav)  │              Main Content Area                       │
│         │                                                      │
│         │                                                      │
│         │                                                      │
│         │                                                      │
│         │                                                      │
│         │                                                      │
│         │                                                      │
└─────────┴──────────────────────────────────────────────────────┘
```

**Dimensions:**
- Sidebar: 256px expanded / 64px collapsed
- Header: 64px height
- Content area: Remaining width, scrolls vertically
- Max content width: 1440px (centered within content area for ultra-wide screens)
- Content padding: `--space-6` (24px) on all sides

### Shell Layout with AI Sidebar Open

```
┌─────────┬──────────────────────────────────┬───────────────────┐
│         │  [Header Bar]                    │                   │
│         ├──────────────────────────────────┤   AI Sidebar      │
│ Sidebar │                                  │                   │
│  (nav)  │        Main Content Area         │  [Chat Input]     │
│         │        (compressed)              │  [Messages]       │
│         │                                  │  [Actions]        │
│         │                                  │                   │
│         │                                  │                   │
│         │                                  │                   │
└─────────┴──────────────────────────────────┴───────────────────┘
```

**AI Sidebar:**
- Width: 400px fixed
- Slides in from right edge with `--transition-normal`
- Main content compresses to accommodate (not overlaid)
- Header bar extends full width; AI toggle button visually connects to the sidebar

### Login Page Layout

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                     [CurryDash Logo]                             │
│                     Central Hub                                  │
│                                                                  │
│                  ┌──────────────────────┐                        │
│                  │   Login Card         │                        │
│                  │                      │                        │
│                  │   [Email input]      │                        │
│                  │   [Magic Link btn]   │                        │
│                  │   ─── or ───         │                        │
│                  │   [Google OAuth]     │                        │
│                  │   [GitHub OAuth]     │                        │
│                  │                      │                        │
│                  └──────────────────────┘                        │
│                                                                  │
│                  Powered by CurryDash                            │
└──────────────────────────────────────────────────────────────────┘
```

- Centered vertically and horizontally on Cream background
- Login card: max-width 400px, white surface, `--shadow-lg`
- CurryDash logo above card in Turmeric Gold
- No sidebar, no header — minimal authentication-focused layout

### Admin Sub-Pages Layout (Users, Integrations, System Health)

```
┌─────────┬──────────────────────────────────────────────────────┐
│         │  [Header: User Management]                           │
│         ├──────────────────────────────────────────────────────┤
│ Sidebar │                                                      │
│  (nav)  │  [Action Bar: + Add User    Search: [________]]     │
│         │                                                      │
│         │  ┌──────────────────────────────────────────────┐    │
│         │  │  Data Table                                  │    │
│         │  │  Name | Email | Role | Status | Actions      │    │
│         │  │  ─────────────────────────────────────────── │    │
│         │  │  Demi  | d@..  | Admin | Active | [Edit]     │    │
│         │  │  Arjun | a@..  | Dev   | Active | [Edit]     │    │
│         │  │  ...                                         │    │
│         │  └──────────────────────────────────────────────┘    │
│         │                                                      │
└─────────┴──────────────────────────────────────────────────────┘
```

- Single-column content with full-width data table
- Action bar above table for primary action (Add User) and search/filter
- Table uses shadcn/ui DataTable component with sorting and pagination

---

## 6. Dashboard Design

### Dashboard Grid System

The dashboard uses a responsive card grid that adapts to available width:

**Grid specification:**
- Columns: 12-column grid (CSS Grid)
- Gap: `--space-6` (24px)
- Cards snap to grid columns: small cards = 3 cols (25%), medium cards = 4 cols (33%), large cards = 6 cols (50%), full-width = 12 cols (100%)
- Rows auto-size based on card content

### Dashboard Section Layout (MVP)

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────┐│
│  │  Stories     │ │  PRs        │ │  Bugs       │ │  CI      ││
│  │  Completed   │ │  Merged     │ │  Open       │ │  Status  ││
│  │  ████ 12     │ │  ████ 7     │ │  ████ 23    │ │  ✓ Green ││
│  │  ▲ +3 wk    │ │  ▲ +2 wk    │ │  ▼ -5 wk    │ │  All OK  ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └──────────┘│
│                                                                │
│  ┌─────────────────────────────┐ ┌────────────────────────────┐│
│  │  Sprint Progress             │ │  Recent Activity           ││
│  │                              │ │                            ││
│  │  [CUR]  ████████░░ 80%      │ │  Arjun merged PR #142      ││
│  │  [CAD]  ██████░░░░ 60%      │ │  Priya moved CUR-312       ││
│  │  [CAR]  ████████████ 100%   │ │  Arjun pushed 3 commits    ││
│  │  [CPFP] █████░░░░░ 50%     │ │  Demi created CUR-320      ││
│  │  [PACK] ██░░░░░░░░ 20%     │ │  Webhook: Jira sync OK     ││
│  │  [CCW]  ███████░░░ 70%     │ │                            ││
│  └─────────────────────────────┘ └────────────────────────────┘│
│                                                                │
│  ┌─────────────────────────────┐ ┌────────────────────────────┐│
│  │  Blockers & Alerts          │ │  Pull Request Feed         ││
│  │                              │ │                            ││
│  │  🔴 CUR-312 Payment timeout │ │  #142 Fix auth flow   ✓   ││
│  │     blocked · 2 days        │ │  #141 Add webhook     ⏳   ││
│  │  🟡 Rate limit at 52%      │ │  #140 Update schema   ✓   ││
│  │     Jira API · warning      │ │  #139 Sprint widget   ⏳   ││
│  │                              │ │                            ││
│  └─────────────────────────────┘ └────────────────────────────┘│
│                                                                │
│  ┌──────────────────────────────────────────────────────────── ┐│
│  │  AI-Generated Widgets (persistent section)                  ││
│  │  [Empty state: "Ask the AI to create a dashboard widget"]   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Dashboard Sections Detail

#### Row 1: Key Metrics Cards (4 x 3-column cards)

Each metric card displays:
- **Metric label** (text-sm, secondary color): "Stories Completed"
- **Metric value** (text-3xl, semibold, primary color): "12"
- **Trend indicator** (text-xs): Arrow up/down + delta + period ("▲ +3 this week")
- **Visual progress** (optional): Mini progress bar or sparkline

Trend colors: `--color-success` for positive trends, `--color-error` for negative, `--color-text-muted` for neutral.

Cards use a white surface with `--shadow-sm`, `--radius-md`, and `--space-5` padding. Hover elevates to `--shadow-md`.

#### Row 2: Sprint Progress + Recent Activity (6-column + 6-column)

**Sprint Progress card:**
- Lists all 6 Jira projects by key (CUR, CAD, CAR, CPFP, PACK, CCW)
- Each project shows: project key, project name (truncated), horizontal progress bar, percentage
- Progress bars use `--color-status-done` fill on `--color-border-subtle` track
- Click a project row to drill down to that project's issues
- Card header includes "Sprint [name]" and date range

**Recent Activity card:**
- Chronological feed of recent events (max 10 visible, scrollable)
- Each item: avatar/icon + actor name + action verb + target + timestamp
- Event types: PR merged, issue transitioned, commits pushed, webhook sync
- Uses relative timestamps ("2 min ago", "1 hour ago")
- Click any item to drill down to detail

#### Row 3: Blockers & Alerts + PR Feed (6-column + 6-column)

**Blockers & Alerts card:**
- Priority-sorted list of items requiring attention
- Blocker items: Chili Red left-border accent, issue key, title, "blocked · X days" duration
- Warning items: Turmeric Gold left-border accent, description, source
- Critical count badge in card header ("2 blockers")
- Click to drill down; expand inline for quick context
- Empty state: "No blockers — all clear" with Coriander Green checkmark

**Pull Request Feed card:**
- List of recent PRs across all connected repos
- Each item: PR number, title (truncated), repo name, status icon (merged ✓ green, open ⏳ gold, draft ○ muted)
- Reviewer avatars (if available)
- Click to open PR detail view

#### Row 4: AI-Generated Widgets (12-column, expandable)

- This section is initially empty with a prominent empty state
- Empty state message: "Ask the AI assistant to create a dashboard widget. Try: 'Show me sprint velocity for the last 3 sprints.'"
- AI-generated widgets appear here as persistent cards
- Each widget has: title, visualization (chart/table/metric), "data as of" timestamp, overflow menu (refresh, remove)
- Widget types: metric cards, bar charts, line charts, pie charts, data tables (all via shadcn/ui + Recharts)

### Stakeholder Dashboard Variant

Identical layout to Admin dashboard with the following differences:
- **Admin controls removed**: No "Users", "Integrations", "System Health" sidebar items
- **Individual dev metrics hidden**: Team activity shows aggregate only ("5 PRs merged this week" not "Arjun merged 3, Kai merged 2")
- **PR code links hidden**: PR titles visible, links to code are not
- **Widget generation disabled**: AI chat and report generation available; widget creation not offered
- **Visual indicator**: Subtle "Read-only" badge in header (text-xs, muted)

---

## 7. Component Patterns

### Card Component

The foundational container for all dashboard content.

**Variants:**

| Variant | Usage | Visual |
|---------|-------|--------|
| **Default** | Standard dashboard widget | White surface, `--shadow-sm`, `--radius-md` |
| **Metric** | Key metric display | Default + large number + trend |
| **Alert** | Blockers, warnings | Left border accent (4px, color by severity) |
| **AI-Generated** | AI-created widgets | Default + subtle Turmeric Gold top-border accent (2px) |
| **Interactive** | Expandable cards | Default + chevron toggle + expand/collapse animation |

**Card anatomy:**
```
┌─────────────────────────────────────────┐
│  [Icon] Card Title         [⋮ Menu]     │  ← Header (--space-4 padding)
│  ─────────────────────────────────────  │  ← Separator (--color-border-subtle)
│                                         │
│  Card content area                      │  ← Body (--space-5 padding)
│                                         │
│  ─────────────────────────────────────  │  ← Footer separator (optional)
│  Footer: metadata, actions, timestamp   │  ← Footer (--space-3 padding)
└─────────────────────────────────────────┘
```

### Button Hierarchy

| Level | Style | Usage |
|-------|-------|-------|
| **Primary** | Solid Turmeric Gold background, white text | Main actions: "Generate Report", "Create User", "Save" |
| **Secondary** | Outlined Cinnamon border, Cinnamon text | Secondary actions: "Cancel", "Filter", "Export" |
| **Ghost** | No border/background, Cinnamon text | Tertiary actions: "View All", table actions |
| **Destructive** | Solid Chili Red background, white text | Dangerous actions: "Remove Widget", "Delete User" |
| **AI Action** | Solid Turmeric Gold with sparkle icon | AI-specific: "Generate Widget", "Create Report" |

All buttons: `--radius-md`, `--text-sm`, `--font-weight-medium`, `--transition-fast` hover.

### Badge Component

| Type | Style | Usage |
|------|-------|-------|
| **Role badge** | Filled, role color (see Role Badge Colors) | User avatars, role indicators |
| **Status badge** | Filled, status color | Issue status (Done, In Progress, Blocked, To Do) |
| **Count badge** | Filled Chili Red circle, white text | Notification counts, alert counts |
| **Info badge** | Outlined, muted border | Labels, tags, project keys |

### Data Table

Used for Users management, integration lists, and detailed data views.

**Features:**
- Column sorting (click header)
- Search/filter bar above table
- Pagination (10/25/50 per page)
- Row hover highlight (Cream tint)
- Action column (rightmost) with ghost buttons
- Empty state: illustration + message + action
- Loading state: skeleton rows

Built on shadcn/ui `<DataTable>` with Tanstack Table.

### Form Patterns

- Labels above inputs (not floating labels — better accessibility, less fragile)
- Required fields marked with Chili Red asterisk
- Inline validation messages below inputs (Chili Red for errors, Coriander Green for success)
- Form actions right-aligned: [Cancel] [Submit]
- All inputs use `--radius-md`, `--text-base`, Cinnamon border

### Modal / Dialog

- Centered on viewport with overlay backdrop (rgba black 50%)
- Max-width: 480px (small), 640px (medium), 800px (large)
- Close: X button (top-right), Escape key, clicking backdrop
- Actions in footer: right-aligned [Cancel] [Confirm]
- Used for: user creation/edit, confirmation dialogs, report preview
- Animated: fade in + scale up with `--transition-normal`

### Toast / Notification

- Position: top-right, below header
- Auto-dismiss: 5 seconds (success), sticky (errors — require manual dismiss)
- Variants: success (Coriander), warning (Turmeric), error (Chili), info (blue)
- Anatomy: icon + message + dismiss X
- Stack: max 3 visible, newest on top

---

## 8. AI UX Patterns

### AI Sidebar Panel

The AI assistant lives in a right-side panel accessible from any dashboard page.

**Anatomy:**
```
┌───────────────────────────┐
│  ✦ AI Assistant    [×]    │  ← Header with close button
│  ─────────────────────────│
│                           │
│  ┌─────────────────────┐  │
│  │ Welcome, Demi!      │  │  ← System greeting (role-aware)
│  │ I can help you with │  │
│  │ project insights,   │  │
│  │ reports, and widgets.│  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ 💬 You:             │  │  ← User message
│  │ Generate a sprint   │  │
│  │ report for this week│  │
│  └─────────────────────┘  │
│                           │
│  ┌─────────────────────┐  │
│  │ ✦ AI:               │  │  ← AI response (streaming)
│  │ Based on Jira data  │  │
│  │ across CUR, CAD...  │  │
│  │ ████████░░ streaming │  │
│  │                     │  │
│  │ Data as of: 9:14am  │  │  ← Source citation
│  └─────────────────────┘  │
│                           │
│  ─────────────────────────│
│  ┌─────────────────────┐  │
│  │ Ask anything...     │  │  ← Input field
│  │              [Send] │  │
│  └─────────────────────┘  │
│                           │
│  Quick actions:           │  ← Suggested actions
│  [Sprint Report]          │
│  [Bug Summary]            │
│  [Create Widget]          │
└───────────────────────────┘
```

**Behavior:**
- Opens with slide-in animation from right (`--transition-normal`, 250ms)
- Main content area compresses to accommodate — sidebar does NOT overlay content
- Persists conversation across page navigation within the same session
- Streaming responses render token-by-token with a subtle cursor animation
- Quick action chips at the bottom for common tasks (contextual to current view)

### AI Message Types

| Type | Visual Treatment |
|------|-----------------|
| **User message** | Right-aligned, Cream background bubble, Cinnamon text |
| **AI text response** | Left-aligned, white background, Cinnamon text. Source citation footer in text-xs muted. |
| **AI report** | Left-aligned, full-width card with formatted markdown. "Save as PDF" and "Copy" actions in footer. |
| **AI widget preview** | Inline card showing the widget as it would appear on the dashboard. "Add to Dashboard" primary button + "Modify" ghost button. |
| **AI error** | Left-aligned, Chili Red left-border accent. "I couldn't complete that request. [Try Again]" |
| **AI unavailable** | Centered notice: "AI assistant is temporarily unavailable. Dashboard data is unaffected." Turmeric warning style. |

### AI Widget Generation Flow

This is the most novel interaction pattern — how users create persistent dashboard widgets through conversation.

**Step 1: User Request**
User types a natural language description:
> "Show me sprint velocity for the last 3 sprints as a bar chart"

**Step 2: AI Processing (visible)**
AI sidebar shows:
- Thinking indicator: "Analyzing sprint data..."
- Data fetching indicator: "Querying Jira across 6 projects..."
- Generating indicator: "Building widget..."

Progress uses a subtle animated dots pattern (not a progress bar — duration is unpredictable).

**Step 3: Widget Preview**
AI presents the widget inline in the chat as a live preview card:
```
┌─────────────────────────────┐
│  Sprint Velocity             │
│  ┌─────────────────────────┐│
│  │  █ █   █ █   █ █       ││
│  │  █ █   █ █   █ █       ││
│  │  █ █   █ █   █ █       ││
│  │  S-41  S-42  S-43       ││
│  └─────────────────────────┘│
│  Data as of: 9:22am         │
│                              │
│  [Add to Dashboard]  [Edit]  │
└─────────────────────────────┘
```

**Step 4: User Confirms**
- "Add to Dashboard" → widget saves to Supabase, appears in AI-Generated Widgets section of dashboard, toast confirmation
- "Edit" → user can ask for modifications: "Make it a line chart instead" or "Add a trend line"
- User can also ignore the preview and continue chatting

**Step 5: Persistent Widget**
Widget appears on the dashboard with:
- Turmeric Gold top-border accent (2px) identifying it as AI-generated
- Overflow menu: Refresh Data, Edit (re-opens AI chat), Remove from Dashboard
- "Data as of [timestamp]" in footer

### AI Report Generation Flow

**Trigger:** User asks "Generate a sprint report" (or clicks Quick Action chip)

**AI Response Format:**
```
┌──────────────────────────────────────┐
│  📄 Sprint Status Report              │
│  Sprint CUR-43 · Feb 10-17, 2026     │
│  ──────────────────────────────────── │
│                                       │
│  ## Summary                           │
│  8 of 12 stories completed (67%)      │
│  Velocity: 21 points (▲ +3 vs last)  │
│                                       │
│  ## Completed                         │
│  - CUR-301: Auth system ✓             │
│  - CUR-305: Dashboard layout ✓        │
│  - ...                                │
│                                       │
│  ## Blocked                           │
│  - CUR-312: Payment timeout 🔴        │
│    Reason: Jira API rate limit...     │
│                                       │
│  ## Risks                             │
│  - Jira rate limit changes Mar 2026   │
│                                       │
│  ──────────────────────────────────── │
│  Data as of: Feb 17, 2026 9:14am     │
│  Sources: Jira CUR/CAD/CAR projects   │
│                                       │
│  [Copy to Clipboard]  [Save as PDF]   │
└──────────────────────────────────────┘
```

Reports render as rich markdown within the AI sidebar. Full-width within the sidebar container. Actions at the bottom for export.

### AI Quick Action Chips

Contextual suggested actions displayed below the chat input. They change based on current dashboard context:

| Context | Quick Actions Shown |
|---------|-------------------|
| Dashboard home | "Sprint Report", "Bug Summary", "Create Widget" |
| Viewing sprint data | "Sprint Velocity Chart", "Blocker Analysis", "Compare to Last Sprint" |
| Viewing PR feed | "PR Review Summary", "Merge Activity This Week" |
| After generating a report | "Share Report", "Create Widget From This", "Dig Deeper" |

Chips use secondary button style (outlined, `--radius-full` for pill shape).

---

## 9. Interaction Flows

### Flow 1: Authentication

```
[User visits /] → [Check session]
  ├── Has valid session → Redirect to role dashboard
  └── No session → Show /login page
       ├── User enters email → Send magic link → Check inbox → Click link → Create session → Redirect
       ├── User clicks Google → OAuth flow → Create/link account → Create session → Redirect
       └── User clicks GitHub → OAuth flow → Create/link account → Create session → Redirect

First login after account creation:
  → /admin (Admin), /dev (Developer), /qa (QA), /stakeholder (Stakeholder)
  → Phase 2: Driver.js onboarding tour starts automatically
```

### Flow 2: Dashboard Morning Ritual (Demi's Journey)

```
[Demi opens Central Hub] → [Dashboard loads in <3s]
  → Scans metric cards (stories, PRs, bugs, CI) [5 seconds]
  → Spots blocker indicator on CUR-312 [glanceable]
  → Clicks blocker card → Inline expansion shows issue detail + linked PR + CI failure
  → Opens AI sidebar → Types "Generate sprint report for stakeholder call"
  → AI streams report (8s) → Demi reviews → Saves/copies
  → Closes AI sidebar → Continues reviewing dashboard
  → Total time: ~5-10 minutes (was 90 minutes)
```

### Flow 3: AI Widget Creation

```
[User clicks AI toggle or presses Cmd+K]
  → AI sidebar slides open (250ms)
  → User types widget request
  → AI shows processing stages:
     1. "Analyzing your request..." (1-2s)
     2. "Fetching data from Jira..." (2-5s)
     3. "Building widget..." (2-5s)
  → Widget preview renders inline in chat
  → User clicks [Add to Dashboard]
     → Widget config saves to Supabase
     → Toast: "Widget added to dashboard"
     → Widget appears in AI-Generated Widgets section
     → Dashboard scroll-to-widget animation
  OR User clicks [Edit]
     → Chat continues with modification context
     → New preview replaces old one
  OR User ignores and continues chatting
```

### Flow 4: Drill-Down from Dashboard to Detail

```
[User sees item on dashboard] → [Clicks item]
  ├── Jira issue → Issue detail panel (slide-in or expand inline)
  │    Shows: Key, Title, Status, Assignee, Priority, Description, Linked PRs
  │    Actions: Open in Jira (external link), Copy link
  │
  ├── Pull Request → PR detail panel
  │    Shows: Number, Title, Repo, Author, Status, Reviewers, CI Status
  │    Actions: Open in GitHub (external link), Copy link
  │
  └── Activity item → Navigates to source (issue or PR detail)

Back navigation: Browser back button or breadcrumb. Scroll position preserved.
```

### Flow 5: Admin User Management

```
[Admin navigates to /admin/users]
  → User list table loads (name, email, role, status, actions)
  → Admin clicks [+ Add User]
     → Modal opens: Email input, Role dropdown, [Cancel] [Create]
     → On submit: Account created, invite email sent, toast confirmation
     → New user appears in table
  → Admin clicks [Edit] on existing user
     → Modal opens: Prefilled fields, role reassignment dropdown
     → On submit: Changes saved, toast confirmation
  → Admin clicks [Deactivate]
     → Confirmation dialog: "Deactivate [name]? They will lose access."
     → On confirm: User deactivated, row shows muted state
```

### Flow 6: Session Expiry

```
[Session expires while user is on page]
  → Next API call returns 401
  → Intercept at application level
  → Show toast: "Your session has expired"
  → Redirect to /login after 2s
  → After re-login: return to the page they were on (stored in sessionStorage)
  → Dashboard data refreshes automatically
```

---

## 10. System States & Feedback

### Loading States

| Context | Loading Pattern |
|---------|----------------|
| **Initial page load** | Full-page skeleton: card outlines with shimmer animation (pulse). Shows layout structure before data arrives. |
| **Dashboard widgets** | Per-widget skeleton. Each card shows its layout skeleton independently — fast widgets appear first, slow widgets shimmer. |
| **AI sidebar message** | Animated dots "..." (typing indicator) followed by token-by-token streaming render. |
| **Data table** | Skeleton rows (5 rows of grey bars in column shapes) with shimmer. |
| **Button action** | Spinner icon replaces button text. Button disabled during load. |
| **Navigation** | Instant client-side transition. No loading bar for in-app navigation. |

Skeleton shimmer uses: `background: linear-gradient(90deg, var(--color-border-subtle) 25%, var(--color-surface) 50%, var(--color-border-subtle) 75%)` with CSS animation.

### Empty States

| Context | Message | Action |
|---------|---------|--------|
| **Dashboard (first use)** | "Welcome to Central Hub! Your dashboard will populate as Jira and GitHub data syncs." | "Configure Integrations" button |
| **AI widget section** | "No widgets yet. Ask the AI assistant to create your first dashboard widget." | "Open AI Assistant" button + example prompt |
| **Blockers card** | "No blockers — all clear" with Coriander Green checkmark | None (this is a success state) |
| **PR feed (no PRs)** | "No recent pull requests across connected repositories." | None |
| **User table (no users)** | "No team members yet." | "Add User" button |
| **AI chat (new session)** | Greeting message + quick action chips | Quick action chips |

### Error States

| Context | Treatment |
|---------|-----------|
| **Widget fails to load** | Card shows error boundary: "Couldn't load [widget name]" + [Retry] ghost button. Other widgets unaffected (FR19). |
| **Jira integration down** | Jira-dependent widgets show stale data + amber staleness badge: "Jira data may be outdated". Other widgets unaffected (NFR-I8). |
| **GitHub integration down** | Same pattern as Jira — isolated degradation with staleness indicator. |
| **AI provider down** | AI sidebar shows: "AI assistant is temporarily unavailable. Your dashboard data is unaffected." (FR37). Dashboard fully functional. |
| **Full API failure** | Dashboard shows last cached data. Header shows amber warning: "Some data may be outdated. [Details]" link opens system health. |
| **Network offline** | Full-page overlay: "You appear to be offline. Central Hub will reconnect automatically." Auto-retry with exponential backoff. |
| **401 Unauthorized** | Redirect to login (see Flow 6). |
| **403 Forbidden** | Redirect to role-appropriate dashboard. No error shown (principle P2). |

### Data Freshness Indicators

**When to show:** Only when data is older than threshold (principle P4 — say nothing when current).

| Staleness | Visual |
|-----------|--------|
| **0-2 min** | No indicator. Header shows "Last updated: just now" |
| **2-10 min** | Header shows "Last updated: X min ago" in secondary text |
| **>10 min** | Amber staleness badge on affected widgets: "Data from X min ago" (FR18) |
| **>30 min** | Chili Red staleness badge: "Stale data — last sync [time]". Admin: system health alert. |
| **Unknown (webhook failed)** | Amber badge: "Update status unknown — checking..." |

### Webhook Health Indicators (Admin Only)

Visible on System Health page and as a compact status in the page header:

```
Integration Health
┌─────────────────────────────────────────┐
│  Jira    ● Connected    Last event: 2m  │
│  GitHub  ● Connected    Last event: 8m  │
│  AI      ● Available    Latency: 1.2s   │
│  Rate Limits:                           │
│    Jira: ████████░░ 48% used            │
│    GitHub: ██░░░░░░░░ 8% used           │
│    AI: $12.40 / $50.00 budget           │
└─────────────────────────────────────────┘
```

Status dots: Coriander Green (connected), Turmeric Gold (degraded), Chili Red (disconnected).

---

## 11. Responsive Behavior

### Breakpoint System

| Breakpoint | Width | Target | Layout Adjustments |
|-----------|-------|--------|-------------------|
| **Desktop XL** | 1440px+ | Large monitors | Max content width capped at 1440px, centered |
| **Desktop** | 1280px-1439px | Standard laptops | Full layout: expanded sidebar + content + AI sidebar |
| **Desktop SM** | 1024px-1279px | Small laptops | Sidebar auto-collapses to icons. AI sidebar overlays instead of compressing. |
| **Tablet** | 768px-1023px | iPad landscape | Sidebar hidden (hamburger menu). AI sidebar full overlay. Metric cards stack 2x2. |
| **Mobile** | <768px | Not supported in MVP | Redirect to "Desktop recommended" message with basic data view |

### Responsive Adaptations

**At 1024px-1279px (Desktop SM):**
- Sidebar collapses to 64px icon-only mode
- AI sidebar overlays content (absolute positioning) instead of compressing the grid
- Metric cards remain 4-across (compressed width)
- Dashboard grid: 2-column instead of responsive 12-col

**At 768px-1023px (Tablet):**
- Sidebar hidden behind hamburger menu (top-left)
- Header becomes primary navigation
- Metric cards: 2-column grid (2 per row)
- Sprint progress + activity: stacked full-width
- AI sidebar: full-screen overlay with backdrop
- Data tables: horizontal scroll enabled

**Below 768px (Mobile — MVP non-target):**
- Show a friendly message: "CurryDash Central Hub is optimized for desktop. For the best experience, please use a laptop or tablet."
- Basic data view: key metrics only, no charts, no AI sidebar
- Full mobile support planned for Phase 4

### AI Sidebar Responsive Behavior

| Viewport | AI Sidebar Behavior |
|----------|-------------------|
| 1280px+ | Side panel (400px), content compresses |
| 1024-1279px | Overlay panel (400px), content does not compress |
| 768-1023px | Full-screen overlay with close button and back gesture |
| <768px | Not available |

---

## 12. Accessibility

### Standards

Target: WCAG 2.1 AA compliance for MVP. AAA for color contrast where achievable with the spice palette.

### Color Contrast Verification

| Combination | Ratio | WCAG AA (4.5:1) | WCAG AAA (7:1) |
|------------|-------|-----------------|----------------|
| Cinnamon (#5D4037) on Cream (#FFF8DC) | **8.1:1** | Pass | Pass |
| Cinnamon (#5D4037) on White (#FFFFFF) | **9.7:1** | Pass | Pass |
| White on Chili (#C5351F) | **4.9:1** | Pass | Fail |
| White on Coriander (#4A7C59) | **4.6:1** | Pass | Fail |
| Cinnamon on Turmeric (#E6B04B) | **3.8:1** | Fail (decorative OK) | Fail |
| White on Cinnamon (#5D4037) | **9.7:1** | Pass | Pass |

**Action items:**
- Body text (Cinnamon on Cream/White): Excellent contrast, AAA compliant
- Buttons (white on brand colors): AA compliant for all brand colors
- Turmeric on white for text: Use only for decorative/non-essential elements. For text on Turmeric backgrounds, use Cinnamon (#5D4037) which passes AA (3.8:1 is borderline — use semibold or larger text)
- QA role badge (Turmeric bg): Uses Cinnamon text instead of white for contrast

### Keyboard Navigation

| Context | Keys | Behavior |
|---------|------|----------|
| **Sidebar navigation** | `Tab` / `Shift+Tab` | Move between nav items |
| **Sidebar navigation** | `Enter` / `Space` | Activate selected item |
| **Sidebar toggle** | `[` | Collapse/expand sidebar |
| **AI sidebar toggle** | `Cmd+K` / `Ctrl+K` | Open/close AI assistant |
| **AI chat input** | `Enter` | Send message |
| **AI chat input** | `Shift+Enter` | New line |
| **Modals** | `Escape` | Close modal |
| **Dashboard cards** | `Tab` | Navigate between cards |
| **Dashboard cards** | `Enter` | Expand/drill-down |
| **Data tables** | Arrow keys | Navigate cells |
| **Data tables** | `Enter` | Activate row action |

### Focus Management

- Visible focus indicator: 2px solid Turmeric Gold outline with 2px offset (visible on all backgrounds)
- Focus trap in modals (Tab cycles within modal while open)
- Focus returns to trigger element when modal/sidebar closes
- Skip-to-content link as first focusable element (visible on focus)
- AI sidebar: focus moves to input field when opened

### Screen Reader Support

- All images and icons have `aria-label` or `alt` text
- Dashboard metric cards use `aria-live="polite"` for real-time updates
- AI streaming responses use `aria-live="polite"` with debounced announcements (every 2 seconds during stream, not per token)
- Role badges have `aria-label` describing the role
- Status indicators have text alternatives (not color-only)
- Data tables use proper `<th>` headers with `scope` attributes
- Charts include text descriptions of trends in `aria-label` (e.g., "Sprint velocity: 21 points, up from 18 last sprint")

### Reduced Motion

When `prefers-reduced-motion: reduce` is detected:
- Skeleton shimmer animations replaced with static grey
- Sidebar slide transitions replaced with instant show/hide
- AI streaming shows paragraphs at a time instead of token-by-token
- Chart animations disabled (instant render)
- Toast notifications appear without slide animation

---

## Appendix A: Widget Type Specifications

Pre-built widget types that the AI can generate:

| Widget Type | Visualization | Data Source | Size |
|------------|--------------|-------------|------|
| **Metric Card** | Large number + trend arrow + sparkline | Any single KPI | 3-column (small) |
| **Bar Chart** | Vertical bars, grouped or stacked | Sprint velocity, bug counts, PR counts | 6-column (medium) |
| **Line Chart** | Time series with data points | Velocity trends, bug trends over time | 6-column (medium) |
| **Pie / Donut Chart** | Segmented circle | Issue distribution by status/type/project | 4-column (small-medium) |
| **Data Table** | Sortable rows and columns | Issue lists, PR lists, team metrics | 6 or 12-column (flexible) |
| **Status List** | Ordered items with status indicators | Blocker list, deployment status, integration health | 6-column (medium) |
| **Progress Bar Set** | Multiple horizontal progress bars | Project-by-project completion | 6-column (medium) |

All widgets built on shadcn/ui components + Recharts for charts.

---

## Appendix B: Keyboard Shortcut Reference

| Shortcut | Action |
|----------|--------|
| `[` | Toggle sidebar collapse |
| `Cmd/Ctrl + K` | Toggle AI assistant |
| `Cmd/Ctrl + /` | Focus search (Phase 2) |
| `Escape` | Close modal / Close AI sidebar |
| `G then D` | Go to Dashboard |
| `G then U` | Go to Users (admin) |
| `G then I` | Go to Integrations (admin) |
| `G then S` | Go to System Health (admin) |

Vim-style `G then X` navigation uses a 500ms timeout between keystrokes.

---

*UX Design Specification completed 2026-02-17 through collaborative BMAD workflow.*
*Input documents: Product Brief, PRD, PRD Validation Report, Technical Research, Action Plan.*
*Visual density: Balanced hybrid. Scope: Full comprehensive.*
