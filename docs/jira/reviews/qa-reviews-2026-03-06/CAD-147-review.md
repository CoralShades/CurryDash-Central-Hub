# CAD-147: Adversarial Review, Edge Case Hunt & Implementation Readiness Check

| Field | Value |
|-------|-------|
| **Ticket** | CAD-147: Remove Deleted/Inactive Food Items Associated with Packages |
| **Review Date** | 2026-03-06 |
| **Reviewer Role** | QA / Adversarial Analyst |
| **Risk Rating** | **CRITICAL** -- highest complexity ticket of the 5 under review |
| **Assignee** | Ramesh Sanjaya (91 total active tickets across CAD + CUR boards) |
| **Status** | In Progress |

---

## Executive Summary

CAD-147 is a **three-subsystem ticket** (Package Unassign, Active Customer Carts, Order History Snapshots) masquerading as a single backend task. The description was significantly expanded on 3/3/2026 -- scope tripled from a simple "warn and delink" to a cross-cutting data integrity overhaul spanning packages, carts, checkout validation, and order history schema changes. The ticket contains at least **23 ambiguities**, **14 missing specifications**, and **9 dangerous race conditions**. It should be split into 3-5 separate stories before implementation proceeds.

Additionally, this ticket overlaps with at least three other tickets on Ramesh's board:
- **CAD-148** ("DO NOT ACTION"): Replace Delete with Hide/Archive -- addresses the same root cause
- **CAD-149** (In Progress): Remove deleted/deactivated items from carts -- directly duplicates Subsystem 2
- **CAD-150** ("DO NOT ACTION"): Cancel ongoing orders with deleted items -- related to Subsystem 3

The relationship between these tickets is unclear. Is CAD-147 the superset? Are CAD-149's cart changes supposed to be done inside CAD-147 or separately? This must be resolved before any code is written.

---

## PART 1: ADVERSARIAL REVIEW -- Package Unassign (Subsystem 1)

### 1.1 Ambiguity: "Incomplete/Inactive" -- Which One?

The ticket states the system must set package status to `Incomplete/Inactive`. These are **different states** with different business implications:

| State | Meaning | Can vendor fix it? | Visible on storefront? |
|-------|---------|-------------------|----------------------|
| Incomplete | Missing required items, structurally invalid | Yes, add items back | Should NOT be visible |
| Inactive | Deliberately turned off by vendor/admin | Yes, toggle back on | Should NOT be visible |

**Problem:** The acceptance criteria say "hidden from the storefront" for both Empty and Incomplete, but never mention Inactive. If the package becomes Inactive, can the vendor reactivate it by just toggling -- even if it's still missing items? That would re-expose a broken package to customers.

**Required Clarification:**
- Define the exact state machine: Active -> Incomplete -> (vendor adds items) -> Active
- Can a vendor reactivate an Incomplete package? If so, is there a validation gate that checks minimum item count before allowing reactivation?
- What happens to a "Draft" package (CAR-204 mentions Draft status) that loses an item? It's not active, so does it silently break?

### 1.2 Ambiguity: Soft Delete vs Hard Delete of Package-Item Link

"Remove all references from associated packages" -- what does "remove" mean at the database level?

- **Hard delete the join record:** The package_item row is deleted. No trace remains. If the food item is reactivated later, it will NOT automatically re-appear in the package.
- **Soft delete / flag:** The join record is marked as inactive. If the food item is reactivated, the package could theoretically be restored.

The ticket does not specify. This matters because:
- If hard delete: vendor loses the package configuration and must manually re-add the item if it's reactivated
- If soft delete: the system needs a reconciliation process to check if deactivated items in packages have been reactivated

**Recommendation:** Hard delete with audit trail. Soft delete introduces cascading complexity.

### 1.3 Ambiguity: "Notify the merchant via the dashboard"

What kind of notification?

| Type | Persistence | User sees it when? | Implementation effort |
|------|-------------|--------------------|-----------------------|
| Toast / snackbar | Transient (5-10 seconds) | Only if dashboard is open | Low |
| In-app notification bell | Persistent until read | Next time they check notifications | Medium |
| Email | Permanent | When they check email | Medium-High |
| Push notification (mobile) | Persistent | Immediately on phone | High |

The ticket says "notify the merchant via the dashboard" but does not specify which channel. The acceptance criteria only mention "Admin receives a warning popup before deleting an item" -- that is the ADMIN warning (the confirmation dialog), NOT the merchant notification AFTER the action occurs. These are two different notifications to two different users:

1. **Pre-action warning** to the admin/vendor performing the deactivation (confirmation dialog -- this is specified)
2. **Post-action notification** to the merchant whose package was affected (not specified)

Are they the same person? The vendor deactivates their own food item, and their own package is affected. Or can an admin deactivate a vendor's food item (per CAD-148's note: "Admin users should still retain ability to permanently delete food items")? If an admin deactivates a vendor's item, the vendor MUST be notified -- but via what channel?

### 1.4 Missing: Minimum Items Per Package Business Rule

The edge case explicitly mentioned is: "Package requires exactly 3 items, removing drops to 2." But the ticket never defines:

- Where is the minimum item count stored? Is it a field on the Package model (`min_items`)?
- Is this enforced at the database level (CHECK constraint) or application level?
- What if a package has no minimum (e.g., a flexible combo)? Does removing an item still trigger Incomplete status?
- What if removing an item drops the package to 0 items? Is that "Empty" vs "Incomplete"? The acceptance criteria distinguish these ("Empty" or "Incomplete") but never define the boundary.

**Proposed rule (needs PO confirmation):**
- 0 items remaining -> "Empty" -> hidden from storefront, cannot be reactivated without adding items
- 1 to (min_items - 1) remaining -> "Incomplete" -> hidden, vendor can add items to restore
- min_items or more remaining -> remains Active (item was removed but package still valid)

### 1.5 Missing: What About Package Pricing?

If a package is priced as a bundle (e.g., "3-item combo for $15") and one item is removed, what happens to the price? Options:

- Package price stays $15 but now only has 2 items (customer gets a deal? or feels cheated?)
- Package becomes Incomplete and is hidden, so price is irrelevant until vendor fixes it
- Package price is automatically recalculated (dangerous -- changes existing business terms)

The ticket is silent on pricing implications.

### 1.6 Scope Creep Observation

The original description (now struck through) was a simple warning dialog. The updated description (3/3/2026) added carts and order snapshots. Was this scope increase communicated to Ramesh? The ticket was created 2026-01-07, went In Progress, then the description was rewritten 2026-03-05 -- nearly two months later. Ramesh may have already implemented the original, simpler scope. If so, his work needs to be re-evaluated against the new requirements.

---

## PART 2: ADVERSARIAL REVIEW -- Active Customer Carts (Subsystem 2)

### 2.1 Critical: Overlap with CAD-149

CAD-149 ("Remove deleted/deactivated Packages and food items from carts") is also assigned to Ramesh and is also In Progress. Its description says:

> "Currently, when a vendor/admin deletes or deactivates a food item, that item remains in user carts as a 'ghost' item. This leads to checkout failures, 500 errors, or price calculation mismatches."

CAD-149 says **remove** the item. CAD-147 says **flag as UNAVAILABLE** and grey it out. These are **contradictory approaches**:

| Approach | CAD-149 | CAD-147 |
|----------|---------|---------|
| Action | Auto-remove from cart | Flag as UNAVAILABLE, keep in cart |
| User experience | Cart total changes silently | Item visible but greyed out |
| User confusion | "Where did my item go?" | "Why can't I checkout?" |

Which one wins? Ramesh is working on both simultaneously. This MUST be resolved by the product owner before any code is written.

### 2.2 Missing: Where Is the UNAVAILABLE Flag Stored?

"Flag the item as UNAVAILABLE" -- this is a critical data modeling question:

**Option A: Field on the cart_item record**
- Add `is_available BOOLEAN DEFAULT TRUE` to the cart_items table
- Requires a process to scan and update all cart_items when a food_item is deactivated
- Performance concern: how many active carts could contain a given food item?

**Option B: Computed at query time**
- Cart query JOINs to food_items and checks `food_items.is_active`
- No schema change needed
- But: what if the food_item is hard-deleted (admin can still delete per CAR-203 note)? The JOIN would return NULL -- is that handled?

**Option C: Real-time event**
- When food_item is deactivated, broadcast a Realtime event
- Client-side cart component receives event and marks item unavailable in local state
- Problem: only works if user has the app open; doesn't persist

The ticket does not specify. Each option has different implementation, performance, and reliability characteristics.

### 2.3 Missing: Cart Total Calculation

"Item should be greyed out" -- but what about the cart total?

- Is the unavailable item's price **included** in the cart total? (Misleading -- total includes items they can't buy)
- Is the unavailable item's price **excluded** from the cart total? (Confusing -- total changed but item is still visible)
- Is there a separate line showing "Unavailable items: -$X.XX"?

This is a UX decision with significant frontend impact that is not specified.

### 2.4 Missing: Who Removes the Unavailable Item?

"Checkout button disabled until the unavailable item is removed." Who removes it?

- **User manually:** They must tap a "Remove" button on the greyed-out item. What does this button look like? Is it the same "Remove" button as for available items, or a new "Dismiss" or "X" button?
- **Auto-remove option:** A "Remove all unavailable items" button at the cart level?
- **Auto-remove after timeout:** If the user doesn't act within X minutes, auto-remove and notify?

### 2.5 Edge Case: All Items Become Unavailable

If every item in the cart is flagged UNAVAILABLE:
- Cart is full of greyed-out items, checkout is disabled
- User sees a cart of ghost items with no actionable next step
- Should there be a "Clear Cart" or "Your cart only contains unavailable items" state?
- What if some items are unavailable and some are available, but the available items don't meet a minimum order amount?

### 2.6 Edge Case: Packages in Carts

If a food item is deactivated and that item is part of a package that is in someone's cart:
- Is the entire package flagged UNAVAILABLE? Or just the specific item within the package?
- If the package is still "valid" (enough items remain per the package rules), does it stay available but with reduced items? Or is it invalidated?
- The ticket only discusses food items in carts, not packages-containing-food-items in carts.

### 2.7 Edge Case: Mobile App vs Web

The acceptance criteria state "full E2E regression testing of the order placement flow across both web and mobile platforms." This implies both platforms exist. But:

- Does the mobile app have the same cart data model as the web?
- Are carts stored server-side (shared across platforms) or client-side (platform-specific)?
- If a user has items in both web and mobile carts (same account), are both updated?
- Does the mobile app support real-time updates for cart item availability?

### 2.8 Race Condition: Checkout During Deactivation

**Scenario:** Customer is on the checkout screen. They have entered payment details and are about to tap "Place Order." At the exact same moment, the vendor deactivates one of the items in the cart.

- If the UNAVAILABLE check is only on the cart screen, the checkout screen doesn't know
- The order placement API MUST re-validate item availability at the moment of order creation
- If it rejects, what error does the customer see? "Item unavailable" after they already entered their credit card?
- Does the payment pre-authorization need to be voided?

### 2.9 Race Condition: Add-to-Cart During Deactivation

**Scenario:** Customer is browsing the menu. They see an item listed (cache hasn't refreshed). They tap "Add to Cart." Between the tap and the API call, the item is deactivated.

- Does the add-to-cart API check `is_active` before adding?
- If yes, what error message does the customer see?
- If no, the item enters the cart as available and only later becomes UNAVAILABLE -- confusing

### 2.10 Missing: Real-Time Cart Updates

If a user has their cart open and an item is deactivated in real-time:
- Does the cart UI update live (via WebSocket / Realtime subscription)?
- Or does the user only see the change on next page load / cart refresh?
- The ticket doesn't specify real-time behavior.

---

## PART 3: ADVERSARIAL REVIEW -- Order History Snapshots (Subsystem 3)

### 3.1 Critical: Is This a Schema Migration?

"Ensure the `Order_Details` table stores hardcoded strings for `item_name` and `price_at_time_of_purchase` rather than just a foreign key."

This statement implies one of two things:

**Possibility A: The table currently uses ONLY a foreign key (food_item_id)**
- This requires adding new columns: `item_name TEXT`, `price_at_time_of_purchase DECIMAL`
- This requires a data migration to backfill ALL existing order records
- This is a **massive migration** on what is likely the largest table in the database
- Downtime or careful online migration required

**Possibility B: The table already has these columns but they're not being populated**
- Only requires a code change to populate them at order creation time
- No migration needed for existing data
- But existing orders still have NULL in these columns -- is that acceptable?

**Possibility C: The table already has these columns AND they're populated**
- No work needed -- this subsystem is already complete
- The ticket is describing a requirement that's already met

The ticket does not clarify the current state of the schema. This is the difference between a 1-hour code change and a multi-day migration with downtime risk.

**Evidence from the codebase:** The current CurryDash Central Hub Supabase schema (`supabase/migrations/20260218000001_initial_schema.sql`) contains NO `order_details`, `orders`, `food_items`, `packages`, `carts`, or `cart_items` tables. These tables exist in the CurryPackApp backend (a separate system). This ticket is for the CurryPackApp Admin Dashboard (CAD project), NOT the CurryDash Central Hub. The actual database schema is in a different repository.

### 3.2 Missing: Keep or Remove the Foreign Key?

"Rather than just a foreign key" -- does this mean:

- **Keep both:** `food_item_id` FK + `item_name` + `price_at_purchase` (denormalized but safe)
- **Remove FK:** Only store snapshot strings, no reference back to the food item (dangerous for reporting)

If the FK is removed:
- Reports that JOIN order_details to food_items (for category analysis, dietary breakdowns, etc.) will break
- Refund calculations that reference the current item price vs. purchase price can't cross-reference
- Admin features that show "which orders contained this food item" become impossible

If the FK is kept:
- The FK can point to a soft-deleted food item (if soft delete is used)
- The FK can be NULL if the food item is hard-deleted (if ON DELETE SET NULL)
- The FK can prevent deletion entirely (if ON DELETE RESTRICT is set) -- is this intentional?

### 3.3 Missing: What Data Gets Snapshotted?

The ticket only mentions `item_name` and `price_at_time_of_purchase`. But order history typically shows much more:

| Data Point | Snapshotted? | Impact if Missing |
|-----------|-------------|-------------------|
| Item name | Yes (specified) | -- |
| Price at purchase | Yes (specified) | -- |
| Item description | NOT SPECIFIED | Order details screen shows blank description |
| Item image URL | NOT SPECIFIED | Order history shows broken image or placeholder |
| Dietary info (vegan, halal, etc.) | NOT SPECIFIED | Allergen info lost for customer reference |
| Category | NOT SPECIFIED | Reporting by category breaks for deleted items |
| Package name (if item was part of combo) | NOT SPECIFIED | "Lunch Deal" shows as unnamed grouping |
| Modifier/customization details | NOT SPECIFIED | "Extra spicy, no onions" -- where is this stored? |
| Vendor/restaurant name | NOT SPECIFIED | If restaurant is also suspended, whose item was it? |

Under-snapshotting now means a second migration later when someone realizes order history is missing critical information.

### 3.4 Missing: Retroactive Migration for Existing Orders

If new snapshot columns are added, do existing orders need to be backfilled?

- If YES: need a migration script that JOINs existing order_details to food_items and populates the snapshot columns. But what about orders where the food_item has ALREADY been deleted (since delete was previously possible)? Those rows will have NULL snapshots forever.
- If NO: existing orders will show blank names/prices in order history. Unacceptable for customer-facing screens.

### 3.5 Edge Case: Package Orders

If a customer ordered a package (combo), the order contains multiple food items grouped under one package:
- Does each sub-item get its own snapshot row in order_details?
- Is the package-level price snapshotted separately from individual item prices?
- If the package offered a discount (3 items for $15 instead of $18 individual), is the discount amount snapshotted?

### 3.6 Performance: Migration on Large Tables

Order_details is typically one of the highest-volume tables. Adding columns and backfilling:
- Requires table lock or online DDL depending on database engine
- May need batched updates to avoid long-running transactions
- Should be tested on a production-sized dataset before deployment
- Rollback plan: can the migration be reversed if it fails partway?

---

## PART 4: CROSS-SYSTEM EDGE CASES

### 4.1 Timing: Order In Flight During Deactivation

| Step | Event | Question |
|------|-------|----------|
| T=0 | Customer places order containing Item X | Order status: Pending |
| T=1 | Vendor deactivates Item X | CAD-147 triggers |
| T=2 | Vendor accepts the order | Should this be allowed? Item X is now inactive |
| T=3 | Kitchen prepares the food | They're making an item that's "inactive" |
| T=4 | Order is delivered | Customer gets the food fine |

The ticket says orders that are "Accepted," "Preparing," or "Completed" must not change. But what about "Pending" orders? The 24-hour auto-cancel rule from CAR-206 is for vendor unresponsiveness, not item deactivation. If a vendor deactivates an item that's in a Pending order:
- Should the vendor be warned? ("This item is in 3 pending orders")
- Should those orders be auto-cancelled? (CAD-150 says "DO NOT ACTION" -- explicitly suspended)
- Should the orders proceed with the deactivated item? (Contradicts the UNAVAILABLE flag logic)

This is a **gap between CAD-147 and CAD-150** that is unresolved by design ("DO NOT ACTION").

### 4.2 Timing: Reactivation During Refund Processing

| Step | Event |
|------|-------|
| T=0 | Vendor deactivates Item X |
| T=1 | Auto-cancel triggers for pending orders (CAR-206 overlap) |
| T=2 | Refund initiated for cancelled orders |
| T=3 | Vendor reactivates Item X (changed their mind) |
| T=4 | Refund is still processing with payment gateway |

Questions:
- Can the refund be reversed? Most payment gateways don't support refund reversal.
- Is the customer re-charged? That would be a terrible experience.
- Does the order get re-created? Or is it gone forever?

### 4.3 Multi-Vendor Item Collision

Can two vendors have the same food item (e.g., "Butter Chicken")? If so:
- Deactivating Vendor A's "Butter Chicken" must NOT affect Vendor B's "Butter Chicken"
- Are food items scoped to a vendor (restaurant_id FK)? The ticket assumes yes but doesn't verify.
- What if an admin (not vendor) deactivates a food item? Is that system-wide or vendor-scoped?

### 4.4 Promotions and Discounts

If a food item has an active promotion (e.g., "50% off Butter Chicken this week"):
- Deactivating the item should cancel/suspend the promotion
- But the ticket doesn't mention promotions at all
- If the promotion is platform-wide (admin-created), does the admin get a separate warning?
- If the item is reactivated, does the promotion resume or stay cancelled?

### 4.5 Scheduled/Future Orders

CAR-206 introduces scheduled orders. If a customer has a scheduled order for next Tuesday containing Item X, and Item X is deactivated today:
- The order hasn't been "Accepted" yet (it's scheduled for the future)
- It's not "Pending" in the traditional sense (it hasn't been sent to the vendor)
- The 24-hour rule from CAR-206 doesn't apply (that's about vendor responsiveness, not item availability)
- Does the customer get notified? When? Immediately? Or when the scheduled order is "activated"?

### 4.6 Search and Discovery

When a food item is deactivated:
- It must NOT appear in customer-facing search results
- It must NOT appear in category browsing
- It must NOT appear in "Recommended for you" or "Popular items"
- It must NOT appear in the vendor's public menu page
- But it SHOULD still appear in the admin's food item list (Inactive tab per CAR-203)
- And it SHOULD still appear in the vendor's food management (Inactive tab per CAR-203)

The ticket doesn't mention search/discovery implications at all.

### 4.7 Reviews and Ratings

If a food item has customer reviews/ratings:
- Do reviews persist when the item is deactivated? (They should -- soft delete)
- If the item is reactivated, do the old reviews reappear?
- CAD-148 specifically calls out "Loss of Reviews" as a risk of hard delete
- This implies reviews are tied to food_item_id -- soft delete preserves them, hard delete doesn't

### 4.8 SEO and Public URLs

CAD-148 mentions "Broken Web Links" as a risk. If food items have public URLs:
- Deactivated items should return HTTP 410 Gone (not 404) for SEO correctness
- Or redirect to the vendor's menu page
- The ticket doesn't address this

---

## PART 5: IMPLEMENTATION READINESS CHECK

### 5.1 Verdict: NOT READY FOR IMPLEMENTATION

| Criterion | Status | Details |
|-----------|--------|---------|
| Requirements clarity | FAIL | 23+ ambiguities identified |
| Scope definition | FAIL | Should be 3-5 separate tickets |
| Acceptance criteria completeness | FAIL | Only 5 ACs for a 3-subsystem ticket |
| Test plan | FAIL | "Full E2E regression" mentioned but no plan exists |
| Schema changes documented | FAIL | Order_Details migration not specified |
| Dependency resolution | FAIL | Overlap with CAD-148, CAD-149, CAD-150 unresolved |
| API contract defined | FAIL | No API specifications for any subsystem |
| Rollback plan | FAIL | No rollback strategy for schema migration |
| Feature flag | FAIL | No mention of gradual rollout |
| Performance assessment | FAIL | No analysis of cart scan or migration performance |

### 5.2 Ticket Splitting Recommendation

This ticket should be decomposed into at minimum:

| New Ticket | Scope | Dependencies |
|-----------|-------|-------------|
| **CAD-147A: Package Unassign Logic** | Warning dialog + delink food items from packages + set package status + merchant notification | CAR-203, CAR-205 |
| **CAD-147B: Cart Unavailability Flagging** | Flag items in carts as UNAVAILABLE + UI changes + checkout blocking | Supersedes CAD-149 (close as duplicate) |
| **CAD-147C: Order Snapshot Schema Migration** | Add snapshot columns to Order_Details + backfill migration + code changes at order creation | None (can be done independently) |
| **CAD-147D: Checkout Validation Gate** | Re-validate item availability at order placement time + handle race conditions | CAD-147B |
| **CAD-147E: E2E Regression Test Plan** | Create and execute test plan for web + mobile | CAD-147A, B, C, D |

### 5.3 Assignee Capacity Concern

Ramesh has **91 active tickets** across CAD (46) and CUR (45) boards. This is an unrealistic workload for one developer. CAD-147 alone, if properly scoped, represents 2-3 sprints of work. Combined with:
- CAD-149 (overlapping, also In Progress)
- CAD-98 (In Progress)
- CAD-192 (In Progress)
- CAD-191 (In Progress)
- CAD-28 (In Progress)
- CAD-10 (In Progress)
- CAD-8 (In Progress)

That's **8 tickets simultaneously In Progress** for one developer. This is a red flag for quality and completion.

### 5.4 Missing Test Plan

The acceptance criteria require "full end-to-end (E2E) regression testing of the order placement flow across both web and mobile platforms." But:
- No test plan document exists
- No test cases are defined
- No test environments are specified
- No mobile testing infrastructure is mentioned
- The CurryDash Central Hub has Playwright for E2E, but the CurryPackApp (where these changes live) may have different tooling
- Who writes the tests? Ramesh? A separate QA engineer?

### 5.5 Missing Migration Strategy

For the Order_Details snapshot columns:
- What is the migration approach? (online DDL, maintenance window, blue-green?)
- What is the estimated data volume? (orders * items per order)
- Is there a staging/pre-prod environment with production-scale data for testing?
- What is the rollback procedure if the migration fails?
- Are there database backups scheduled before migration?

### 5.6 Missing Feature Flag Strategy

Given the risk profile:
- Subsystem 1 (Package Unassign) could be behind a `FEATURE_PACKAGE_UNASSIGN` flag
- Subsystem 2 (Cart UNAVAILABLE) could be behind a `FEATURE_CART_AVAILABILITY_CHECK` flag
- Subsystem 3 (Order Snapshots) is a schema change -- harder to feature-flag but the code path can be
- This allows gradual rollout and quick rollback without code deployment

---

## PART 6: SECURITY & DATA INTEGRITY

### 6.1 Vendor Toggle Abuse

A malicious or confused vendor could rapidly toggle items active/inactive to:
- Disrupt customer carts repeatedly (items flashing available/unavailable)
- Trigger mass package invalidation and restoration
- Generate spam notifications to merchants
- Cause performance issues if each toggle scans all carts

**Mitigation required:**
- Rate limiting on the toggle endpoint (e.g., max 5 toggles per item per hour)
- Cooldown period after deactivation before reactivation is allowed (e.g., 5 minutes)
- Audit log of all toggle events with timestamp, user, and affected entities

### 6.2 Audit Trail

The ticket mentions no audit logging. For compliance and debugging:
- WHO deactivated the item (admin or vendor? user ID?)
- WHEN was it deactivated (timestamp)
- WHAT packages were affected (list of package IDs)
- WHAT carts were affected (count of affected carts, not individual cart contents for privacy)
- Was the action reversed (reactivation)?

### 6.3 Authorization

- Can a vendor deactivate another vendor's food item? (Must be impossible)
- Can an admin deactivate any vendor's food item? (Per CAR-203, yes)
- If an admin deactivates an item, can the vendor reactivate it? (Permission conflict)
- Is there a "locked by admin" state that prevents vendor override?

### 6.4 Data Integrity: Orphaned Records

If the implementation deletes package-item links (hard delete), ensure:
- No dangling foreign keys remain
- Package item count is recalculated correctly
- Package price is recalculated if it's derived from item prices
- Package search index is updated (if full-text search is used)
- Package cache is invalidated

---

## PART 7: RELATIONSHIP TO OTHER TICKETS

### 7.1 Ticket Overlap Matrix

| Concern | CAD-147 | CAD-148 | CAD-149 | CAD-150 | CAR-203 | CAR-204 | CAR-205 | CAR-206 |
|---------|---------|---------|---------|---------|---------|---------|---------|---------|
| Warning before deactivation | YES | -- | -- | -- | -- | -- | YES | -- |
| Package delink | YES | -- | -- | -- | -- | -- | -- | -- |
| Cart handling | YES | -- | YES (contradicts!) | -- | -- | -- | -- | -- |
| Order snapshot | YES | -- | -- | -- | -- | -- | -- | -- |
| Remove delete button | -- | YES (suspended) | -- | -- | YES | YES | -- | -- |
| Cancel in-flight orders | -- | -- | -- | YES (suspended) | -- | -- | -- | Partially |
| Refund logic | -- | -- | -- | -- | -- | -- | -- | YES |
| Hide/Archive concept | -- | YES (suspended) | -- | -- | -- | -- | -- | -- |

### 7.2 Blockers and Dependencies

```
CAR-203 (Disable Delete for Food Items) -- MUST be done first or simultaneously
    Reason: If delete is still possible, CAD-147's "deactivation" logic isn't the only code path.
            Hard delete triggers different behavior than soft deactivation.

CAR-205 (Handling Inactive Food Items) -- duplicates CAD-147 subsystem 1
    Reason: Same warning dialog, same delink logic, different project (CAR vs CAD).
            Need to clarify: is this seller-side or admin-side? Or both?

CAD-149 (Remove items from carts) -- CONTRADICTS CAD-147 subsystem 2
    Reason: CAD-149 says "remove," CAD-147 says "flag as unavailable."
            One must be closed as superseded.

CAD-150 (Cancel ongoing orders) -- explicitly suspended
    Reason: Related to CAD-147 subsystem 3 but deliberately deferred.
            Gap: what happens to Pending orders when item is deactivated?
```

---

## PART 8: RECOMMENDED ACTIONS (Priority Order)

### Immediate (Before Any More Code Is Written)

1. **STOP implementation** until scope is clarified with the product owner
2. **Resolve the CAD-147 vs CAD-149 contradiction** (flag-as-unavailable vs auto-remove)
3. **Split CAD-147 into 3-5 separate tickets** (see Section 5.2)
4. **Define the package status state machine** (Active / Incomplete / Inactive / Empty / Draft)
5. **Clarify the Order_Details current schema** -- determine if migration is needed

### Before Sprint Planning

6. **Define acceptance criteria for each sub-ticket** (current ACs are insufficient)
7. **Create a test plan** for E2E regression across web and mobile
8. **Assess Ramesh's capacity** -- 91 tickets with 8 In Progress is unsustainable
9. **Identify the migration strategy** for Order_Details if schema change is needed
10. **Design the API contracts** for deactivation, cart availability check, and order creation validation

### Before Code Review

11. **Require feature flags** for each subsystem
12. **Require audit logging** for all toggle/deactivation events
13. **Require rate limiting** on the toggle endpoint
14. **Require race condition handling** at checkout (double-check availability before order creation)
15. **Require rollback plan** for the Order_Details migration

---

## Appendix A: Questions Requiring Product Owner Answers

| # | Question | Impact if Unanswered |
|---|----------|---------------------|
| 1 | Is the package status "Incomplete" or "Inactive"? Or a new state? | Dev builds wrong state machine |
| 2 | Is the package-item link hard-deleted or soft-deleted? | Reactivation behavior undefined |
| 3 | What notification channel for merchant? (Toast/email/push/in-app) | Wrong implementation |
| 4 | What is the minimum item count rule for packages? | Incomplete/Empty boundary undefined |
| 5 | Does CAD-147 supersede CAD-149? | Contradictory implementations |
| 6 | Should pending orders be affected by item deactivation? | Gap between CAD-147 and CAD-150 |
| 7 | Is the cart total recalculated when item is flagged UNAVAILABLE? | UX confusion |
| 8 | Who removes the unavailable item from cart? (Manual/auto/both) | Frontend design blocked |
| 9 | Does Order_Details currently have snapshot columns? | Migration scope unknown |
| 10 | Should the FK be kept alongside snapshot columns? | Reporting impact |
| 11 | What data beyond name and price should be snapshotted? | Under-snapshotting requires future migration |
| 12 | Do existing orders need backfill? | Migration scope unknown |
| 13 | Can a vendor reactivate an Incomplete package? | Business rule gap |
| 14 | How should packages-in-carts be handled when a sub-item is deactivated? | Not addressed at all |

## Appendix B: Test Scenarios (Minimum Required)

### Package Unassign
- [ ] Deactivate item linked to 1 package
- [ ] Deactivate item linked to multiple packages
- [ ] Deactivate item that is the last item in a package (Empty state)
- [ ] Deactivate item in package at minimum count (Incomplete state)
- [ ] Deactivate item in package above minimum count (package stays Active)
- [ ] Deactivate item in Draft package
- [ ] Admin deactivates vendor's item (cross-user notification)
- [ ] Vendor deactivates own item (self-notification or no notification?)
- [ ] Reactivate previously deactivated item -- package behavior
- [ ] Rapid toggle (activate/deactivate/activate) -- rate limiting

### Cart Unavailability
- [ ] Single unavailable item in cart with other available items
- [ ] All items in cart become unavailable
- [ ] Package in cart where one sub-item becomes unavailable
- [ ] Unavailable item price excluded/included from total
- [ ] User removes unavailable item -- checkout re-enables
- [ ] User adds new available item to cart with unavailable items present
- [ ] Cart persistence across sessions (close app, reopen)
- [ ] Cart sync across web and mobile (same account)
- [ ] Real-time update when item deactivated while cart is open
- [ ] Race condition: add-to-cart during deactivation
- [ ] Race condition: checkout during deactivation

### Order Snapshots
- [ ] New order captures item_name and price_at_purchase
- [ ] Order history displays snapshot data (not live data)
- [ ] Deactivated item's order history still shows correct name and price
- [ ] Hard-deleted item's order history still shows correct name and price (if admin deletes)
- [ ] Package order snapshots all sub-items
- [ ] Refund calculation uses snapshot price
- [ ] Migration backfill for existing orders (if applicable)
- [ ] Rollback of migration (if applicable)
