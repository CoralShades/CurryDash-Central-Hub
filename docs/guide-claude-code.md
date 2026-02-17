# Working with Claude Code — CurryDash Central Hub

## Getting Started

1. Install Claude Code CLI: `npm install -g @anthropic-ai/claude-code`
2. Navigate to the project root: `cd CurryDash-Central-Hub`
3. Launch: `claude`
4. Claude Code auto-loads `CLAUDE.md`, all `.claude/rules/` files, and MCP servers

## Configuration Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project-wide instructions (174 lines) |
| `.claude/settings.json` | Permissions, hooks, behavioral controls |
| `.claude/settings.local.json` | Personal overrides (gitignored) — add your API tokens here |
| `.mcp.json` | MCP servers (Playwright, filesystem) |
| `.claude/rules/` | 6 modular rule files loaded automatically |
| `.claude/hooks/` | PreToolUse/PostToolUse/Stop hook scripts |
| `.claude/skills/` | Planning-with-files skill |
| `.claude/commands/bmad/` | 120+ BMAD slash commands |

## BMAD Slash Commands

All BMAD v6 workflows are available via `/bmad:` prefix. Key commands by phase:

### Phase 1 — Analysis
- `/bmad:bmm:workflows:create-product-brief` — Create product brief
- `/bmad:bmm:workflows:research` — Domain, market, technical research

### Phase 2 — Planning
- `/bmad:bmm:workflows:create-ux-design` — UX design collaboration
- `/bmad:bmm:workflows:prd` — Create, validate, or edit PRD

### Phase 3 — Solutioning
- `/bmad:bmm:workflows:create-architecture` — Architecture decisions
- `/bmad:bmm:workflows:create-epics-and-stories` — Break PRD into stories
- `/bmad:bmm:workflows:check-implementation-readiness` — Pre-implementation validation

### Phase 4 — Implementation
- `/bmad:bmm:workflows:create-story` — Create next user story
- `/bmad:bmm:workflows:dev-story` — Execute a story
- `/bmad:bmm:workflows:code-review` — Adversarial code review
- `/bmad:bmm:workflows:sprint-planning` — Sprint management

### Quick Flows
- `/bmad:bmm:workflows:quick-dev` — Flexible development from specs or instructions
- `/bmad:bmm:workflows:quick-spec` — Conversational spec engineering

### Agents
- `/bmad:core:agents:bmad-master` — Master orchestrator
- `/bmad:bmm:agents:architect` — Architecture specialist
- `/bmad:bmm:agents:dev` — Developer agent
- `/bmad:bmm:agents:pm` — Product manager
- `/bmad:bmm:agents:analyst` — Business analyst

### Testing
- `/bmad:bmm:workflows:testarch-framework` — Initialize test framework
- `/bmad:bmm:workflows:testarch-automate` — Expand test coverage
- `/bmad:bmm:workflows:testarch-atdd` — Acceptance-test-driven development

## Planning with Files

The project uses persistent markdown files for session continuity:

- **`task_plan.md`** — Active task checklist. Update `[ ]` → `[x]` as tasks complete.
- **`findings.md`** — Research log with sources and decisions.
- **`progress.md`** — Session recovery journal. Read at start, update at end.

Hooks in `.claude/settings.json` automatically:
- Read `task_plan.md` before file writes
- Remind about `progress.md` after modifications
- Check for pending tasks before session end

## MCP Servers

### Pre-configured (`.mcp.json`)
- **Playwright** — Browser automation for E2E testing
- **Filesystem** — Structured file access

### Personal Servers (`.claude/settings.local.json`)
To add Jira and GitHub MCP servers, edit `.claude/settings.local.json` and fill in your tokens:
- `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN`
- `GITHUB_TOKEN`

Check available servers: `/mcp` command in Claude Code.

## Recommended Workflow

1. Start session → Claude auto-reads `CLAUDE.md` + rules
2. Read `progress.md` to recover context from prior sessions
3. Activate BMAD master: `/bmad:core:agents:bmad-master`
4. Select workflow for current phase
5. Execute tasks, update planning files as you go
6. End session → hooks check completion status

## External Resources

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
- [Planning with Files](https://github.com/OthmanAdi/planning-with-files) — Session continuity skill
- [Awesome Claude Code Subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) — 100+ specialized agents
- [Awesome Claude Skills](https://github.com/ComposioHQ/awesome-claude-skills) — 944+ skill integrations
- [Knowledge Work Plugins](https://github.com/anthropics/knowledge-work-plugins) — Domain specialist plugins
- [Interface Design](https://github.com/Dammyjay93/interface-design) — Design system framework
- [Agent Skills Spec](https://github.com/agentskills/agentskills) — Cross-platform skill standard
