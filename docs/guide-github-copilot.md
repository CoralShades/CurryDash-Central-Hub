# Working with GitHub Copilot — CurryDash Central Hub

## Getting Started

1. Ensure GitHub Copilot is enabled on your account/organization
2. Install the GitHub Copilot extension in your IDE
3. Open the CurryDash-Central-Hub project
4. Copilot auto-reads `.github/copilot-instructions.md` (342 lines of project-specific guidelines)

## Configuration Files

| File | Purpose |
|------|---------|
| `.github/copilot-instructions.md` | Comprehensive coding guidelines (type safety, RBAC, design system, integrations) |
| `.github/agents/` | 17 custom agent definitions (`.agent.md` files) |
| `.github/workflows/copilot-setup-steps.yml` | Environment setup for Copilot coding agent |
| `.github/workflows/claude.yml` | @claude interactive action (complements Copilot) |
| `.github/workflows/pr-review.yml` | Automated PR review |

## Custom Agents

The `.github/agents/` directory contains 17 specialized agent definitions:

### BMAD Agents
| Agent File | Role |
|---|---|
| `bmd-agent-architect.agent.md` | Architecture decisions |
| `bmd-agent-dev.agent.md` | Development implementation |
| `bmd-agent-analyst.agent.md` | Business analysis |
| `bmd-agent-pm.agent.md` | Product management |
| `bmd-agent-sm.agent.md` | Scrum master |
| `bmd-agent-tea.agent.md` | Technical excellence advisor |
| `bmd-agent-tech-writer.agent.md` | Documentation |
| `bmd-agent-ux-designer.agent.md` | UX design |
| `bmd-agent-quick-flow-solo-dev.agent.md` | Solo development flow |

### Creative & Innovation Agents
| Agent File | Role |
|---|---|
| `bmd-agent-brainstorming-coach.agent.md` | Brainstorming facilitation |
| `bmd-agent-creative-problem-solver.agent.md` | Creative problem solving |
| `bmd-agent-design-thinking.agent.md` | Design thinking methodology |
| `bmd-agent-innovation-strategist.agent.md` | Innovation strategy |
| `bmd-agent-presentation-master.agent.md` | Presentation design |
| `bmd-agent-storyteller.agent.md` | Narrative crafting |

### Core Agents
| Agent File | Role |
|---|---|
| `bmd-agent-bmad-master.agent.md` | Master orchestrator |
| `bmd-agent-jira-bridge.agent.md` | Jira integration |

## GitHub Actions Workflows

### @claude Interactive Action (`.github/workflows/claude.yml`)
- Mention `@claude` in PR comments, issues, or reviews
- Uses `claude-haiku-4-5` (cost-optimized) with max 10 turns
- Requires `ANTHROPIC_API_KEY` repository secret

### Automated PR Review (`.github/workflows/pr-review.yml`)
- Triggers on PR open, sync, reopen
- Reviews for: TypeScript compliance, design tokens, RBAC, component boundaries, Zod validation
- Uses `claude-haiku-4-5` with max 5 turns

### Copilot Setup Steps (`.github/workflows/copilot-setup-steps.yml`)
- Configures the environment for Copilot coding agent
- Node.js 20, npm install, Prisma client generation
- Job name `copilot-setup-steps` (required by GitHub)

### CI Quality Gates (`.github/workflows/ci.yml`)
- Runs on push/PR to main and develop
- Type checking, linting, unit tests, build

## Setting Up Repository Secrets

For the Claude-powered GitHub Actions to work, add these repository secrets:

1. Go to repository Settings → Secrets and variables → Actions
2. Add `ANTHROPIC_API_KEY` — your Anthropic API key

## Copilot Instructions

The `.github/copilot-instructions.md` file (342 lines) covers:

- **Type Safety** — Strict TypeScript patterns, Zod schemas, error handling
- **Role-Based Architecture** — RBAC patterns, role-specific colors and permissions
- **Design System** — Spice theme tokens, shadcn/ui patterns, spacing scale
- **Integration Patterns** — Jira client, GitHub client, AI chat engine usage
- **Testing** — Co-located tests, E2E patterns, mock strategies
- **Security** — HMAC validation, RLS enforcement, input sanitization

## Dependabot (`.github/dependabot.yml`)

Automated dependency updates configured for:
- npm packages (weekly, grouped by ecosystem)
- GitHub Actions (weekly)

Groups: `next-ecosystem`, `testing`, `ai-stack`

## Tips

1. **Use @claude for complex tasks** — Copilot handles inline suggestions; @claude handles multi-file reasoning
2. **Reference agents** — Mention specific `.agent.md` files when asking Copilot for role-specific guidance
3. **PR workflow** — Open PRs to get automated review from both Copilot and Claude
4. **Cost awareness** — All Claude GitHub Actions use `claude-haiku-4-5` by default to minimize costs

## External Resources

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Custom Agents Configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
- [Claude Code Action](https://github.com/anthropics/claude-code-action)
- [Copilot Agentic Workflows](https://github.blog/changelog/2025-02-04-github-copilot-agentic-workflows)
