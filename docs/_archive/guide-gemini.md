# Working with Google Gemini Code Assist — CurryDash Central Hub

## Getting Started

1. Install the Gemini Code Assist extension in your IDE (VS Code, JetBrains)
2. Sign in with your Google Account
3. Open the CurryDash-Central-Hub project
4. Gemini auto-reads `.gemini/instructions.md` for project context

## Configuration Files

| File | Purpose |
|------|---------|
| `.gemini/instructions.md` | Project-specific context and rules |
| `.gemini/styleguide.md` | Code review standards |
| `.gemini/commands/` | 67 BMAD command definitions (TOML format) |

## BMAD Commands

The `.gemini/commands/` directory contains 67 TOML-formatted command definitions. These follow the naming pattern `bmad-{type}-{module}-{name}.toml`.

### Command Categories

**Agents (17 commands)**
- Architecture, development, analysis, PM, SM, QA agents
- Creative agents: brainstorming, design thinking, storytelling
- Integration agents: Jira Bridge

**Workflows (46 commands)**
- Full BMAD lifecycle: analysis → planning → solutioning → implementation
- Quick flows for rapid development
- TestArch workflows for comprehensive testing
- Excalidraw diagram generation

**Tasks (4 commands)**
- Document sharding, indexing, and utility tasks

### Example Usage
Reference TOML command files when asking Gemini to execute BMAD workflows. The commands contain the full workflow instructions and agent personas.

## Code Review Integration

Gemini uses `.gemini/styleguide.md` for code review standards:

- TypeScript strict mode enforcement
- Server/Client Component boundary validation
- CSS custom property usage (no hardcoded hex)
- Zod validation patterns at data boundaries
- Error handling patterns (`{ data, error }` returns)
- Naming conventions (kebab-case files, PascalCase components)

## GitHub Integration

For GitHub-based code review with Gemini:

1. Install Gemini Code Assist on your GitHub organization
2. Configure via `.gemini/` directory in the repository
3. Gemini uses `instructions.md` and `styleguide.md` for review context
4. Custom code review style guides enforce project-specific patterns

## Tips

1. **Reference instructions** — Point Gemini to `.gemini/instructions.md` when it misses project conventions
2. **Use styleguide for reviews** — The styleguide enforces CurryDash-specific patterns like spice theme tokens
3. **Combine with BMAD** — Use TOML command files as context for complex workflow execution
4. **IDE inline suggestions** — Gemini learns from project patterns; the instructions file improves suggestion quality

## External Resources

- [Gemini Code Assist Documentation](https://cloud.google.com/gemini/docs/codeassist)
- [Gemini Code Assist on GitHub](https://developers.google.com/gemini-code-assist/docs/set-up-code-assist-github)
- [Custom Style Guides](https://cloud.google.com/gemini/docs/codeassist/customize)
