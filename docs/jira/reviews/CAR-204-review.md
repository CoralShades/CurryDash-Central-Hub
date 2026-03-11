# CAR-204 Adversarial Review: Disable 'Delete' Action for Packages

**Ticket:** CAR-204 — Disable 'Delete' Action for Packages
**Reviewer:** QA Adversarial Review Agent
**Date:** 2026-03-06
**Related Tickets:** CAR-203 (food items equivalent), CAD-147 (admin-side cascade), CAR-205 (inactive food item handling)
**Verdict:** NOT READY FOR IMPLEMENTATION --- requires resolution of 7 critical and 9 high-severity findings before development begins.

---

## Table of Contents

1. [Adversarial Review](#1-adversarial-review)
2. [Edge Case Hunting](#2-edge-case-hunting)
3. [Implementation Readiness Check](#3-implementation-readiness-check)
4. [Cross-Ticket Dependencies](#4-cross-ticket-dependencies)
5. [Summary of Findings](#5-summary-of-findings)
6. [Recommended Actions](#6-recommended-actions)

---

## 1. Adversarial Review

### 1.1 Acceptance Criteria Testability

| AC # | Criterion | Testable? | Issues |
|------|-----------|-----------|--------|
| AC-1 | Delete button/action removed from packages in Vendor Portal | Yes | Clear and verifiable. |
| AC-2 | Inactive item moves to Inactive list | Partially | Does not specify timing ("immediately" is stated in description but not in AC). Does not define animation/transition behavior. Does not state whether list refreshes or uses optimistic UI. |
| AC-3 | Active item moves to Active list | Partially | Same issues as AC-2. Also: what status does a re-activated item get? "Active"? What if it was "Draft" before deactivation? |
| AC-4 | Both tabs contain columns, actions, filters | Yes | Columns are specified. However, the filter specification is asymmetric and may be incomplete (see 1.3). |
| AC-5 | Draft packages remain in active column | Partially | "Remain" implies they cannot be moved to Inactive. But can a Draft package be toggled inactive? The AC is ambiguous --- it could mean "Draft is a valid status in the Active tab" or "Draft packages cannot be deactivated." |

**Severity: CRITICAL** --- AC-2, AC-3, and AC-5 have ambiguity that will cause different developers to implement different behaviors.

### 1.2 Unstated Assumptions

| # | Assumption | Risk | Severity |
|---|------------|------|----------|
| A-1 | A `packages` table with an `is_active` boolean column already exists in the database. | The current CurryDash Central Hub schema (`20260218000001_initial_schema.sql`) has NO `packages` table. The PRD references a `packages` table (Section 3.5) and the Filament vendor portal (Laravel backend) has a PackageResource, but this is in the **separate Admin-Seller Portal** Laravel codebase, not this Next.js hub. The ticket does not specify which codebase this applies to. | CRITICAL |
| A-2 | The toggle API endpoint already exists or will be created as part of this ticket. | The ticket is typed as "Frontend Task" but requires a backend toggle endpoint. If the API does not exist, this ticket is unimplementable as scoped. | CRITICAL |
| A-3 | Package `status` field has defined enum values (Active, Draft, Inactive). | The ticket references "Active" and "Draft" as status picklist values but never defines the full enum. Is "Inactive" a status value or is it derived from `is_active = false`? Are status and is_active orthogonal fields or the same field? | HIGH |
| A-4 | The "Actions" column has been defined for what actions remain (after delete removal). | The ticket says "actions (minus delete button)" but never enumerates what actions exist. Edit? View? Duplicate? Toggle? Without knowing the current action set, "minus delete" is not fully specifiable. | MEDIUM |
| A-5 | Empty state designs exist or are deferred to design. | "Add appropriate empty state illustrations/text" is a design deliverable. Are designs provided? Placeholder text is mentioned but no Figma/mockup reference. | LOW |
| A-6 | The vendor can only see their own packages (data isolation). | Not stated in ticket. The PRD (Section 3.5) confirms vendor data isolation, but this ticket should reference it. | LOW |

### 1.3 Contradictions and Inconsistencies

**CONTRADICTION 1: Filter asymmetry without rationale** (Severity: HIGH)

The Active tab has filters: `Search field (text), Status picklist (Active, Draft), Reset button`.
The Inactive tab has filters: `Search field (text), Reset button`.

Why does the Inactive tab lack a Status picklist? If inactive items can have different statuses (e.g., a package was Draft when deactivated vs. Active when deactivated), filtering by original status could be useful. The ticket does not explain this asymmetry. More critically: what status does an inactive item display? If `is_active = false` and `status = Active`, the Status column will show "Active" on the Inactive tab, which is confusing.

**CONTRADICTION 2: "Draft should remain in active column" vs. toggle behavior** (Severity: HIGH)

AC-5 states "Packages with the status 'Draft' should remain in active column." This creates two possible interpretations:

- **Interpretation A:** Draft packages are displayed on the Active tab (because Draft is an active-side status). They CAN be toggled inactive.
- **Interpretation B:** Draft packages are LOCKED to the Active tab and CANNOT be toggled inactive.

If Interpretation A: the AC is merely a display rule and is trivially satisfied by the `is_active = true` default for new/draft packages.
If Interpretation B: the toggle button should be disabled or hidden for Draft packages, which needs explicit UI specification.

**CONTRADICTION 3: CAR-204 vs. CAR-203 filter divergence** (Severity: MEDIUM)

CAR-203 (food items) specifies the same filters for BOTH tabs: `Search field (text), Categories (picklist), Dietary Type (picklist)`. CAR-204 has different filters per tab. This inconsistency suggests either (a) a deliberate design decision that is not documented, or (b) an oversight. If the tabs are supposed to share a component (see Section 3), this divergence complicates reuse.

**CONTRADICTION 4: "Item number" column vs. package identity** (Severity: LOW)

The columns list includes "Item number." For food items (CAR-203), an item number is natural. For packages, is this a package ID, a sequential number, or an auto-generated code? The PRD does not mention a vendor-facing package number. Using the internal database UUID would be a poor UX choice.

### 1.4 Developer Misinterpretation Risks

| # | Risk | Likely Misinterpretation | Severity |
|---|------|--------------------------|----------|
| M-1 | The ticket says "toggle" but does not specify the UI control. | Developer may implement a switch/toggle component, a button with confirmation dialog, or a dropdown action. Each has different UX implications. | HIGH |
| M-2 | "Immediately move" could mean optimistic UI or server-round-trip. | If optimistic: what happens on API failure? If server-round-trip: what loading state during transition? Neither is specified. | MEDIUM |
| M-3 | The ticket does not specify a confirmation dialog for deactivation. | CAD-147 specifies a warning dialog when deactivating food items linked to packages. CAR-204 does not specify any confirmation for deactivating packages, even though packages may be in customer carts or active orders. A developer may implement no confirmation, which could be a UX regression. | HIGH |
| M-4 | No specification for bulk toggle. | Can a vendor select multiple packages and toggle them all at once? FR138-F1 in the PRD references bulk availability toggle for food items. Packages are not mentioned. Developers may or may not implement this. | MEDIUM |

### 1.5 The Draft-Inactive-Edit Question

**Specific question raised:** "What about a package that was Active, then toggled Inactive, then edited --- does it become Draft again?"

The ticket is completely silent on this. The status lifecycle is undefined. Possible behaviors:

1. **Status is frozen during inactivation.** A package that was "Active" and toggled inactive retains `status = Active` but `is_active = false`. When re-activated, it returns as "Active." If edited while inactive, it stays "Active" (or becomes "Draft" if edits are significant).

2. **Status resets on edit.** Any edit to an inactive package resets it to "Draft." Re-activation then puts a Draft package on the Active tab.

3. **Editing inactive packages is disallowed.** The vendor must re-activate first, then edit.

**Severity: CRITICAL** --- This is a fundamental workflow question that affects data model design, UI behavior, and the meaning of the Status column.

---

## 2. Edge Case Hunting

### 2.1 Package-Food Item Interaction Cascade

| # | Edge Case | Expected Behavior? | Specified? | Severity |
|---|-----------|---------------------|------------|----------|
| E-1 | ALL food items in a package are deactivated (via CAR-203/CAD-147). | CAD-147 says package should become "Incomplete/Inactive" and vendor notified. But CAR-204 does not mention system-triggered deactivation at all. The Inactive tab will show these packages, but the vendor may not understand WHY they appeared there. | Partially (in CAD-147, not in CAR-204) | CRITICAL |
| E-2 | Vendor deactivates a package --- do its food items stay active? | Logically yes (food items are independent entities per PRD Section 3.5, Tier 3). But this is not stated. A developer might cascade the deactivation. | No | HIGH |
| E-3 | Package contains an inactive food item --- is the package auto-deactivated? | CAD-147 says the food item is "unassigned" from the package, not that the package is auto-deactivated (unless it becomes empty/incomplete). But what is "incomplete"? Is a package with 2/3 required items "incomplete"? | Partially | HIGH |
| E-4 | Package has 0 items (all removed via CAD-147 cascade). Can it be toggled Active? | Undefined. An empty package should arguably NOT be activatable. But no validation rule is specified in CAR-204. | No | HIGH |

### 2.2 Data Persistence During Toggle

| # | Edge Case | Expected Behavior? | Specified? | Severity |
|---|-----------|---------------------|------------|----------|
| E-5 | Package price persists when toggled Inactive and back to Active. | Should persist (it is a database field, toggling `is_active` should not touch price). But if the toggle endpoint does anything beyond flipping `is_active`, price could be affected. | No (implied by "toggle" semantics) | MEDIUM |
| E-6 | Package images persist during toggle cycle. | Same as E-5. Images are stored references; they should persist. But if the storage layer has cleanup jobs for "inactive" content, images could be purged. | No | MEDIUM |
| E-7 | Package configurations (Tier 2) and options (Tier 3) persist during toggle. | The entire 3-tier hierarchy must remain intact. A toggle should only flip `is_active` on the Package (Tier 1) record. If it cascades to configurations/options, re-activation becomes a reconstruction nightmare. | No | HIGH |
| E-8 | Active -> Inactive -> Active produces identical package state. | Round-trip fidelity is not guaranteed unless explicitly designed. `updated_at` will change. Any audit log should record the toggle events. | No | MEDIUM |

### 2.3 Order and Cart Impact

| # | Edge Case | Expected Behavior? | Specified? | Severity |
|---|-----------|---------------------|------------|----------|
| E-9 | Package is in a customer's active cart when vendor deactivates it. | CAD-147 specifies cart handling for food items (flag as UNAVAILABLE, grey out, disable checkout). But CAD-147 does NOT mention packages in carts. If a customer has a configured package in their cart and the vendor deactivates it, what happens? The package-level deactivation is a different event than individual food item deactivation. | No | CRITICAL |
| E-10 | Package is part of an active/scheduled order when deactivated. | CAD-147's "Snapshot Rule" (Section 3) says placed orders must not change. This should apply to packages too, but CAR-204 does not reference this. | Partially (in CAD-147) | HIGH |
| E-11 | Package is part of an active subscription when deactivated. | The PRD (Section 3.5) mentions subscription-eligible packages. If a customer has a recurring subscription that includes a now-inactive package, what happens to the next delivery cycle? | No | CRITICAL |

### 2.4 UI Edge Cases

| # | Edge Case | Expected Behavior? | Specified? | Severity |
|---|-----------|---------------------|------------|----------|
| E-12 | Image column: placeholder for packages without images. | Not specified. The PRD (FR140) mentions multiple images per package. If a package has no image, the Image column needs a placeholder. The codebase references `FoodImage` with "placeholder SVG" (Epic 13) --- is there an equivalent `PackageImage`? | No | LOW |
| E-13 | Sort/filter: Active tab Status picklist --- both "Active" and "Draft" selected. | Standard multi-select behavior: show both. But if NO status is selected, does it show all or none? Reset button behavior is also unspecified (reset to default selection or clear all?). | No | LOW |
| E-14 | Pagination: many inactive packages. | If a vendor has 500 packages and deactivates 400, the Inactive tab needs pagination. Not mentioned. | No | LOW |
| E-15 | Tab count badges. | Should the tabs show counts (e.g., "Active (12)" / "Inactive (3)")? Not specified but is a common UX pattern that vendors would expect. | No | LOW |
| E-16 | Real-time updates: another vendor staff member deactivates a package while the current user is viewing the list. | The vendor portal supports staff delegated access (FR128). Two staff members could be managing packages simultaneously. If staff A deactivates a package that staff B is viewing on the Active tab, does it disappear in real-time? | No | MEDIUM |

### 2.5 Vendor-Level Edge Cases

| # | Edge Case | Expected Behavior? | Specified? | Severity |
|---|-----------|---------------------|------------|----------|
| E-17 | Can a vendor create a NEW package while having inactive packages? | Should be yes (inactive packages are historical, not blocking). But if there is a maximum package limit, do inactive packages count toward it? | No | MEDIUM |
| E-18 | Is there a maximum number of packages a vendor can have? | Not specified in the ticket or in the PRD sections reviewed. If a limit exists, toggling vs. deleting changes the calculus --- vendors can never free up "slots." | No | MEDIUM |
| E-19 | Package availability schedules (FR139 --- seasonal availability). | A package with seasonal dates (e.g., "Christmas Special" available Dec 1-31) that is toggled inactive --- does the seasonal schedule persist? When re-activated in November, does it become visible to customers on Dec 1 as expected? What if it was re-activated on Dec 15 --- does the end date still apply? | No | MEDIUM |
| E-20 | What about the vendor's storefront view? | The ticket only discusses the vendor's management screen. But deactivating a package must also remove it from the customer-facing storefront. Is this handled by the same `is_active` flag, or does storefront visibility use a separate mechanism? | No (assumed, not stated) | HIGH |

### 2.6 Admin Portal Interaction

| # | Edge Case | Expected Behavior? | Specified? | Severity |
|---|-----------|---------------------|------------|----------|
| E-21 | Admin portal: does admin see both Active/Inactive tabs too? | The note says "Admin users should still retain ability to permanently delete packages from admin portal." This addresses delete, but does the admin see the same tabbed layout? Can admin re-activate a vendor's inactive package? Can admin deactivate a vendor's active package? | No | MEDIUM |
| E-22 | Admin deletes a package that a vendor sees as "Inactive." | The vendor's Inactive tab shows the package. Admin hard-deletes it. The vendor refreshes --- the package vanishes entirely. Is this expected? Should the vendor see a "Deleted by Admin" status? | No | MEDIUM |

---

## 3. Implementation Readiness Check

### 3.1 Backend Requirements

| Requirement | Status | Notes | Blocker? |
|-------------|--------|-------|----------|
| `packages` table exists with `is_active` column | UNKNOWN | The CurryDash Central Hub (this repo) has no `packages` table in its schema. The PRD references the packages table in the Laravel Admin-Seller Portal codebase. **This ticket may target the wrong codebase**, or the packages schema needs to be ported/mirrored to this Next.js hub. | YES |
| Toggle API endpoint (`PATCH /api/packages/{id}/toggle-active`) | DOES NOT EXIST | No package-related API routes exist in `src/app/`. This must be created, but the ticket is typed as "Frontend Task." | YES |
| Zod validation schema for toggle request/response | DOES NOT EXIST | Per project rules, all Route Handlers validate with Zod. Must be created. | YES |
| Package status enum definition | UNDEFINED | The relationship between `is_active` (boolean) and `status` (enum: Active, Draft, ???) is not defined. Are they two separate columns? Is "Inactive" a status value? | YES |
| Vendor data isolation (RLS) | UNKNOWN | If packages are added to this codebase, RLS policies must enforce vendor-scoped access. | YES |

### 3.2 Frontend Requirements

| Requirement | Status | Notes | Blocker? |
|-------------|--------|-------|----------|
| Tabbed navigation component | DOES NOT EXIST | No package management screen exists in `src/modules/`. Must be built from scratch or ported from Filament. | YES |
| Shared tab component with CAR-203 | NOT DESIGNED | CAR-203 and CAR-204 use the same tabbed pattern. A shared `ActiveInactiveTabs` component could serve both. Neither ticket specifies component reuse. | No (but recommended) |
| Toggle UI control (switch, button, dropdown action) | UNSPECIFIED | The ticket says "toggle" but does not specify the control type. | No (design decision) |
| Confirmation dialog for deactivation | UNSPECIFIED | CAD-147 requires confirmation for food item deactivation. Should packages have the same? Especially given cart/order impact. | No (but HIGH recommendation) |
| Empty state components | NOT DESIGNED | Illustrations/text not provided. Can use placeholder text initially. | No |
| Loading/error states for toggle action | UNSPECIFIED | Per project design system, `<WidgetSkeleton>` is used for loading. But a toggle action needs inline loading (spinner on toggle button) and error toast, not a skeleton. | No (but should be specified) |
| Optimistic UI vs. server-confirmed update | UNSPECIFIED | Affects UX quality. Must be decided before implementation. | No (design decision) |

### 3.3 Event System / Realtime

| Requirement | Status | Notes |
|-------------|--------|-------|
| Realtime broadcast on package status change | UNSPECIFIED | Per project integrations rules, Realtime broadcasts are used for webhooks. Should package deactivation broadcast to the storefront? To admin? To other vendor staff? |
| `revalidateTag('packages')` on toggle | UNSPECIFIED | Per Next.js patterns, ISR revalidation uses tags. A toggle should trigger `revalidateTag('packages')`. |
| Audit log for toggle events | UNSPECIFIED | No audit log table exists in the schema. Toggle events (who, when, which package) should be recorded for vendor support queries. |

### 3.4 API Response Structure

Not specified. Per project code style rules, the response should follow:

```typescript
// Success
{ data: { id: string; is_active: boolean; status: string; updated_at: string }, error: null }

// Error
{ data: null, error: { code: string; message: string } }
```

This should be documented in the ticket or a linked API specification ticket.

---

## 4. Cross-Ticket Dependencies

### 4.1 Implementation Order

```
CAD-147 (Backend: cascade logic)     -- MUST be implemented first
    |
    v
CAR-203 (Frontend: food items UI)    -- Should come before CAR-204
    |                                    (shared tab component extraction)
    v
CAR-205 (Backend: inactive food      -- Should be parallel with CAR-203
    |    item handling in vendor)
    v
CAR-204 (Frontend: packages UI)     -- Depends on all above
```

**Rationale:**

1. **CAD-147 first:** It defines the cascade behavior (food item deactivation -> package impact). CAR-204 cannot handle system-deactivated packages without knowing how CAD-147 marks them.

2. **CAR-203 before CAR-204:** The food item tab UI (CAR-203) is a simpler implementation (no 3-tier hierarchy complexity). Building it first allows extraction of the shared `ActiveInactiveTabs` component that CAR-204 can reuse.

3. **CAR-205 parallel with CAR-203:** CAR-205 defines the backend behavior for the vendor-side when food items become inactive. This informs the warning dialogs and cascade notifications that CAR-204 will need.

### 4.2 CAD-147 Cascade Interactions

| CAD-147 Behavior | CAR-204 Impact | Gap? |
|-------------------|----------------|------|
| Deactivating a food item "unassigns" it from packages. | The package may lose items. If it becomes "Incomplete," it should appear on the Inactive tab. But CAR-204 does not handle externally-triggered deactivation. | YES --- CRITICAL |
| "Incomplete" packages are "hidden from the storefront." | Does "hidden from storefront" mean `is_active = false`? If so, the package moves to the Inactive tab. But if it uses a different mechanism (e.g., `storefront_visible = false`), the vendor may not see the change on their management screen. | YES --- HIGH |
| Vendor receives dashboard notification. | CAR-204 does not mention notification handling. The notification presumably links to the affected package --- does it deep-link to the Inactive tab? | YES --- MEDIUM |

### 4.3 CAR-205 Interactions

CAR-205 is a near-duplicate of CAD-147 Section 1 (Package Unassign) but from the vendor portal perspective. It specifies the warning dialog when a vendor deactivates a food item that is linked to packages. However:

- CAR-205 does not specify what happens to the PACKAGE after the food item is delinked.
- CAR-204 does not reference CAR-205 at all.
- There is no ticket covering the reverse: "Vendor deactivates a PACKAGE --- what happens to its food items?"

**Gap: No ticket covers the package-to-food-item deactivation direction.** Only the food-item-to-package direction is covered (CAD-147, CAR-205).

### 4.4 CAR-206 Interaction

CAR-206 (auto-cancellation of unaccepted scheduled orders) has a potential interaction: if a vendor deactivates a package that is part of a scheduled (future) order that has not yet been accepted, does the 24-hour auto-cancel logic apply? Or does the deactivation trigger an immediate cancellation? Neither ticket addresses this.

---

## 5. Summary of Findings

### By Severity

| Severity | Count | Finding IDs |
|----------|-------|-------------|
| CRITICAL | 7 | A-1 (no packages table), A-2 (no toggle API), 1.5 (Draft-Inactive-Edit lifecycle), E-1 (all food items deactivated), E-9 (package in cart), E-11 (subscription impact), 4.2-cascade |
| HIGH | 9 | A-3 (status enum undefined), 1.3-C1 (filter asymmetry rationale), 1.3-C2 (Draft ambiguity), M-1 (toggle control unspecified), M-3 (no confirmation dialog), E-2 (food item cascade direction), E-3 (incomplete package definition), E-4 (empty package activation), E-20 (storefront visibility) |
| MEDIUM | 10 | A-4 (actions undefined), M-2 (optimistic vs. confirmed), M-4 (bulk toggle), E-5/E-6/E-8 (data persistence), E-16 (concurrent staff), E-17/E-18 (package limits), E-19 (seasonal schedules), E-21/E-22 (admin interaction) |
| LOW | 5 | A-5 (empty state designs), A-6 (data isolation unstated), 1.3-C4 (item number meaning), E-12 (image placeholder), E-13/E-14/E-15 (pagination, counts, filter edge cases) |

### By Category

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Specification Ambiguity | 1 | 4 | 2 | 2 |
| Missing Backend | 2 | 0 | 0 | 0 |
| Package-Food Interaction | 2 | 3 | 0 | 0 |
| Order/Cart/Subscription | 2 | 0 | 0 | 0 |
| UI/UX Gaps | 0 | 2 | 4 | 3 |
| Cross-Ticket Dependencies | 0 | 0 | 4 | 0 |

---

## 6. Recommended Actions

### Before Development Starts (Blockers)

1. **Clarify target codebase.** Is CAR-204 for the Laravel/Filament vendor portal (Admin-Seller Portal repo) or the Next.js Central Hub? The Jira project (CAR) maps to the Seller Dashboard, which is currently Laravel/Filament. If it is Filament, the implementation approach is entirely different from a Next.js frontend task. Resolve this before anything else.

2. **Define the `status` vs. `is_active` relationship.** Propose: `is_active` is a boolean column (separate from `status`). `status` retains its existing enum values (Active, Draft). An "Inactive" item is one where `is_active = false` regardless of its `status` value. When an item is re-activated, its `status` is preserved (it returns as whatever status it was before deactivation). Document this in the ticket.

3. **Define the Draft-toggle interaction.** Propose: Draft packages CAN be toggled inactive (they appear on the Inactive tab with `status = Draft`). When re-activated, they return to the Active tab as Draft. AC-5 means "Draft packages default to `is_active = true` and therefore appear on the Active tab by default" --- not that they are locked there.

4. **Create a backend ticket** (or re-type CAR-204 as a Full-Stack Task) for: the toggle API endpoint, Zod schema, RLS policy, and any necessary database migration.

5. **Specify the confirmation dialog.** Given the cart, order, and subscription implications, deactivating a package should show a confirmation dialog similar to CAD-147's food item dialog. The dialog should list: active carts containing this package, pending/scheduled orders, and active subscriptions.

6. **Address the cart/subscription gap.** Either: (a) add acceptance criteria to CAR-204 for cart and subscription handling, or (b) create a new ticket (CAR-207?) for "Handling Inactive Packages in Carts, Orders, and Subscriptions" analogous to CAD-147/CAR-205.

7. **Define system-triggered deactivation handling.** When CAD-147 cascade sets a package to Incomplete/Inactive, CAR-204's UI must reflect this. Add an AC: "Packages deactivated by the system (e.g., due to food item removal) appear on the Inactive tab with a visual indicator showing the reason for deactivation."

### Before QA Testing (High Priority)

8. **Specify the toggle UI control.** Recommend: a toggle switch in the Actions column for quick toggling, with a confirmation dialog on deactivate (not on re-activate).

9. **Specify the "Incomplete" state.** Define when a package is "Incomplete" (e.g., fewer items than a configuration group's `min` selection count). Specify how "Incomplete" interacts with Active/Inactive tabs.

10. **Define storefront visibility coupling.** State explicitly: "Setting `is_active = false` removes the package from the customer-facing storefront immediately."

11. **Add round-trip fidelity AC.** Add: "Toggling a package Inactive and then Active again preserves all package data: name, description, price, images, configurations, options, and seasonal availability settings."

12. **Specify reuse with CAR-203.** Add a technical note: "The tabbed Active/Inactive UI should share a base component with the food items tab from CAR-203. Extract `ActiveInactiveTabs` as a shared component in `src/components/shared/`."

### Implementation Notes (Medium Priority)

13. Decide on optimistic UI vs. server-confirmed toggle. Recommend: optimistic with rollback on error and an error toast.

14. Add tab count badges showing (Active: N / Inactive: N).

15. Ensure pagination on both tabs (default page size: 25).

16. Define the "Item number" column: recommend a vendor-facing sequential package number (e.g., PKG-001), not a UUID.

17. Add bulk toggle capability or explicitly defer it to a future ticket.
