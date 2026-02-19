# CurryDash Central Hub

## Tech Stack
- **Framework**: Next.js 15 (App Router), React 18, TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL + Realtime + Auth)
- **Auth**: Auth.js v5 (JWT sessions with role claims)
- **Styling**: Tailwind CSS v4, shadcn/ui (stone base + spice palette)
- **State**: Zustand 5 (UI state only)
- **AI**: CopilotKit v1.51.3 + Mastra v0.10.15 + Vercel AI SDK v4.3.19
- **Integrations**: Jira (jira.js), GitHub (Octokit)
- **Testing**: Vitest (unit/integration), Playwright (E2E)

## Project Structure
```
src/app/              # Thin route wrappers (App Router)
src/components/ui/    # shadcn/ui auto-generated
src/components/shared/# App-wide (WidgetSkeleton, WidgetError, RoleGate)
src/modules/          # Feature modules by domain
src/lib/              # Shared utils, schemas, errors, supabase clients
src/stores/           # Zustand stores
src/types/            # Cross-module shared types
src/mastra/           # AI agent backend
e2e/                  # Playwright E2E tests
_bmad-output/         # BMAD planning + implementation artifacts
```

## Build & Validate
```bash
npx vitest run        # Unit/integration tests
npx tsc --noEmit      # Type checking
npm run lint          # Linting
npm run build         # Full build
```

## Key References
- **Project rules (48)**: `_bmad-output/project-context.md`
- **Code style**: `.claude/rules/code-style.md`
- **Design system**: `.claude/rules/design-system.md`
- **Next.js patterns**: `.claude/rules/nextjs-patterns.md`
- **RBAC**: `.claude/rules/rbac.md`
- **Integrations**: `.claude/rules/integrations.md`
- **Operational patterns**: `AGENTS.md`

## Four Roles (Spice Theme)
- **Admin** (Chili #C5351F) — system administration
- **Developer** (Coriander #4A7C59) — code development
- **QA** (Turmeric #E6B04B) — quality assurance
- **Stakeholder** (Cinnamon #5D4037) — project oversight
