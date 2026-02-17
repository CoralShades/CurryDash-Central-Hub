# Code Style Rules

## TypeScript
- Strict mode required — no `any` unless wrapping untyped external APIs
- Import alias: always use `@/` prefix — `import { logger } from '@/lib/logger'`
- DB columns are `snake_case`, TypeScript properties are `camelCase` — never mix within same layer
- Server Actions never throw — return `{ data: T, error: null }` or `{ data: null, error: { code, message } }`
- Route Handlers return `NextResponse.json({ data, error }, { status })` with appropriate HTTP codes
- Error classes: `AuthError`, `IntegrationError`, `ValidationError`, `RateLimitError` extend base `AppError` in `src/lib/errors.ts`
- Zod at boundaries: every Server Action, Route Handler, webhook handler validates input with Zod before writes
- Zod schema naming: `camelCase` + `Schema` suffix — `jiraIssueSchema`, `webhookEventSchema`

## File & Symbol Naming
- **Files:** `kebab-case` — `issue-card.tsx`, `use-realtime.ts`, `jira-client.ts`
- **Components:** `PascalCase` — `IssueCard`, `DashboardGrid`, `WidgetSkeleton`
- **Functions/hooks:** `camelCase` — `getIssues()`, `useRealtimeUpdates()`
- **Constants:** `UPPER_SNAKE_CASE` — `MAX_JIRA_CALLS_PER_MINUTE`
- **Types/interfaces:** `PascalCase` — `JiraIssue`, `WebhookEvent`
- **Zustand stores:** `use{Feature}Store` — `useDashboardStore`
- **Server Actions:** `{verb}{Resource}` — `createIssue()`, `updateWidget()`
- **API routes:** `/api/{resource}/{action}` — `/api/webhooks/jira`
- **Event names:** `{resource}.{action}` — `issue.created`, `sprint.updated`
