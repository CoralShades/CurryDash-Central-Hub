# CUR (New Platform / Central Hub) — Board Audit

> **Date**: 2026-03-12 | **Total Active**: 100 tickets | **Completed (30d)**: 0
> **Project**: CurryDash — New Platform | **Codebase**: `D:\ailocal\CurryDash-Central-Hub` (Next.js 15)
> **Stack**: Next.js 15, React 18, TypeScript, Supabase, Auth.js v5, shadcn/ui, Tailwind CSS v4

---

## Dashboard

| Metric | Value | Change from AM |
|--------|-------|----------------|
| Total Active | 100 | — |
| To Do | 85 | -5 |
| In Progress | 1 (CUR-14: Cart Screen Prototyping) | — |
| SIT | 2 (CUR-8 Logo, CUR-3 Branding) | — |
| UAT | 8 | +1 (CUR-4 Splash/Welcome added) |
| Ready for PROD | **4** (NEW) | +4 |
| Completed (30d) | 0 | — |
| Assigned to Ramesh | 40 | +3 |
| Assigned to Ruchiran | 31 | +9 |
| Assigned to Santhuka | 3 | +2 |
| Assigned to Deshan | 9 | — |
| **Unassigned** | **17** | -14 |

### Ready for PROD (NEW — 4 tickets):
- CUR-109 (Ramesh: Design complete ERD)
- CUR-113 (Deshan: Curry package data coordination)
- CUR-121 (Santhuka: GCP Access)
- CUR-79 (Santhuka: Apple Developer Account setup)

### UAT (8 tickets — was 7):
- CUR-4 (Ruchiran: Splash & Welcome Screen) — **NEW to UAT**
- CUR-5 (Ruchiran: User Registration Screen)
- CUR-6 (Ruchiran: Login Screen)
- CUR-7 (Ruchiran: Forgot Password Screen)
- CUR-10/11/12/13 (Ruchiran: Home, Search, Restaurant, Menu prototypes)

### Status: Low velocity but improving. 4 tickets now Ready for PROD. 14 more tickets assigned.

---

## Ticket Categories

### Epic 11: Platform Configuration & API Foundation (14 stories) — CRITICAL PATH

This is the core of the new CurryDash platform. All 14 stories are **To Do**, assigned to Ramesh.

| Key | Summary | Backend Dependency | Complexity | Assignee |
|-----|---------|-------------------|------------|----------|
| CUR-140 | Platform-Wide Settings Configuration | New Supabase tables | L | Ramesh |
| CUR-141 | Zone Management | Maps + geospatial | XL | Ramesh |
| CUR-142 | Promotional Banners | Image upload + scheduling | M | Ramesh |
| CUR-143 | Commission Structure Configuration | Financial validation | L | Ramesh |
| CUR-144 | Category Management | CRUD Supabase | M | Ramesh |
| CUR-145 | Feature Flags | Key-value config | M | Ramesh |
| CUR-146 | Customer Authentication API | Auth.js + JWT + social | L | Ramesh |
| CUR-147 | Package & Food Browsing API | API from Laravel or new | L | Ramesh |
| CUR-148 | Cart & Checkout API | Complex order flow | XL | Ramesh |
| CUR-149 | Order Management API | Order lifecycle | XL | Ruchiran |
| CUR-150 | Subscription Management API | Billing cycles | XL | Ramesh |
| CUR-151 | Stripe Payment Integration | Stripe keys + webhooks | XL | Ramesh |
| CUR-152 | Firebase Push Notification Integration | FCM + Next.js | L | Ramesh |
| CUR-153 | API Authentication & Security | Auth.js v5 + Supabase RLS | L | Ramesh |

**Decision needed**: Is this a NEW platform replacing Laravel, or does it proxy to Laravel APIs? 13 of 14 are assigned to Ramesh — he already has 92 active CAD/CAR tickets. This is a **capacity bottleneck**.

### Epic 10: Multi-Channel Notifications (6 stories)

| Key | Summary | Dependencies | Assignee |
|-----|---------|-------------|----------|
| CUR-134 | Vendor New Order Notifications | Firebase + WebSocket | Ramesh |
| CUR-135 | Order Status Change Notifications | Event system | Ramesh |
| CUR-136 | Customer Order Update Notifications | Push + email | Ramesh |
| CUR-137 | Admin Performance Alerts | Metrics + thresholds | Ramesh |
| CUR-138 | Email Notifications | Template engine | Ramesh |
| CUR-139 | SMS Notifications for Critical Updates | SMS provider (Twilio?) | Ramesh |

**All 6 assigned to Ramesh.** Related to CAD-195 (umbrella notification story) and CAR-207 (notification bug).

### Stripe Admin Dashboard (6 tickets)

| Key | Summary | Assignee |
|-----|---------|----------|
| CUR-122 | Admin dashboard: Stripe integration | Santhuka |
| CUR-128 | Transaction Monitor Dashboard | Unassigned |
| CUR-129 | Refund Manager | Unassigned |
| CUR-130 | Payment Analytics Dashboard | Unassigned |
| CUR-131 | Dispute Center | Unassigned |
| CUR-132 | Subscription Billing Monitor | Unassigned |

**Santhuka owns CUR-122** but 5 subtasks are unassigned. Needs Stripe credentials and test account.

### Admin Prototyping (25 subtasks — CUR-54 to CUR-78)

All assigned to Ruchiran. These are UI prototyping tasks for the new admin dashboard:

| Range | Domain | Count |
|-------|--------|-------|
| CUR-54-57 | User & Seller Management | 4 |
| CUR-58-61 | Order & Fulfillment | 4 |
| CUR-62-65 | Financials & Payouts | 4 |
| CUR-66-69 | Promotions & Plans | 4 |
| CUR-70-72 | Content & Catalog | 3 |
| CUR-73-75 | Analytics & Insights | 3 |
| CUR-76-78 | Support & Operations | 3 |

**Parent stories** (CUR-47-53) assigned to Ramesh. This creates a confusing ownership split.

### User Flow Prototyping (14 tickets)

| Key | Summary | Status | Assignee |
|-----|---------|--------|----------|
| CUR-10 | Home Screen (Restaurant List) | UAT | Ruchiran |
| CUR-11 | Search Results Screen | UAT | Ruchiran |
| CUR-12 | Restaurant Details Screen | UAT | Ruchiran |
| CUR-13 | Menu Item Detail / Customize | UAT | Ruchiran |
| CUR-14 | Cart Screen (Order Summary) | **In Progress** | Ruchiran |
| CUR-20 | Order Status Timeline | To Do | Ramesh |
| CUR-21 | Order Completion & Feedback | To Do | Ramesh |
| CUR-23-28 | Profile, Addresses, Payment, Favorites, History | To Do | Ramesh |

### Seller Portal Prototyping (7 stories)

| Key | Summary | Assignee |
|-----|---------|----------|
| CUR-32 | Seller Onboarding | Ramesh |
| CUR-33 | Menu Management | Ramesh |
| CUR-34 | Order Management | Ramesh |
| CUR-35 | Payouts & Financial Reporting | Ramesh |
| CUR-36 | Seller Support | Ramesh |
| CUR-37 | Customer Feedback Dashboard | Ramesh |
| CUR-38 | Promotions & Discounts | Ramesh |

### Driver Portal (2 stories)

| Key | Summary | Assignee |
|-----|---------|----------|
| CUR-42 | Navigation & Delivery Flow | Ramesh |
| CUR-44 | Driver Support & Reporting | Ramesh |

### Portal Activation (2 tasks — UAT)

| Key | Summary | Status | Assignee |
|-----|---------|--------|----------|
| CUR-154 | Admin portal: Activation Check | UAT | Deshan |
| CUR-155 | Restaurant portal: Activation Check | UAT | Deshan |

### Branding (2 stories — SIT)

| Key | Summary | Status | Assignee |
|-----|---------|--------|----------|
| CUR-3 | Design And Branding Guidelines | SIT | Deshan |
| CUR-8 | Logo and Brand Name | SIT | Deshan |

### Special: Auto-Cancellation (1 task)

| Key | Summary | Note |
|-----|---------|------|
| CUR-156 | Auto-cancel stale orders | **DUPLICATE of CAR-206** — confirmed in prior audit |

---

## Epics

| Key | Epic Name | Active Tickets | Status |
|-----|-----------|---------------|--------|
| CUR-1 | Epic 11: Platform Configuration & API Foundation | 14 stories | To Do |
| CUR-133 | Epic 10: Multi-Channel Notifications | 6 stories | To Do |
| CUR-119 | Epic: Third-Party Integration Services | Stripe subtasks | To Do |
| CUR-112 | Epic 8: Subscription Lifecycle | 0 direct | To Do |
| CUR-111 | Epic 9: Platform Analytics & BI | 0 direct | To Do |
| CUR-110 | Epic 11: Cross-Platform Integration | 0 direct | To Do |
| CUR-2 | UI/UX: User Onboarding & Auth | 0 direct | To Do |
| CUR-9 | Restaurant Discovery & Search | 4 prototypes in UAT | To Do |
| CUR-15 | UI/UX: Checkout & Payment Flow | 1 in progress | To Do |
| CUR-19 | UI/UX: Order Tracking & Delivery | 2 prototypes | To Do |
| CUR-22 | UI/UX: User Profile & Account | 6 prototypes | To Do |
| CUR-29 | Seller Portal Development | 7 stories | To Do |
| CUR-30 | Food Delivery Persons Portal | 2 stories | To Do |
| CUR-46 | [ARCHIVED] Legacy Admin Prototyping | — | Archived |

---

## Cross-Project Dependencies

### CUR → Current Platform (Laravel)

| CUR Ticket | Depends On | Current Status | Nature |
|------------|-----------|----------------|--------|
| CUR-148 | CAD-149 (Cart validation) | In Progress | Cart validation logic informs API design |
| CUR-149 | CAR-207 (Notification bug), CAR-198 (Order status) | In Progress / To Do | Order flow bugs inform API design |
| CUR-151 | PACK-105, CUR-122 | To Do | 3 Stripe tickets need coordination |
| CUR-138 | CAR-202 (Email link), CAD-222 (OTP bug) | To Do | Email bugs inform notification design |
| CUR-152 | PACK-199 (Notification text), CAR-207 | In Progress | Notification bugs inform Firebase design |
| CUR-156 | CAR-206 | To Do | **DUPLICATE** — merge into CUR-156 |

### CUR → PACK (Mobile)

| CUR Ticket | Related PACK | Nature |
|------------|-------------|--------|
| CUR-148 | PACK-224 (Back nav), PACK-184 (Checkout state) | Shared checkout UX concerns |
| CUR-149 | PACK-210 (Track order) | Order API consumers |
| CUR-151 | PACK-105 (Stripe SDK) | Payment integration alignment |
| CUR-152 | PACK-169/170 (Notifications) | Push notification alignment |

---

## Key Risks

1. **Ramesh has 37 CUR tickets + 92 CAD/CAR = 129 total** — unsustainable workload
2. **Zero completed tickets in 30 days** — no momentum
3. **Epic 11 is the critical path** but all 14 stories are To Do
4. **Platform direction unclear** — is CUR replacing Laravel or proxying to it?
5. **Prototyping work (37 tickets)** consumes Ramesh's capacity with no production value yet
6. **7 tickets in UAT** but nobody seems to be validating them
7. **CUR-156 is confirmed duplicate** of CAR-206 — still not linked/resolved
8. **Stripe coordination** needed across CUR-122, CUR-151, PACK-105 — no one coordinating

---

## Recommendations

1. **Decision D6 (from prior audit)**: Deprioritize CUR prototyping to free Ramesh for CAD/CAR backend
2. **Close CUR-156** as duplicate of CAR-206
3. **Validate UAT tickets** (CUR-7/10/11/12/13) — they've been sitting untouched
4. **Assign CUR subtasks** (CUR-128-132) — 5 Stripe subtasks have no owner
5. **Clarify Epic 11 strategy** — build on Supabase (new) vs proxy to Laravel (existing)?
6. **Break prototyping into sprints** — don't assign all 37 to Ramesh simultaneously
