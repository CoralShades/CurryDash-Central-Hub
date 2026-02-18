---
description: "Generate .ralph-plan.md from BMAD v6 planning artifacts"
---

# Ralph Bridge — BMAD-to-Ralph Plan Generator

Read all planning artifacts and generate a structured implementation plan for the Ralph loop.

## Input Documents

Read these documents in order:

1. `_bmad-output/planning-artifacts/architecture.md` — Architecture decisions, tech stack, patterns, project structure
2. `_bmad-output/planning-artifacts/prd.md` — Product requirements (56 FRs, 46 NFRs)
3. `_bmad-output/planning-artifacts/epics.md` — Epic breakdown with all stories and acceptance criteria
4. `_bmad-output/planning-artifacts/ux-design-specification.md` — UX patterns and design tokens
5. `_bmad-output/test-design-system.md` — Test strategy and Sprint 0 recommendations
6. `_bmad-output/project-context.md` — Project rules and conventions

## Output

Create a file called `.ralph-plan.md` with this structure:

```markdown
---
generated: "[current date]"
source: "BMAD v6 planning artifacts"
project: "CurryDash-Central-Hub"
total_stories: [count]
total_epics: [count]
---

# Ralph Implementation Plan

Generated from BMAD v6 planning artifacts on [date].

## Architecture Context

[Summarize key decisions from architecture docs — tech stack, patterns, constraints, project structure]

## Tech Stack Summary

[List: Next.js 15, Supabase, Auth.js v5, Tailwind/shadcn/ui, CopilotKit, Mastra, Vitest, Playwright]

## Stories (ordered by epic priority, then story priority)

For each story in each epic, create an entry:

### [EPIC-N] Story [N.M]: [Title]
- **Status:** [ ] pending
- **Epic:** [Epic name]
- **FRs:** [FR numbers this story covers]
- **NFRs:** [NFR numbers if applicable]
- **ARCH:** [Architecture decisions if applicable]
- **UX:** [UX requirements if applicable]
- **Acceptance Criteria:** [Copy Given/When/Then from story]
- **Key Files:** [Files this story will create or modify, from architecture]
- **Dependencies:** [Other story IDs that must complete first]
- **Estimated Complexity:** simple | moderate | complex
- **Recommended Model:** haiku | sonnet | opus

## Model Assignment Rules

Mark stories as follows:
- **haiku**: Simple CRUD, boilerplate, scaffolding, schema migrations, test writing, config files, static pages
- **sonnet**: Integration logic, auth flows, webhook pipeline, real-time features, component composition, code review, QA
- **opus**: Cross-cutting architectural decisions, complex debugging, multi-module changes

## Dependency Rules

- Epic 1 must complete before Epic 2
- Epic 2 must complete before Epic 3
- Epics 4, 5, and 8 can start after Epic 3 (parallel-capable)
- Epics 6 and 7 require Epics 4 and 5
- Within each epic, stories are ordered by their natural dependencies
```

Do NOT implement anything. Only create the plan.

When the plan is complete, output: <promise>PLAN_COMPLETE</promise>
