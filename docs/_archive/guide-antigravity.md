# Working with Antigravity (Claude on the Web) — CurryDash Central Hub

## What is Antigravity?

Antigravity refers to using Claude on the web (claude.ai) for project planning, brainstorming, and analysis tasks that benefit from the conversational UI, artifacts, and project knowledge features.

## Setting Up a Project

1. Go to [claude.ai](https://claude.ai) and create a new Project
2. Name it "CurryDash Central Hub"
3. Upload project knowledge files (see below)

## Key Files to Upload as Project Knowledge

Upload these files to give Claude full project context:

### Required
| File | Purpose |
|------|---------|
| `_bmad-output/project-context.md` | 48 implementation rules — the single most important context file |
| `CLAUDE.md` | Project architecture overview |
| `AGENTS.md` | AI agent personas and guidelines |

### Recommended (Phase-Dependent)
| File | When to Upload |
|------|---------------|
| `_bmad-output/planning-artifacts/product-brief.md` | During PRD and architecture phases |
| `_bmad-output/planning-artifacts/prd.md` | During architecture and epic planning |
| `_bmad-output/planning-artifacts/architecture.md` | During implementation planning |
| `_bmad-output/planning-artifacts/ux-spec.md` | During UI implementation |
| `progress.md` | For session continuity context |
| `findings.md` | For accumulated research context |

## Recommended Use Cases

### Planning & Analysis
- Product strategy discussions
- Architecture trade-off analysis
- UX design exploration with artifact generation
- Sprint retrospective facilitation

### Document Generation
- PRD drafting and refinement
- Technical specification writing
- Meeting notes and action items
- Stakeholder reports and presentations

### Research
- Technology evaluation (e.g., comparing auth libraries)
- API documentation analysis
- Competitive analysis
- Best practices research

## Tips for Effective Use

1. **Start with context** — Always reference the uploaded project knowledge at the start of a conversation
2. **Use artifacts** — Ask Claude to create documents, diagrams, and code as artifacts for easy iteration
3. **Iterate on artifacts** — Edit and refine artifacts through conversation rather than starting from scratch
4. **Export results** — Copy finalized artifacts back to the repo as BMAD output files
5. **Session handoff** — Update `progress.md` with any decisions or outputs from web sessions

## Workflow Integration with CLI

The web and CLI tools complement each other:

| Task | Best Tool |
|------|-----------|
| High-level planning | Antigravity (web) |
| Document drafting | Antigravity (web) |
| Code implementation | Claude Code (CLI) |
| BMAD workflow execution | Claude Code (CLI) |
| Code review | Claude Code (CLI) or GitHub Action |
| Research & brainstorming | Either |

## Limitations

- Cannot directly access the repository or run commands
- Files must be manually uploaded/downloaded
- No MCP server integration
- Context is limited to uploaded files and conversation history
