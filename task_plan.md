# Task Plan: BMAD Artifact Sync — Fumadocs Documentation Site

**Branch:** main (fumadocs already merged via PR #19)
**Created:** 2026-02-21
**Author:** Demi + Claude (BMad Master session)
**Status:** Phase 1 — Discovery & Gap Assessment

---

## Goal

Synchronize all BMAD planning artifacts (PRD, architecture, epics, sprint-status, project-context) to reflect the Fumadocs documentation site feature that was implemented on `feat/fumadocs-integration` and merged to main via PR #19, but never tracked through BMAD workflows.

---

## Current Phase

Phase 6 (final verification)

---

## What Was Implemented (Without BMAD Tracking)

### Commits on feat/fumadocs-integration (merged PR #19)

| Commit | Description | Phase |
|--------|-------------|-------|
| a79b329 | Next.js 15 → 16.1.6 upgrade + proxy.ts migration | Phase 0 (prereq) |
| de5bb98 | Fumadocs scaffold — routes, components, MDX, config | Phase 1 |
| ca11aa6 | Planning files updated (task_plan.md only) | Tracking |
| d78bcf3 | Comprehensive Playwright E2E suite with JWT auth | E2E (bonus) |

### What Was Built (Phase 1 Complete, Phases 2-5 NOT started)

**Infrastructure (Phase 1):**
- fumadocs-core@16.6.3, fumadocs-ui@16.6.3, fumadocs-mdx@14.2.7
- `src/app/docs/` route group (layout, page, search API)
- `content/docs/` with 3 MDX pages (index, getting-started, central-hub)
- 7 custom MDX components in `src/components/docs/`
- Spice palette → Fumadocs CSS variable mapping
- Dashboard sidebar "Docs" link (all roles)
- Orama search endpoint
- `source.config.ts` for MDX content loading

**NOT Built (Phases 2-5 from original plan):**
- Phase 2: PRD-to-MDX content generation pipeline (0 of ~30 pages)
- Phase 3: Visual content — Mermaid diagrams, SVG assets
- Phase 4: Role-based documentation views
- Phase 5: AI-powered doc maintenance script

### Also Not Updated (The Core Problem)

- `_bmad-output/planning-artifacts/prd.md` — no Fumadocs FRs added
- `_bmad-output/planning-artifacts/architecture.md` — no docs architecture section
- `_bmad-output/planning-artifacts/epics.md` — no Epic 9 for docs
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — no docs stories
- `_bmad-output/project-context.md` — no Fumadocs rules
- No sprint change proposal was filed

---

## Phases

### Phase 1: Discovery & Gap Assessment
- [x] Recover previous session context (442 unsynced messages)
- [x] Map what was actually committed on feat/fumadocs-integration
- [x] Compare against original 5-phase plan
- [x] Identify all BMAD artifacts that need updates
- [x] Document current state in planning files
- **Status:** complete

### Phase 2: Sprint Change Proposal
- [x] Draft sprint change proposal using BMAD correct-course workflow
- [x] Define new Epic 9: Documentation Site (Fumadocs)
- [x] Break into stories matching the 5-phase plan
- [x] Mark Phase 1 stories as DONE (already implemented)
- [x] Mark Phases 2-5 stories as BACKLOG
- [x] Get user approval on the change proposal
- **Status:** complete

### Phase 3: PRD Amendment
- [x] Add Fumadocs functional requirements (FR57-FR64 in epics.md)
- [x] Add FR Coverage Map entries for Epic 9
- [x] Add Epic 9 summary to Epic List section
- **Status:** complete

### Phase 4: Architecture Amendment
- [x] Update Next.js version reference: 15 → 16
- [x] Add docs route group to project structure
- [x] Add content/docs/, src/components/docs/, source.config.ts to structure
- [x] Add Fumadocs architecture decision table
- [x] Add Next.js 16 migration notes
- [x] Add "Documentation as Code" cross-cutting concern
- **Status:** complete

### Phase 5: Epics & Sprint Status Update
- [x] Add Epic 9 with 6 stories + acceptance criteria to epics.md
- [x] Update sprint-status.yaml with Epic 9 entries
- [x] Mark stories 9-0 and 9-1 as done
- [x] Mark stories 9-2 through 9-5 as backlog
- [x] Update FR traceability and story count tables
- **Status:** complete

### Phase 6: Commit & Verify
- [ ] Review all artifact changes for consistency
- [ ] Commit BMAD artifact updates
- [ ] Verify sprint-status reflects true project state
- **Status:** in_progress

---

## Key Questions

1. Should Fumadocs get its own epic (Epic 9) or be appended to Epic 1 (Foundation)?
   - **Answer:** Own epic — it's a distinct feature with 5 phases and separate stories
2. What FR range for Fumadocs in the Central Hub PRD scope?
   - **Answer:** FR57-FR64 (continuing Central Hub FR numbering from architecture.md)
3. Should the consolidated PRD (docs/prd.md) also be updated?
   - **Answer:** TBD — ask user. The consolidated PRD covers all 3 repos, Fumadocs is Central Hub only
4. How should Phase 0 (Next.js 16 upgrade) be tracked?
   - **Answer:** As a prerequisite task in Epic 9, story 9-0

---

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| New Epic 9 for docs | Distinct feature with multiple phases, not a foundation concern |
| Use correct-course workflow | Retroactive tracking of unplanned feature work |
| FR57-FR64 range | Continues Central Hub numbering; won't conflict with consolidated PRD ranges |
| Phase 1 = DONE | Already implemented, tested, merged — just needs artifact tracking |

---

## Errors Encountered

| Error | Attempt | Resolution |
|-------|---------|------------|
| — | — | No errors yet |

---

## Notes

- The original plan from the user's earlier session specified 5 phases but only Phase 1 was executed
- Next.js was upgraded from 15 to 16 as a prerequisite — this is a significant change that also needs architecture tracking
- The E2E test suite on the fumadocs branch (d78bcf3) added docs.spec.ts + enhanced all existing specs
- The planning files (task_plan.md, findings.md, progress.md) in the repo are from the fumadocs session and are stale
