# Sprint A — Quick Wins Orchestrator

> **Target codebase**: `/home/demi/gitrepo/cd/Admin-Seller/` (WSL)
> **Total tickets**: 9 (across 8 prompt files)
> **Estimated time**: ~6-7 hours
> **Skill approach**: `/bmad-quick-spec` → `/bmad-quick-dev` for all quick wins

---

## Execution Order

Run these prompts sequentially in a single Claude Code WSL session. Each prompt is self-contained — copy-paste the full `.md` file content into Claude Code.

| # | File | Tickets | Est | Type | Dependencies |
|---|------|---------|-----|------|-------------|
| 1 | `01-CAR-201-abn-mandatory.md` | CAR-201 | 30 min | Bug fix | None — start here |
| 2 | `02-CAR-144-display-abn.md` | CAR-144 | 45 min | Story | After CAR-201 (shared ABN field) |
| 3 | `03-CAD-207-role-display.md` | CAD-207 | 1-2 hrs | Bug fix | Independent |
| 4 | `04-CAD-203-name-search.md` | CAD-203 | 1 hr | Bug fix | Independent |
| 5 | `05-CAR-179-date-filter.md` | CAR-179 | 1-2 hrs | Bug fix | Independent |
| 6 | `06-CAR-195-error-message.md` | CAR-195 | 30 min | Bug fix | Independent |
| 7 | `07-CAR-202-email-fix.md` | CAR-202 | 1 hr | Bug fix | Independent |
| 8 | `08-CAR-203-204-disable-delete.md` | CAR-203, CAR-204 | 2 hrs | Frontend task | Independent |

## Pre-Session Checklist

Before starting the session in WSL:

```bash
cd /home/demi/gitrepo/cd/Admin-Seller/
git checkout main && git pull origin main
git status  # Ensure clean working tree
php artisan migrate:status  # Check DB state
```

## Subagent Strategy

Tickets 3-7 are fully independent (different controllers, different views, different subsystems). If using `dispatching-parallel-agents` or `subagent-driven-development`, these can be dispatched as parallel subagents:

**Parallel Group A** (admin bugs — CAD project):
- Agent 1: CAD-207 (EmployeeController + employee list view)
- Agent 2: CAD-203 (OrderController + order monitoring view)

**Parallel Group B** (seller bugs — CAR project):
- Agent 3: CAR-179 (Order history + ReportFilter trait)
- Agent 4: CAR-195 (PackageController reorder response)
- Agent 5: CAR-202 (Email templates + Mail classes)

**Sequential** (dependencies):
- CAR-201 → CAR-144 (ABN field: make mandatory first, then display)
- CAR-203 + CAR-204 (combined: same pattern, do together)

## Common Jira Governance

All prompts follow `JIRA_GOVERNANCE.md`. Key rules:

### Branch Format
```
{type}/{JIRA-KEY}-{short-slug}
```

### Commit Format
```
{type}({scope}): {imperative description} [{JIRA-KEY}]
```

### PR Title Format
```
[JIRA-KEY] {type}: {description}
```

### Jira Transition Workflow (MCP)
1. **Start work** → Transition to "In Progress"
2. **PR opened** → Transition to "Code Review"
3. **Browser tested + screenshots** → Create Draft PR → Wait for Demi's approval
4. **Demi approves Draft PR** → Transition to "Dev Tested"
5. **PR moved Draft → Active** → Transition to "SIT"

### MCP Tool Reference
- Get transitions: `mcp__claude_ai_Atlassian__getTransitionsForJiraIssue`
- Transition: `mcp__claude_ai_Atlassian__transitionJiraIssue`
- Add comment: `mcp__claude_ai_Atlassian__addCommentToJiraIssue`
- Get issue: `mcp__claude_ai_Atlassian__getJiraIssue`

### Post-Implementation Checklist (every ticket)
- [ ] Tests written (at minimum: happy path + one error path)
- [ ] `php artisan test --filter=YourTest` passes
- [ ] Code review via `/bmad-code-review`
- [ ] Commit with `[JIRA-KEY]` in message
- [ ] Draft PR with `[JIRA-KEY]` in title
- [ ] Browser test the change and take screenshots
- [ ] Jira comment with PR link posted
- [ ] Wait for Demi's approval before transitioning to Dev Tested

## Architecture Reminders (from WSL CLAUDE.md)

- **Auth**: Passport (NOT Sanctum) — 3-guard system: `admin`, `vendor`, `api`
- **Test coverage**: Critically low (12 tests for 123 models) — every ticket MUST add tests
- **FormRequests**: Only 4 exist — use inline validation for quick wins, don't refactor now
- **Helpers.php**: 5189-line god class — do NOT add methods here. Create services in `app/Services/`
- **New features**: Create dedicated service classes under `app/Services/`
