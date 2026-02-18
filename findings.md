# Findings: System-Level Test Design — CurryDash Central Hub

## Testability Assessment

### Controllability — PASS
- Supabase RLS + Auth.js v5 JWT claims enable fine-grained role control in tests
- Webhook pipeline has clear entry points (POST endpoints) for test injection
- Config-driven widget registry allows selective component testing
- AI stack has explicit graceful degradation paths (testable failure modes)

### Observability — PASS (with concerns)
- Structured logging (`{ message, correlationId, source, data }`) enables assertion on log output
- Realtime channels (`dashboard:{role}`) are observable via Supabase client subscriptions
- **Concern:** No explicit metrics/telemetry layer beyond logging — monitoring assertions will need custom helpers
- **Concern:** AI token budget tracking (request/session/monthly) needs test instrumentation

### Reliability — PASS
- Per-widget ErrorBoundary isolation prevents cascade failures
- Dead letter queue captures webhook failures for test verification
- Correlation IDs flow through entire pipeline — enables end-to-end trace assertions
- ISR + revalidateTag pattern provides deterministic cache invalidation for tests

## High-Priority ASRs (Score >= 6)

### ASR-1: Three-Layer RBAC Consistency (Score: 6 = P2 × I3)
- **Risk:** Edge middleware, Server Components, and Supabase RLS must all agree on role enforcement
- **Mitigation:** E2E auth matrix tests — every role × every route × every RLS policy
- **Test Level:** Integration (middleware + server) + E2E (full stack)

### ASR-2: AI Graceful Degradation (Score: 6 = P2 × I3)
- **Risk:** AI service unavailability must never crash the dashboard
- **Mitigation:** Mock AI responses, test `<AiStatus />` indicator, verify dashboard functions without AI
- **Test Level:** Integration (component isolation) + E2E (full flow)

## Test Levels Strategy
| Level | Ratio | Focus |
|-------|-------|-------|
| Unit | 40% | Zod schemas, utility functions, Zustand stores, error classes |
| Integration | 30% | Supabase queries, webhook pipeline, auth middleware, AI tools |
| E2E | 30% | Role-based flows, dashboard rendering, real-time updates, cross-cutting |

## Key Architectural Patterns Affecting Testing
1. **Webhook pipeline** (HMAC → dedup → Zod → upsert → revalidateTag → Realtime) — needs end-to-end pipeline tests
2. **Config-driven widgets** — registry-based testing, widget isolation via ErrorBoundary
3. **Server/Client component split** — Server components need Supabase mock, Client components need browser environment
4. **Four Supabase client variants** — each needs appropriate test context (browser, server, middleware, admin)
5. **MCP precedence chain** (live → cache → citation) — needs timeout simulation tests

## Hook File CRLF Issue
- All three `.claude/hooks/*.sh` files had Windows CRLF line endings
- Caused "syntax error: unexpected end of file" on WSL bash execution
- Fixed with `sed -i 's/\r$//'` on all three files
- Root cause: files created/edited on Windows side of WSL

---
*Updated 2026-02-18 — System-Level testability review complete*
