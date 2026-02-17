# Integration Patterns

## AI Stack
- **AI is an enhancement layer** — dashboard, nav, data, charts all work without AI
- **CopilotKit frontend** in `src/modules/ai/` — **Mastra backend** in `src/mastra/`
- Model routing: Haiku for simple queries, Sonnet for reports + complex multi-tool
- Token cap: `maxTokens: 4000` on every AI SDK completion call
- MCP precedence: live query (5s timeout) → Supabase cache → include source in citation
- Tool errors: Mastra tools return `{ data, error }`. On failure, agent says "I couldn't retrieve that data"
- AI unavailable: show `<AiStatus />` indicator, never crash the dashboard

## Webhook Pipeline (Jira + GitHub)
Every webhook follows this exact sequence:
```
POST → HMAC-SHA256 validate → Event ID dedup → Zod parse →
Supabase upsert → revalidateTag() → Realtime broadcast → 200 OK
```
- Failures → write to `dead_letter_events` with raw payload + error
- Correlation ID generated per event, flows through entire pipeline
- NEVER read Jira/GitHub APIs on page load — always from Supabase cache

## Structured Logging
- Format: `{ message, correlationId, source, data }`
- Sources: `webhook:jira`, `webhook:github`, `auth`, `ai`, `realtime`, `admin`
- Levels: `debug` (dev), `info` (ops), `warn` (degraded), `error` (failures)

## Testing
- Co-locate unit tests: `jira-client.test.ts` beside `jira-client.ts`
- E2E in top-level `e2e/` — `e2e/auth.spec.ts`, `e2e/dashboard.spec.ts`
- Mocks in `src/test-utils/mocks/`, factories in `src/test-utils/factories/`
