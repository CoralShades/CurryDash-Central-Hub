# PACK (Mobile/Flutter) — Board Audit

> **Date**: 2026-03-12 (refreshed end-of-day) | **Total Active**: 100 tickets | **Completed (30d)**: 2
> **Project**: CurryPackApp - Mobile | **Codebase**: `D:\ailocal\currydash\User-Web-Mobile`
> **Stack**: Flutter/Dart, GetX state management, 34 feature modules
> **Last Jira refresh**: 2026-03-12 18:00

---

## Dashboard

| Metric | Value | Change from AM |
|--------|-------|----------------|
| Total Active | 100 | — |
| To Do | 46 | -54 |
| In Progress | 10 | +10 |
| Dev Tested | 23 | +23 |
| READY FOR UAT | 20 | +20 |
| UAT | 1 | +1 |
| Bugs | 14 | — |
| Epics | 15 (2 archived) | — |
| Assigned to Ruchiran | **51** | +32 |
| Assigned to Deshan | 9 | +6 |
| Assigned to Kasun | 2 | — |
| Assigned to Ramesh | 1 | — |
| **Unassigned** | **37** | -37 |

### Status: ACTIVE — 54 tickets moved from To Do. Ruchiran driving core package + user story work.

### Non-To Do Tickets (54 tickets in motion)

**Dev Tested (23)** — Ruchiran:
- PACK-1 (API Endpoint Constants), PACK-3 (API Client: Package List), PACK-4 (Restaurant "Packages & Combos" UI)
- PACK-5 (Package Configure Screen), PACK-6 (Cart AddPackage API), PACK-7 (Cart Model Package Lines)
- PACK-8 (Cart UI Package Lines), PACK-9 (Checkout Package→Order), PACK-46 (Guest Home Screen)
- PACK-49 (Guest Menu Item), PACK-51 (Create Profile), PACK-52 (Login Email/Password)
- PACK-53 (Social Login), PACK-55 (View/Edit Profile), PACK-64 (Checkout Screen)
- PACK-65 (Edit Address in Checkout), PACK-66 (Edit Delivery Date/Time), PACK-71 (Place Multiple Orders)
- PACK-73 (Error Handling & Messaging), PACK-76 (Curry Pack Bundle Page)
- PACK-77 (Unavailable Package Visibility), PACK-81 (Guest "Not Logged In" Banner)
- PACK-92 (Order Status Push Notifications)

**Ready for UAT (20):**
- Ruchiran: PACK-47 (Guest Setup Location), PACK-48 (Guest View Restaurants), PACK-50 (Guest Add to Cart)
  PACK-54 (Forgot Password), PACK-57 (Edit Location on Map), PACK-58 (View Restaurants in Zone)
  PACK-59 (Home Screen), PACK-60 (Item Detail), PACK-61 (Add Multiple Items to Cart)
  PACK-62 (View Cart), PACK-63 (Edit Cart), PACK-74 (Loading States), PACK-75 (Session Management)
- Deshan: PACK-23 (Mobile Nav Bar), PACK-100 (Epic Docs), PACK-101 (CI/CD PR Validation)
  PACK-102 (CI/CD E2E), PACK-103 (README Overhaul), PACK-104 (Progress Checkpoints), PACK-12 (Dev Guide)

**In Progress (10):**
- Ruchiran: PACK-2 (Extend Package Model), PACK-56 (User Setup Location)
- Deshan: PACK-20 (Onboarding Branding)
- Ramesh: PACK-10 (Web Portal Package Configure Modal)
- Kasun: PACK-11 (Unit + Integration Tests for Package Flows)
- Unassigned: PACK-67 (Payment Method COD/Online), PACK-68 (Promo Code), PACK-69 (Review & Confirm Order),
  PACK-70 (Order Summary & Tracking), PACK-106 (QA: Test Stripe)

**UAT (1):** PACK-99 (Deshan: Documentation & CI/CD Infrastructure Setup)

---

## Bug Inventory (14 bugs)

### Backend-Blocked Bugs (7)

| Key | Summary | Blocked By | Backend Status | Priority |
|-----|---------|-----------|----------------|----------|
| PACK-222 | ISE when cart item deleted from menu | CAD-149 | In Progress | Medium |
| PACK-226 | Editing config creates duplicate cart item | CAD-149 | In Progress | Medium |
| PACK-216 | Cart not cleared on suspended restaurant | CAD-177 | Parked (DO NOT ACTION) | Medium |
| PACK-205 | Signup "Failed to send mail" | CAD-222 | To Do | Medium |
| PACK-200 | Filter by delivery availability missing | CAR-96 | To Do | Medium |
| PACK-210 | Track Order + delivery time issues | CUR-149 | To Do | Medium |
| PACK-199 | Incorrect notification for "Ready for Handover" | CAR-207 | In Progress | Medium |

### Flutter-Only Bugs (7) — No backend dependency

| Key | Summary | Area | Assignee | Complexity |
|-----|---------|------|----------|------------|
| PACK-177 | Deleted address persists after logout/login | Auth/Address cache | Ruchiran | S |
| PACK-221 | Bottom nav hidden by order processing bar | Dashboard layout | Unassigned | S |
| PACK-193 | UI overflow "Right overflowed by 12px" Android | Layout | Unassigned | S |
| PACK-209 | Dietary notes warning icons not applicable | Product UI | Unassigned | S |
| PACK-178 | Network failure infinite loading | API error handling | Ruchiran | M |
| PACK-184 | Address/time not retained at checkout | Checkout state | Ruchiran | M |
| PACK-224 | Can't navigate back from payment page | Payment WebView nav | Unassigned | M |
| PACK-212 | Restaurants not sorted by distance | Discovery/sort | Unassigned | M |

---

## Feature Tasks — By Domain

### Cart & Checkout (6 tickets)

| Key | Summary | Type | Dependencies | Assignee |
|-----|---------|------|-------------|----------|
| PACK-113 | DEV: Implement checkout form | Subtask | Backend APIs | Unassigned |
| PACK-114 | QA: Test checkout flow | Subtask | PACK-113 | Unassigned |
| PACK-151 | Story 6.5: Complete Payment | Task | PACK-217/218/219 | Unassigned |
| PACK-78 | Smart selection of next closest delivery date | Task | CAR-96 | Unassigned |
| PACK-72 | Add multiple payment methods | Task | Stripe SDK | Unassigned |
| PACK-105 | DEV: Integrate Stripe SDK | Subtask | CUR-151 coordination | Unassigned |

### Package Management (4 tickets)

| Key | Summary | Dependencies | Assignee |
|-----|---------|-------------|----------|
| PACK-190 | Replace Cuisines with Packages | CAR-28/29/30 | Unassigned |
| PACK-146 | Package Config Backend Support | CAR-28/29 | Unassigned |
| PACK-111 | DEV: Build package config UI | CAR-28/29/30 | Unassigned |
| PACK-112 | QA: Test package configuration | PACK-111 | Unassigned |

### Subscription Management (7 tickets)

| Key | Summary | Dependencies | Assignee |
|-----|---------|-------------|----------|
| PACK-86 | Subscribe to recurring curry packs | Stripe + backend | Unassigned |
| PACK-87 | Select subscription frequency & delivery day | Backend API | Unassigned |
| PACK-88 | Pause or skip subscription deliveries | Backend API | Unassigned |
| PACK-89 | Modify subscription package selections | Backend API | Unassigned |
| PACK-90 | Cancel subscription | Backend API | Unassigned |
| PACK-107 | DEV: Implement subscription billing w/ Stripe | Stripe SDK | Unassigned |
| PACK-108 | QA: Test subscription lifecycle | PACK-107 | Unassigned |

### Notifications (4 tickets)

| Key | Summary | Dependencies | Assignee |
|-----|---------|-------------|----------|
| PACK-170 | Manage notification preferences | Backend API | Unassigned |
| PACK-169 | Promotional notifications | Backend + Firebase | Unassigned |
| PACK-168 | Subscription reminder notifications | Backend API | Unassigned |
| PACK-94 | Manage notification preferences (duplicate?) | Backend API | Unassigned |

### Customer Support (5 tickets)

| Key | Summary | Dependencies | Assignee |
|-----|---------|-------------|----------|
| PACK-97 | Contact support for active orders | Backend API | Unassigned |
| PACK-164 | Report order issue with photo | Backend API | Unassigned |
| PACK-165 | View support ticket status | Backend API | Unassigned |
| PACK-166 | Help center & FAQ | CMS content | Unassigned |
| PACK-115/116 | DEV/QA: Support ticket creation | Backend API | Unassigned |

### User Account & Registration (1 ticket)

| Key | Summary | Dependencies | Assignee |
|-----|---------|-------------|----------|
| PACK-194 | Add full name field to registration | Flutter + Laravel API | Unassigned |

### Order Tracking (2 tickets)

| Key | Summary | Dependencies | Assignee |
|-----|---------|-------------|----------|
| PACK-98 | Reorder from previous orders | Backend API | Unassigned |
| PACK-196 | Order details page visual sync | PACK-9 | Unassigned |

### UI/UX Improvements (3 tickets)

| Key | Summary | Area | Assignee |
|-----|---------|------|----------|
| PACK-197 | Homepage improvements | Discovery | Unassigned |
| PACK-195 | Cart package & item card redesign | Cart UI | Unassigned |
| PACK-130 | StackFood reference removal | Branding | Deshan |

### Brand Identity & Design (14 tickets — all assigned to Ruchiran)

| Key | Summary | Status |
|-----|---------|--------|
| PACK-25 | Implement Core Color Design Tokens | To Do |
| PACK-26 | Set Font Families and Hierarchy | To Do |
| PACK-27 | Primary CTA Button Styling | To Do |
| PACK-28 | Card Component Styling | To Do |
| PACK-29 | Implement 8pt Spacing Grid | To Do |
| PACK-30 | App Icon Implementation | To Do |
| PACK-31 | Storytelling Tone of Voice | To Do |
| PACK-32 | Logo Usage on Backgrounds | To Do |
| PACK-33 | UI Feedback States | To Do |
| PACK-34 | Accessibility: ARIA Labels & Touch Targets | To Do |
| PACK-24 | Minimum Font Size Compliance | To Do |
| PACK-21 | Style Order Tracking Progress Bar | To Do |
| PACK-117 | Migrate Theme to Brand Colors v2.0 | To Do |
| PACK-118 | Refactor to Use Centralized AppColors | To Do |

### Developer Foundation & Testing (12 tickets)

| Key | Summary | Assignee |
|-----|---------|----------|
| PACK-121 | Developer environment setup guide | Unassigned |
| PACK-122 | Jira story standards & templates | Unassigned |
| PACK-123 | Local testing workflow docs | Unassigned |
| PACK-124 | Automated test suite integration | Unassigned |
| PACK-125 | Pre-commit quality gates | Unassigned |
| PACK-126 | Sprint planning & tracking | Unassigned |
| PACK-127 | App icon & splash screen update | Deshan |
| PACK-131 | Brand style guide documentation | Unassigned |
| PACK-171 | Playwright E2E test suite | Unassigned |
| PACK-172 | Mobile emulator testing workflow | Unassigned |
| PACK-173 | Manual testing checklists | Unassigned |
| PACK-174 | CI/CD test automation | Unassigned |
| PACK-175 | Test results visibility | Unassigned |

---

## Epics (15)

| Key | Epic Name | Active Tickets | Status |
|-----|-----------|---------------|--------|
| PACK-13 | Epic 1: Developer Foundation | 6 stories | To Do |
| PACK-18 | Epic 2: Brand Identity | 14+ tasks | To Do |
| PACK-36 | Epic 3: User Account & Auth | 1 story | To Do |
| PACK-38 | Epic 4: Location & Restaurant Discovery | 0 direct | To Do |
| PACK-35 | Epic 5: Guest User Experience | 0 direct | To Do |
| PACK-120 | Epic 5: Package Configuration | 2 subtasks | To Do |
| PACK-40 | Epic 6: Cart & Checkout | 3 subtasks | To Do |
| PACK-83 | Epic 7: Subscription Management | 6 stories | To Do |
| PACK-41 | Epic 8: Order Tracking & History | 0 direct | To Do |
| PACK-85 | Epic 9: Customer Support | 3 stories | To Do |
| PACK-84 | Epic 10: Push Notifications | 3 stories | To Do |
| PACK-15 | Epic 11: Testing Infrastructure | 5 stories | To Do |
| PACK-17 | Core Components & Style | 0 direct | To Do |
| PACK-19 | Feedback & Accessibility | 0 direct | To Do |
| PACK-79 | [ARCHIVED] Improvements | — | Archived |
| PACK-37 | [ARCHIVED] Location & Personalization | — | Archived |

---

## Potential Duplicates / Overlaps

| Pair | Overlap | Recommendation |
|------|---------|---------------|
| PACK-170 ↔ PACK-94 | Both "Manage notification preferences" | Merge — keep PACK-170 |
| PACK-158 ↔ PACK-168 | Both "Subscription reminder notifications" | Merge — keep PACK-168 |
| PACK-93 ↔ PACK-169 | Both "Promotional notifications" | Merge — keep PACK-169 |
| PACK-91 ↔ PACK-168 | "Subscription reminder" vs "Subscription reminder" | Merge — keep PACK-168 |
| PACK-96 ↔ PACK-165 | Both "View support ticket status" | Merge — keep PACK-165 |
| PACK-95 ↔ PACK-164 | Both "Report order issue with photo" | Merge — keep PACK-164 |
| PACK-39 ↔ PACK-40 | "Cart Management" vs "Cart & Checkout" epics | Merge epics |

**7 potential duplicate pairs found** — old tasks (PACK-86-98) overlap with newer stories (PACK-164-175).

---

## Key Risks (Updated)

1. ~~ZERO velocity~~ **RESOLVED** — 54 tickets now in progress/dev-tested/ready-for-UAT
2. ~~74 unassigned~~ **Improved** — Down to 37 unassigned. But 4 In Progress tickets are unassigned (PACK-67-70)
3. **Ruchiran overloaded** — Now at 51 tickets (up from 19). Core dev but capacity concern.
4. **Backend blocking** — 7 of 14 bugs STILL blocked by backend work (CAD-149, CAD-177, CAD-222, CAR-96, CAR-207, CUR-149)
5. **Minimal tests** — Still only 5 tests (4 package model + 1 widget). Kasun working on PACK-11 (In Progress)
6. ~~Package system not started~~ **RESOLVED** — PACK-1 through PACK-9 all Dev Tested. Package management is the most progressed feature.
7. **Stripe not started** — PACK-106 (QA test Stripe) In Progress but unassigned. PACK-67 (Payment Method) In Progress unassigned.
8. **Duplicate stories** — Still present: PACK-86-98 overlap with PACK-164-175
9. **NEW: Unassigned In-Progress tickets** — PACK-67, 68, 69, 70 are In Progress but have no assignee
