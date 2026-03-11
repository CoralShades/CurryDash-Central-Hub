# Ticket Cluster Analysis — 12 Cross-Project Clusters

> **Date**: 2026-03-11 | **Source**: Full 4-project audit (490 tickets)
> **Read with**: `BOARD-AUDIT-2026-03-11.md` for full ticket details

---

## Cluster 1: Cart Validation Chain (CRITICAL)

**Tickets**: 7 | **Projects**: CAD, CAR, PACK | **Status**: In Progress
**Architecture**: Hybrid — Backend flags + API checkout validation + Client notification
**Owners**: Ramesh (Laravel backend), Ruchiran (Flutter mobile)

```
CAD-149 (In Progress, Ramesh) — Backend: flag inactive, validate checkout
  ├── CAD-205 (DevTested, Ruchiran) — Admin portal package validation ✅
  ├── CAR-205 (To Do, Unassigned) — Inactive food items [DUPLICATE of CAR-146 — CLOSE]
  ├── PACK-223 (linked) — Mobile: inactive package still orderable
  ├── PACK-222 (To Do, Unassigned) — ISE when cart item deleted from menu
  ├── PACK-226 (To Do, Unassigned) — Editing config creates duplicate cart item
  └── PACK-216 (To Do, Unassigned) — Cart not cleared on suspended restaurant [blocked by CAD-177]
```

**Key dependency**: CAD-149 must finish before PACK-222/226 can be fixed.
**Previous decisions**: Hybrid architecture (Option C) decided by Demi. Comments posted on all 3 chain tickets (#16336-16338).

---

## Cluster 2: Draft Status Workflow

**Tickets**: 4 | **Projects**: CAD, CAR | **Status**: Partially done

```
CAD-180 (DevTested) — Draft for Packages (admin) ✅
  └── CAR-169 (To Do, Ramesh) — Draft for Packages (seller UI) — BLOCKED until CAD-180 QA pass
CAR-170 (In Progress, Ramesh) — Draft for Food Items (seller backend)
  └── CAD-181 (To Do, Ramesh) — Draft for Food Items (admin UI) — BLOCKED until CAR-170 done
```

**Key dependency**: CAR-170 → CAD-181 is the active chain. CAD-180 → CAR-169 is ready.
**Contradiction**: CAD-148 (Hide/Archive) may be obsolete now. Decision needed.

---

## Cluster 3: ABN (Australian Business Number)

**Tickets**: 4 active + 2 completed | **Projects**: CAD, CAR

```
COMPLETED:
  CAD-142 (SIT) — ABN field introduced for restaurants ✅
  CAD-182/CAR-172 (DevTested) — TIN→TFN relabel ✅

ACTIVE (chain order):
  1. CAR-201 (To Do, Ramesh) — Bug: ABN not mandatory [QUICK FIX FIRST]
  2. CAR-148 (To Do, Ramesh) — ABN validation for vendor CRUD
  3. CAD-215 (To Do, Ramesh) — ABN Approval Queue + Name Sync (subtask of CAD-98)
  4. CAR-144 (To Do, Ramesh) — Display ABN in vendor portal [depends on CAR-148]
```

**Recommended order**: CAR-201 (quick fix) → CAR-148 (validation) → CAD-215 (approval queue) → CAR-144 (display)

---

## Cluster 4: Notification System (LARGEST — 16 tickets)

**Tickets**: 16 | **Projects**: CAD, CAR, PACK, CUR | **Status**: 7 bugs, 2 infrastructure, 7 new platform

### Current Platform Bugs (fix first)
| Key | Project | Summary | Assignee | Notes |
|-----|---------|---------|----------|-------|
| CAR-207 | CAR | Notification before order placed | Ramesh | In Progress |
| CAD-222 | CAD | OTP + registration emails simultaneous | Ramesh | Related to PACK-205 |
| CAD-221 | CAD | Vendor not receiving cancel notification | Ramesh | — |
| CAD-206 | CAD | No email on admin password change | Ruchiran | Assigned last session |
| CAR-202 | CAR | Verification email wrong link/username | Unassigned | Related to CUR-138 |
| PACK-205 | PACK | Signup "Failed to send mail" | Ramesh | Same flow as CAD-222 |
| PACK-199 | PACK | Wrong text for "Ready for Handover" | Unassigned | Related to CAR-194 |

### Infrastructure
| Key | Summary | Assignee |
|-----|---------|----------|
| CAD-183 | Admin Global Notification Panel | Ramesh |
| CAD-195 | Comprehensive Notification System (umbrella) | Ramesh |

### New Platform (CUR — defer)
| Key | Summary |
|-----|---------|
| CUR-134..139 | 6 notification stories (Ramesh) |
| CUR-152 | Firebase Push Integration (Ramesh) |

**Key insight**: 7 bugs across 3 projects = fragile notification infrastructure. Fix bugs first. Build CAD-195 umbrella second. CUR notifications third.

---

## Cluster 5: Audit Log & History

**Tickets**: 4 | **Projects**: CAD, CAR

```
CAD-212 (To Do, Ramesh) — Audit Log Backend [BUILD FIRST — HasAuditLog trait]
  ├── CAD-213 (To Do, Ramesh) — Audit Log Admin UI
  ├── CAR-147 (To Do, Ramesh) — Vendor panel audit logs
  └── CAD-119 (To Do, Kasun) — Story 6.7: Comprehensive Audit Trail
```

**Strategy**: Build `HasAuditLog` Laravel trait in CAD-212, then apply everywhere.

---

## Cluster 6: Vendor Management (17 subtasks — already created)

**Tickets**: 17 subtasks | **Projects**: CAD, CAR | **Confluence**: Published
**Priority order**: CAR-156 → CAD-97 → CAD-98 → CAD-101

### CAR-156: Holiday Hours (5 subtasks)
CAR-208 (DB & Models) → CAR-209 (Admin) → CAR-210 (Vendor Exceptions) → CAR-211 (API) → CAR-212 (Flutter)

### CAD-97: Application Approval (4 subtasks) — parent in SIT
CAD-208 (Backend) → CAD-209 (UI) → CAD-210 (Email Templates) → CAD-211 (Privacy CMS)

### CAD-98: Vendor Profiles (4 subtasks) — parent In Progress
CAD-212 (Audit Backend) → CAD-213 (Audit UI) → CAD-214 (Multi-Location) → CAD-215 (ABN Queue)

### CAD-101: Performance Metrics (4 subtasks)
CAD-216 (Service) → CAD-217 (Controller) → CAD-218 (Tab UI) → CAD-219 (Benchmarks)

---

## Cluster 7: Package Management Backend

**Tickets**: 6 | **Projects**: CAR, PACK

```
CAR-28 (To Do, Ramesh) — PKG-001: Database Schema Enhancement
  └── CAR-29 (To Do, Ramesh) — PKG-002: Backend Logic
      └── CAR-30 (To Do, Ramesh) — PKG-003a: Vendor Package UI
CAR-146 (To Do, Ramesh) — Removing food items from packages
PACK-146 (To Do, Unassigned) — Vendor Package Config Backend [depends on CAR-28/29]
PACK-190 (To Do, Unassigned) — Replace Cuisines with Packages [depends on CAR-28/29/30]
```

---

## Cluster 8: Order Management & Status

**Tickets**: 8 | **Projects**: CAD, CAR, PACK, CUR

| Key | Status | Summary | Notes |
|-----|--------|---------|-------|
| CAR-207 | In Progress | Notification before order placed | Ramesh |
| CAR-198 | To Do | Order status "Placed" before payment | **Blocks PACK-106 + CAR-200** |
| CAR-179 | In Progress | Date range filter | Ramesh — quick fix |
| CAD-220 | To Do | Incomplete Order Timeline | Enhancement following CAD-15 |
| CAD-203 | To Do | Customer Name Search | Backend query fix |
| CAR-194 | To Do | Incorrect order status colors | Kasun |
| PACK-210 | To Do | Track Order + delivery time | Mobile |
| CUR-149 | To Do | Order Management API | Ruchiran — new platform |

**Key insight**: CAR-207 and CAR-198 may share root cause (premature status triggers). CAR-198 blocks 2 QA testing tasks.

---

## Cluster 9: Employee & Permission System

**Tickets**: 7 | **Projects**: CAD, CAR

```
CAR-178 (In Progress, Ramesh) — Employees cannot log in [BLOCKER]
CAD-202 (In Progress, Ramesh) — Package Module Permission [blocks CAD-114]
  ├── CAD-200 (To Do, Unassigned) — Package Section Not Accessible [SAME ROOT CAUSE]
  └── CAD-179 (To Do, Ramesh) — Employee Permission: Packages [DUPLICATE of CAD-202]
CAD-207 (To Do, Ramesh) — User Role Not Displayed
CAD-2 (To Do, Ramesh) — User Access Control & Role Management
CAD-204 (To Do, parked) — Deactivate/Reactivate Admin
```

---

## Cluster 10: Payment / Stripe (NEW)

**Tickets**: 3 + 5 subtasks | **Projects**: PACK, CUR

```
PACK-105 (To Do, Unassigned) — Stripe SDK integration (Flutter)
CUR-151 (To Do, Ramesh) — Stripe Payment Integration (new platform API)
CUR-122 (To Do, Santhuka) — Stripe Admin Dashboard
  ├── CUR-128 — Transaction Monitor
  ├── CUR-129 — Refund Manager
  ├── CUR-130 — Payment Analytics
  ├── CUR-131 — Dispute Center
  └── CUR-132 — Subscription Billing Monitor
```

**Key insight**: 3 Stripe tickets across 3 projects. Need coordinated implementation — shared Stripe config, test keys, webhook endpoints.

---

## Cluster 11: Checkout Flow (NEW)

**Tickets**: 3 | **Projects**: PACK, CUR

```
PACK-224 (To Do, Unassigned) — Cannot navigate back from payment page
PACK-184 (To Do, Ruchiran) — Address/time not retained at checkout
CUR-148 (To Do, Ramesh) — Cart & Checkout API (new platform)
```

**Key insight**: Current checkout bugs should inform CUR-148 API design.

---

## Cluster 12: Schedule & Delivery (NEW)

**Tickets**: 4 | **Projects**: CAD (done), CAR, PACK

```
CAD-68 (DevTested) — Override Restaurant Delivery Days ✅
CAR-156 (To Do, Ramesh) — Holiday Hours (5 subtasks already created)
CAR-96 (To Do, Ramesh) — Global Delivery Date Setting [may reuse CAD-68]
PACK-200 (To Do, Unassigned) — Filter by delivery availability [depends on CAR-96]
```
