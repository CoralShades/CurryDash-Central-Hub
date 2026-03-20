# CurryDash Project Management Playbook & Taxonomy Guide

> **Audience:** All contributors — backend engineers, Flutter developers, QA, and AI agents working on the CurryDash ecosystem.
> **Scope:** This document governs how Jira issues, epics, tickets, and GitHub branches are created and maintained across all six CurryDash projects (CAD · CAR · CCW · CPFP · CUR · PACK).

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Issue Taxonomy](#2-issue-taxonomy)
3. [Naming Conventions](#3-naming-conventions)
4. [Ticket Anatomy & Templates](#4-ticket-anatomy--templates)
5. [Definition of Ready (DoR)](#5-definition-of-ready-dor)
6. [Definition of Done (DoD)](#6-definition-of-done-dod)
7. [Workflow & Status Transitions](#7-workflow--status-transitions)
8. [Branch & Commit Naming](#8-branch--commit-naming)
9. [Cross-Project Dependency Rules](#9-cross-project-dependency-rules)
10. [Release Version Management](#10-release-version-management)
11. [Team Ownership Matrix](#11-team-ownership-matrix)
12. [Governance Cadence](#12-governance-cadence)

---

## 1. Project Overview

CurryDash is a multi-component food delivery ecosystem. Every ticket must be created in the **correct Jira project** — the table below is the authoritative routing guide.

| Project Key | Full Name | Tech Layer | Users Served |
|-------------|-----------|-----------|--------------|
| **CUR** | CurryPackApp – Central Management | Laravel 10.x (CentralLogics, APIs, Notifications) | All — orchestration hub |
| **CAD** | CurryPackApp – Admin Dashboard | Laravel (Blade), PHP 8.2+ | Platform administrators |
| **CAR** | CurryPackApp – Seller Dashboard | Laravel (Blade), PHP 8.2+ | Restaurant vendors |
| **CPFP** | CurryPackApp – Food Packages & Combos | Laravel (Eloquent data model) | All — data foundation |
| **CCW** | CurryPackApp – Customer Web Portal | Flutter Web / PWA | End customers (web) |
| **PACK** | CurryPackApp – Mobile | Flutter (iOS & Android) | End customers + delivery drivers |

**Routing rule:** When unsure, use this decision tree:

```
Is it a database schema change?  ──────────────────────────► CPFP
Is it a backend API or notification change? ────────────────► CUR
Is it an Admin UI feature? ─────────────────────────────────► CAD
Is it a Vendor/Seller portal feature? ──────────────────────► CAR
Is it a Flutter mobile feature? ────────────────────────────► PACK
Is it a Flutter web / PWA feature? ─────────────────────────► CCW
Is it infrastructure, DevOps, or CI/CD? ────────────────────► CAD (use the [DevOps] prefix)
```

---

## 2. Issue Taxonomy

### 2.1 Issue Types

| Issue Type | When to Use | Who Creates It |
|------------|------------|----------------|
| **Epic** | A large feature or theme that spans multiple sprints and contains many stories. Example: "Vendor Onboarding", "Real-Time Order Operations". Maximum 1 epic per major PRD functional-requirement group. | PM (Demi) |
| **Story** (User Story) | A single, deliverable slice of user-facing functionality that fits within one sprint. Written from the perspective of a named user role. | PM or Tech Lead |
| **Backend Task** | A backend implementation task with no direct user-facing output — migrations, API endpoints, service layer additions, queue jobs, Eloquent model changes. | Backend Dev (Ramesh) |
| **Frontend Task** | A frontend implementation task — Blade templates, Flutter widgets, PWA screens. | Frontend Dev (Ruchiran / Ramesh for Blade) |
| **Testing Task** | A QA or automation task — writing PHPUnit tests, Playwright E2E scripts, manual test cases, regression test execution. | QA Lead (Kasun) |
| **DevOps Task** | Infrastructure, CI/CD, Docker, GCP Cloud Run, environment configuration. | Ramesh / DevOps |
| **Bug** | A confirmed defect in production or staging. Must include steps to reproduce and expected vs actual behaviour. | Anyone — triage by QA Lead |
| **Subtask** | A breakdown of any parent ticket into smaller, individually trackable work units. Maximum depth: 1 level. | Assignee of parent ticket |

### 2.2 Hierarchy Rules

```
Epic
 └── Story  (describes the "what" and "why")
      ├── Backend Task  (implements the API/model side)
      ├── Frontend Task  (implements the UI side)
      └── Testing Task  (verifies acceptance criteria)
```

- Every Story must be linked to a parent Epic.
- Backend/Frontend/Testing Tasks may live directly under an Epic when there is no user-facing story (e.g. a pure infrastructure task).
- Bugs stand alone — they are not children of stories. They are assigned to the relevant Epic via the **Epic Link** field.
- Subtasks are allowed but should be rare. Prefer separate Backend/Frontend Tasks over subtasks.

### 2.3 PRD Traceability Labels

Every Story and Epic must carry a label linking it back to the master PRD. Use the format `prd-fr-{number}` for single FRs or `prd-epic-{number}` for epic-level coverage:

| Label | Meaning |
|-------|---------|
| `prd-epic-1` | Covers PRD Epic 1 (Vendor Onboarding) |
| `prd-epic-4` | Covers PRD Epic 4 (Admin Vendor Management) |
| `prd-fr-9` | Directly implements FR9 (Food item CRUD) |
| `non-prd-scope` | Operational or infrastructure work not in the PRD |

---

## 3. Naming Conventions

### 3.1 Epic Titles

Format: `[Project Prefix] – [Feature Domain]: [Scope Phrase]`

| Prefix | Used For | Example |
|--------|----------|---------|
| `[CurryDash-Hub]` | CUR — cross-cutting API and notification work | `[CurryDash-Hub] – Notifications: Multi-Channel Push and Email` |
| `[Admin]` | CAD — admin portal features | `[Admin] – Vendor Management: Approval and Suspension Workflow` |
| `[Seller]` | CAR — vendor portal features | `[Seller] – Menu: Food Item CRUD and Variants` |
| `[Package]` | CPFP — package data model | `[Package] – Data Model: 3-Tier Package Hierarchy` |
| `[Mobile]` | PACK — Flutter mobile app | `[Mobile] – Order Tracking: Real-Time Driver Location` |
| `[Web]` | CCW — Flutter web / PWA | `[Web] – Customer Checkout: Cart and Payment Flow` |

### 3.2 Story Titles

Format (mandatory): `As a [user role], I want to [action] so that [business value]`

Valid user roles for CurryDash:

| Role | Used In |
|------|---------|
| `Platform Admin` | CAD |
| `Support Agent` | CAD |
| `Vendor Owner` | CAR |
| `Vendor Staff` | CAR |
| `Customer` | CCW, PACK |
| `Delivery Driver` | PACK |
| `System` | CUR (automated/background processes) |

**Examples:**
- `As a Vendor Owner, I want to see incoming orders in real-time so that I can accept or reject them promptly`
- `As a Platform Admin, I want to suspend a vendor account so that I can enforce quality standards`
- `As a Customer, I want to build a custom curry pack so that I can personalise my meal`

### 3.3 Task Titles

Format: `[Type-Stack] Verb phrase describing the work`

| Prefix | Stack Signal | Example |
|--------|-------------|---------|
| `[Backend-Laravel]` | PHP / Laravel layer | `[Backend-Laravel] Add food item availability toggle endpoint` |
| `[Backend-Queue]` | Laravel Queue / Horizon | `[Backend-Queue] Create subscription order generation job` |
| `[Frontend-Blade]` | Blade templates | `[Frontend-Blade] Add vendor suspension banner to dashboard` |
| `[Frontend-Flutter]` | Flutter mobile | `[Frontend-Flutter] Implement cart total calculation widget` |
| `[Frontend-PWA]` | Flutter Web / PWA | `[Frontend-PWA] Add service worker for offline menu browsing` |
| `[DevOps]` | CI/CD, Docker, GCP | `[DevOps] Configure Cloud Run auto-scaling for API service` |
| `[Testing-PHPUnit]` | Backend unit/feature tests | `[Testing-PHPUnit] Write feature test for vendor approval API` |
| `[Testing-Playwright]` | E2E browser tests | `[Testing-Playwright] Add E2E flow for vendor login and menu creation` |
| `[Testing-Manual]` | Manual QA test execution | `[Testing-Manual] Execute regression suite for order status workflow` |

### 3.4 Bug Titles

Format: `[BUG] [Severity] Short description of what is broken`

Severity levels: `P0-Critical` · `P1-High` · `P2-Medium` · `P3-Low`

**Examples:**
- `[BUG][P0-Critical] Order status not updating for delivery driver after vendor accepts`
- `[BUG][P1-High] Vendor profile image not saving on first upload attempt`
- `[BUG][P2-Medium] Currency symbol missing in financial report export CSV`

---

## 4. Ticket Anatomy & Templates

### 4.1 Epic Template

```markdown
## Epic Purpose
<!-- One paragraph: what business capability does this epic deliver? -->

## Business Value
<!-- Why does this matter? What metric or outcome improves? -->

## PRD Reference
<!-- FR range or Epic number from docs/prd/functional-requirements.md -->
<!-- e.g. "Covers FR9–FR20 (Menu & Package Management)" -->

## Scope
- [ ] Feature area 1
- [ ] Feature area 2
- [ ] Feature area 3

## Out of Scope
<!-- Explicitly state what this epic does NOT cover -->

## Dependencies
<!-- Jira issue keys or systems this epic depends on -->
<!-- e.g. "Depends on CPFP-5 (Package data model complete)" -->

## Technical Reference
<!-- Controller, route file, or model most relevant to this epic -->
<!-- e.g. "app/Http/Controllers/Vendor/ · routes/vendor.php" -->
```

---

### 4.2 Story Template

```markdown
## User Story
As a [user role], I want to [action] so that [business value].

## PRD Reference
<!-- FR number(s) from docs/prd/functional-requirements.md this story implements -->

## Acceptance Criteria
- [ ] AC1: [Observable, testable outcome]
- [ ] AC2: [Observable, testable outcome]
- [ ] AC3: [Edge cases or error states handled]

## Technical Notes
<!-- Backend: relevant controller, model, route, or service class -->
<!-- Frontend: relevant Blade template or Flutter widget -->
<!-- API: endpoint path, HTTP method, request/response shape if new -->
<!-- Database: migration or model change required -->

## UI/UX Notes
<!-- Blade view? Flutter screen? -->
<!-- Link to design mockup or Figma frame if available -->
<!-- Brand token or colour constraint if applicable -->

## Out of Scope
<!-- What related functionality is explicitly deferred -->
```

---

### 4.3 Backend Task Template

```markdown
## What to Build
<!-- Technical description: what endpoint, model, service, job, or migration -->

## Affected Files
<!-- List the files expected to change -->
<!-- e.g. app/Http/Controllers/Api/V1/OrderController.php -->
<!--      database/migrations/xxxx_add_status_to_orders_table.php -->

## Acceptance Criteria
- [ ] API returns correct HTTP status codes for all cases
- [ ] Input validated via Form Request class
- [ ] Business logic extracted to Action or Service class (not in controller)
- [ ] All new database columns have default values and are nullable where appropriate
- [ ] PHPUnit feature test covers the happy path and at least one error path

## Technical Notes
<!-- Authentication guard: auth:api | auth:admin | auth:vendor -->
<!-- Rate limiting, caching strategy, or queue requirement if applicable -->
<!-- Related Eloquent relationships to eager-load -->
```

---

### 4.4 Frontend Task Template (Blade)

```markdown
## What to Build
<!-- Description of the UI component, page, or resource -->

## Affected Files
<!-- e.g. resources/views/vendor-views/food/index.blade.php -->

## Acceptance Criteria
- [ ] Component renders correctly at desktop, tablet, and mobile breakpoints
- [ ] All interactive states (loading, empty, error) are handled
- [ ] Colour values use design tokens (not hard-coded hex)
- [ ] WCAG 2.1 AA contrast requirements met
- [ ] Keyboard navigation works for all interactive elements

## Design Reference
<!-- Figma frame URL or design mockup -->
<!-- Design token file: docs/brand-strategy/design-tokens/colors.json -->
```

---

### 4.5 Frontend Task Template (Flutter)

```markdown
## What to Build
<!-- Widget name, screen, or feature in the Flutter app -->

## Affected Files
<!-- lib/features/[feature]/presentation/widgets/... -->
<!-- lib/features/[feature]/presentation/screens/... -->

## Acceptance Criteria
- [ ] Widget matches approved design (Figma or stitch screen)
- [ ] Handles loading, error, and empty states
- [ ] Responsive across phone and tablet form factors
- [ ] Integrated with the relevant API endpoint (from CUR project)
- [ ] Widget test written for critical interaction paths

## API Dependency
<!-- CUR Jira ticket key for the backend API this widget consumes -->
<!-- Endpoint: GET/POST /api/v1/... -->
```

---

### 4.6 Bug Template

```markdown
## Environment
- **Project:** [CAD | CAR | CCW | CPFP | CUR | PACK]
- **Branch / Version:** e.g. `feature/vendor-portal` · `v1.0-Beta`
- **Severity:** [P0-Critical | P1-High | P2-Medium | P3-Low]
- **Reproducible:** [Always | Sometimes | Once]

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behaviour
<!-- What should happen -->

## Actual Behaviour
<!-- What actually happens — include screenshot or log excerpt -->

## Technical Investigation Notes
<!-- Controller or Flutter widget where the bug originates, if known -->
<!-- Relevant log lines, error messages, or stack traces -->

## Acceptance Criteria (Fix Verified When)
- [ ] Original steps no longer reproduce the bug
- [ ] Regression test added to prevent recurrence
- [ ] Fix deployed to staging and verified by QA
```

---

## 5. Definition of Ready (DoR)

A ticket is **Ready** and may be pulled into a sprint only when all of the following are true:

| # | Requirement | Who Verifies |
|---|-------------|-------------|
| 1 | **Title** follows the naming convention for its type (Section 3) | PM / Tech Lead |
| 2 | **Description** uses the appropriate template from Section 4 with no empty required sections | PM / Tech Lead |
| 3 | **Acceptance Criteria** are written as observable, testable outcomes (not vague goals) | PM |
| 4 | **fixVersion** is assigned (v1.0-Alpha / Beta / RC / GA) | PM |
| 5 | **Epic Link** is set (the ticket belongs to a parent epic) | PM |
| 6 | **Labels** include at minimum the PRD epic label (`prd-epic-N`) and at least one tech-layer label (`backend`, `frontend`, `flutter`, `testing`, `infra`) | PM / Tech Lead |
| 7 | **Story Points** are estimated by the implementing developer (Stories and Tasks; not required for Epics or CCW tasks). Use the Fibonacci scale and reference anchors in `docs/jira-restructuring/09-estimation-and-timeline-guide.md` | Developer |
| 8 | **Assignee** is set | PM |
| 9 | **Due Date** matches the target sprint end date | PM |
| 10 | **Dependencies** are identified: any blocking tickets are listed in the ticket description and cross-linked via Jira Issue Links | Tech Lead |
| 11 | **Technical Notes** section references the specific Laravel controller/model/route or Flutter widget/screen affected | Developer |
| 12 | For Stories with a UI component: a design reference (Figma link, screen number, or design token reference) is present | PM / Designer |

**DoR Checklist (paste into any ticket before sprint planning):**

```
- [ ] Title follows naming convention
- [ ] Description template complete
- [ ] Acceptance Criteria: testable checkboxes
- [ ] fixVersion assigned
- [ ] Epic Link set
- [ ] Labels: prd-epic-N + tech layer
- [ ] Story Points estimated
- [ ] Assignee set
- [ ] Due Date = sprint end
- [ ] Dependencies cross-linked
- [ ] Technical Notes: file/class reference
- [ ] Design reference (if UI work)
```

---

## 6. Definition of Done (DoD)

A ticket is **Done** when all of the following are true:

| # | Criterion | Responsible |
|---|-----------|------------|
| 1 | All Acceptance Criteria checkboxes are ticked | Developer |
| 2 | Code is committed to the correct branch (`feature/PROJ-NNN-short-description`) | Developer |
| 3 | Pull Request opened with the Jira ticket key in the title and description | Developer |
| 4 | CI pipeline passes (lint, build, tests) | CI / Developer |
| 5 | At least one peer code review approved | Peer |
| 6 | For backend changes: PHPUnit feature test written and passing for the happy path and at least one error path | Developer |
| 7 | For frontend changes: WCAG 2.1 AA accessibility check passed; loading / empty / error states implemented | Developer |
| 8 | For Flutter changes: widget test written; tested on both phone and tablet breakpoints | Developer |
| 9 | QA has verified the fix or feature against the Acceptance Criteria in the staging environment | QA Lead |
| 10 | Jira ticket status set to **Dev Tested** (before UAT) or **Done** (after UAT sign-off) | Developer / QA |
| 11 | No known regressions introduced (QA regression check passed) | QA Lead |
| 12 | Documentation updated if the change affects an API contract, a configuration flag, or user-facing behaviour | Developer |

---

## 7. Workflow & Status Transitions

The target 9-status workflow applies to all six projects once Phase 2 workflow alignment is complete.

```
To Do ──► In Progress ──► Code Review ──► Dev Tested ──► SIT ──► Ready for UAT ──► UAT ──► Ready for Prod ──► Prod
```

| Status | Who Transitions | Trigger |
|--------|----------------|---------|
| **To Do** | PM | Ticket is sprint-ready (DoR passed) |
| **In Progress** | Developer | Work begins |
| **Code Review** | Developer | PR opened; awaiting peer review |
| **Dev Tested** | Developer | PR merged; CI passes; developer self-tested |
| **SIT** | QA | Feature deployed to staging; integration testing begins |
| **Ready for UAT** | QA | SIT passed; ticket ready for stakeholder sign-off |
| **UAT** | PM / Stakeholder | UAT session in progress |
| **Ready for Prod** | PM | UAT passed; approved for next deployment |
| **Prod** | DevOps / PM | Deployed to production |

**Terminal states for blocked/cancelled work:**

| Status | Use When |
|--------|----------|
| **Blocked** | External dependency prevents progress. Add a blocker comment with the blocking issue key. |
| **Won't Do** | Ticket is no longer in scope. Add a closing comment and remove from sprint. |

---

## 8. Branch & Commit Naming

### 8.1 Branch Naming

Format: `{type}/{JIRA-KEY}-{short-slug}`

| Type | Example |
|------|---------|
| `feature/` | `feature/CAR-52-vendor-onboarding-flow` |
| `fix/` | `fix/CAD-177-vendor-approval-status-bug` |
| `chore/` | `chore/CUR-110-update-api-auth-middleware` |
| `hotfix/` | `hotfix/CAR-195-order-creation-null-pointer` |
| `docs/` | `docs/CAD-35-analytics-dashboard-readme` |
| `test/` | `test/CAR-22-order-operations-playwright` |

### 8.2 Commit Message Format

Format: `{type}({scope}): {imperative description} [{JIRA-KEY}]`

The `scope` maps to the tech layer:

| Scope | Used For |
|-------|---------|
| `api` | REST API endpoint changes |
| `model` | Eloquent model or migration |
| `blade` | Blade template change |
| `flutter` | Flutter widget or screen |
| `queue` | Queue job or listener |
| `config` | Configuration or env change |
| `test` | Test additions or modifications |
| `docs` | Documentation only |
| `infra` | Docker, CI/CD, GCP |

**Examples:**

```
feat(blade): add OrderResource status badge column [CAR-22]
fix(api): return 422 when vendor attempts duplicate menu item name [CUR-45]
feat(model): add package_option_constraints table migration [CPFP-7]
test(api): add feature test for subscription order generation [CUR-112]
chore(infra): update Cloud Run memory limit to 1Gi [CAD-151]
```

### 8.3 PR Title Format

`[JIRA-KEY] {type}: {description}`

Example: `[CAR-22] feat: real-time order operations resource`

---

## 9. Cross-Project Dependency Rules

Because CurryDash is a multi-project ecosystem, cross-project changes are common. The following rules prevent broken dependencies.

1. **API-first rule:** Any backend API change in **CUR** that affects **PACK** or **CCW** must be accompanied by a linked PACK/CCW ticket before the CUR ticket can move to Dev Tested. Use Jira's "Blocks" link type.

2. **Database-first rule:** Any schema change in **CPFP** must be reviewed by Ramesh before any consuming project (CAD, CAR, CUR) ticket moves to In Progress.

3. **Feature flag rule:** Any new feature in **CAR** that is controlled by a feature flag in `config/features.php` must have a corresponding **CAD** ticket for the admin toggle UI (if user-configurable).

4. **Notification rule:** Any feature in **CAD** or **CAR** that triggers a user notification must link to the corresponding **CUR** notification implementation ticket.

5. **Cross-project links:** Use the "Relates to" link type for awareness links and "Blocks / is blocked by" for hard dependencies. Add a comment on the blocking ticket explaining the dependency.

---

## 10. Release Version Management

Four release milestones exist per project. Every ticket must have a `fixVersion` assigned.

| Version | Meaning | Which Issues Belong Here |
|---------|---------|--------------------------|
| **v1.0-Alpha** | Completed work — internal release | Issues in Done / UAT / Ready for Prod |
| **v1.0-Beta** | Active development and testing | Issues In Progress, DevTested, SIT, Ready for UAT; all open bugs |
| **v1.0-RC** | Release candidate — must ship before launch | To Do with priority Highest or High (P0/P1) |
| **v1.0-GA** | General availability — standard backlog | To Do with priority Medium, Low, Lowest (P2/P3) |

**Progression:** `v1.0-GA` → `v1.0-RC` → `v1.0-Beta` → `v1.0-Alpha`

`fixVersion` is a **milestone label** and does not update automatically. Update it:
- At sprint planning: promote RC/GA items that are being started to Beta
- At sprint close: promote completed Beta items to Alpha
- When priority is escalated: promote GA items to RC

Version IDs for API use are in `docs/jira-restructuring/reference/version-ids.json`.

---

## 11. Team Ownership Matrix

| Name | Role | Jira Projects | Issue Types Owned | Account ID |
|------|------|--------------|------------------|------------|
| **Demi** (Deshan) | PM | All | Epics, Stories (creation), sprint planning | `712020:fa38c43a-dbc3-450d-8a30-de63d9a2772a` |
| **Ramesh** (Sanjaya) | Backend Developer | CAD, CAR, CUR, CPFP | Backend Tasks, DevOps Tasks | `712020:fd7e5b19-06dd-4b48-ad43-89bd772e1e48` |
| **Ruchiran** (Avishka) | Flutter Developer | PACK, CCW | Frontend Tasks (Flutter, PWA) | `712020:66e04391-0253-4aad-9f45-302a0e84d8ba` |
| **Kasun** (Mendis) | QA Lead | All | Testing Tasks, Bugs (triage) | `712020:d4e053d4-66a6-49c9-a225-955177d5d0f4` |
| **Minuri** (Rubasinghe) | Junior QA | Limited | Testing Tasks (execution) | `712020:dbbae15f-e598-4b6a-8c0d-e8cba0fd74f1` |
| **Santhuka** (De Silva) | Director | Review only | UAT sign-off | `712020:2ee811fb-31a2-4e93-9f71-6b1a6d5ec35c` |

**Assignment rules:**

- `[Backend-Laravel]`, `[Backend-Queue]`, `[DevOps]` tickets → **Ramesh**
- `[Frontend-Blade]` tickets → **Ramesh** (Blade is backend-side)
- `[Frontend-Flutter]`, `[Frontend-PWA]` tickets → **Ruchiran**
- `[Testing-PHPUnit]`, `[Testing-Playwright]`, `[Testing-Manual]` tickets → **Kasun**
- `[BUG]` tickets → Triage by **Kasun**; fix assigned to **Ramesh** (backend bug) or **Ruchiran** (Flutter bug)
- Epics → **Demi**

---

## 12. Governance Cadence

| Frequency | Activity | Owner | Reference |
|-----------|----------|-------|-----------|
| **Daily** | Standup: review open In Progress tickets for blockers | Scrum Master | `docs/jira-restructuring/05-sprint-management-guide.md` |
| **Weekly** | Sprint health review: check overdue tickets, unassigned issues, and missing fields | PM | Recipe 7 in `docs/jira-restructuring/06-ai-prompt-cookbook.md` |
| **Pre-sprint** | Sprint planning: apply DoR checklist to all candidate tickets before pulling into sprint; calculate team capacity and confirm sprint commitment ≤ 80% of capacity | PM + Tech Lead | Section 5 above · `docs/jira-restructuring/09-estimation-and-timeline-guide.md` §6 |
| **Post-sprint** | Sprint retrospective: review DoD compliance, identify escaped defects, update fixVersions, record sprint velocity | Full team | Section 6 above · `docs/jira-restructuring/09-estimation-and-timeline-guide.md` §7 |
| **Monthly** | Field health audit: run field-gap script across all active projects; target thresholds in `00-team-guide.md` | PM | `docs/jira-restructuring/00-team-guide.md` §7.2 |
| **Quarterly** | PRD gap re-assessment: verify FR coverage against Jira epics | PM | `docs/jira-restructuring/04-prd-gap-analysis.md` |
| **Per-release** | Update fixVersions for completed work; mark milestone as Released in Jira | PM | `docs/jira-restructuring/reference/version-ids.json` |

---

*This document is maintained by the Project Manager. Propose changes via a PR targeting the `UAT` branch. Updates take effect from the next sprint planning session.*