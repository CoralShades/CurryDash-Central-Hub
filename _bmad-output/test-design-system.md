# System-Level Test Design — CurryDash Central Hub

> **Mode:** System-Level (Phase 3 — Solutioning Testability Review)
> **Generated:** 2026-02-18
> **Workflow:** `testarch/test-design` (auto-detected System-Level)
> **Status:** test-design = optional → COMPLETE

---

## 1. Executive Summary

This document assesses the testability of the CurryDash Central Hub architecture before implementation begins. The architecture is **testable with no blockers** and 6 manageable concerns. Two high-priority Architecturally Significant Requirements (ASRs) require dedicated test strategies: three-layer RBAC consistency and AI graceful degradation. The recommended test ratio is 40% Unit / 30% Integration / 30% E2E, reflecting the UI-heavy dashboard nature of the application.

**Key Finding:** The architecture's emphasis on config-driven widgets, structured logging with correlation IDs, and per-widget error isolation creates strong testability foundations. The main challenge is ensuring three-layer RBAC agreement (Edge Middleware + Server Components + Supabase RLS) across all four roles.

---

## 2. Testability Assessment

### 2.1 Controllability — PASS

| Aspect | Rating | Evidence |
|--------|--------|----------|
| Auth state control | Strong | Auth.js v5 JWT claims allow role injection in tests |
| Data seeding | Strong | Supabase admin client bypasses RLS for test setup |
| Webhook triggering | Strong | POST endpoints with HMAC validation — easy to simulate |
| AI state control | Moderate | CopilotKit + Mastra separation allows independent mocking |
| Widget configuration | Strong | Config-driven registry enables selective component testing |
| Realtime events | Moderate | Supabase Realtime channels are subscribable from test code |

**Assessment:** All major subsystems have clear entry points for test control. The four Supabase client variants (browser, server, middleware, admin) provide appropriate isolation levels for different test contexts.

### 2.2 Observability — PASS (with concerns)

| Aspect | Rating | Evidence |
|--------|--------|----------|
| Structured logging | Strong | `{ message, correlationId, source, data }` format |
| Correlation tracking | Strong | IDs flow through entire webhook pipeline |
| Error visibility | Strong | Dead letter queue captures failed webhooks with raw payload |
| Cache state | Moderate | ISR + revalidateTag provides deterministic invalidation |
| AI token tracking | Concern | Token budget enforcement (request/session/monthly) needs test instrumentation |
| Metrics/telemetry | Concern | No explicit metrics layer beyond structured logging |

**Concerns:**
1. AI token budget tracking at 3 levels (request, session, monthly) has no obvious test assertion surface — will need custom test helpers
2. No application-level metrics/telemetry layer defined — monitoring-related tests will need custom instrumentation

### 2.3 Reliability — PASS

| Aspect | Rating | Evidence |
|--------|--------|----------|
| Error isolation | Strong | Per-widget ErrorBoundary with `<WidgetError />` fallback |
| Failure capture | Strong | Dead letter queue with raw payload + error for forensics |
| Cache consistency | Strong | ISR + revalidateTag (never revalidatePath, never polling) |
| Graceful degradation | Strong | AI unavailable shows `<AiStatus />`, never crashes dashboard |
| State management | Strong | Zustand for UI only, JWT authoritative for RBAC — clear separation |

---

## 3. Architecturally Significant Requirements (ASRs)

### 3.1 Risk Scoring Matrix

| ID | ASR | Prob | Impact | Score | Priority |
|----|-----|------|--------|-------|----------|
| ASR-1 | Three-layer RBAC consistency | 2 | 3 | **6** | **HIGH** |
| ASR-2 | AI graceful degradation | 2 | 3 | **6** | **HIGH** |
| ASR-3 | Webhook pipeline idempotency | 2 | 2 | 4 | Medium |
| ASR-4 | Real-time data freshness (staleness badges) | 2 | 2 | 4 | Medium |
| ASR-5 | Token budget enforcement (3 levels) | 1 | 3 | 3 | Medium |
| ASR-6 | Widget error isolation (no cascade) | 1 | 3 | 3 | Medium |
| ASR-7 | MCP precedence chain (live → cache → citation) | 2 | 2 | 4 | Medium |
| ASR-8 | Webhook HMAC-SHA256 validation | 1 | 3 | 3 | Medium |
| ASR-9 | Supabase RLS policy correctness | 2 | 3 | **6** | **HIGH** |
| ASR-10 | ISR revalidation correctness | 1 | 2 | 2 | Low |
| ASR-11 | Responsive grid layout (3-col → 2-col) | 1 | 1 | 1 | Low |
| ASR-12 | WCAG 2.1 AA accessibility | 1 | 2 | 2 | Low |

### 3.2 High-Priority ASR Mitigation Strategies

#### ASR-1: Three-Layer RBAC Consistency (Score: 6)
- **Risk:** Edge Middleware, Server Components, and Supabase RLS must all enforce the same role-based access rules. Divergence between layers creates security holes.
- **Test Strategy:**
  - **Integration tests:** Middleware route gating per role (4 roles × all protected routes)
  - **Integration tests:** Server Component `auth()` helper validation per role
  - **Integration tests:** Supabase RLS policy tests per role per table
  - **E2E tests:** Full-stack auth matrix — login as each role, verify accessible/blocked routes
- **Coverage Target:** 100% of role × route × table combinations

#### ASR-2: AI Graceful Degradation (Score: 6)
- **Risk:** AI service unavailability must never crash the dashboard or degrade non-AI features.
- **Test Strategy:**
  - **Unit tests:** `<AiStatus />` component renders correct states
  - **Integration tests:** CopilotKit sidebar handles API timeout/error
  - **Integration tests:** Mastra tool error responses produce user-friendly messages
  - **E2E tests:** Dashboard fully functional with AI service mocked as unavailable
- **Coverage Target:** All AI-touching components tested with AI unavailable state

#### ASR-9: Supabase RLS Policy Correctness (Score: 6)
- **Risk:** RLS policies using `auth.jwt()->>'role'` could be misconfigured, exposing data across roles.
- **Test Strategy:**
  - **Integration tests:** Each table tested with all 4 role JWTs — verify SELECT/INSERT/UPDATE/DELETE permissions
  - **Integration tests:** Admin bypass via service role client confirmed working
  - **E2E tests:** Cross-role data isolation verified in dashboard views
- **Coverage Target:** 100% of RLS policies across all tables

---

## 4. Test Levels Strategy

### 4.1 Recommended Distribution

| Level | Ratio | Tool | Scope |
|-------|-------|------|-------|
| **Unit** | 40% | Vitest | Zod schemas, utility functions, Zustand stores, error classes, component rendering |
| **Integration** | 30% | Vitest + Supabase test helpers | Supabase queries, webhook pipeline stages, auth middleware, AI tool responses, RLS policies |
| **E2E** | 30% | Playwright | Role-based user journeys, dashboard rendering, real-time updates, cross-cutting flows |

### 4.2 Rationale
- **40% Unit** — High because: Zod schemas at every boundary, 4 error classes, config-driven widget registry, multiple Zustand stores
- **30% Integration** — Critical because: webhook pipeline has 6 stages, 4 Supabase client variants, 3-layer RBAC
- **30% E2E** — Elevated because: UI-heavy dashboard app, role-specific views, real-time updates, AI sidebar interaction

### 4.3 Anti-Patterns to Avoid
- Testing Supabase RLS only via unit tests (must use real Supabase connection)
- E2E tests for Zod schema validation (use unit tests)
- Mocking Supabase in integration tests that verify RLS (defeats purpose)
- Polling-based assertions for Realtime events (use subscription + waitFor)

---

## 5. NFR Testing Approach

### 5.1 Security (10 NFRs)
| What | Tool | Level |
|------|------|-------|
| RBAC enforcement (3-layer) | Playwright + Vitest | Integration + E2E |
| JWT claim validation | Vitest | Unit + Integration |
| HMAC-SHA256 webhook validation | Vitest | Integration |
| Supabase RLS policies | Vitest + Supabase | Integration |
| CSRF/XSS prevention | Playwright | E2E |
| Environment variable exposure | Vitest | Unit |

### 5.2 Performance (10 NFRs)
| What | Tool | Level |
|------|------|-------|
| Dashboard initial load < 3s | Playwright | E2E |
| Widget render time | Playwright | E2E |
| Webhook processing latency | Vitest | Integration |
| AI response time (with timeout) | Vitest | Integration |
| ISR cache hit rate | Vitest | Integration |
| Supabase query performance | Vitest + Supabase | Integration |

### 5.3 Reliability (7 NFRs)
| What | Tool | Level |
|------|------|-------|
| Widget error isolation | Playwright + Vitest | Integration + E2E |
| Dead letter queue capture | Vitest | Integration |
| AI unavailable fallback | Playwright | E2E |
| Webhook retry/dedup | Vitest | Integration |
| Realtime reconnection | Playwright | E2E |
| Correlation ID propagation | Vitest | Integration |

### 5.4 Maintainability (5 NFRs from Scalability category)
| What | Tool | Level |
|------|------|-------|
| Module boundary enforcement | CI lint rules | CI |
| Import alias consistency (`@/`) | ESLint | CI |
| Type coverage | `tsc --noEmit` | CI |
| Test co-location compliance | Custom lint | CI |
| Component naming conventions | ESLint | CI |

---

## 6. Test Environment Requirements

### 6.1 Local Development
- **Supabase Local:** `supabase start` for local PostgreSQL + Auth + Realtime
- **Test Database:** Separate Supabase project or schema for test isolation
- **Environment Variables:** `.env.test` with test-specific API keys and endpoints
- **AI Mocking:** Mastra tools return `{ data, error }` — mock at tool boundary

### 6.2 CI/CD
- **GitHub Actions** with Supabase CLI for database setup
- **Playwright** in headless mode with role-specific auth states
- **Parallel execution:** Tests must be parallel-safe (no shared mutable state)
- **Test data:** Factories in `src/test-utils/factories/`, mocks in `src/test-utils/mocks/`

### 6.3 Test Data Strategy
- **Factories:** Create test users per role, test projects, test issues
- **Seeding:** Use Supabase admin client (bypasses RLS) for test setup
- **Cleanup:** Transaction rollback or truncate after each test suite
- **Fixtures:** Playwright fixtures for authenticated browser contexts per role

---

## 7. Testability Concerns

### Assessment: No Blockers — 6 Manageable Concerns

| # | Concern | Severity | Mitigation |
|---|---------|----------|------------|
| 1 | AI token budget test instrumentation | Low | Create test helper that wraps AI SDK calls with token tracking |
| 2 | No metrics layer for monitoring tests | Low | Add lightweight telemetry wrapper in Sprint 0; defer if not blocking |
| 3 | Supabase Realtime test determinism | Medium | Use `waitForEvent` helper with configurable timeout; avoid time-based waits |
| 4 | MCP server test isolation | Medium | Mock MCP responses at Mastra tool boundary; test live MCP separately |
| 5 | Four Supabase client variant testing | Low | Create test utility that initializes correct client per test context |
| 6 | Webhook HMAC secret management in tests | Low | Use fixed test secrets in `.env.test`; never share with production |

---

## 8. Sprint 0 Recommendations

### 8.1 Test Framework Setup
- [ ] Initialize Vitest with Next.js 15 configuration
- [ ] Initialize Playwright with role-based auth fixtures
- [ ] Configure test path aliases (`@/` prefix)
- [ ] Set up `.env.test` with test-specific values

### 8.2 Test Infrastructure
- [ ] Create `src/test-utils/factories/` with user, project, issue factories
- [ ] Create `src/test-utils/mocks/` with Supabase, Mastra, webhook mocks
- [ ] Create Playwright fixtures for 4 role-authenticated browser states
- [ ] Set up Supabase local development instance for tests

### 8.3 CI Pipeline
- [ ] GitHub Actions workflow: lint → type-check → unit → integration → E2E
- [ ] Supabase CLI setup in CI for database provisioning
- [ ] Playwright report artifacts (HTML report + screenshots on failure)
- [ ] Test parallelization configuration

### 8.4 Quality Gates
- [ ] Define coverage thresholds per test level
- [ ] Set up PR checks requiring all test levels to pass
- [ ] Configure test timeout limits (unit <5s, integration <15s, E2E <30s)

### 8.5 Test Conventions
- [ ] Document test file co-location pattern (`.test.ts` beside source)
- [ ] Document E2E test location (`e2e/` top-level)
- [ ] Document assertion patterns (explicit, no magic numbers)
- [ ] Document test naming convention (`describe/it` with behavior descriptions)

### 8.6 Monitoring & Observability Testing
- [ ] Create structured log assertion helpers
- [ ] Create correlation ID verification utilities
- [ ] Create staleness badge test helpers (amber >10min, red >30min)

---

## 9. Test Coverage by Epic

| Epic | Title | Critical Test Areas | Primary Level |
|------|-------|-------------------|---------------|
| 1 | Project Foundation & Design System | Design tokens, responsive grid, CSS variables | Unit + E2E |
| 2 | Identity & Access Management | 3-layer RBAC matrix, JWT claims, session management | Integration + E2E |
| 3 | Dashboard Shell & Data Visualization | Widget registry, error boundaries, skeleton loading | Unit + E2E |
| 4 | Jira Integration & Live Sprint Data | Webhook pipeline, Zod parsing, dedup, dead letter | Integration |
| 5 | GitHub Integration & Repository Activity | Webhook pipeline, Realtime broadcast, Zod parsing | Integration |
| 6 | AI Assistant & Project Intelligence | CopilotKit sidebar, Mastra tools, graceful degradation | Integration + E2E |
| 7 | AI Reports & Widget Generation | Token budgets, report generation, widget CRUD | Integration + E2E |
| 8 | System Administration & Observability | Admin panels, user management, logging, metrics | Integration + E2E |

---

## 10. Quality Gate Criteria

### Phase Gate: Implementation Readiness
Before exiting Solutioning (Phase 3), the following test-related criteria must be met:
- [x] System-level testability review complete (this document)
- [ ] No testability blockers identified (**PASS** — 0 blockers)
- [ ] High-priority ASRs have defined mitigation strategies (**PASS** — 3 ASRs mitigated)
- [ ] Test levels strategy defined (**PASS** — 40/30/30 split)
- [ ] Sprint 0 test setup requirements documented (**PASS** — 6 categories)

### Implementation Quality Gates (per Epic)
- Unit test coverage ≥ 80% for business logic
- Integration test coverage ≥ 70% for Supabase/webhook/auth paths
- E2E tests cover all role-based user journeys
- No test > 1.5 minutes execution time
- All tests deterministic and parallel-safe

---

## 11. Follow-on Workflows

| Workflow | When | Purpose |
|----------|------|---------|
| `testarch-framework` | Sprint 0 | Scaffold Vitest + Playwright with fixtures and factories |
| `testarch-test-design` (Epic-Level) | Per epic in Phase 4 | Detailed test cases per epic with risk-adjusted coverage |
| `testarch-atdd` | Per story in Phase 4 | Red-green acceptance tests before implementation |
| `testarch-ci` | Sprint 0 | GitHub Actions quality pipeline setup |
| `testarch-nfr` | Before release | Deep NFR assessment (performance, security, reliability) |
| `testarch-trace` | Before release | Requirements-to-tests traceability matrix |

---

*Generated by BMAD TEA (Test Engineering Agent) — System-Level Mode*
*CurryDash-Central-Hub — Phase 3 Solutioning*
