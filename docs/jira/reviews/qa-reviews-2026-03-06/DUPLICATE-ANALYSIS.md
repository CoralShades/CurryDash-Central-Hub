# Cross-Project Duplicate & Overlap Analysis

> Generated: 2026-03-06 | Sources: Jira (all projects), PRD, Laravel Admin-Seller Portal codebase, Flutter User App codebase

---

## Executive Summary

Investigation across **5 Jira projects** (CAD, CAR, CUR, PACK, CCW), **2 codebases** (Laravel + Flutter), and the **PRD** reveals:

- **1 direct duplicate** of CAR-206 (CUR-156, broader scope, created 6 days earlier)
- **5 cross-project duplicate pairs** with no Jira links between them
- **3 active bugs** (PACK-222, PACK-223, PACK-203) proving CAD-149's fix is incomplete
- **1 major contradiction** — CAD-67 (DEVTESTED) implements hard delete for packages while CAR-204 wants to disable delete entirely
- **1 unlinked investigation** (CAD-199) covering the exact same ground as all 5 reviewed tickets
- **7 PRD gaps** — the PRD is silent on auto-cancellation, soft-delete, cart validation, order snapshots, and cascade behavior
- **Existing implementations** in Laravel: food item toggle with audit log, package 3-state status, order snapshot via `food_details` JSON
- **Existing implementations** in Flutter: cart unavailability UI (partial), order snapshots, Firebase notifications, scheduled orders

---

## 1. Direct Duplicate: CAR-206 = CUR-156

| Field | CAR-206 (Seller Dashboard) | CUR-156 (CurryDash) |
|-------|---------------------------|---------------------|
| Summary | Auto-Cancellation for Unaccepted Scheduled Orders (24-Hour Rule) | Auto-Cancellation and Refund Logic for Stale Orders |
| Status | To Do | To Do |
| Created | 2026-03-04 | 2026-02-26 (6 days earlier) |
| Scope | Scheduled orders only, 24h rule, cron job | ASAP orders (15-20 min TTL) AND scheduled orders, includes vendor nudging escalation |

**CUR-156 is the canonical ticket** — broader scope, created first. CAR-206 should be linked as duplicate or merged.

---

## 2. Cross-Project Duplicate Pairs (No Jira Links)

| Ticket A | Ticket B | What They Cover | Status Gap |
|----------|----------|----------------|------------|
| **CAD-147** (Admin, In Progress) | **CAR-146** (Seller, To Do) | Removing food items from packages on delete/deactivate | Admin side in progress, seller side not started, no link |
| **CAD-181** (Admin, To Do) | **CAR-170** (Seller, To Do) | Draft Status for Food Items — identical description | Neither started, not linked |
| **CAD-180** (Admin, DEVTESTED) | **CAR-169** (Seller, To Do) | Draft Status for Packages — identical description | Admin done, seller not started, not linked |
| **PACK-216** (Mobile, To Do) | **CCW-75** (Web, To Do) | Cart not cleared when restaurant suspended | Same bug, two projects, not linked |
| **PACK-77** (Mobile, Dev Tested) | **CCW-29** (Web, To Do) | Unavailable Package Visibility | Mobile done, web not started, not linked |

---

## 3. Active Bugs Proving Reviewed Tickets' Problems Are Real

| Bug | Project | Summary | Status | Proves |
|-----|---------|---------|--------|--------|
| **PACK-222** | Mobile | 500 error when cart item deleted from menu | To Do | CAD-149 fix is incomplete — ghost cart items cause server errors |
| **PACK-223** | Mobile | Inactive Package not removed from cart, order can still be placed | SIT | CAD-149 doesn't cover packages — only food items |
| **PACK-203** | Mobile | Unavailable food item visible via cuisine filter | SIT | CAR-205 scope is needed — current system doesn't filter consistently |

**CAD-149 is "In Progress"** but these bugs were filed on 2026-03-05 — the fix either hasn't deployed or doesn't cover these cases.

---

## 4. Contradiction: CAD-67 vs CAR-204/CAD-148

| Ticket | Approach | Status |
|--------|----------|--------|
| **CAD-67** | Permanent hard delete for packages (with confirmation modal) | **DEVTESTED** (code built) |
| **CAR-204** | Disable Delete action entirely, replace with Active/Inactive toggle | To Do |
| **CAD-148** | Replace Delete with Hide/Archive system | To Do ("DO NOT ACTION") |

CAD-67's implementation directly contradicts both CAR-204 and CAD-148. If CAR-204 proceeds, CAD-67's deletion feature needs to be rolled back or modified.

---

## 5. Unlinked Investigation: CAD-199

**CAD-199** ("Investigation: Technical Impact of Food Item Deletion") was created 2026-03-04, assigned to Vimukthi Ravindu, status To Do. It covers:
- Database cascade impacts
- Cart and checkout implications
- Analytics and reporting effects
- UI fallback strategies
- Search cache cleanup

This investigation covers the **exact same ground** as CAD-147, CAR-203, CAR-204, CAR-205, and CAD-149 combined — but is not linked to any of them. Work may proceed without the investigation's findings.

---

## 6. What Already Exists in Code

### Laravel Admin-Seller Portal

| Feature | Status | Details |
|---------|--------|---------|
| Food item availability toggle | **IMPLEMENTED** | Bulk toggle action in `FoodResource.php`, writes to `food_availability_logs` table |
| Food item hard delete | **IMPLEMENTED** | Cascades: deletes image, cart items, variations, translations, taxes |
| Package 3-state status | **IMPLEMENTED** | `status` column: 1=Active, 2=Draft, 0=Inactive |
| Package deletion protection | **IMPLEMENTED** | Blocks delete if orders exist, recommends deactivation |
| Order snapshot (`food_details`) | **IMPLEMENTED** | JSON snapshot of food data stored in `order_details` table |
| Cart availability validation | **NOT IMPLEMENTED** | No check if items are active before checkout |
| Soft deletes | **NOT IMPLEMENTED** | All entities use hard delete |
| Package snapshot in orders | **NOT IMPLEMENTED** | No JSON snapshot for package configuration data |

### Flutter User App

| Feature | Status | Details |
|---------|--------|---------|
| Cart unavailability UI | **PARTIAL** | `not_available_product_view_widget.dart` exists, offers user options but does NOT block checkout |
| Order status tracking | **IMPLEMENTED** | String-based statuses: pending, accepted, confirmed, processing, handover, pickedUp, delivered, canceled, refundRequested, refunded |
| Order item snapshots | **IMPLEMENTED** | Full item details preserved in order model |
| Firebase push notifications | **IMPLEMENTED** | FCM integrated with order status, message, and fund notification types |
| Scheduled orders | **IMPLEMENTED** | `scheduleAt` field + date/time picker UI |
| Subscription orders | **IMPLEMENTED** | Full recurring order setup with days/times |
| Stripe SDK | **NOT IMPLEMENTED** | Payment handled via backend InAppWebView (not native Stripe) |
| Refund UI | **IMPLEMENTED** | Refund request screen and models exist |

---

## 7. PRD Gaps (Silent on Critical Topics)

| Topic | PRD Says | Impact |
|-------|----------|--------|
| **Auto-cancellation** | No timeout/auto-cancel requirement exists | CAR-206 and CUR-156 are beyond PRD scope — need PO sign-off |
| **Soft-delete vs hard-delete** | Not specified for any entity | Source of all delete/deactivate confusion across tickets |
| **Cart validation** | FR165 says "validates the cart" but doesn't define what | No spec for blocking checkout when items are unavailable |
| **Order snapshots** | Not specified | No requirement to freeze item data at order time (but code already does it) |
| **Package cascade** | Not specified | No requirement for what happens to packages when food items are deleted |
| **Order status enum** | Statuses mentioned across FR33, FR141-F2, FR143 but never consolidated | No canonical list — "pending" and "cancelled" are not formally defined |
| **Refund SLA** | Not specified | "3-5 business days" in CAR-206 has no PRD backing |

---

## 8. Refund Pipeline Overlap

Refund logic is scattered across **4 tickets in 3 projects**:

| Ticket | Project | Scope | Status | Assignee |
|--------|---------|-------|--------|----------|
| **CUR-151** | CUR | Stripe Refund API (backend) | To Do | Ramesh |
| **CUR-129** | CUR | Refund Manager (central service) | To Do | Unassigned |
| **CAD-108** | CAD | Refunds & Credits Processing (admin UI) | **In Progress** | Kasun Mendis |
| **CAR-131** | CAR | Order Refunds (vendor UI) | To Do | Minuri |

**CAD-105** (Order Intervention, In Progress, Kasun) already includes "Cancel Order triggers automatic refund" — this is the same pipeline CAR-206/CUR-156 needs. Coordinate with Kasun.

---

## 9. Order Status State Machine Is Fragile

3 active bugs show the current order lifecycle has issues:

| Bug | Summary | Status |
|-----|---------|--------|
| **CAR-183** | Incorrect Order Status Color Coding | To Do |
| **CAR-194** | Order status incorrectly changes to Delivered | To Do |
| **CAR-198** | Order Status Set to "Placed" Before Payment Confirmation | To Do |

**CAR-127** (Order Status Workflow) should be completed before adding auto-cancellation states.

---

## 10. Recommended Actions

### Immediate (Link & Deduplicate)

1. **Link CAR-206 to CUR-156** as duplicate — CUR-156 is the canonical ticket
2. **Link CAD-147 to CAR-146** — same feature, admin vs seller side
3. **Link CAD-181/CAR-170 and CAD-180/CAR-169** — cross-project pairs
4. **Link PACK-222 and PACK-223 to CAD-149** — bugs proving the fix is incomplete
5. **Link CAD-199 to CAD-147, CAR-203, CAR-204, CAR-205** — investigation covers all of them
6. **Resolve CAD-67 vs CAR-204 contradiction** — can Admin hard-delete packages or not?

### Before Development

7. **Complete CAD-199 investigation first** — it should inform all implementation tickets
8. **Define the entity status model** — a single ticket defining how Draft, Active, Inactive, and Archive relate. Currently fragmented across 6+ tickets
9. **Add cart validation** — no ticket currently covers validating cart item availability at checkout time (CAD-149 removes ghost items but doesn't block checkout)
10. **Add order snapshot ticket** — no dedicated ticket ensures order history survives item deletion. The Laravel code already snapshots `food_details` but packages aren't covered

### For CAR-206 Specifically

11. **Close CAR-206 as duplicate of CUR-156** or merge implementation details
12. **Leverage CAD-105/CAD-108 refund logic** (In Progress, Kasun) — don't build a parallel refund pipeline
13. **Fix order status bugs first** (CAR-183, CAR-194, CAR-198) before adding cancellation states

---

## 11. Complete Ticket Cross-Reference Map

```
FOOD ITEM LIFECYCLE
  CAR-203 (toggle UI, To Do)
    ← overlaps → CAD-148 (hide/archive, DO NOT ACTION)
    ← depends → CAR-205 (cascade handling, To Do)
    ← related → CAR-122 (availability toggle, To Do)
    ← related → CAD-181/CAR-170 (Draft status, To Do)
    ← investigation → CAD-199 (deletion impact, To Do)

PACKAGE LIFECYCLE
  CAR-204 (toggle UI, To Do)
    ← CONTRADICTS → CAD-67 (hard delete, DEVTESTED)
    ← overlaps → CAD-148 (hide/archive, DO NOT ACTION)
    ← related → CAD-180/CAR-169 (Draft status, DEVTESTED/To Do)

INACTIVE FOOD ITEMS IN PACKAGES
  CAD-147 (admin backend, In Progress)
    ← DUPLICATE → CAR-146 (seller side, To Do)
    ← partial copy → CAR-205 (seller, To Do)
    ← CONTRADICTS → CAD-149 (auto-remove vs flag, In Progress)
    ← related → CAD-150 (cancel orders, DO NOT ACTION)
    ← bugs proving need → PACK-222, PACK-223, PACK-203

AUTO-CANCELLATION
  CAR-206 (scheduled orders, To Do)
    ← DUPLICATE → CUR-156 (broader scope, To Do)
    ← depends → CUR-149, CUR-151, CUR-148 (all To Do)
    ← refund overlap → CAD-105, CAD-108 (In Progress, Kasun)
    ← status bugs → CAR-183, CAR-194, CAR-198
```

---

## Files Referenced

| File | Contents |
|------|----------|
| `docs/jira/reviews/CAR-203-review.md` | Full adversarial review |
| `docs/jira/reviews/CAR-204-review.md` | Full adversarial review |
| `docs/jira/reviews/CAR-205-review.md` | Full adversarial review |
| `docs/jira/reviews/CAD-147-review.md` | Full adversarial review |
| `docs/jira/reviews/CAR-206-review.md` | Full adversarial review |
| `docs/jira/reviews/MASTER-REVIEW-SUMMARY.md` | Cross-ticket summary |
| `docs/jira/reviews/DUPLICATE-ANALYSIS.md` | This file |
| `docs/prd.md` | Project PRD (3300+ lines) |
