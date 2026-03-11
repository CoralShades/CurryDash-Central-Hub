# Task Plan: Full 4-Project Board Audit — CAD + CAR + PACK + CUR

> **Date**: 2026-03-11 | **Source**: Complete board audit across all projects
> **Cross-ref**: `findings.md` for dependency analysis, `progress.md` for session history

---

## Board Summary

| Project | Total Active | In Progress | DevTested | To Do | Unassigned |
|---------|-------------|-------------|-----------|-------|------------|
| CAD (Admin) | 100 | 6 | 14 | 77 | 4 |
| CAR (Seller) | 100 | 8 | 3 | 89 | 8 |
| PACK (Mobile) | 100 | 0 | 0 | 100 | 75 |
| CUR (Platform) | 100 | 1 | 7 | 92 | 9 |
| **Completed** | 45 | — | — | — | — |

---

## PHASE 1: IMMEDIATE — Bugs & Blockers

- [ ] **CAR-178** (In Progress, Ramesh) — Employees cannot log into merchant panel — **LOGIN BLOCKER**
- [ ] **CAD-149** (In Progress, Ramesh) — Remove inactive items from carts — **blocks 4 PACK bugs**
- [ ] **CAR-207** (In Progress, Ramesh) — Notification triggered before order placed
- [ ] **CAR-179** (In Progress, Ramesh) — Date range filter not available
- [ ] **CAR-198** (To Do, Unassigned) — Order status "Placed" before payment — **blocks PACK-106 + CAR-200 QA**

## PHASE 2: IN PROGRESS — Feature Work

- [ ] **CAD-98** (In Progress, Ramesh) — Vendor Profile Management → 4 subtasks (CAD-212..215)
- [ ] **CAD-202** (In Progress, Ramesh) — Package Module Permission → blocks CAD-114
- [ ] **CAR-170** (In Progress, Ramesh) — Draft Status for Food Items (seller backend)

---

## PHASE 3: CLEANUP — Close Duplicates + Create Missing Links

### Close as Duplicates
- [ ] **CAR-206** → duplicate of CUR-156 (auto-cancellation) — **needs Demi approval**
- [ ] **CAR-205** → duplicate of CAR-146 (inactive food items) — **needs Demi approval**
- [ ] **CAD-179** → duplicate of CAD-202 (package permissions) — **needs Demi approval**

### Create Missing Jira Links
- [ ] CUR-156 ↔ CAR-206 (Duplicate)
- [ ] CAD-200 ↔ CAD-202 (Relates — same permission root cause)
- [ ] CAD-179 ↔ CAD-202 (Duplicate)
- [ ] PACK-226 ↔ PACK-198 (Relates — investigation should cover)
- [ ] CAR-198 ↔ CAR-207 (Relates — premature status triggers)
- [ ] PACK-190 ↔ CAR-28 (Depends — Cuisines→Packages needs schema)
- [ ] PACK-200 ↔ CAR-96 (Depends — filter needs delivery date setting)
- [ ] PACK-105 ↔ CUR-151 (Relates — both Stripe SDK)

### Decisions Needed (8 items — see findings.md §11)
- [ ] D1: CAD-67 vs CAR-204 (package delete contradiction)
- [ ] D2: Close CAR-206 as dup of CUR-156?
- [ ] D3: Close CAR-205 as dup of CAR-146?
- [ ] D4: Merge CAD-179 into CAD-202?
- [ ] D5: Close CAD-148 (Hide/Archive) as obsolete?
- [ ] D6: Deprioritize CUR prototyping (37 tickets)?
- [ ] D7: CUR-156 beyond PRD — PO sign-off?
- [ ] D8: Unpark CAD-177 (suspended restaurant)?

---

## CLUSTER 1: Cart Validation (Hybrid Architecture — decided)

**Owner**: Ramesh (Laravel) + Ruchiran (Flutter)
**Architecture**: Backend flags + API checkout validation + Client notification

- [ ] **CAD-149** (In Progress, Ramesh) — Backend: flag inactive items, validate at checkout
- [x] **CAD-205** (DevTested, Ruchiran) — Admin portal package status validation
- [ ] PACK-222 (To Do, Unassigned) — ISE when cart item deleted — **depends on CAD-149**
- [ ] PACK-226 (To Do, Unassigned) — Duplicate cart item on config edit — **needs investigation**
- [ ] PACK-216 (To Do, Unassigned) — Cart not cleared on suspended restaurant — **depends on CAD-177 (parked)**

## CLUSTER 2: Draft Status Workflow

- [x] **CAD-180** (DevTested) — Draft for Packages (admin backend done)
- [ ] **CAR-169** (To Do, Ramesh) — Draft for Packages (seller UI) — **depends on CAD-180**
- [ ] **CAR-170** (In Progress, Ramesh) — Draft for Food Items (seller backend)
- [ ] **CAD-181** (To Do, Ramesh) — Draft for Food Items (admin UI) — **depends on CAR-170**

## CLUSTER 3: ABN (Australian Business Number)

- [x] **CAD-142** (SIT) — ABN field introduced for restaurants
- [x] **CAD-182/CAR-172** (DevTested) — TIN→TFN relabel
- [ ] **CAR-201** (To Do, Ramesh) — Bug: ABN field not mandatory — **quick fix first**
- [ ] **CAR-148** (To Do, Ramesh) — ABN Validation logic for vendor CRUD
- [ ] **CAD-215** (To Do, Ramesh) — ABN Approval Queue + Name Sync (subtask of CAD-98)
- [ ] **CAR-144** (To Do, Ramesh) — Display ABN in vendor portal — **depends on CAR-148**

## CLUSTER 4: Notification System (16 tickets — LARGEST CLUSTER)

### Current Platform Bugs (fix first)
- [ ] **CAR-207** (In Progress, Ramesh) — Notification before order placed
- [ ] **CAD-222** (To Do, Ramesh) — OTP + registration emails simultaneous
- [ ] **CAD-221** (To Do, Ramesh) — Vendor not receiving cancel notification
- [ ] **CAD-206** (To Do, Ruchiran) — No email on admin password change
- [ ] **CAR-202** (To Do, Unassigned) — Verification email wrong link/username
- [ ] **PACK-205** (To Do, Ramesh) — Signup "Failed to send mail"
- [ ] **PACK-199** (To Do, Unassigned) — Wrong notification for Ready for Handover

### Infrastructure
- [ ] **CAD-183** (To Do, Ramesh) — Admin Global Notification Panel
- [ ] **CAD-195** (To Do, Ramesh) — Comprehensive Notification System (umbrella)

### New Platform (defer until current bugs fixed)
- [ ] CUR-134..139 (6 stories, Ramesh) — Epic 10 notification stories
- [ ] CUR-152 (To Do, Ramesh) — Firebase Push Notification Integration

## CLUSTER 5: Audit Log

- [ ] **CAD-212** (To Do, Ramesh) — Audit Log Backend — **build HasAuditLog trait first**
- [ ] **CAD-213** (To Do, Ramesh) — Audit Log Admin UI — **depends on CAD-212**
- [ ] **CAR-147** (To Do, Ramesh) — Vendor panel audit logs — **depends on CAD-212 trait**
- [ ] CAD-119 (To Do, Kasun) — Story 6.7: Comprehensive Audit Trail — **depends on CAD-212**

## CLUSTER 6: Vendor Management — 17 Subtasks

### CAR-156: Holiday Hours (Priority 1)
- [ ] **CAR-208** — Holiday System: Database & Models
- [ ] **CAR-209** — Admin Holiday Management
- [ ] **CAR-210** — Vendor Schedule Exceptions
- [ ] **CAR-211** — Schedule API Endpoint
- [ ] **CAR-212** — Flutter App: Holiday Awareness

### CAD-97: Application Approval (Priority 2) — parent in SIT
- [ ] **CAD-208** — Request More Info: Backend
- [ ] **CAD-209** — Request More Info: Admin & Vendor UI
- [ ] **CAD-210** — Email Templates Setup
- [ ] **CAD-211** — Privacy Policy CMS Page

### CAD-98: Vendor Profiles (Priority 3 — parent In Progress)
- [ ] **CAD-212** — Audit Log Backend (also in Cluster 5)
- [ ] **CAD-213** — Audit Log Admin UI
- [ ] **CAD-214** — Multi-Location Management
- [ ] **CAD-215** — ABN Approval Queue + Name Sync (also in Cluster 3)

### CAD-101: Performance Metrics (Priority 4)
- [ ] **CAD-216** — Performance Service
- [ ] **CAD-217** — Performance Controller & Routes
- [ ] **CAD-218** — Performance Tab UI
- [ ] **CAD-219** — Platform Benchmarks & Warnings

## CLUSTER 7: Package Management Backend

- [ ] **CAR-28** (To Do, Ramesh) — PKG-001: Database Schema Enhancement
- [ ] **CAR-29** (To Do, Ramesh) — PKG-002: Backend Logic — **depends on CAR-28**
- [ ] **CAR-30** (To Do, Ramesh) — PKG-003a: Vendor Package UI — **depends on CAR-29**
- [ ] **CAR-146** (To Do, Ramesh) — Removing food items from packages
- [ ] PACK-146 (To Do, Unassigned) — Vendor Package Config Backend Support — **depends on CAR-28/29**
- [ ] PACK-190 (To Do, Unassigned) — Replace Cuisines with Packages — **depends on CAR-28/29/30**

## CLUSTER 8: Order Management & Status

- [ ] **CAR-207** (In Progress, Ramesh) — Notification before order placed
- [ ] **CAR-198** (To Do, Unassigned) — Order status "Placed" before payment — **blocks 2 QA tasks**
- [ ] **CAD-220** (To Do, Ramesh) — Incomplete Order Timeline
- [ ] **CAD-203** (To Do, Unassigned) — Customer Name Search not working
- [ ] CAR-194 (To Do, Kasun) — Incorrect order status colors
- [ ] CAR-183 (To Do, Kasun) — Inconsistent status color coding
- [ ] PACK-210 (To Do, Unassigned) — Track Order button / delivery time
- [ ] CUR-149 (To Do, Ruchiran) — Order Management API (new platform)

## CLUSTER 9: Employee & Permission System

- [ ] **CAR-178** (In Progress, Ramesh) — Employees cannot log in — **BLOCKER**
- [ ] **CAD-202** (In Progress, Ramesh) — Package Module Permission — blocks CAD-114
- [ ] **CAD-200** (To Do, Unassigned) — Package Section Not Accessible — **same root cause as CAD-202**
- [ ] **CAD-207** (To Do, Ramesh) — User Role Not Displayed in Employee List
- [ ] **CAD-2** (To Do, Ramesh) — User Access Control & Role Management

## CLUSTER 10: Payment / Stripe (NEW)

- [ ] **PACK-105** (To Do, Unassigned) — Stripe SDK integration (Flutter)
- [ ] **CUR-151** (To Do, Ramesh) — Stripe Payment Integration (new platform API)
- [ ] **CUR-122** (To Do, Santhuka) — Stripe Admin Dashboard + 5 subtasks (CUR-128..132)

## CLUSTER 11: Checkout Flow (NEW)

- [ ] **PACK-224** (To Do, Unassigned) — Cannot navigate back from payment page
- [ ] **PACK-184** (To Do, Ruchiran) — Address/time not retained at checkout
- [ ] **CUR-148** (To Do, Ramesh) — Cart & Checkout API (new platform)

## CLUSTER 12: Schedule & Delivery (NEW)

- [x] **CAD-68** (DevTested) — Override Restaurant Delivery Days
- [ ] **CAR-156** (To Do, Ramesh) — Holiday Hours (5 subtasks)
- [ ] **CAR-96** (To Do, Ramesh) — Global Delivery Date Setting — **may reuse CAD-68**
- [ ] PACK-200 (To Do, Unassigned) — Filter by delivery availability — **depends on CAR-96**

---

## STANDALONE BACKEND TICKETS (Ramesh — not in clusters)

| Ticket | Summary | Epic |
|--------|---------|------|
| CAD-186 | Image Compression for Media Uploads | — |
| CAD-193 | Admin Menu Standards Configuration | Epic 2 |
| CAD-189 | Subscription Plan Templates | Epic 8 |
| CAD-190 | Trial Period Management | Epic 8 |

## STANDALONE BACKEND TICKETS (Kasun)

| Ticket | Summary | Epic | Status |
|--------|---------|------|--------|
| CAD-105 | Story 4.10: Order Intervention | Epic 4 | In Progress |
| CAD-104 | Story 4.9: Platform Order Monitoring | Epic 4 | In Progress |
| CAD-113 | Story 6.1: Admin Account Management | Epic 6 | In Progress |
| CAD-135 | Story 9.8: Subscription vs On-Demand Analysis | Epic 9 | To Do |
| CAD-140 | Setup zones for 3174 and 3168 | — | To Do |
| CAD-102..136 | 16 stories across Epics 4–9 | Various | To Do |

## STANDALONE (Minuri — CAR only)

| Ticket | Summary | Epic | Status |
|--------|---------|------|--------|
| CAR-105 | Story 1.1: Vendor Registration | Epic 1 | In Progress |
| CAR-108 | Story 1.4: Restaurant Profile Setup | Epic 1 | In Progress |
| CAR-112 | Story 1.8: Staff Access Delegation | Epic 1 | In Progress |
| CAR-118 | Story 2.6: Package Configuration Groups | Epic 2 | In Progress |
| CAR-106..142 | 20+ stories across Epics 1–3, 7–9 | Various | To Do |

## CUR NEW PLATFORM — Backend Stories (all To Do)

### Epic 11: Platform Configuration & API (Ramesh)
| Ticket | Summary | Notes |
|--------|---------|-------|
| CUR-140 | Platform-Wide Settings Configuration | — |
| CUR-141 | Zone Management | — |
| CUR-142 | Promotional Banners | — |
| CUR-143 | Commission Structure Configuration | — |
| CUR-144 | Category Management | — |
| CUR-145 | Feature Flags | — |
| CUR-146 | Customer Authentication API | — |
| CUR-147 | Package & Food Browsing API | — |
| CUR-148 | Cart & Checkout API | Informed by CAD-149 cart fix |
| CUR-150 | Subscription Management API | — |
| CUR-151 | Stripe Payment Integration | 3 Stripe tickets across projects |
| CUR-152 | Firebase Push Notifications | — |
| CUR-153 | API Authentication & Security | — |

### Epic 10: Notifications (Ramesh)
| Ticket | Summary |
|--------|---------|
| CUR-134 | Vendor New Order Notifications |
| CUR-135 | Order Status Change Notifications |
| CUR-136 | Customer Order Update Notifications |
| CUR-137 | Admin Performance Alerts |
| CUR-138 | Email Notifications |
| CUR-139 | SMS Notifications |

### Epic 11: Order Management (Ruchiran)
| Ticket | Summary |
|--------|---------|
| CUR-149 | Order Management API |

### Prototyping (non-prd-scope — RECOMMEND DEPRIORITIZE)
| Range | Count | Assignee | Summary |
|-------|-------|----------|---------|
| CUR-47..53 | 7 stories | Ramesh | Admin prototyping (22 subtasks → Ruchiran) |
| CUR-27..28 | 2 stories | Ramesh | User profile prototyping |
| CUR-20..21 | 2 stories | Ramesh | Order tracking prototyping |
| CUR-32..38 | 7 stories | Ramesh | Seller portal prototyping |
| CUR-42..44 | 2 stories | Ramesh | Driver portal prototyping |

## PACK MOBILE — Backend-Dependent Tickets

| Ticket | Summary | Depends On | Assignee |
|--------|---------|-----------|----------|
| PACK-222 | ISE when cart item deleted | CAD-149 | Unassigned |
| PACK-226 | Duplicate cart item on edit | CAD-149 investigation | Unassigned |
| PACK-216 | Cart + suspended restaurant | CAD-177 (parked) | Unassigned |
| PACK-205 | Signup "Failed to send mail" | CAD-222 | Ramesh |
| PACK-199 | Wrong notification text | CAR-207 fix | Unassigned |
| PACK-200 | Filter by delivery availability | CAR-96 | Unassigned |
| PACK-190 | Replace Cuisines with Packages | CAR-28/29/30 | Unassigned |
| PACK-146 | Package Config Backend Support | CAR-28/29 | Unassigned |
| PACK-105 | Stripe SDK integration | CUR-151 coordination | Unassigned |
| PACK-210 | Track Order + delivery time | CUR-149 | Unassigned |
| PACK-184 | Checkout address/time lost | Flutter-side | Ruchiran |
| PACK-178 | Network failure infinite load | Flutter-side | Ruchiran |
| PACK-177 | Deleted address persists | Flutter-side | Ruchiran |
| PACK-224 | Cannot back-nav from payment | Flutter-side | Unassigned |
| PACK-194 | Full Name in registration | Registration flow | Unassigned |
| PACK-198 | INVESTIGATE: Package bugs | — | Kasun |

---

## PARKED / DO NOT ACTION

| Ticket | Summary | Reason |
|--------|---------|--------|
| CAD-148 | Replace Delete with Hide/Archive | Superseded by Draft workflow |
| CAD-150 | Cancel orders with deleted items | Depends on CAD-149 resolution |
| CAD-177 | Suspended restaurant visible | Parked — unpark decision needed |
| CAD-204 | Deactivate/Reactivate Admin | Parked |
| CAR-98 | Admin Intervention Notifications | Parked |

---

## RECOMMENDED SPRINT PRIORITY ORDER

### Sprint N (Current — finish in-progress + critical bugs)
1. **CAR-178** — Employee login blocker
2. **CAD-149** — Cart validation (unblocks 4 PACK bugs)
3. **CAR-207** + **CAR-179** — Quick bug fixes
4. **CAR-170** — Draft for food items (finish in-progress)
5. **CAD-202** — Package permission (finish in-progress, unblocks CAD-114 + CAD-200)

### Sprint N+1 (Cart + Draft + ABN + Notification bugs)
1. CAD-181 — Draft food items admin UI (unblocked by CAR-170)
2. CAR-169 — Draft packages seller UI (unblocked by CAD-180)
3. CAR-201 → CAR-148 → CAR-144 — ABN chain
4. CAD-221 + CAD-222 + PACK-205 — Notification bugs
5. CAR-208 → CAR-209 — Holiday system DB + Admin

### Sprint N+2 (Vendor Management + Audit)
1. CAR-210 → CAR-211 → CAR-212 — Holiday: exceptions, API, Flutter
2. CAD-208 → CAD-209 — Request More Info
3. CAD-212 → CAD-213 — Audit Log (shared trait)
4. CAR-147 — Vendor audit logs
5. CAD-210 + CAD-211 — Email templates + Privacy CMS

### Sprint N+3 (Performance + Packages + Remaining)
1. CAD-214 + CAD-215 — Multi-location + ABN queue
2. CAD-216 → CAD-219 — Performance metrics (4 subtasks)
3. CAR-28 → CAR-29 → CAR-30 — Package backend
4. CAD-186 — Image compression
5. Notification umbrella (CAD-195 / CAD-183)

### Future (CUR New Platform)
- CUR Epic 11 stories only after current platform bugs are resolved
- CUR prototyping deprioritized (37 tickets)
- Stripe coordination (PACK-105, CUR-151, CUR-122) as a dedicated sprint
