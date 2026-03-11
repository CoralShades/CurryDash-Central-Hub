# Findings: Full 4-Project Board Audit & Cross-Project Dependency Analysis

> **Date**: 2026-03-11 | **Scope**: CAD (Admin), CAR (Seller), PACK (Mobile), CUR (New Platform)
> **Data**: 100 active CAD + 100 active CAR + 100 active PACK + 100 active CUR + 45 completed CAD/CAR
> **Tracked developers**: Ramesh (Laravel/PHP/SQL), Ruchiran (Flutter/Firebase/GCP), Unassigned

---

## 1. Board Inventory Summary

| Project | Total Active | In Progress | DevTested/SIT/UAT | To Do | Epics |
|---------|-------------|-------------|-------------------|-------|-------|
| **CAD** (Admin) | 100 | 6 | 14 (DevTested) + 3 (SIT) | 77 | 12 |
| **CAR** (Seller) | 100 | 8 | 3 (DevTested) | 89 | 10 |
| **PACK** (Mobile) | 100 | 0 | 0 | 100 | 14 |
| **CUR** (Platform) | 100 | 1 | 2 (SIT) + 5 (UAT) | 92 | 12 |
| **Completed (CAD+CAR)** | 45 | — | — | — | — |

### By Developer (active To Do + In Progress, backend-relevant)

| Developer | CAD | CAR | PACK | CUR | Total |
|-----------|-----|-----|------|-----|-------|
| **Ramesh** | 29 | 26 | 1 | 36 | **92** |
| **Ruchiran** | 2 | 0 | 8 | 16 | **26** |
| **Kasun** | 22 | 4 | 2 | 0 | **28** |
| **Minuri** | 0 | 24 | 1 | 0 | **25** |
| **Unassigned** | 4 | 8 | 75 | 9 | **96** |

---

## 2. Confirmed Duplicates

| # | Ticket A | Ticket B | Evidence | Action |
|---|----------|----------|----------|--------|
| D1 | **CAR-206** (Auto-Cancellation) | **CUR-156** (Auto-Cancel + Refund) | Same scope, CUR-156 broader. Comment #16132 confirms. **No Jira link exists.** | Merge → CUR-156, close CAR-206 |
| D2 | **CAR-205** (Handling inactive food items) | **CAR-146** (Removing food items from packages) | Comment #16338 confirms overlap. CAR-205 is partial copy of CAD-147. | Merge → CAR-146, close CAR-205 |
| D3 | **CAD-202** (Package Module Permission) | **CAD-200** (Package Section Not Accessible) | Same root cause — Package not in permissions matrix. CAD-200 blocks CAD-66 (DevTested). | Link as related, fix together |
| D4 | **CAD-179** (Employee Permission: Packages) | **CAD-202** (Package Module Permission) | Both add Package to permissions. CAD-202 is In Progress, CAD-179 is To Do. | Merge → CAD-202, close CAD-179 |

### Near-Duplicates (shared backend work)

| # | Tickets | Overlap | Action |
|---|---------|---------|--------|
| N1 | **CAD-180** (Draft Packages, DevTested) ↔ **CAR-169** (Draft Packages, To Do) | Same backend. CAR-169 is seller UI on top. | CAR-169 depends on CAD-180. Link. |
| N2 | **CAD-182** (TIN→TFN, DevTested) ↔ **CAR-172** (TIN→TFN, DevTested) | Already linked. Both DevTested. | QA should test together. |
| N3 | **CAD-173** (CAPTCHA, DevTested) ↔ **CAR-149** (CAPTCHA, DevTested) | Already linked. Both DevTested. | QA should test together. |
| N4 | **CAD-68** (Delivery Days, DevTested) ↔ **CAR-96** (Global Delivery Date, To Do) | Admin override done, seller global setting pending. | CAR-96 may reuse CAD-68 backend. |
| N5 | **CAD-181** (Draft Food Items, To Do) ↔ **CAR-170** (Draft Food Items, In Progress) | Same feature: CAR-170 = backend, CAD-181 = admin UI. | CAD-181 blocked by CAR-170. |

### Contradictions

| # | Ticket A | Ticket B | Conflict |
|---|----------|----------|----------|
| C1 | **CAD-67** (Package Deletion, DevTested) | **CAR-204** (Disable Delete, To Do) | Delete was implemented. Now wants disabling. **Decision needed.** |
| C2 | **CAD-148** (Hide/Archive, parked) | Draft workflow (CAD-181/CAR-170) | Draft may supersede Hide/Archive. |

---

## 3. Ticket Clusters (12 identified)

### Cluster 1: Cart Validation Chain (CRITICAL — 7 tickets, 3 projects)
```
CAD-149 (In Progress, Ramesh) — Backend: flag inactive, validate checkout
  ├── CAD-205 (DevTested, Ruchiran) — Admin portal package validation
  ├── CAR-205 (To Do, Unassigned) — Inactive food items [DUPLICATE of CAR-146]
  ├── PACK-223 (linked) — Mobile: inactive package orderable
  ├── PACK-222 (To Do, Unassigned) — ISE when cart item deleted
  ├── PACK-226 (To Do, Unassigned) — Editing config creates duplicate cart item
  └── PACK-216 (To Do, Unassigned) — Cart not cleared on suspended restaurant
Architecture: Hybrid (backend flags + API checkout validation + client notification)
Owner: Ramesh (Laravel), Ruchiran (Flutter)
```

### Cluster 2: Draft Status Workflow (4 tickets, 2 projects)
```
CAD-180 (DevTested, Ramesh) — Draft for Packages (admin done)
  └── CAR-169 (To Do, Ramesh) — Draft for Packages (seller UI) [DEPENDS ON CAD-180]
CAR-170 (In Progress, Ramesh) — Draft for Food Items (seller backend)
  └── CAD-181 (To Do, Ramesh) — Draft for Food Items (admin UI) [DEPENDS ON CAR-170]
```

### Cluster 3: ABN (Australian Business Number) (4 tickets + 2 completed)
```
CAR-201 (To Do, Ramesh) — Bug: ABN not mandatory [FIX FIRST]
CAR-148 (To Do, Ramesh) — ABN validation logic
CAD-215 (To Do, Ramesh) — ABN Approval Queue + Name Sync (subtask of CAD-98)
CAR-144 (To Do, Ramesh) — Display ABN [DEPENDS ON CAR-148]
Completed: CAD-142 (SIT), CAD-182/CAR-172 (DevTested - TIN→TFN)
```

### Cluster 4: Notification System (16 tickets, 4 projects — LARGEST)
```
CURRENT PLATFORM BUGS:
  CAD-222 (To Do, Ramesh) — OTP + registration emails simultaneous
  CAD-221 (To Do, Ramesh) — Vendor not receiving cancel notification
  CAD-206 (To Do, Ruchiran) — No email on admin password change
  CAR-207 (In Progress, Ramesh) — Notification before order placed
  CAR-202 (To Do, Unassigned) — Verification email wrong link/username
  PACK-205 (To Do, Ramesh) — Signup "Failed to send mail"
  PACK-199 (To Do, Unassigned) — Wrong notification for "Ready for Handover"

INFRASTRUCTURE:
  CAD-183 (To Do, Ramesh) — Admin Global Notification Panel
  CAD-195 (To Do, Ramesh) — Comprehensive Notification System (umbrella)

NEW PLATFORM (CUR):
  CUR-134 (To Do, Ramesh) — Vendor New Order Notifications
  CUR-135 (To Do, Ramesh) — Order Status Change Notifications
  CUR-136 (To Do, Ramesh) — Customer Order Update Notifications
  CUR-137 (To Do, Ramesh) — Admin Performance Alerts
  CUR-138 (To Do, Ramesh) — Email Notifications
  CUR-139 (To Do, Ramesh) — SMS Notifications
  CUR-152 (To Do, Ramesh) — Firebase Push Notifications
```
**Key insight**: 7 bugs across 3 projects may indicate fragile notification infrastructure. Fix bugs before building CAD-195 umbrella.

### Cluster 5: Audit Log & History (4 tickets)
```
CAD-212 (To Do, Ramesh) — Audit Log Backend [BUILD FIRST — HasAuditLog trait]
CAD-213 (To Do, Ramesh) — Audit Log Admin UI [depends on CAD-212]
CAR-147 (To Do, Ramesh) — Vendor panel audit logs [depends on CAD-212]
CAD-119 (To Do, Kasun) — Story 6.7: Comprehensive Audit Trail [depends on CAD-212]
```

### Cluster 6: Vendor Management — 17 Subtasks (already created, Confluence published)
```
CAR-156 → CAR-208..212 (5 subtasks) — Holiday Hours [PRIORITY 1]
CAD-97 → CAD-208..211 (4 subtasks) — Application Approval [PRIORITY 2]
CAD-98 → CAD-212..215 (4 subtasks) — Vendor Profiles [PRIORITY 3]
CAD-101 → CAD-216..219 (4 subtasks) — Performance Metrics [PRIORITY 4]
```

### Cluster 7: Package Management Backend (6 tickets, 3 projects)
```
CAR-28 (To Do, Ramesh) — PKG-001: Database Schema Enhancement
CAR-29 (To Do, Ramesh) — PKG-002: Backend Logic [depends on CAR-28]
CAR-30 (To Do, Ramesh) — PKG-003a: Vendor Package UI [depends on CAR-29]
CAR-146 (To Do, Ramesh) — Removing food items from packages
PACK-146 (To Do, Unassigned) — Vendor Package Config Backend Support
PACK-190 (To Do, Unassigned) — Replace Cuisines with Packages [depends on CAR-28/29/30]
```

### Cluster 8: Order Management & Status (8 tickets, 4 projects)
```
CAR-207 (In Progress, Ramesh) — Notification before order placed
CAR-198 (To Do, Unassigned) — Order status "Placed" before payment
  ├── Blocks: PACK-106 (QA: Stripe test, In Progress)
  └── Blocks: CAR-200 (QA: Stripe test, In Progress)
CAR-206 / CUR-156 (To Do, Unassigned) — Auto-cancellation [DUPLICATE]
CAD-220 (To Do, Ramesh) — Incomplete Order Timeline
CAD-203 (To Do, Unassigned) — Customer Name Search not working
CAR-179 (In Progress, Ramesh) — Date range filter
PACK-210 (To Do, Unassigned) — Track Order button / delivery time
CUR-149 (To Do, Ruchiran) — Order Management API (new platform)
```
**Key insight**: CAR-207 and CAR-198 may share root cause (premature status/notification triggers). CAR-198 blocks 2 QA tasks.

### Cluster 9: Employee & Permission System (7 tickets)
```
CAR-178 (In Progress, Ramesh) — Employees cannot log in [BLOCKER]
CAD-202 (In Progress, Ramesh) — Package Module Permission [blocks CAD-114]
CAD-179 (To Do, Ramesh) — Employee Permission: Packages [DUPLICATE of CAD-202]
CAD-200 (To Do, Unassigned) — Package Section Not Accessible [same root cause as CAD-202]
CAD-207 (To Do, Ramesh) — User Role Not Displayed in Employee List
CAD-2 (To Do, Ramesh) — User Access Control & Role Management
CAD-204 (To Do, parked) — Deactivate/Reactivate Admin Accounts
```

### Cluster 10: Payment / Stripe (3 tickets, 3 projects — NEW)
```
PACK-105 (To Do, Unassigned) — Integrate Stripe SDK (Flutter)
CUR-151 (To Do, Ramesh) — Stripe Payment Integration (new platform)
CUR-122 (To Do, Santhuka) — Stripe Admin Dashboard
  ├── CUR-128 — Transaction Monitor
  ├── CUR-129 — Refund Manager
  ├── CUR-130 — Payment Analytics
  ├── CUR-131 — Dispute Center
  └── CUR-132 — Subscription Billing Monitor
```
**Key insight**: 3 Stripe tickets across 3 projects need coordinated implementation. CUR-122 has 5 subtasks.

### Cluster 11: Checkout Flow (3 tickets — NEW)
```
PACK-224 (To Do, Unassigned) — Cannot navigate back from payment page
PACK-184 (To Do, Ruchiran) — Address/time not retained at checkout
CUR-148 (To Do, Ramesh) — Cart & Checkout API (new platform)
```
**Key insight**: PACK-224 and PACK-184 are related checkout UX bugs. CUR-148 should incorporate lessons from these bugs.

### Cluster 12: Schedule & Delivery (3 tickets)
```
CAR-156 (To Do, Ramesh) — Holiday Hours / Specific Dates [5 subtasks]
CAR-96 (To Do, Ramesh) — Global Delivery Date Setting
CAD-68 (DevTested, Ramesh) — Override Restaurant Delivery Days [DONE]
PACK-200 (To Do, Unassigned) — Filter by delivery availability [depends on CAR-96]
```

---

## 4. Mobile (PACK) → Backend Dependencies

| PACK Ticket | Depends On | Backend Status | Notes |
|-------------|-----------|----------------|-------|
| PACK-223 | CAD-149 (cart validation) | In Progress | Architecture decided (Hybrid) |
| PACK-222 | CAD-149 (cart validation) | In Progress | ISE when item deleted |
| PACK-226 | Cart logic review | To Do | Orphaned — no links. Should link to PACK-198 |
| PACK-216 | CAD-177 (suspended restaurant) | Parked | Blocked |
| PACK-205 | CAD-222 (OTP/email bug) | To Do | Same registration flow |
| PACK-199 | Notification infrastructure | To Do | Related to CAR-207, CAR-194 |
| PACK-184 | Checkout API stability | To Do | Flutter-side, related to PACK-224 |
| PACK-178 | API error handling | To Do | Independent Flutter bug |
| PACK-200 | CAR-96 (Global Delivery Date) | To Do | Also depends on CAD-68 (done) |
| PACK-190 | CAR-28/29/30 (Package backend) | To Do | Replace Cuisines with Packages |
| PACK-146 | CAR-28/29 (Package schema + logic) | To Do | Backend support for package config |
| PACK-194 | Registration flow | To Do | May conflict with CAD-222 fix |
| PACK-105 | Payment infrastructure | To Do | Stripe SDK — coordinate with CUR-151 |
| PACK-210 | Order tracking API | To Do | Related to CUR-149, CAR-179 |

---

## 5. CUR (New Platform) → Current Platform Dependencies

| CUR Ticket | Relates To | Notes |
|------------|-----------|-------|
| CUR-156 | CAR-206 | **Duplicate** — merge into CUR-156 |
| CUR-148 (Cart & Checkout API) | CAD-149 | Current cart fix informs new API design |
| CUR-149 (Order Management API) | CAR-207, CAR-198 | Order status bugs inform new API |
| CUR-151 (Stripe Payment) | PACK-105, CUR-122 | 3 Stripe tickets across projects |
| CUR-138 (Email Notifications) | CAR-202, CAD-222 | Current email bugs inform new system |
| CUR-152 (Firebase Push) | PACK notification bugs | Same notification infrastructure |
| CUR-140..153 (14 Epic 11) | CAD/CAR equivalents | New platform versions of existing features |
| CUR-134..139 (6 Epic 10) | CAD-195 (notification umbrella) | New notification system |
| CUR-47..53 (7 prototyping) | non-prd-scope | 22 subtasks assigned to Ruchiran |

---

## 6. Completed Work Informing Active Tickets

| Completed Ticket | Status | Informs | How |
|------------------|--------|---------|-----|
| CAD-180 (Draft Packages) | DevTested | CAR-169 | Backend ready, seller UI can proceed |
| CAD-68 (Delivery Days Override) | DevTested | CAR-96, PACK-200 | Admin override done, seller + mobile pending |
| CAD-67 (Package Deletion) | DevTested | CAR-204 | **CONTRADICTION** — delete implemented vs disable |
| CAD-178 (Package Image) | DevTested | CAD-186 | Image display fixed, compression is enhancement |
| CAD-194 (Min order + packages) | DevTested | PACK-226 | Min order logic may interact with cart edit bug |
| CAD-142 (ABN field) | SIT | CAR-148, CAR-201 | ABN introduced, now needs validation + mandatory |
| CAD-182/CAR-172 (TIN→TFN) | DevTested | — | QA should test together |
| CAD-173/CAR-149 (CAPTCHA) | DevTested | — | QA should test together |
| CAD-97 (Application Approval) | SIT | CAD-208..211 | Parent approved, subtasks ready |
| CAD-99 (Vendor Suspension) | SIT | CAR-145 | Linked to CAR-145 (DevTested) |
| CAD-100 (Vendor Search) | SIT | — | Complete |
| CAR-128 (Order Details View) | DevTested | CAD-220 | Order details done, timeline enhancement pending |
| CAR-125 (Real-Time Dashboard) | DevTested | CAR-179 | Dashboard done, date filter bug outstanding |
| CAR-113..120 (7 stories) | DevTested | CAR-118 (In Progress) | Minuri's Epic 2 stories progressing |

---

## 7. Missing Jira Links (should be created)

| Link | Type | Reason |
|------|------|--------|
| CUR-156 ↔ CAR-206 | Duplicate | Confirmed duplicate, no link exists |
| CAD-200 ↔ CAD-202 | Relates | Same root cause (Package permission) |
| CAD-179 ↔ CAD-202 | Duplicate | Both add Package to permissions |
| PACK-226 ↔ PACK-198 | Relates | Investigation should cover this bug |
| CAR-198 ↔ CAR-207 | Relates | Both premature order status triggers |
| CAR-198 ↔ PACK-106 | Blocks | Already exists per comment analysis |
| PACK-190 ↔ CAR-28 | Depends | Cuisines→Packages depends on schema |
| PACK-200 ↔ CAR-96 | Depends | Filter depends on delivery date setting |
| PACK-105 ↔ CUR-151 | Relates | Both Stripe SDK integration |

---

## 8. Unassigned Backend Tickets (track but do NOT assign)

| Ticket | Project | Summary | Cluster | Notes |
|--------|---------|---------|---------|-------|
| CAR-206 | CAR | Auto-Cancellation Logic | Order | **Close** (duplicate of CUR-156) |
| CAR-205 | CAR | Handling inactive food items | Cart | **Close** (duplicate of CAR-146) |
| CAR-198 | CAR | Order Status before Payment | Order | Blocks 2 QA tasks. High priority. |
| CAR-204 | CAR | Disable Delete for Packages | Package | Contradicts CAD-67. Decision needed. |
| CAR-203 | CAR | Disable Delete for Food Items | Package | Same pattern as CAR-204 |
| CAR-195 | CAR | Misleading error on Config Group reorder | UI | Frontend fix |
| CAR-202 | CAR | Verification Email wrong link | Notification | Email template bug |
| CAD-203 | CAD | Customer Name Search not working | Order | Backend query fix |
| CAD-200 | CAD | Package Section + no Audit Trail | Permission | Same root cause as CAD-202 |

---

## 9. Orphaned Tickets (no links, no comments)

| Ticket | Summary | Should Link To |
|--------|---------|---------------|
| PACK-226 | Duplicate cart item on config edit | PACK-198 (investigation) |
| PACK-198 | INVESTIGATE: Package bugs | PACK-226, PACK-222, CAD-149 |
| CAD-200 | Package access + audit trail | CAD-202 (permission root cause) |
| CAR-198 | Order status before payment | CAR-207 (premature notification) |

---

## 10. Key Risks

| Risk | Impact | Tickets | Mitigation |
|------|--------|---------|------------|
| Cart validation incomplete | Users ordering unavailable items | CAD-149, 4 PACK bugs | Ramesh must finish CAD-149 first |
| Employee login broken | Vendors locked out | CAR-178 | Immediate priority |
| Notification infrastructure fragile | 7 bugs across 3 projects | 16 notification tickets | Fix bugs before CAD-195 umbrella |
| ABN scattered across 4 tickets | Inconsistent implementation | CAR-201/148/144, CAD-215 | Fix CAR-201 first (mandatory field) |
| Draft workflow split across boards | Admin/seller out of sync | CAD-180/181, CAR-169/170 | Coordinate deployment |
| Package delete contradiction | CAD-67 done vs CAR-204 wants disable | CAD-67, CAR-204, CAD-148 | **Decision from Demi** |
| Stripe across 3 projects | Fragmented payment implementation | PACK-105, CUR-151, CUR-122 | Coordinate: shared Stripe config |
| CAR-198 blocks 2 QA tasks | QA testing stalled | CAR-198, PACK-106, CAR-200 | Assign + prioritize CAR-198 |
| CUR prototyping (37 tickets) | Ramesh overloaded (92 tickets!) | CUR-47..53 + subtasks | **Deprioritize** to free capacity |
| 96 unassigned tickets | Work not progressing | Across all projects | Triage and assign in batches |

---

## 11. Decisions Needed From Demi

| # | Decision | Tickets | Impact |
|---|----------|---------|--------|
| 1 | **CAD-67 vs CAR-204**: Rollback package deletion or keep? | CAD-67, CAR-204, CAR-203 | Determines if delete stays or gets disabled |
| 2 | **CAR-206**: Close as duplicate of CUR-156? | CAR-206, CUR-156 | Prevents double work |
| 3 | **CAR-205**: Close as duplicate of CAR-146? | CAR-205, CAR-146, CAD-147 | Cleans up cart cluster |
| 4 | **CAD-179 vs CAD-202**: Merge into CAD-202? | CAD-179, CAD-202, CAD-200 | Cleans up permission cluster |
| 5 | **CAD-148** (Hide/Archive): Obsolete now that Draft is building? | CAD-148, CAD-181, CAR-170 | Can be closed |
| 6 | **CUR Prototyping** (37 tickets): Deprioritize? | CUR-27..53 + subtasks | Frees Ramesh for bug fixes |
| 7 | **CUR-156**: Beyond PRD scope — PO sign-off? | CUR-156 | No auto-cancel in PRD |
| 8 | **CAD-177** (suspended restaurant): Unpark? | CAD-177, PACK-216 | PACK-216 blocked until decision |
