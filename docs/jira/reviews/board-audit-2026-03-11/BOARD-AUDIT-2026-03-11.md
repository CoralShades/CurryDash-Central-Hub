# Full 4-Project Board Audit — 2026-03-11

> **Scope**: CAD (Admin), CAR (Seller), PACK (Mobile), CUR (New Platform)
> **Total tickets analyzed**: 490 (445 active + 45 completed)
> **Planning files**: `task_plan.md`, `findings.md`, `progress.md` (root of repo)
> **To continue in a new session**: Read this file + `DECISIONS-NEEDED.md` + `progress.md`

---

## Board Inventory

| Project | Total Active | In Progress | DevTested/SIT/UAT | To Do | Epics | Unassigned |
|---------|-------------|-------------|-------------------|-------|-------|------------|
| **CAD** (Admin) | 100 | 6 | 17 | 77 | 12 | 4 |
| **CAR** (Seller) | 100 | 8 | 3 | 89 | 10 | 8 |
| **PACK** (Mobile) | 100 | 0 | 0 | 100 | 14 | 75 |
| **CUR** (Platform) | 100 | 1 | 7 | 92 | 12 | 9 |
| **Completed** | 45 | — | — | — | — | — |

### Developer Workload

| Developer | CAD | CAR | PACK | CUR | Total | Overloaded? |
|-----------|-----|-----|------|-----|-------|-------------|
| **Ramesh** (Laravel/PHP/SQL) | 29 | 26 | 1 | 36 | **92** | YES — 37 CUR prototyping |
| **Ruchiran** (Flutter/Firebase/GCP) | 2 | 0 | 8 | 16 | **26** | Moderate |
| **Kasun** (QA/Testing) | 22 | 4 | 2 | 0 | **28** | OK |
| **Minuri** (Stories/PM) | 0 | 24 | 1 | 0 | **25** | OK |
| **Unassigned** | 4 | 8 | 75 | 9 | **96** | 96 tickets with no owner |

---

## CAD Project — All Active Backend Tickets

### In Progress (6)

| Key | Type | Assignee | Summary | Parent |
|-----|------|----------|---------|--------|
| CAD-149 | Backend Task | Ramesh | Remove deleted/deactivated Packages and food items from carts | CAD-146 |
| CAD-98 | Story | Ramesh | Story 4.3: Vendor Profile Management | Epic 4 |
| CAD-202 | Backend Task | Ramesh | Add "Package" Module Permission and Review Module Permission Structure | Epic 6 |
| CAD-105 | Story | Kasun | Story 4.10: Order Intervention | Epic 4 |
| CAD-104 | Story | Kasun | Story 4.9: Platform Order Monitoring | Epic 4 |
| CAD-113 | Story | Kasun | Story 6.1: Admin Account Management | Epic 6 |

### DevTested (14)

| Key | Type | Assignee | Summary |
|-----|------|----------|---------|
| CAD-205 | Bug | Ruchiran | Package Status Validation Missing in Admin Portal |
| CAD-67 | Frontend Task | Ramesh | Package Deletion & Secondary Management |
| CAD-66 | Frontend Task | Ramesh | Admin Package Detail & Modification |
| CAD-178 | Bug | Ramesh | Package Image Not Displayed After Order Placement |
| CAD-82 | Frontend Task | Ramesh | Packages tab on restaurant page |
| CAD-81 | Backend Task | Ramesh | Package view functionality on admin portal |
| CAD-94 | Frontend Task | Ramesh | Redesign restaurant review page |
| CAD-182 | Backend Task | Ramesh | Relabel TIN to TFN |
| CAD-65 | Frontend Task | Ramesh | Admin Package Management Dashboard |
| CAD-180 | Backend Task | Ramesh | Draft Status and Save as Draft for Packages |
| CAD-197 | Backend Task | Ruchiran | Change Order Notification naming to Currydash |
| CAD-194 | Backend Task | Ruchiran | Updated minimum order check to include package totals |
| CAD-173 | Backend Task | Ruchiran | Replace Legacy CAPTCHA with Frictionless Bot Detection |
| CAD-68 | Backend Task | Ramesh | Override & Manage Restaurant Delivery Days |

### SIT (3)

| Key | Type | Assignee | Summary |
|-----|------|----------|---------|
| CAD-97 | Story | Ramesh | Story 4.2: Application Approval/Rejection |
| CAD-99 | Story | Ramesh | Story 4.4: Vendor Account Suspension |
| CAD-100 | Story | Ramesh | Story 4.5: Vendor Search & Filtering |
| CAD-142 | Story | Ramesh | Introduce ABN field for restaurants |

### To Do — Ramesh (Backend Tasks & Bugs)

| Key | Type | Summary | Parent/Epic | Cluster |
|-----|------|---------|-------------|---------|
| CAD-222 | Bug | Mobile Signup – OTP and Registration Emails Triggered Simultaneously | — | Notification |
| CAD-221 | Bug | Vendor Not Receiving Notification When Order is Cancelled by Admin | — | Notification |
| CAD-220 | Bug | Incomplete Order Timeline in Order Details | — | Order |
| CAD-207 | Bug | User Role Not Displayed in Employee List | — | Permission |
| CAD-181 | Backend Task | Implement "Draft" Status and Workflow for Food Items | Epic 2 | Draft |
| CAD-179 | Backend Task | New Employee Permission Module: Packages | Epic 6 | Permission (DUP of CAD-202) |
| CAD-183 | Backend Task | Implement Admin Global Notification Panel | Epic 10 | Notification |
| CAD-186 | Backend Task | Implement Image Compression for All Media Uploads | — | Standalone |
| CAD-195 | Story | Comprehensive Notification System | Epic 10 | Notification (umbrella) |
| CAD-193 | Story | Story 2.A3: Admin Menu Standards Configuration | Epic 2 | Standalone |
| CAD-189 | Story | Story 8.1: Subscription Plan Templates | Epic 8 | Subscription |
| CAD-190 | Story | Story 8.2: Trial Period Management | Epic 8 | Subscription |
| CAD-2 | Backend Task | User Access Control & Role Management | — | Permission |

### To Do — Ramesh (Subtasks — Vendor Management)

| Key | Summary | Parent |
|-----|---------|--------|
| CAD-208 | Request More Info — Backend | CAD-97 |
| CAD-209 | Request More Info — Admin & Vendor UI | CAD-97 |
| CAD-210 | Email Templates Setup | CAD-97 |
| CAD-211 | Privacy Policy CMS Page | CAD-97 |
| CAD-212 | Audit Log — Backend | CAD-98 |
| CAD-213 | Audit Log — Admin UI | CAD-98 |
| CAD-214 | Multi-Location Management | CAD-98 |
| CAD-215 | ABN Approval Queue + Name Sync Fix | CAD-98 |
| CAD-216 | Performance Service | CAD-101 |
| CAD-217 | Performance Controller & Routes | CAD-101 |
| CAD-218 | Performance Tab UI | CAD-101 |
| CAD-219 | Platform Benchmarks & Warnings | CAD-101 |

### To Do — Kasun (Stories & Testing)

| Key | Type | Summary | Parent |
|-----|------|---------|--------|
| CAD-135 | Story | Story 9.8: Subscription vs On-Demand Analysis | Epic 9 |
| CAD-112 | Story | Story 5.7: Knowledge Base Access | Epic 5 |
| CAD-110 | Story | Story 5.5: Issue Escalation | Epic 5 |
| CAD-109 | Story | Story 5.4: Public Review Responses | Epic 5 |
| CAD-103 | Story | Story 4.8: Quality Assessment Scheduling | Epic 4 |
| CAD-111 | Story | Story 5.6: Case Notes Documentation | Epic 5 |
| CAD-107 | Story | Story 5.2: Complete Order Context View | Epic 5 |
| CAD-106 | Story | Story 5.1: Complaint Queue Management | Epic 5 |
| CAD-102 | Story | Story 4.7: Quality Review Flagging | Epic 4 |
| CAD-140 | Backend Task | Setup zones for 3174 and 3168 | — |
| CAD-136 | Story | Story 9.9: Financial Report Generation | Epic 9 |
| CAD-134 | Story | Story 9.7: Geographic Order Distribution | Epic 9 |
| CAD-131 | Story | [CROSS-REF] Story 9.4: Ratings & Feedback View | Epic 9 |
| CAD-130 | Story | [CROSS-REF] Story 9.3: Platform Benchmarking | Epic 9 |
| CAD-129 | Story | [CROSS-REF] Story 9.2: Sales Trends Analysis | Epic 9 |
| CAD-127 | Story | Story 7.8: Commission Calculation | Epic 7 |
| CAD-126 | Story | Story 7.7: Manual Adjustments | Epic 7 |
| CAD-125 | Story | Story 7.6: Admin Payout Management | Epic 7 |
| CAD-124 | Story | [CROSS-REF] Story 7.5: Annual Tax Summary | Epic 7 |
| CAD-123 | Story | [CROSS-REF] Story 7.4: Monthly Statements | Epic 7 |
| CAD-122 | Story | [CROSS-REF] Story 7.3: Withdrawal Requests | Epic 7 |
| CAD-121 | Story | [CROSS-REF] Story 7.2: Payout History | Epic 7 |
| CAD-120 | Story | [CROSS-REF] Story 7.1: Earnings Dashboard | Epic 7 |
| CAD-119 | Story | Story 6.7: Comprehensive Audit Trail | Epic 6 |
| CAD-118 | Story | Story 6.6: Accountant Role Access | Epic 6 |
| CAD-74..93 | Testing Tasks | 14 testing tasks across Epics 2, 4, 6 | Various |

### To Do — Ruchiran

| Key | Type | Summary |
|-----|------|---------|
| CAD-206 | Bug | No Email Notification Sent When Super Admin Updates an Admin Password |
| CAD-198 | Frontend Task | Implement live streaming polling for admin & vendor in Chat |
| CAD-188 | Devops Task | UI/UX 'Delete Package' action success message |
| CAD-71 | Frontend Task | Global System Activity & History Trackings Log |

### To Do — Unassigned

| Key | Type | Summary | Notes |
|-----|------|---------|-------|
| CAD-203 | Bug | Customer Name Search Not Returning Matching Orders | Backend query fix |
| CAD-200 | Bug | Package Section Not Accessible + No Audit Trail | Same root cause as CAD-202 |
| CAD-204 | Bug | DO NOT ACTION: Deactivate/Reactivate for Admin | Parked |

### Parked / DO NOT ACTION

| Key | Summary | Reason |
|-----|---------|--------|
| CAD-148 | Replace Delete with Hide/Archive | Superseded by Draft workflow |
| CAD-150 | Cancel ongoing orders with deleted items | Depends on CAD-149 |
| CAD-177 | Suspended Restaurant visible to customers | Parked |
| CAD-204 | Deactivate/Reactivate Admin | Parked |

---

## CAR Project — All Active Backend Tickets

### In Progress (8)

| Key | Type | Assignee | Summary | Parent |
|-----|------|----------|---------|--------|
| CAR-178 | Bug | Ramesh | Employees cannot log into merchant panel | — |
| CAR-179 | Bug | Ramesh | Date Range filter not available | Epic 3 |
| CAR-207 | Bug | Ramesh | Order Placed Notification Before Order Placed | — |
| CAR-170 | Backend Task | Ramesh | Draft Status and Workflow for Food Items | — |
| CAR-105 | Story | Minuri | Story 1.1: Vendor Registration | Epic 1 |
| CAR-108 | Story | Minuri | Story 1.4: Restaurant Profile Setup | Epic 1 |
| CAR-112 | Story | Minuri | Story 1.8: Staff Access Delegation | Epic 1 |
| CAR-118 | Story | Minuri | Story 2.6: Package Configuration Groups | Epic 2 |

### DevTested (3)

| Key | Type | Assignee | Summary |
|-----|------|----------|---------|
| CAR-145 | Frontend Task | Ramesh | Vendor Account Suspension |
| CAR-172 | Backend Task | Ramesh | Relabel TIN to TFN |
| CAR-149 | Backend Task | Ruchiran | Replace Legacy CAPTCHA with Frictionless Bot Detection |

### To Do — Ramesh

| Key | Type | Summary | Cluster |
|-----|------|---------|---------|
| CAR-156 | Story | Holiday Hours / Specific Dates (5 subtasks) | Schedule |
| CAR-201 | Bug | ABN Field Not Mandatory | ABN |
| CAR-146 | Backend Task | Removing food items from packages | Package |
| CAR-148 | Backend Task | ABN Validation for Vendor CRUD | ABN |
| CAR-147 | Backend Task | Vendor panel audit logs | Audit |
| CAR-169 | Backend Task | Draft Status for Packages | Draft |
| CAR-96 | Backend Task | Global Delivery Date Setting | Schedule |
| CAR-144 | Story | Display ABN | ABN |
| CAR-28 | Backend Task | PKG-001: Database Schema Enhancement | Package |
| CAR-29 | Backend Task | PKG-002: Vendor Package Backend Logic | Package |
| CAR-30 | Frontend Task | PKG-003a: Vendor Package UI | Package |
| CAR-193 | Story | Story 9.5: Report Export | Epic 9 |
| CAR-192 | Story | Story 9.4: Ratings & Feedback View | Epic 9 |
| CAR-191 | Story | Story 9.3: Platform Benchmarking | Epic 9 |
| CAR-190 | Story | Story 9.2: Sales Trends Analysis | Epic 9 |
| CAR-189 | Story | Story 9.1: Vendor Metrics Dashboard | Epic 9 |
| CAR-188 | Story | Story 7.5: Annual Tax Summary | Epic 7 |
| CAR-187 | Story | Story 7.4: Monthly Statements | Epic 7 |
| CAR-186 | Story | Story 7.3: Withdrawal Requests | Epic 7 |
| CAR-185 | Story | Story 7.2: Payout History | Epic 7 |
| CAR-184 | Story | Story 7.1: Earnings Dashboard | Epic 7 |

### To Do — Ramesh (Subtasks — Holiday Hours)

| Key | Summary | Parent |
|-----|---------|--------|
| CAR-208 | Holiday System — Database & Models | CAR-156 |
| CAR-209 | Admin Holiday Management | CAR-156 |
| CAR-210 | Vendor Schedule Exceptions | CAR-156 |
| CAR-211 | Schedule API Endpoint | CAR-156 |
| CAR-212 | Flutter App — Holiday Awareness | CAR-156 |

### To Do — Minuri (20+ stories)

| Key | Summary | Epic | Status |
|-----|---------|------|--------|
| CAR-106 | Story 1.2: Document Upload & Verification | Epic 1 | To Do |
| CAR-107 | Story 1.3: Application Status Tracking | Epic 1 | To Do |
| CAR-109 | Story 1.5: Operating Hours Configuration | Epic 1 | To Do |
| CAR-110 | Story 1.6: Delivery Zone Definition | Epic 1 | To Do |
| CAR-111 | Story 1.7: Multi-Location Management | Epic 1 | To Do |
| CAR-114 | Story 2.2: Menu Category Organization | Epic 2 | To Do |
| CAR-121..124 | Stories 2.9-2.12 | Epic 2 | To Do |
| CAR-126..134 | Stories 3.2-3.9 | Epic 3 | To Do |
| CAR-135..142 | Stories 8.1-8.8 | Epic 8 | To Do |

### To Do — Unassigned

| Key | Type | Summary | Notes |
|-----|------|---------|-------|
| CAR-206 | Backend Task | Auto-Cancellation for Unaccepted Scheduled Orders | **DUPLICATE of CUR-156** |
| CAR-205 | Backend Task | Handling inactive food items | **DUPLICATE of CAR-146** |
| CAR-204 | Frontend Task | Disable Delete for packages | **CONTRADICTS CAD-67** |
| CAR-203 | Frontend Task | Disable Delete for food items | Same pattern as CAR-204 |
| CAR-198 | Bug | Order Status "Placed" Before Payment | Blocks PACK-106 + CAR-200 |
| CAR-195 | Bug | Misleading error on Config Group reorder | Frontend fix |
| CAR-202 | Bug | Verification Email wrong link/username | Email template |
| CAR-98 | Backend Task | DO NOT ACTION: Admin Intervention Notifications | Parked |

---

## PACK Project — All Backend-Dependent Tickets

### Bugs (backend dependency)

| Key | Summary | Depends On | Assignee |
|-----|---------|-----------|----------|
| PACK-222 | ISE when cart item deleted from menu | CAD-149 | Unassigned |
| PACK-226 | Editing Package Config creates duplicate cart item | CAD-149 investigation | Unassigned |
| PACK-216 | Cart not cleared on suspended restaurant | CAD-177 (parked) | Unassigned |
| PACK-205 | Signup "Failed to send mail" | CAD-222 | Ramesh |
| PACK-199 | Wrong notification for "Ready for Handover" | CAR-207 fix | Unassigned |
| PACK-210 | Track Order button + delivery time issues | CUR-149 | Unassigned |
| PACK-200 | Cannot filter by delivery availability | CAR-96 | Unassigned |
| PACK-224 | Cannot navigate back from payment page | Checkout flow | Unassigned |
| PACK-212 | Restaurants not sorted by relevance/distance | Backend search | Unassigned |
| PACK-209 | Dietary Notes Warning Icons not applicable | TBC | Unassigned |
| PACK-221 | Bottom nav hidden by Order Processing bar | UI-only | Unassigned |
| PACK-193 | UI Overflow on Android | UI-only | Unassigned |

### Bugs (Flutter-side — Ruchiran)

| Key | Summary |
|-----|---------|
| PACK-184 | Address/time not retained at checkout |
| PACK-178 | Network failure infinite loading |
| PACK-177 | Deleted address persists after logout/login |

### Tasks (backend dependency)

| Key | Summary | Depends On | Assignee |
|-----|---------|-----------|----------|
| PACK-190 | Replace Cuisines with Packages | CAR-28/29/30 | Unassigned |
| PACK-146 | Vendor Package Config Backend Support | CAR-28/29 | Unassigned |
| PACK-105 | Integrate Stripe SDK | CUR-151 coordination | Unassigned |
| PACK-198 | INVESTIGATE: Package Ordering Bugs | — | Kasun |
| PACK-194 | Full Name field in registration | Registration flow | Unassigned |
| PACK-151 | Story 6.5: Complete Payment | Epic 6 | Unassigned |
| PACK-136 | Story 3.5: Payment Method Management | Epic 3 | Minuri |

### Ruchiran — Brand & UI Tasks

| Key | Summary |
|-----|---------|
| PACK-21..34 | 11 brand identity tasks (colors, fonts, spacing, buttons, etc.) |
| PACK-27 | Primary CTA Button Styling |

---

## CUR Project — All Active Tickets

### In Progress / SIT / UAT

| Key | Status | Assignee | Summary |
|-----|--------|----------|---------|
| CUR-14 | In Progress | Ruchiran | Prototyping: Cart Screen |
| CUR-8 | SIT | Demi | Prepare Logo and Brand Name |
| CUR-3 | SIT | Demi | Design And Branding Guidelines |
| CUR-155 | UAT | Demi | Restaurant portal: Activation Check |
| CUR-154 | UAT | Demi | Admin portal: Activation Check |
| CUR-10..13 | UAT | Ruchiran | 4 prototyping screens |
| CUR-7 | UAT | Ruchiran | Prototyping: Forgot Password |

### To Do — Epic 11: Platform Configuration & API (Ramesh)

| Key | Summary | Notes |
|-----|---------|-------|
| CUR-140 | Platform-Wide Settings Configuration | — |
| CUR-141 | Zone Management | — |
| CUR-142 | Promotional Banners | — |
| CUR-143 | Commission Structure Configuration | — |
| CUR-144 | Category Management | — |
| CUR-145 | Feature Flags | — |
| CUR-146 | Customer Authentication API | — |
| CUR-147 | Package & Food Browsing API | — |
| CUR-148 | Cart & Checkout API | Informed by CAD-149 fix |
| CUR-150 | Subscription Management API | — |
| CUR-151 | Stripe Payment Integration | 3 Stripe tickets across projects |
| CUR-152 | Firebase Push Notifications | — |
| CUR-153 | API Authentication & Security | — |

### To Do — Epic 10: Notifications (Ramesh)

| Key | Summary |
|-----|---------|
| CUR-134 | Vendor New Order Notifications |
| CUR-135 | Order Status Change Notifications |
| CUR-136 | Customer Order Update Notifications |
| CUR-137 | Admin Performance Alerts |
| CUR-138 | Email Notifications |
| CUR-139 | SMS Notifications |

### To Do — Order Management (Ruchiran)

| Key | Summary |
|-----|---------|
| CUR-149 | Order Management API |

### To Do — Stripe Admin Dashboard (Santhuka)

| Key | Summary |
|-----|---------|
| CUR-122 | Admin dashboard: Stripe integration |
| CUR-128 | Transaction Monitor Dashboard |
| CUR-129 | Refund Manager |
| CUR-130 | Payment Analytics Dashboard |
| CUR-131 | Dispute Center |
| CUR-132 | Subscription Billing Monitor |

### To Do — Standalone

| Key | Assignee | Summary |
|-----|----------|---------|
| CUR-156 | Unassigned | Auto-Cancellation and Refund Logic (duplicate of CAR-206) |

### To Do — Prototyping (non-prd-scope — RECOMMEND DEPRIORITIZE)

| Range | Count | Assignee | Summary |
|-------|-------|----------|---------|
| CUR-47..53 | 7 stories | Ramesh | Admin prototyping |
| CUR-54..78 | 22 subtasks | Ruchiran | Admin prototyping subtasks |
| CUR-27..28 | 2 stories | Ramesh | User profile prototyping |
| CUR-20..21 | 2 stories | Ramesh | Order tracking prototyping |
| CUR-32..38 | 7 stories | Ramesh | Seller portal prototyping |
| CUR-42..44 | 2 stories | Ramesh | Driver portal prototyping |
| **Total** | **37+** | Ramesh+Ruchiran | **Deprioritize to free capacity** |

---

## Completed Tickets (45) — Cross-Reference

| Key | Status | Assignee | Summary | Informs |
|-----|--------|----------|---------|---------|
| CAD-180 | DevTested | Ramesh | Draft for Packages | CAR-169 can proceed |
| CAD-68 | DevTested | Ramesh | Restaurant Delivery Days Override | CAR-96, PACK-200 |
| CAD-67 | DevTested | Ramesh | Package Deletion | **CONTRADICTS** CAR-204 |
| CAD-178 | DevTested | Ramesh | Package Image bug | CAD-186 enhancement |
| CAD-194 | DevTested | Ruchiran | Min order + package totals | PACK-226 interaction |
| CAD-142 | SIT | Ramesh | ABN field introduced | CAR-148, CAR-201 |
| CAD-182 | DevTested | Ramesh | TIN→TFN (admin) | Test with CAR-172 |
| CAD-173 | DevTested | Ruchiran | CAPTCHA (admin) | Test with CAR-149 |
| CAD-97 | SIT | Ramesh | Application Approval | Subtasks CAD-208..211 ready |
| CAD-99 | SIT | Ramesh | Vendor Suspension | Linked to CAR-145 |
| CAD-100 | SIT | Ramesh | Vendor Search & Filtering | Complete |
| CAR-172 | DevTested | Ramesh | TIN→TFN (seller) | Test with CAD-182 |
| CAR-149 | DevTested | Ruchiran | CAPTCHA (seller) | Test with CAD-173 |
| CAR-128 | DevTested | Minuri | Order Details View | CAD-220 enhancement |
| CAR-125 | DevTested | Minuri | Real-Time Dashboard | CAR-179 (date filter) |
| CAR-113..120 | DevTested | Minuri | 7 Epic 2 stories | CAR-118 In Progress |
| CAR-35 | DevTested | Ramesh | Vendor Package Creation | — |
| CAR-95 | DevTested | Ramesh | Package Availability Calendar | — |
| CAD-185 | DevTested | Ruchiran | Cloud Run migrations setup | — |
| CAD-197 | DevTested | Ruchiran | Notification naming → Currydash | — |
| CAD-165..169 | DevTested | Demi | 5 GCP infra tasks | — |
| CAR-157 | Done | Demi | BMAD DocOps Integration | — |
| CAR-132 | Done | Minuri | Order History (closed as DUPLICATE of CAR-133) | — |
