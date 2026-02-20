# Working with OpenAI Codex — CurryDash Central Hub

## Getting Started

1. Install Codex CLI: Follow instructions at [developers.openai.com/codex](https://developers.openai.com/codex)
2. Navigate to the project root: `cd CurryDash-Central-Hub`
3. Trust the project when prompted (required for `.codex/config.toml` to load)
4. Codex auto-reads `AGENTS.md` for project instructions

## Configuration Files

| File | Purpose |
|------|---------|
| `AGENTS.md` | Primary project instructions (auto-discovered by Codex) |
| `.codex/config.toml` | Model selection (`o4-mini`), approval policies |
| `.agent/workflows/bmad/` | 55 BMAD workflow definitions in flat naming format |

## Configuration Details

### `.codex/config.toml`
```toml
model = "o4-mini"                    # Cost-optimized model
approval_policy = "unless-allow-listed"  # Safe default
```

Codex also reads `CLAUDE.md` as a fallback instruction file (configured via `project_doc_fallback_filenames`).

## Available BMAD Workflows

The `.agent/workflows/bmad/` directory contains 55 workflow files using flat naming:

### Naming Convention
`bmad-{module}-{type}-{name}.md`

### Key Workflows
| Workflow File | Purpose |
|---|---|
| `bmad-bmm-workflow-prd.md` | Product Requirements Document |
| `bmad-bmm-workflow-create-architecture.md` | Architecture decisions |
| `bmad-bmm-workflow-create-epics-and-stories.md` | Epic/story breakdown |
| `bmad-bmm-workflow-dev-story.md` | Story implementation |
| `bmad-bmm-workflow-code-review.md` | Adversarial code review |
| `bmad-bmm-workflow-quick-dev.md` | Flexible development |
| `bmad-bmm-workflow-quick-spec.md` | Quick spec engineering |
| `bmad-bmm-workflow-sprint-planning.md` | Sprint management |
| `bmad-bmm-workflow-testarch-framework.md` | Test framework init |

### Agents
| Agent File | Role |
|---|---|
| `bmad-bmm-agent-architect.md` | Architecture specialist |
| `bmad-bmm-agent-dev.md` | Developer |
| `bmad-bmm-agent-pm.md` | Product manager |
| `bmad-bmm-agent-analyst.md` | Business analyst |
| `bmad-bmm-agent-sm.md` | Scrum master |
| `bmad-core-agent-bmad-master.md` | Master orchestrator |

## Skills Ecosystem

Codex supports installable skills from the [OpenAI Skills catalog](https://github.com/openai/skills):

```bash
# Install a skill by name
$skill-installer gh-address-comments

# Install from a GitHub directory URL
$skill-installer https://github.com/openai/skills/tree/main/.curated/react-best-practices
```

### Recommended Skills for CurryDash
- **react-best-practices** — React/Next.js optimization rules
- **web-design-guidelines** — Accessibility and responsive design
- **gh-address-comments** — Address GitHub PR review comments

Also see [Vercel Agent Skills](https://github.com/vercel-labs/agent-skills) for Next.js-specific skills installable via `npx skills add vercel-labs/agent-skills`.

## Approval Policies

The project uses `unless-allow-listed` policy:
- Pre-approved safe operations run without confirmation
- Destructive operations require explicit approval
- Customize in `.codex/config.toml`

## Tips

1. **Start with context** — Codex reads `AGENTS.md` automatically; reference specific workflow files for complex tasks
2. **Use o4-mini** — Cost-optimized default; switch to `o3` for complex architecture decisions if needed
3. **Trust the project** — `.codex/config.toml` only loads in trusted projects
4. **Combine with CLI workflows** — Use `.agent/workflows/bmad/` files as implementation guides

## External Resources

- [Codex Documentation](https://developers.openai.com/codex)
- [Codex Configuration Reference](https://developers.openai.com/codex/config-basic/)
- [OpenAI Skills Catalog](https://github.com/openai/skills)
- [Agent Skills Specification](https://github.com/agentskills/agentskills)
