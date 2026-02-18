# Task Plan: Ralph Loop Integration — CurryDash Central Hub

## Goal
Set up the Ralph Loop autonomous implementation system integrated with BMAD v6 workflows. Complete remaining Phase 3 gaps, then create full Ralph infrastructure for Phase 4 implementation.

## Reference
- **Ralph Plugin:** Official `ralph-wiggum` from Claude Code plugins
- **BMAD Status:** Phase 3 (Solutioning) — IR report says READY, epics.md Step 03 pending
- **Planning Artifacts:** `_bmad-output/planning-artifacts/` (9 files, ~6,000 lines)
- **Architecture:** 8 epics, 36 stories, 56 FRs, 46 NFRs, 18 ARCH decisions

## Phase A: Complete BMAD Phase 3 Gaps

### A1: Fix Documentation Defects (per IR recommendations)
- [ ] Fix Traceability Matrix FR1-FR9 (epics.md Appendix)
- [ ] Fix Story Count Summary (Epic 1: 5, Epic 2: 5, Total: 36)
- [ ] Add NFR-P8 to Epic 5 header

### A2: Update Workflow Status
- [ ] Mark `create-epics-and-stories` as complete in bmm-workflow-status.yaml
- [ ] Mark `implementation-readiness` as complete in bmm-workflow-status.yaml
- [ ] Mark `test-design` as complete (already done but verify)

## Phase B: Ralph Loop Infrastructure

### B1: Install ralph-wiggum Plugin
- [ ] Fetch plugin from official Claude Code repo
- [ ] Install to project or user-level plugins directory
- [ ] Verify `/ralph-loop` command is available

### B2: Create Sub-Agent Definitions (.claude/agents/)
- [ ] `ralph-implementer.md` — Haiku-based TDD implementation agent
- [ ] `ralph-reviewer.md` — Sonnet-based code review agent
- [ ] `ralph-qa.md` — Sonnet-based QA validation agent
- [ ] `ralph-architect.md` — Opus escalation for architectural decisions

### B3: Create Ralph Commands (.claude/commands/)
- [ ] `ralph-bridge.md` — BMAD-to-Ralph plan translator
- [ ] `ralph-run.md` — Ralph loop orchestration instructions

### B4: Configuration
- [ ] Update `.claude/settings.json` with Ralph-relevant permissions
- [ ] Ensure MCP servers configured for Ralph iterations

## Phase C: Generate Ralph Plan

### C1: Run Ralph Bridge
- [ ] Generate `.ralph-plan.md` from BMAD artifacts
- [ ] Include story ordering, dependency chains, model assignments
- [ ] Include architecture context summary

### C2: Progress Tracking
- [ ] Initialize `.ralph-progress.md` template
- [ ] Update all planning files (progress.md, findings.md)

## Model Strategy
| Role | Model | Rationale |
|------|-------|-----------|
| Ralph orchestration | Sonnet | Orchestrates sub-agents, picks tasks |
| Implementation (routine) | Haiku | 70%+ of coding work, fast and cheap |
| Code review | Sonnet | Deeper analysis needed |
| QA validation | Sonnet | Reasons about acceptance criteria |
| Architecture decisions | Opus | Cross-cutting concerns only |

## Dependencies
- Phase A must complete before Phase C (clean artifacts needed for plan generation)
- Phase B is independent and can run in parallel with Phase A
- Phase C depends on both A and B
