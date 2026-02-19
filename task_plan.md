# Post-Ralph Review, E2E Testing & Validation — Task Plan

## Phase 0: Setup & Baseline
- [x] Create session files (task_plan.md, findings.md, progress.md)
- [x] Baseline: vitest run — 353/356 pass (3 flaky timeouts, pre-existing)
- [x] Baseline: npm run build — passes
- [x] Baseline: playwright smoke — webServer timeout in worktree (expected, fixing in config)

## Phase 1: Auth Setup (USER ACTION REQUIRED)
- [ ] GitHub OAuth App configured
- [ ] .env.local vars set (AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, NEXTAUTH_URL, NEXTAUTH_SECRET)
- [ ] Manual login verified at /login -> "Continue with GitHub"
- [ ] Supabase roles assigned (admin, developer, qa, stakeholder)
- [ ] Playwright storageState captured per role

## Phase 2: BMAD Code Reviews
- [ ] Epic 2: Auth & IAM (Critical)
- [ ] Epic 4: Jira Integration (Critical)
- [ ] Epic 5: GitHub Integration (Critical)
- [ ] Epic 1: Foundation (Batch)
- [ ] Epic 3: Dashboard Shell (Batch)
- [ ] Epic 6: AI Assistant (Batch)
- [ ] Epic 7: AI Reports (Batch)
- [ ] Epic 8: Admin & Observability (Batch)

## Phase 3: E2E Test Suite
- [ ] Update playwright.config.ts (multi-project)
- [ ] Create e2e/helpers.ts
- [ ] Create e2e/auth.setup.ts
- [ ] Create unauth-login.spec.ts (11 tests)
- [ ] Create admin-*.spec.ts (7 files)
- [ ] Create dev-*.spec.ts (2 files)
- [ ] Create qa-dashboard.spec.ts
- [ ] Create stakeholder-*.spec.ts (2 files)
- [ ] Delete smoke.spec.ts (absorbed)

## Phase 4: Test Execution & Verification
- [ ] Run full E2E suite
- [ ] Playwright MCP visual verification
- [ ] Fix failures

## Phase 5: Finalization
- [ ] Full regression (vitest + playwright + build + tsc)
- [ ] Commit & push
