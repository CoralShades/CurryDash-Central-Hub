# Findings: Ralph Loop Integration — CurryDash Central Hub

## BMAD Phase 3 Status Discovery

### Implementation Readiness: ALREADY COMPLETE
- IR report exists at `_bmad-output/planning-artifacts/implementation-readiness-report-2026-02-18.md`
- Verdict: **READY — Proceed to Implementation**
- Scorecard: 100% FR coverage, 100% NFR coverage, 36/36 story quality PASS
- 0 critical issues, 3 major (all documentation defects), 2 minor
- `bmm-workflow-status.yaml` NOT updated — still shows "required"

### Documentation Defects to Fix (from IR)
1. **Traceability Matrix FR1-FR9** — Appendix has wrong descriptions and story mappings
2. **Story Count Summary** — Epic 1 claims 3 (actual 5), Epic 2 claims 4 (actual 5), Total claims 33 (actual 36)
3. **NFR-P8 in Epic 5 header** — Implemented in Stories 5.2/5.4 but missing from header

### Create Epics & Stories: Steps 01-02 Complete
- Step 03 pending but may not be blocking — all 36 stories with full AC exist in monolithic `epics.md`
- Ralph bridge can work with monolithic file (stories have clear heading structure)
- Individual story files in `epics-and-stories/epic-N/story-N.md` format would be ideal but not required

## Ralph Wiggum Plugin Analysis

### How It Works
- Official plugin at `github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum`
- Uses a Stop hook that blocks exit and feeds the same prompt back
- Prompt never changes between iterations — Claude reads modified files and git history
- Commands: `/ralph-loop "<prompt>" --max-iterations N --completion-promise "TEXT"`
- Cancel: `/cancel-ralph`

### Key Design Principles
- Iteration > Perfection — loop refines work
- Failures are data — predictable and informative
- Persistence wins — files persist between iterations
- Operator skill matters — prompt quality determines success

### Good For
- Well-defined tasks with clear success criteria (our stories have Given/When/Then AC)
- Tasks requiring iteration and refinement (TDD cycle)
- Greenfield projects (our case exactly)
- Tasks with automatic verification (tests, linters)

## Model Routing Strategy

### Task Tool Integration
- Claude Code's `Task` tool supports `model` parameter: "haiku", "sonnet", "opus"
- Sub-agent definitions in `.claude/agents/` provide context but don't set model
- Ralph orchestrator (running on Sonnet) delegates via Task tool with model selection
- Cost estimate per epic: ~$15-28 (Haiku 70%, Sonnet 25%, Opus 5%)

### Model Assignment Criteria
| Complexity | Model | Examples |
|------------|-------|---------|
| Simple | Haiku | CRUD, boilerplate, test writing, schema migrations |
| Moderate | Sonnet | Integration logic, auth flows, webhook pipeline, code review |
| Complex | Opus | Cross-cutting architectural decisions, stuck task diagnosis |

## Architecture Context for Ralph

### Epic Priority Chain
```
Epic 1 (Foundation) → Epic 2 (Auth) → Epic 3 (Dashboard Shell)
                                        ├→ Epic 4 (Jira) ─────┐
                                        ├→ Epic 5 (GitHub) ───┤
                                        └→ Epic 8 (Admin) ────┤
                                                               ├→ Epic 6 (AI Assistant)
                                                               └→ Epic 7 (AI Reports)
```

### Sprint Recommendation (from IR)
1. Sprint 1: Epic 1 + Epic 2 (Foundation + Auth)
2. Sprint 2: Epic 3 (Dashboard Shell)
3. Sprint 3: Epic 4 + 5 in parallel (Jira + GitHub integrations)
4. Sprint 4: Epic 6 + 8 (AI Assistant + Admin)
5. Sprint 5: Epic 7 (AI Reports)

### Story Count by Epic
| Epic | Stories | Recommended Model |
|------|---------|-------------------|
| Epic 1: Foundation | 5 | Haiku (boilerplate-heavy) |
| Epic 2: Auth | 5 | Sonnet (security-critical) |
| Epic 3: Dashboard | 5 | Haiku/Sonnet mix |
| Epic 4: Jira | 5 | Sonnet (integration logic) |
| Epic 5: GitHub | 4 | Sonnet (integration logic) |
| Epic 6: AI Assistant | 5 | Sonnet (AI + MCP complexity) |
| Epic 7: AI Reports | 4 | Sonnet (AI generation) |
| Epic 8: Admin | 3 | Haiku (CRUD admin pages) |
| **Total** | **36** | |

---
*Updated 2026-02-18 — Ralph Loop integration analysis complete*
