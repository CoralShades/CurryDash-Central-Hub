# Ralph Build Iteration — CurryDash Central Hub

You are implementing ONE story for the CurryDash Central Hub project. Follow these phases exactly.

## Phase 0: Orient

1. Read the story content and acceptance criteria below carefully.
2. Read `AGENTS.md` for build commands and operational patterns.
3. Read `_bmad-output/project-context.md` for the 48 project rules.
4. Search the codebase for existing implementations related to this story.
   Do NOT assume code is missing — confirm with search first.

## Phase 1: Plan

1. Identify all files to create or modify.
2. Check existing code for patterns to follow (look at sibling modules).
3. If a partial implementation exists (noted below), review what's already done
   and implement ONLY the gaps. Do NOT rewrite working code.

## Phase 2: Implement with TDD

Follow Red-Green-Refactor strictly:

1. **RED**: Write failing tests first.
   - Unit tests: co-located beside source (e.g., `component.test.ts`)
   - E2E tests: in `e2e/` directory
2. **GREEN**: Implement minimum code to pass all tests.
3. **REFACTOR**: Clean up while keeping tests green.

Use subagents for efficiency:
- Haiku subagents for file exploration and codebase search
- Sonnet subagents for implementation work

## Phase 3: Validate (ALL must pass before committing)

Run these commands and fix any failures:
```bash
npx vitest run          # All tests pass
npx tsc --noEmit        # No type errors
npm run lint            # No lint errors
```

If validation fails, fix and re-run. After 3 failed attempts on the same issue,
proceed to Phase 4 with a WIP commit.

## Phase 4: Commit (MANDATORY — do NOT skip)

### On success (all validations pass):
1. Update `.ralph-plan.md`: change `[ ] pending` to `[x] done` for this story
2. Stage specific files: `git add [file1] [file2] ...` (NOT `git add -A`)
3. Commit: `git commit -m "feat({epic-slug}): {story title} - story {ID} complete"`

### On failure (cannot pass validation after 3 attempts):
1. Stage working code only: `git add [working files]`
2. Commit: `git commit -m "wip({epic-slug}): {story title} - story {ID} partial"`
3. Do NOT update `.ralph-plan.md` status

## Phase 5: Signal (REQUIRED — output exactly one)

- Success: `STORY_COMPLETE`
- Failure: `STORY_BLOCKED: {specific reason why}`
- All done: `<promise>ALL_STORIES_COMPLETE</promise>`

## Rules

- Implement ONLY this story. Do not touch unrelated files.
- ONE story per iteration. Never start a second story.
- `.claude/rules/` files are auto-loaded — follow all conventions.
- CSS: custom properties only — never hardcoded hex values.
- Server Actions: return `{ data, error }` — never throw.
- Widgets: `<ErrorBoundary>` wrapper, `<WidgetSkeleton>` for loading.
- Supabase: use correct client variant (client/server/middleware/admin).
- RBAC: enforce at all three layers (middleware, server component, RLS).
- Zod: validate at all boundaries (Server Actions, Route Handlers, webhooks).
- Imports: always use `@/` prefix.

---

## Story to Implement

{{STORY_CONTENT}}

## Acceptance Criteria

{{ACCEPTANCE_CRITERIA}}

## Architecture Context

{{ARCHITECTURE_SECTION}}
