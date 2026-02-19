# Plan: Jira Restructuring + Documentation Branch

## Context

CurryDash has 6 Jira projects (CAD, CAR, CUR, CPFP, CCW, PACK) with ~400+ issues that are hard to manage due to:
- **Zero story points** (field not configured or not populated)
- **Zero fixVersions/releases** across all projects
- **90-100% issues missing labels**
- **15-85% issues unassigned** (CUR worst at 85%)
- **Jira epic numbering diverges from PRD** (e.g., CAR-18="Epic 2", CAR-52="Epic 1")
- **PRD Epics 12-18 (vendor modernization) don't exist in Jira** and should stay hidden for now
- **Duplicate/overlapping epics** in CAD
- **Most issues stuck at "To Do"** with no sprint/release tracking

Additionally, docs from `feature/vendor-portal` branch need to reach the team via a `docs/prd-update` branch based on SIT.

**User decisions:**
- PRD is the source of truth for epic definitions
- Rename/remap existing Jira epics to match PRD Epic 1-11
- Keep Epics 12-18 hidden from Jira (team not aware of modernization)
- Full enrichment: story points + labels + fixVersions + sprint + assignees
- Auto-estimate story points based on complexity
- Milestone-based releases (Alpha, Beta, RC, GA)
- Everything goes on the docs branch (all docs/, _bmad-output/, stories, audits, brand)
- Don't edit existing titles or descriptions

---

## Phase 1: Jira Epic Rename & Remap

### 1.1 Epic Mapping Table (PRD → Jira)

| PRD Epic | PRD Title | Jira Project | Existing Jira Key | Action |
|----------|-----------|-------------|-------------------|--------|
| Epic 1 | Vendor Onboarding | CAR | CAR-52 | Keep (already matches) |
| Epic 2 | Menu & Curry Pack Mgmt | CAR | CAR-18 | Keep (already matches) |
| Epic 3 | Real-Time Order Ops | CAR | CAR-22 | **Rename** (currently "CAR-005: System Compatibility") |
| Epic 4 | Admin Vendor Mgmt | CAD | CAD-73 | Keep (already matches) |
| Epic 5 | Customer Support | CAD | CAD-95 | Keep (already matches) |
| Epic 6 | Platform Access & Security | CAD | CAD-87 | Keep (already matches) |
| Epic 7 | Financial & Payout | CAD + CAR | CAD-36, CAR-21 | Keep both (admin + vendor side) |
| Epic 8 | Subscription System | CAR + CAD + CUR | CAR-19, CAD-34, CUR-112 | Keep all (multi-project) |
| Epic 9 | Analytics & BI | CAD + CAR + CUR | CAD-35, CAR-20, CUR-111 | Keep all (multi-project) |
| Epic 10 | Multi-Channel Notifications | CUR | CUR-133 | Keep (already matches) |
| Epic 11 | Platform Config & API | CUR | CUR-110 | Keep (already matches) |
| Epic 12-18 | Vendor Portal Modernization | - | NONE | **Do NOT create** (hidden) |

### 1.2 Rename Actions

Only these need title changes:
- **CAR-22**: Rename summary to match "Epic 3: Real-Time Order Operations"

### 1.3 Classify Non-PRD Epics

These Jira epics don't map to the PRD and need labeling as `non-prd-scope`:

| Key | Current Title | Action |
|-----|--------------|--------|
| CAR-97 | Vendor Activity History & Audit Trail | Add label `non-prd-scope`, `future` |
| CAR-143 | Functionality: Package Management | Add label `non-prd-scope`, `operational` |
| CAD-33 | Epic 2: Menu & Curry Pack (Admin) | **Duplicate of CAD-64** — link to CAD-64, add `duplicate` label |
| CAD-37 | CAD-005: System Integrity Validation | Add label `non-prd-scope`, `testing` |
| CAD-64 | Admin Package Management | Add label `prd-epic-2` (admin-side of Epic 2) |
| CAD-69 | Restaurant Activity History & Audit | Add label `non-prd-scope`, `future` |
| CAD-83 | Admin Food Item Oversight | Add label `prd-epic-2` (sub-scope of Epic 2) |
| CAD-146 | Packages behavior | Add label `non-prd-scope`, `operational` |
| CAD-151 | GCP Migration | Add label `non-prd-scope`, `infrastructure` |
| CUR-119 | Third-Party Integration Services | Add label `prd-epic-11` |
| CUR-46 | [ARCHIVED] Legacy Prototyping | Leave as-is (already archived) |
| CUR-30 | UI/UX - Delivery Persons | Add label `non-prd-scope`, `ux-research` |
| CUR-29 | Seller Portal Development | Add label `non-prd-scope`, `legacy` |
| CUR-22, CUR-19, CUR-15, CUR-9 | UI/UX Flows | Add label `non-prd-scope`, `ux-research` |
| CCW-* | Customer Web epics | Keep as-is (CCW scope, not in backend PRD) |
| CPFP-* | Package Data epics | Keep as-is, add `prd-epic-2` where applicable |

---

## Phase 2: Full Enrichment (Story Points, Labels, Releases, Assignees)

### 2.1 Create Releases (fixVersions) per Project

Create milestone-based releases in each project:

| Release | Description | Start Date | Release Date |
|---------|-------------|------------|-------------|
| `v1.0-Alpha` | Core functionality complete, internal testing | - | TBD |
| `v1.0-Beta` | Feature-complete, SIT testing | - | TBD |
| `v1.0-RC` | Release candidate, UAT testing | - | TBD |
| `v1.0-GA` | General availability, production | - | TBD |

Projects to create in: **CAD, CAR, CUR** (primary dev projects). CPFP, CCW, PACK get releases only if they have active development.

### 2.2 Label Convention

Apply labels to ALL issues based on these categories:

**Epic Labels** (link child issues to their PRD epic):
- `prd-epic-1` through `prd-epic-11`

**Type Labels**:
- `backend`, `frontend`, `testing`, `devops`, `api`, `mobile`

**Priority Labels** (supplementing Jira priority field):
- `p0-critical`, `p1-high`, `p2-medium`, `p3-low`

**Source Labels**:
- `bmad-sync` (issues from BMAD workflow)
- `manual` (manually created by team)
- `bug-report` (from testing)

**Scope Labels**:
- `non-prd-scope` (not in current PRD)
- `legacy` (existing functionality)
- `future` (post-GA scope)
- `operational` (day-to-day fixes)
- `infrastructure` (devops/deployment)

### 2.3 Story Point Estimation Rules

Auto-estimate using issue type + description complexity:

| Issue Type | Default SP | Upgrade to 8 if... | Upgrade to 13 if... |
|-----------|-----------|--------------------|--------------------|
| Bug | 2 | Complex multi-model fix | Payment/security bug |
| Story | 5 | 5+ acceptance criteria | Multi-page, 8+ ACs |
| Backend Task | 3 | API + DB migration | Multi-endpoint + tests |
| Frontend Task | 3 | Complex form/dashboard | Multi-view + responsive |
| DevOps Task | 3 | Multi-service config | CI/CD pipeline setup |
| Testing Task | 2 | E2E multi-flow | Full regression suite |
| Subtask | 1 | Multi-step | Complex logic |
| Epic | SUM | - | - |

### 2.4 Assignee Mapping

Based on `docs/jira-orchestration/jira-config.yaml` team config:

| Team Member | Account ID | Assign To |
|------------|-----------|-----------|
| **Ramesh** (Backend Dev) | `712020:fd7e5b19-...` | Backend Tasks, Stories in CAD/CAR/CUR/CPFP |
| **Ruchiran** (Flutter Dev) | `712020:66e04391-...` | Frontend Tasks in PACK/CCW |
| **Kasun** (QA Lead) | `712020:d4e053d4-...` | Testing Tasks, Bugs |
| **Minuri** (Junior QA) | `712020:dbbae15f-...` | Testing Tasks (Epic 8, 9) |
| **Demi** (PM) | `712020:fa38c43a-...` | Epics, coordination issues |
| **Santhuka** (Director) | `712020:2ee811fb-...` | Review/approval items only |

Rules:
- Only assign if currently unassigned
- Backend stories/tasks → Ramesh
- Frontend/mobile → Ruchiran
- Testing → Kasun (primary), Minuri (Epic 8-9 only)
- Bugs → Kasun
- Epics → Demi

### 2.5 Assign fixVersion to Issues

- Issues with status `Done` or `UAT` → `v1.0-Alpha`
- Issues with status `DEVTESTED` or `SIT` or `READY FOR UAT` → `v1.0-Beta`
- Issues with status `To Do` or `In Progress` → `v1.0-Beta` (current target)

---

## Phase 3: Documentation Branch

### 3.1 Create Branch

```bash
git checkout SIT
git pull origin SIT
git checkout -b docs/prd-update
```

### 3.2 Files to Copy from `feature/vendor-portal`

Cherry-pick/copy documentation files (NOT code changes) from `feature/vendor-portal`:

**From `docs/`:**
- `docs/prd/` (all 10 files)
- `docs/epics/` (all 23 files)
- `docs/architecture/` (all 26 files)
- `docs/architecture.md` (master document)
- `docs/audit/` (all 9 reports + screenshots)
- `docs/brand-strategy/` (guidelines + design tokens + logos)
- `docs/guides/` (feature-flags.md, adding-interactive-tours.md)
- `docs/runbooks/` (filament-rollback-procedure.md)
- `docs/index.md` (v2.0)
- `docs/source-tree-analysis.md`
- `docs/development-guide.md`
- `docs/deployment-guide.md`
- `docs/project-overview.md`

**From `_bmad-output/`:**
- `_bmad-output/implementation-artifacts/stories/` (147 story files + manifests)
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/wave-plan.md`
- `_bmad-output/implementation-artifacts/wave-plan-summary.md`
- `_bmad-output/implementation-artifacts/wave-dependency-graph.md`
- `_bmad-output/planning-artifacts/` (sprint plans, readiness reports)
- `_bmad-output/epics/creative-assets/` (asset specs)
- `_bmad-output/brand-fix-sprint/` (change records)
- `_bmad-output/ux-audit/` (audit report)

**From project root:**
- `CLAUDE.md` (updated with Filament docs)

**Exclude from docs branch** (code changes stay in feature/vendor-portal):
- `app/` directory changes
- `config/` changes
- `resources/` changes
- `routes/` changes
- `tests/` changes
- `database/` migration changes
- `composer.json`/`package.json` changes

### 3.3 Commit & Push

Single commit: `docs: sync PRD, architecture, epics, stories, audit reports, and brand docs from vendor-portal planning`

Push to remote. Do NOT create PR to SIT automatically (user will do this manually when ready).

---

## Execution Order

### Step 1: Create Releases in Jira (5 min)
- Create `v1.0-Alpha`, `v1.0-Beta`, `v1.0-RC`, `v1.0-GA` in CAD, CAR, CUR

### Step 2: Rename/Remap Epics (10 min)
- Rename CAR-22 summary
- Add `prd-epic-*` labels to matched epics
- Add `non-prd-scope` labels to unmatched epics

### Step 3: Label All Issues (30 min)
- Batch-apply labels based on epic parent, issue type, and project
- Use Jira API bulk operations

### Step 4: Auto-Estimate Story Points (30 min)
- Apply story points based on estimation rules
- Verify a sample of 10 issues manually

### Step 5: Assign Unassigned Issues (20 min)
- Apply assignee rules based on project + issue type
- Skip already-assigned issues

### Step 6: Assign fixVersions (15 min)
- Based on current status mapping

### Step 7: Create Documentation Branch (20 min)
- Branch from SIT
- Copy docs from feature/vendor-portal
- Commit and push

---

## Verification

### Jira Verification
- Query each project for issues missing story points → should be 0
- Query for issues missing labels → should be 0
- Query for issues missing fixVersions → should be 0
- Query for unassigned issues → only review/approval items
- Verify Jira dashboards show velocity charts, burndown, release tracking
- Spot-check 5 random issues per project for correct story points

### Branch Verification
- Verify `docs/prd-update` branch exists and is based on SIT
- Verify all doc files are present
- Verify NO code changes leaked into the branch
- Verify the branch has a single clean commit

---

## Constraints & Safety

1. **Do NOT edit existing Jira titles or descriptions** (user explicitly stated this) — exception: CAR-22 rename to match PRD
2. **Do NOT create Epics 12-18 in Jira** (modernization work hidden)
3. **Do NOT create PR to SIT** for docs branch (manual process)
4. **Do NOT touch UAT branch** (has automations, PRs created manually)
5. **Do NOT modify issues already assigned** (respect current team assignments)
6. **Back up current state** before bulk Jira updates (export issue list)

---

## Critical Files Referenced

- `docs/jira-orchestration/jira-config.yaml` — Team members, project IDs, issue type IDs
- `docs/epics/` — PRD epic definitions (source of truth)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — Current sprint tracking
- `docs/prd/functional-requirements.md` — FR definitions for label mapping
- `docs/epics/requirements-inventory.md` — FR-to-epic coverage matrix
