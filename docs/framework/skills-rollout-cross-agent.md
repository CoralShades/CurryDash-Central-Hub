# Cross-Agent Skills Rollout

This document records the installed skill setup for CurryDash Central Hub.

## Project

- Repository: `CurryDash-Central-Hub`
- Stack: Next.js 15, React, TypeScript, Supabase, Auth.js, Playwright

## Installed Skill Roots

- `.claude/skills`
- `.agents/skills`
- `.opencode/skills`
- `.codex/skills`
- `.cursor/skills`
- `.gemini/skills`
- `.agent/skills`

## Catalog Sources

- `https://github.com/VoltAgent/awesome-agent-skills`
- `https://github.com/travisvn/awesome-claude-skills`
- `https://github.com/supabase/agent-skills`

## Installed Packs

- Core baseline pack mirrored from local curated catalog
- Planning add-on: `planning-with-files`
- Stack-specific add-on: `supabase-postgres-best-practices`

## Preservation Rules Applied

- Existing `.claude/commands`, `.gemini/commands`, and `.agent/workflows` were preserved
- Existing repository config under `.codex/config.toml` was preserved
- Existing local skill folders were not overwritten; only missing skills were added
