# Findings: Post-Ralph Review & E2E Validation

## Baseline Status (Phase 0)
- **Unit tests:** 353/356 pass (3 flaky timeout failures — pre-existing)
  - `copilot-provider.test.ts` — useCopilotActions export test timeout
  - `jira-client.test.ts` — missing credentials test timeout (21.5s)
  - `ai-widget-card.test.ts` — export test timeout
- **Build:** Passes (all pages compile)
- **Playwright smoke:** webServer timeout in worktree (expected)
- **Branch:** `feature/post-ralph-e2e` on worktree `.worktrees/post-ralph-e2e`

---

## BMAD Code Reviews

### Epic 2: Auth & IAM

| Severity | Issue | File(s) | Lines |
|----------|-------|---------|-------|
| **Critical** | `/api/jira/sprint-issues` has NO authentication check — unauthenticated access to sprint data | `src/app/api/jira/sprint-issues/route.ts` | 9-76 |
| **Critical** | `VERCEL_URL` fallback missing `https://` scheme — webhook auto-registration silently fails | `src/app/api/cron/refresh-webhooks/route.ts` | 61, 72 |
| **Major** | IDOR in `getUserWidgets` — accepts arbitrary userId, any authenticated user can read others' widgets | `src/modules/dashboard/actions/manage-widgets.ts` | 100-117 |
| **Major** | Admin client (`createAdminClient`) used in widget reads bypasses RLS — three-layer RBAC broken | `sprint-progress-widget.tsx`, `pr-status-widget.tsx`, `cicd-status-widget.tsx` | various |
| **Major** | `createAdminClient()` falls back to `NEXT_PUBLIC_SUPABASE_URL` — misleading for service-role client | `src/lib/supabase/admin.ts` | 13 |
| **Major** | Middleware RBAC is exact equality — admins cannot access developer/QA/stakeholder routes (may be intentional) | `src/middleware.ts` | 70-73 |
| **Minor** | `@ts-expect-error` on `request.auth` — type safety bypass for Auth.js v5 middleware | `src/middleware.ts` | 51 |
| **Minor** | Discarded `createClient()` return value — non-obvious side-effect pattern | `src/middleware.ts` | 44 |
| **Minor** | Cron secret comparison uses plain string equality, not timing-safe | `src/app/api/cron/refresh-webhooks/route.ts` | 49 |

### Epic 4: Jira Integration

| Severity | Issue | File(s) | Lines |
|----------|-------|---------|-------|
| **Critical** | HMAC validation is conditional — skipped when `JIRA_WEBHOOK_SECRET` not set. Endpoint completely open. | `src/app/api/webhooks/jira/route.ts` | 134-135 |
| **Critical** | Event ID dedup uses `eventType:issueKey` — NOT globally unique. Second update to same issue silently dropped. | `src/app/api/webhooks/jira/route.ts` | 119-123, 162-185 |
| **Major** | Deleted Jira issues never removed from DB — persist indefinitely | `src/app/api/webhooks/jira/route.ts` | 281-333 |
| **Major** | Sprint events (`sprint_created/updated/started/closed`) never handled — sprint data permanently stale | `src/app/api/webhooks/jira/route.ts` | (absent) |
| **Major** | `retryWithBackoff` off-by-one: 4 attempts instead of documented 3 | `src/app/api/webhooks/jira/route.ts` | 15, 21-38, 344 |
| **Major** | `webhook_events` insert failure doesn't fail-fast — breaks idempotency | `src/app/api/webhooks/jira/route.ts` | 188-205, 336-343 |
| **Major** | JQL injection via direct `projectKey` interpolation | `src/lib/clients/jira-client.ts` | 153-158 |
| **Major** | Staleness indicator inverted comparison — always shows oldest sync time | `sprint-progress-widget.tsx` | 84 |
| **Major** | N+1 Supabase queries (up to 13 per render) in sprint progress widget | `sprint-progress-widget.tsx` | 42-101 |
| **Minor** | Out-of-order check doesn't validate date strings — NaN silently disables guard | `src/app/api/webhooks/jira/route.ts` | 251-254 |
| **Minor** | `withRetry` doesn't retry network errors (only HTTP 429) | `src/lib/clients/jira-client.ts` | 11-27 |
| **Minor** | `createClient()` called inside every function — no singleton caching | `src/lib/clients/jira-client.ts` | 53, 86, 103 |

### Epic 5: GitHub Integration

| Severity | Issue | File(s) | Lines |
|----------|-------|---------|-------|
| **Critical** | HMAC validation conditional — skipped without `GITHUB_WEBHOOK_SECRET` | `src/app/api/webhooks/github/route.ts` | 89-111 |
| **Critical** | `workflow_run` events validated but NEVER written to DB — CI/CD widget permanently empty | `src/app/api/webhooks/github/route.ts` | 276-292 |
| **Critical** | `push` events validated but NEVER written to DB — commit activity chart empty | `src/app/api/webhooks/github/route.ts` | 259-275 |
| **Major** | PRs from unregistered repos silently dropped (no dead-letter, no log) | `src/app/api/webhooks/github/route.ts` | 220-258 |
| **Major** | Dedup query error silently ignored — `existing` becomes `undefined`, event reprocessed | `src/app/api/webhooks/github/route.ts` | 128-134 |
| **Major** | `revalidateTag` missing for push events | `src/app/api/webhooks/github/route.ts` | 330-335 |
| **Major** | `review_status` and `ci_status` fields NEVER written — always show "Pending" | `github/route.ts` + `pr-status-card.tsx` | 52-70 |
| **Major** | PR widget uses admin client bypassing RLS — stakeholder-restricted data in RSC payload | `pr-status-widget.tsx` | 45, 89-90 |
| **Major** | Module-level `rateLimitRemaining` unreliable in serverless (cold start = null) | `src/lib/clients/github-client.ts` | 9, 57-59 |
| **Major** | `withRetry` wraps all non-429 errors in `IntegrationError` — loses original type/stack | `src/lib/clients/github-client.ts` | 53 |
| **Minor** | Sprint detail view fetches from unauthenticated `/api/jira/sprint-issues` endpoint | `sprint-detail-view.tsx` | 58-75 |
| **Minor** | Sprint detail view silently catches all fetch errors — shows "No issues found" | `sprint-detail-view.tsx` | 67-70 |

### Epic 1: Foundation

| Severity | Issue | File(s) | Lines |
|----------|-------|---------|-------|
| **Minor** | CSS spacing token `--spacing-sidebar-width-collapsed` name mismatch | `globals.css` | various |
| **Minor** | Missing JetBrains Mono import for code blocks | `globals.css` | N/A |
| **Minor** | `LogSource` type missing `'cron'` and `'reports'` values | `src/lib/logger.ts` | N/A |
| **Minor** | `system_health` metadata typed as `Record<string, unknown>` not Supabase `Json` | types | N/A |

### Epic 3: Dashboard Shell

| Severity | Issue | File(s) | Lines |
|----------|-------|---------|-------|
| **Major** | Sidebar "Dashboard" link hardcoded to `/dev` — wrong for non-developer roles | `app-sidebar.tsx` | 26-34 |
| **Major** | Admin keyboard shortcuts (`g+u`, `g+i`, `g+s`) accessible to ALL roles | `page-header.tsx` | 112-124 |
| **Minor** | `'system-health'` widget type missing from `resolveWidget` switch — falls through to placeholder | `widget-grid.tsx` | 30-43 |
| **Minor** | AI widget card context menu has no click-outside or Escape handler | `ai-widget-card.tsx` | 22-38 |
| **Nit** | `useRelativeTime` hook duplicated in page-header instead of shared import | `page-header.tsx` | 28-51 |
| **Nit** | User menu "My Dashboard" uses `<a>` instead of Next.js `<Link>` | `page-header.tsx` | 315 |

### Epic 6: AI Assistant

| Severity | Issue | File(s) | Lines |
|----------|-------|---------|-------|
| **Critical** | CopilotKit runtime has NO tools/agents connected — Mastra agents are dead code | `src/app/api/ai/copilotkit/route.ts` | 47-61 |
| **Critical** | `userRole` extracted but NEVER used — all users get identical AI responses | `src/app/api/ai/copilotkit/route.ts` | 37-44 |
| **Major** | `generateWidget` action handler returns static string — may not call `saveWidget` | `use-copilot-actions.tsx` | 134-136 |
| **Minor** | Duplicate `getSupabaseAdmin()` helper across 3 Mastra tool files | `jira-tools.ts`, `supabase-tools.ts`, `github-tools.ts` | 34-38 |
| **Minor** | AI cost estimation uses blended rate — ignores input/output pricing difference | `model-routing.ts` | 36-39 |
| **Minor** | AI widget render callback uses type assertion without Zod validation | `use-copilot-actions.tsx` | 113-132 |

### Epic 7: AI Reports

| Severity | Issue | File(s) | Lines |
|----------|-------|---------|-------|
| **Major** | AI widget renderer ALWAYS shows static sample data (`42`, `Sample metric`) — never fetches real data | `ai-widget-renderer.tsx` | 148-159, 297-354 |
| **Major** | IDOR in `getUserWidgets` (duplicate of Epic 2 finding) | `manage-widgets.ts` | 100-117 |
| **Minor** | Report generation `catch {}` swallows error entirely — no logging | `generate-report.ts` | 46-48 |
| **Minor** | `deleteWidget`/`regenerateWidget` use admin client for user-scoped operations | `manage-widgets.ts` | 31, 67 |

### Epic 8: Admin & Observability

| Severity | Issue | File(s) | Lines |
|----------|-------|---------|-------|
| **Critical** | `Math.random()` for password generation — not cryptographically secure | `manage-users.ts` | 88 |
| **Critical** | `saveCredentials` silently discards input — admin UI appears functional but is non-operative | `configure-integration.ts` | 329-377 |
| **Major** | Orphaned auth users when `createUser` fails after auth creation — no cleanup | `manage-users.ts` | 86-115 |
| **Major** | `deactivateUser` doesn't revoke JWT sessions — access persists up to 24hrs | `manage-users.ts` | 188-203 |
| **Minor** | `bulkRetryDeadLetterEvents` runs `requireAuth` on every iteration (up to 50x) | `retry-dead-letter.ts` | 576-582 |
| **Minor** | Dead letter retry skips Zod validation that normal pipeline performs | `retry-dead-letter.ts` | 357-420 |
| **Minor** | Notification real-time updates only broadcast to `dashboard:admin` channel | `notification-dropdown.tsx` + `send-notification.ts` | 68-84, 100 |
| **Minor** | Budget alert notification type strings inconsistent (`budget_alert` vs `ai_budget`) | `ai-cost-tracker.ts` + `record-usage.ts` | 255, 91 |
| **Minor** | `getNotifications` uses admin client for user-scoped reads unnecessarily | `manage-notifications.ts` | 52 |
| **Minor** | `recordAiUsage` creates new Supabase client on every call instead of using `createAdminClient` | `record-usage.ts` | 27 |

---

## Summary

| Severity | Count |
|----------|-------|
| **Critical** | 11 |
| **Major** | 24 |
| **Minor** | 27 |
| **Nit** | 8+ |

### Top Priority Fixes (Critical)
1. Webhook HMAC validation must be mandatory (Jira + GitHub)
2. Jira event dedup must use truly unique IDs (include timestamp)
3. GitHub `workflow_run` and `push` handlers must write to DB
4. `/api/jira/sprint-issues` needs authentication
5. `VERCEL_URL` fallback needs `https://` prefix
6. CopilotKit runtime must connect Mastra agents
7. `userRole` must be used in AI route for role-specific responses
8. `Math.random()` must be replaced with `crypto.randomBytes` for passwords
9. `saveCredentials` must either persist or return explicit error
10. IDOR in `getUserWidgets` must enforce ownership server-side

## E2E Test Results
_Pending — auth setup required_

---
*Updated 2026-02-19 22:00*
