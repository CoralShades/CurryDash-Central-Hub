# Master Review Summary — 5 QA Tickets

> Generated: 2026-03-06 | Reviewed by: Adversarial Review + Edge Case Hunting + Readiness Check
> Individual reviews: [CAR-203](./CAR-203-review.md) | [CAR-204](./CAR-204-review.md) | [CAR-205](./CAR-205-review.md) | [CAD-147](./CAD-147-review.md) | [CAR-206](./CAR-206-review.md)

---

## Executive Verdict

| Ticket | Verdict | Critical Issues | High Issues | Edge Cases |
|--------|---------|-----------------|-------------|------------|
| CAR-203 | **NOT READY** | 5 | 7 | 12+ |
| CAR-204 | **NOT READY** | 7 | 9 | 10+ |
| CAR-205 | **NOT READY** | 4 | 5 | 14 |
| CAD-147 | **NOT READY** | 6 | 8 | 30+ |
| CAR-206 | **NOT READY** | 17 | 12 | 23 |

**None of the 5 tickets are ready for implementation in their current state.**

---

## Top 10 Cross-Ticket Findings (Ranked by Impact)

### 1. DIRECT CONTRADICTION: CAD-147 vs CAD-149 (Severity: BLOCKER)
CAD-147 says "flag cart items as UNAVAILABLE and grey them out." CAD-149 (also Ramesh's, also In Progress) says "auto-remove items from carts." **These are mutually exclusive approaches.** Product owner must decide.

### 2. NO FOOD/ORDER DOMAIN TABLES EXIST (Severity: BLOCKER)
The CurryDash Central Hub codebase has zero food_items, packages, orders, carts, or payment tables. These exist in the separate Laravel CurryPackApp backend. **All 5 tickets may be targeting the wrong codebase**, or the schema migration strategy is completely unspecified.

### 3. SCOPE TRIPLED ON CAD-147 WITHOUT COMMUNICATION (Severity: CRITICAL)
CAD-147's description was rewritten on 3/3/2026 to add carts + order history. The ticket has been In Progress since before this change. Ramesh may have already built the original (simpler) scope. **Scope creep without assignee notification.**

### 4. CAR-205 IS A GHOST TICKET (Severity: CRITICAL)
CAR-205 has:
- Zero acceptance criteria
- Near-identical description to CAD-147 Section 1
- No clear scope boundary vs CAD-147
- Wrong issue type (Backend Task but reads like a dialog spec)
**Recommendation: Merge into CAD-147 or decompose properly.**

### 5. UNDEFINED DEPENDENCY CHAIN (Severity: CRITICAL)
No ticket documents blocking relationships. The correct implementation order is:
```
CAD-147 (backend: package unassign, cart flagging, order snapshots)
  → CAR-205 (seller-side warning dialog — IF kept separate)
    → CAR-203 (frontend: food item toggle UI)
      → CAR-204 (frontend: package toggle UI)
        → CAR-206 (standalone: auto-cancellation cron)
```
CAR-206 also depends on unimplemented tickets: CUR-149 (Order API), CUR-151 (Stripe), CUR-148 (Cart API), CUR-109 (ERD).

### 6. CAR-206 HAS NO PAYMENT INFRASTRUCTURE (Severity: CRITICAL)
The ticket requires Stripe refund API integration, but:
- Zero payment/refund code exists in src/
- CUR-151 (Stripe Integration) is still "To Do"
- No intermediate `refund_in_progress` state defined
- No idempotency keys for Stripe calls
- No audit trail for financial compliance

### 7. "CANCELD" TYPO RISK (Severity: HIGH)
CAR-206 contains "Canceld" (typo for "Cancelled") in the description. If a developer copies this value into an enum or status check, it will silently fail to match.

### 8. INCONSISTENT STATUS TERMINOLOGY (Severity: HIGH)
Across tickets:
- CAR-206 uses `Pending`, `Canceld`, `Vendor Unresponsive`, `Cancelled - Vendor Timeout`
- CAD-147 uses `Incomplete`, `Inactive`, `UNAVAILABLE`
- CUR-148 uses lowercase `pending`
- CUR-20 uses `Order Placed`
**No shared status enum is defined.**

### 9. CAR-203 & CAR-204 ARE NEAR-IDENTICAL (Severity: MEDIUM)
These tickets describe the same UI pattern (Active/Inactive tabs, remove delete button) for different entities (food items vs packages). **A shared component ticket should be created** to avoid duplicate frontend work.

### 10. RAMESH'S WORKLOAD (Severity: RISK)
Ramesh has **91 active tickets** across CAD + CUR with **8 simultaneously In Progress**. This is unsustainable and threatens quality on all assigned work, especially the complex CAD-147.

---

## Recommended Actions

### Immediate (Block Development)
1. **Resolve CAD-147 vs CAD-149 contradiction** — product owner decision needed
2. **Clarify target codebase** for all CAR tickets — Central Hub or Laravel backend?
3. **Add blocking relationships** in Jira: CAD-147 blocks CAR-205, CAR-205 blocks CAR-203, CAR-203 blocks CAR-204
4. **Decompose CAD-147** into 3-5 sub-tickets (Package Unassign, Cart Availability, Order Snapshots, Checkout Validation, E2E)
5. **Decide on CAR-205**: merge into CAD-147 or add acceptance criteria

### Before Development
6. **Define status enums** — create a shared vocabulary across all tickets
7. **Add acceptance criteria** to CAR-205 (currently zero)
8. **Create toggle API ticket** — no backend endpoint exists for the toggle action
9. **Add confirmation dialog spec** to CAR-203 and CAR-204
10. **Create shared UI component ticket** for Active/Inactive tab pattern

### For CAR-206 Specifically
11. **Block until CUR-149, CUR-151, CUR-148, CUR-109 are done** — no orders, payments, or carts exist
12. **Fix "Canceld" typo** in ticket description
13. **Define refund failure handling** — what happens when Stripe returns error?
14. **Add idempotency keys** requirement for payment operations
15. **Specify timezone handling** for the 24-hour rule

---

## Test Scenarios Identified (Summary)

| Ticket | Min Test Scenarios | Most Critical |
|--------|-------------------|---------------|
| CAR-203 | 15+ | Toggle while item is in cart; concurrent toggle during checkout |
| CAR-204 | 12+ | All food items deactivated cascade; subscription impact |
| CAR-205 | 14 | Partial failure atomicity; zero-item package state |
| CAD-147 | 30+ | Cart race condition; order snapshot migration; checkout blocking |
| CAR-206 | 17+ | Refund API failure; race with vendor acceptance; bulk cancellation storm |

**Total: 88+ test scenarios identified across all 5 tickets.**

---

## Files Generated

| File | Contents |
|------|----------|
| `docs/jira/reviews/CAR-203-review.md` | Full adversarial review |
| `docs/jira/reviews/CAR-204-review.md` | Full adversarial review |
| `docs/jira/reviews/CAR-205-review.md` | Full adversarial review |
| `docs/jira/reviews/CAD-147-review.md` | Full adversarial review |
| `docs/jira/reviews/CAR-206-review.md` | Full adversarial review |
| `docs/jira/reviews/MASTER-REVIEW-SUMMARY.md` | This file |
| `docs/jira/ramesh-mentions-and-requests.md` | Comment search results |
| `docs/jira/ramesh-comment-requests.md` | Detail-request comment analysis |
