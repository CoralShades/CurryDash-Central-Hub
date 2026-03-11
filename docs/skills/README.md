# CurryDash Central Hub Skill Guide

This guide explains the cross-agent skill setup and how to invoke skills consistently.

## Skill Roots

- Claude Code: `.claude/skills`
- Codex primary: `.agents/skills`
- OpenCode: `.opencode/skills`
- Codex mirror: `.codex/skills`
- Cursor: `.cursor/skills`
- Gemini CLI: `.gemini/skills`
- Antigravity: `.agent/skills`

## Recommended Core Skills

- Planning and execution: `brainstorming`, `writing-plans`, `executing-plans`, `verification-before-completion`
- Frontend quality: `frontend-design`, `next-best-practices`, `react-best-practices`, `web-design-guidelines`
- Security review: `codeql`, `semgrep`, `insecure-defaults`, `differential-review`
- Git workflow: `commit`, `create-pr`, `code-review`, `find-bugs`
- Documents and reporting: `pdf`, `docx`, `pptx`, `xlsx`

## Stack-Specific Skills

- Supabase/Postgres: `supabase-postgres-best-practices`

## Prompt Templates

- Claude/OpenCode/Codex: `@docs/skills/README.md Use <skill-name> to <task>.`
- Cursor/Gemini/Antigravity: reference this file and explicitly name the skill and expected output format.

## Verification Checklist

- Confirm target skill exists in the active tool root
- Run project checks after implementation:
  - `npx vitest run`
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm run build`
