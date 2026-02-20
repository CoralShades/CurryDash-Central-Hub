# Sprint Change Proposal — Fumadocs Documentation Site & Next.js 16 Upgrade

**Date:** 2026-02-21
**Author:** BMad Master (on behalf of Demi)
**Scope:** Moderate — Retroactive artifact tracking + new Epic 9
**Status:** PENDING APPROVAL

---

## Section 1: Issue Summary

### Problem Statement

The Fumadocs documentation site feature (Phase 1 scaffold + Next.js 15→16 upgrade) was implemented on branch `feat/fumadocs-integration` and merged to main via PR #19 on 2026-02-20. However, this work was executed outside the BMAD workflow — no sprint change proposal was filed, no new functional requirements were added to the PRD, no new epic was created, and no sprint-status tracking was established.

### Context

- **When discovered:** 2026-02-21, during a BMad Master session
- **How discovered:** Demi noticed BMAD artifacts were stale after reviewing commit history
- **Current state:** Phase 1 of a 5-phase plan is complete and merged. Phases 2-5 are unstarted with no backlog tracking.

### Evidence

| Artifact | Expected State | Actual State |
|----------|---------------|--------------|
| `prd.md` | FR57-FR64 for docs site | Only FR1-FR56 |
| `architecture.md` | Next.js 16, docs route group | Next.js 15, no docs section |
| `epics.md` | Epic 9 with 6 stories | Only Epics 1-8 |
| `sprint-status.yaml` | Epic 9 entries | Only Epics 1-8 (all done) |
| `project-context.md` | Fumadocs rules | No Fumadocs rules |

---

## Section 2: Impact Analysis

### Epic Impact

- **Existing Epics 1-8:** No impact. All remain `done`. No modifications needed.
- **New Epic 9 Required:** "Documentation Site (Fumadocs)" with 6 stories covering the 5-phase plan plus the Next.js 16 prerequisite.

### Story Impact

| Story | Title | Status | Notes |
|-------|-------|--------|-------|
| 9-0 | Next.js 16 Upgrade & Proxy Migration | done | Commit a79b329, already merged |
| 9-1 | Fumadocs Scaffold & MDX Components | done | Commit de5bb98, already merged |
| 9-2 | PRD-to-MDX Content Generation Pipeline | backlog | ~30 pages from BMAD artifacts |
| 9-3 | Visual Content — Mermaid Diagrams & Static Assets | backlog | Diagrams for all architecture flows |
| 9-4 | Role-Based Documentation Views & Access Control | backlog | Role landing pages + doc gating |
| 9-5 | AI-Powered Doc Maintenance Script | backlog | CLI script for regeneration |

### Artifact Conflicts

**PRD (`_bmad-output/planning-artifacts/prd.md`):**
- Add 8 new functional requirements (FR57-FR64)
- Extend FR Coverage Map with Epic 9 mappings
- Add Epic 9 summary to Epic List section

**Architecture (`_bmad-output/planning-artifacts/architecture.md`):**
- Update Next.js version reference: 15 → 16
- Document middleware.ts → proxy.ts migration
- Add docs route group to project structure
- Add Fumadocs to integration points
- Note ESLint 9 flat config migration
- Add revalidateTag() signature change

**Epics (`_bmad-output/planning-artifacts/epics.md`):**
- Add full Epic 9 definition with 6 stories
- Each story with acceptance criteria matching original plan

**Sprint Status (`_bmad-output/implementation-artifacts/sprint-status.yaml`):**
- Add Epic 9 with story status entries

### Technical Impact

- **No code changes needed** — all code is already merged and working
- Build passes, TypeScript clean, E2E tests pass (138 tests)
- This is purely a documentation/tracking synchronization

---

## Section 3: Recommended Approach

### Selected Path: Direct Adjustment (Option 1)

**Rationale:** This is the lowest-risk option with purely additive changes to planning artifacts. The implementation work is complete and verified. No existing artifacts need modification beyond additive amendments. No rollback or scope reduction is warranted.

**Effort:** Low — artifact text updates only, no code changes
**Risk:** Low — additive changes cannot break existing artifact integrity
**Timeline Impact:** None — completed within this session

### Alternatives Considered

| Option | Assessment |
|--------|-----------|
| Rollback | Not viable — work is merged and functional |
| MVP Review | Not applicable — MVP is complete, this is post-MVP |
| Do nothing | Not acceptable — artifacts would remain permanently stale |

---

## Section 4: Detailed Change Proposals

### 4.1 PRD Amendment (prd.md)

**Location:** After FR56, before the Epic List section

**ADD — New Functional Requirements:**

```markdown
**9. Documentation Site (FR57-FR64)**

- FR57: Users can access a documentation site at `/docs` within Central Hub that renders MDX content with full-text search
- FR58: The documentation site can display content with custom MDX components (Mermaid diagrams, API endpoint cards, role badges, callouts, tech stack tables, architecture diagrams)
- FR59: The documentation site integrates with the CurryDash spice palette design system via CSS variable mapping
- FR60: The system can auto-generate MDX documentation pages from BMAD planning artifacts (PRD, architecture, epics, UX spec)
- FR61: The documentation site can render Mermaid diagrams for architecture flows, data pipelines, RBAC matrices, and ER diagrams
- FR62: The documentation site can display role-specific landing pages guiding each user type to relevant documentation
- FR63: Admin users can configure which documentation sections are visible to each role via frontmatter-based access control
- FR64: The system can regenerate documentation from BMAD artifacts via a CLI script (`npm run docs:generate`)
```

**ADD — FR Coverage Map entries:**

```markdown
FR57: Epic 9 - Documentation site at /docs with MDX and search
FR58: Epic 9 - Custom MDX components (Mermaid, API cards, role badges)
FR59: Epic 9 - Spice palette integration with Fumadocs theme
FR60: Epic 9 - Auto-generate docs from BMAD artifacts
FR61: Epic 9 - Mermaid diagram rendering for architecture docs
FR62: Epic 9 - Role-specific documentation landing pages
FR63: Epic 9 - Role-based documentation access control
FR64: Epic 9 - CLI doc regeneration script
```

**ADD — Epic 9 to Epic List:**

```markdown
### Epic 9: Documentation Site (Fumadocs)
Users can access a comprehensive documentation site at `/docs` within Central Hub, featuring auto-generated content from BMAD artifacts, Mermaid diagrams, role-specific views, and full-text search — integrated with the spice palette design system.
**FRs covered:** FR57, FR58, FR59, FR60, FR61, FR62, FR63, FR64
**Additional reqs:** None (post-MVP enhancement, no NFR dependencies)
```

---

### 4.2 Architecture Amendment (architecture.md)

**CHANGE — Starter Template Evaluation section:**

```
OLD: | Next.js | 15.x (latest stable) |
NEW: | Next.js | 16.x (latest stable, upgraded from 15.x in Sprint 2) |
```

**ADD — To Project Directory Structure (after `src/app/(dashboard)/`):**

```
├── src/app/docs/                    # Fumadocs documentation route group
│   ├── layout.tsx                   # DocsLayout with RootProvider + spice palette
│   ├── [[...slug]]/
│   │   └── page.tsx                 # Dynamic SSG page renderer
│   └── api/search/
│       └── route.ts                 # Orama full-text search endpoint
```

```
├── content/docs/                    # MDX documentation source
│   ├── meta.json                    # Navigation structure
│   ├── index.mdx                    # Docs landing page
│   ├── getting-started/             # Quick start guides
│   └── central-hub/                 # Central Hub-specific docs
```

```
├── src/components/docs/             # Custom MDX components
│   ├── mdx-components.tsx           # Component registration map
│   ├── mermaid-diagram.tsx          # Client-side Mermaid.js renderer
│   ├── api-endpoint.tsx             # Styled API endpoint card
│   ├── role-badge.tsx               # Inline role indicator pill
│   ├── callout.tsx                  # info/warning/success/note admonition
│   ├── tech-stack-table.tsx         # 3-repo comparison table
│   └── architecture-diagram.tsx     # SVG viewer with zoom dialog
```

```
├── source.config.ts                 # Fumadocs MDX loader configuration
├── eslint.config.mjs                # ESLint 9 flat config (Next.js 16)
```

**ADD — New Architecture Decision (after existing decisions table):**

```markdown
### Documentation Site Architecture

| Decision | Choice | Version | Rationale | Affects |
|----------|--------|---------|-----------|---------|
| Doc framework | Fumadocs | core@16.6.3, ui@16.6.3, mdx@14.2.7 | Route-group integration inside existing app. Shares auth, design tokens, single deployment. | /docs routes, MDX pipeline |
| Content source | MDX in content/docs/ | fumadocs-mdx | Source-controlled docs with custom components. BMAD artifacts as generation source. | Content workflow, CI |
| Search | Orama | @orama/orama | Full-text search with relevance ranking. Lightweight, no external service. | /docs/api/search route |
| Theme integration | CSS variable mapping | Tailwind v4 | --color-fd-* mapped to spice palette tokens. Zero runtime cost. | globals.css, all doc pages |
| MDX components | 7 custom components | React | Mermaid diagrams, API endpoints, role badges, callouts, comparison tables, SVG viewer. Registered in component map. | All MDX content |
```

**ADD — Note about Next.js 16 migration:**

```markdown
### Next.js 16 Migration Notes (Sprint 2)

- `middleware.ts` → `proxy.ts` (Node.js runtime, not Edge)
- `revalidateTag(tag)` → `revalidateTag(tag, 'max')` (7 call sites updated)
- ESLint config: `.eslintrc.json` → `eslint.config.mjs` (ESLint 9 flat config)
- Node.js requirement: ≥20.9 (upgraded from 18.x)
- All existing functionality preserved; Auth.js v5 compatible with Node.js runtime
```

---

### 4.3 Epics Amendment (epics.md)

**ADD — After Epic 8 section:**

Full Epic 9 with 6 stories including acceptance criteria. (The BMad Master will generate the complete story definitions when applying the changes.)

---

### 4.4 Sprint Status Amendment (sprint-status.yaml)

**ADD — After epic-8 section:**

```yaml
  # Epic 9: Documentation Site (Fumadocs)
  epic-9: in-progress
  9-0: done      # Next.js 16 upgrade + proxy.ts migration
  9-1: done      # Fumadocs scaffold, routes, components, search
  9-2: backlog   # PRD-to-MDX content generation pipeline
  9-3: backlog   # Mermaid diagrams and static visual assets
  9-4: backlog   # Role-based documentation views
  9-5: backlog   # AI-powered doc maintenance script
  epic-9-retrospective: optional
```

---

## Section 5: Implementation Handoff

### Change Scope: Moderate

The changes are purely additive artifact amendments. No code changes. No architectural risk. But the scope touches 4+ planning documents requiring careful, consistent updates.

### Handoff Plan

| Recipient | Responsibility |
|-----------|---------------|
| BMad Master (this session) | Apply all artifact amendments after approval |
| Demi | Review and approve changes, commit |
| Development team (future) | Implement backlog stories 9-2 through 9-5 when prioritized |

### Success Criteria

- [ ] PRD has FR57-FR64 with Epic 9 in FR Coverage Map
- [ ] Architecture reflects Next.js 16, proxy.ts, docs route group
- [ ] Epics has complete Epic 9 with 6 stories and acceptance criteria
- [ ] Sprint-status has Epic 9 entries (9-0 and 9-1 as done)
- [ ] All artifacts are internally consistent (FR numbers, story IDs, cross-references match)
- [ ] Commit with message: `docs(bmad): sprint change proposal — Epic 9 Fumadocs documentation site`
