# BMAD v6 Workflow Conventions

## Framework Location
- Core framework: `_bmad/` directory (with underscore prefix)
- Output artifacts: `_bmad-output/` directory
- Project context: `_bmad-output/project-context.md` (48 rules, read before implementing)

## Subsystems
- **BMM** (Business & Method Management) — agents, workflows, testarch knowledge base
- **CIS** (Creativity & Innovation System) — brainstorming, design thinking, storytelling
- **JBM** (Jira Bridge Module) — Jira integration agent with sidecar config
- **Core** — BMAD Master agent, party-mode, brainstorming workflow

## Available Commands
- Claude Code: `.claude/commands/bmad/` — invoke via `/bmad:` slash commands
- Codex: `.agent/workflows/bmad/` — 55 workflow files in flat naming
- Gemini: `.gemini/commands/` — 67 TOML command definitions
- Copilot: `.github/agents/` — 17 `.agent.md` agent definitions

## Workflow Phases
1. **Analysis** — product-brief, research (domain/market/technical)
2. **Planning** — UX design, PRD (create/validate/edit)
3. **Solutioning** — architecture, epics-and-stories, implementation-readiness
4. **Implementation** — create-story, dev-story, code-review, sprint-planning

## Session Recovery
- Planning files: `task_plan.md`, `findings.md`, `progress.md`
- Read `progress.md` at session start to recover context
- Update `progress.md` at session end with completed work
