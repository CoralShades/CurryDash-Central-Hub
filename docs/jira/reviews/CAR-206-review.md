# CAR-206 Adversarial Review: Auto-Cancellation Logic for Unaccepted Scheduled Orders

> **Ticket:** [CAR-206](https://coralshades.atlassian.net/browse/CAR-206)
> **Reviewer:** QA Adversarial Review (Automated)
> **Date:** 2026-03-06
> **Verdict:** NOT READY FOR IMPLEMENTATION
> **Risk Level:** HIGH (involves real money -- refunds)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Adversarial Review -- Ticket Quality Issues](#2-adversarial-review----ticket-quality-issues)
3. [Edge Cases -- The 24-Hour Rule](#3-edge-cases----the-24-hour-rule)
4. [Edge Cases -- Safety Buffer (Sub-24h Orders)](#4-edge-cases----safety-buffer-sub-24h-orders)
5. [Edge Cases -- Notifications](#5-edge-cases----notifications)
6. [Edge Cases -- Financial and Legal](#6-edge-cases----financial-and-legal)
7. [Implementation Readiness Assessment](#7-implementation-readiness-assessment)
8. [Dependency Analysis](#8-dependency-analysis)
9. [Recommended Actions Before Implementation](#9-recommended-actions-before-implementation)
10. [Test Scenarios the Ticket Misses](#10-test-scenarios-the-ticket-misses)

---

## 1. Executive Summary

CAR-206 describes a critical financial operation -- automatically cancelling pre-paid orders and issuing refunds when vendors fail to respond within 24 hours. Despite being a high-stakes ticket involving real customer money, the specification is dangerously underspecified. It contains an actual typo in a status value, omits critical edge cases around timing, relies on infrastructure that does not yet exist in this codebase, and has hard dependencies on at least 4 other unbuilt stories (CUR-149, CUR-151, CUR-152, CUR-134/135/136). Implementing this ticket in its current state will produce either broken code or code that cannot be tested.

**Blocking Issues Found:** 17
**Critical Ambiguities:** 12
**Missing Edge Cases:** 23
**Infrastructure Gaps:** 6

---

## 2. Adversarial Review -- Ticket Quality Issues

### BLOCKER-01: Typo in Status Enum Value -- "Canceld"

The ticket states:

> Update `Status` to 'Cancelled' with Reason: `Vendor Unresponsive`

But the acceptance criteria says:

> "Cancelled - Vendor Timeout"

And looking at the Order Status Timeline in CUR-20, the prototyping uses statuses like "Order Placed", "Restaurant Accepted", etc. -- none of which match the `'Pending'` value referenced in this ticket.

**The real danger:** If a developer copies status strings from the ticket description or Jira comments, they may end up with inconsistent enum values across the codebase. There is currently no `OrderStatus` enum anywhere in the codebase to validate against.

**Required action:** Define the canonical order status enum BEFORE this ticket is implemented. Proposed values should be agreed upon across all consuming tickets (CAR-206, CUR-149, CUR-20, CUR-135).

---

### BLOCKER-02: "Pending" -- What Is the Exact Status Value?

The ticket says to query orders where `Status = 'Pending'`. But:

- CUR-148 (Cart & Checkout API) says orders are created in `"pending"` status (lowercase).
- CUR-20 (Order Timeline) uses `"Order Placed"` as the first status.
- CUR-135 references order statuses for notifications but never defines the enum.

Is it `'Pending'`, `'pending'`, `'PENDING'`, `'Placed'`, or `'Order Placed'`? Case sensitivity in database queries is a real bug source, especially if PostgreSQL collation is case-sensitive (default) or if someone adds a `citext` column later.

**Required action:** There must be a single source of truth for order status values, ideally a PostgreSQL enum type or a CHECK constraint.

---

### BLOCKER-03: "Vendor Unresponsive" vs "Vendor Timeout" -- Inconsistent Cancellation Reason

The technical requirements say:

> Reason: `Vendor Unresponsive`

The acceptance criteria say:

> "Cancelled - Vendor Timeout"

These are two different strings. Which one goes in the database? Which one is displayed to the user? Is the display label derived from the DB value, or is it a separate mapping?

**Required action:** Define the `cancellation_reason` enum and the display-label mapping.

---

### ISSUE-04: Cron Frequency Is a Range, Not a Value

> "The job should run every 30-60 minutes."

This is not a specification; it is a suggestion. A cron job runs at a fixed interval. Pick one:

- **Every 30 minutes:** More responsive, higher DB load, closer to the 24-hour promise.
- **Every 60 minutes:** Less responsive, up to 25 hours before cancellation (24h + 60min worst case).

The worst-case SLA for customer notification is `24 hours + cron_interval`. If the interval is 60 minutes, the customer could wait 25 hours before getting their refund initiated. Is this acceptable?

**Required action:** Define the exact interval. Consider whether this should be configurable via environment variable or platform settings (CUR-140 references "Platform-Wide Settings Configuration").

---

### ISSUE-05: Payment Provider Not Specified

> "Trigger the Refund API for the respective payment provider"

CUR-151 (Stripe Payment Integration) specifies Stripe as the payment provider. But CUR-151 is currently "To Do." This ticket cannot be implemented without the Stripe integration existing first.

Furthermore, the ticket says "respective payment provider" (plural implication). Is there more than one? If Stripe is the only one, say "Stripe." If there could be others, the refund logic needs a provider abstraction layer.

**Required action:** Explicitly state "Stripe" and add CUR-151 as a blocking dependency.

---

### ISSUE-06: Refund Amount Calculation Is Incomplete

> "Full amount (Base price + Delivery + Service fees)"

What about:
- **Discounts / promo codes** -- If a customer used a 20% discount coupon, is the refund for the amount they actually paid, or the full pre-discount amount?
- **Loyalty points** -- If the customer paid partially with loyalty points, are the points restored?
- **Platform credits** -- If the customer used wallet/credit balance, is that restored?
- **Taxes** -- Are taxes refunded? (They should be, but the ticket doesn't mention them.)

The correct refund amount should be: `amount_actually_charged_to_payment_method`. Not a manual sum of components.

**Required action:** Clarify that refund amount = Stripe's `payment_intent.amount` (the actual captured amount). The itemized breakdown is for display only.

---

### ISSUE-07: "3-5 Business Days" -- Provider-Dependent Claim

The customer notification template says:

> "should appear in your account within 3-5 business days"

This timeline varies by:
- Payment method (credit card vs. debit card vs. bank transfer)
- Card issuer
- Country/region
- Stripe's processing queue

Stripe's documentation says refunds take 5-10 business days for some card issuers. Promising "3-5" and delivering in 10 will generate support tickets.

**Required action:** Either widen the estimate ("5-10 business days") or use dynamic text based on payment method, or use Stripe's refund webhook to send an "arrived" confirmation.

---

### ISSUE-08: "Order #[ID]" -- Which ID?

The vendor notification uses `Order #[ID]`. The system likely has:
- `orders.id` (UUID -- ugly for display)
- `orders.order_number` (sequential human-readable number)
- Stripe's `payment_intent_id`

Which one goes in the notification? UUIDs are user-hostile. Sequential numbers need a generation strategy.

**Required action:** The orders table design (CUR-149) must define a human-readable `order_number` field before this ticket is implemented.

---

### ISSUE-09: "Maintain Your Store Rating" -- Phantom Feature

The vendor notification says:

> "Please ensure timely acceptance to maintain your store rating."

The acceptance criteria say:

> "Vendor 'Response Rate' metric is updated (internally)"

Questions:
- Does a vendor rating/scoring system exist? No evidence in the codebase or in any "To Do" ticket.
- Where is the "Response Rate" stored? New table? Column on vendors table? Analytics system?
- Does the response rate affect anything (search ranking, visibility, deactivation)?
- If this is aspirational/future, the notification is misleading.

**Required action:** Either (a) remove the rating mention from the notification, or (b) create a separate ticket for the Vendor Response Rate system and link it as a dependency.

---

## 3. Edge Cases -- The 24-Hour Rule

### EC-01: Timezone -- 24 Hours in Whose Clock?

The ticket says "24 hours of the order being placed." But:

- Server time (UTC)?
- Vendor's local timezone?
- Customer's local timezone?

If the server is UTC and the customer is in UTC+5:30 (India), an order placed at "11 PM local" is actually 5:30 PM UTC. The 24-hour window expires at 5:30 PM UTC the next day (11 PM local next day). This is fine if everything uses UTC -- but the ticket never says so.

**Required action:** Explicitly state "24 hours from `orders.created_at` (stored as UTC TIMESTAMPTZ)" and ensure all comparisons are in UTC.

---

### EC-02: Daylight Saving Time Transitions

If the system or any date library uses local time instead of UTC:
- An order placed at 1:30 AM on the night clocks spring forward could have a 23-hour or 25-hour window depending on direction.
- PostgreSQL `TIMESTAMPTZ` handles this correctly, but application-layer `new Date()` comparisons in JavaScript might not if `TZ` env var is set to a non-UTC zone.

**Required action:** Ensure the cron job query uses `NOW() - INTERVAL '24 hours'` in SQL (which is DST-safe), not application-layer date arithmetic.

---

### EC-03: Cron Drift -- The 25-Hour Problem

Worst case timeline:
1. Order placed at 00:00 UTC.
2. 24-hour window expires at 00:00 UTC next day.
3. Cron runs at 00:01 UTC (just missed) and next runs at 01:01 UTC.
4. Order is cancelled at 01:01 UTC -- 25 hours and 1 minute after placement.

With a 60-minute cron interval, the customer could wait up to ~25 hours. With 30 minutes, ~24.5 hours.

**Question for product:** Is up to 25 hours acceptable? Or should the SLA be "within 25 hours" to be honest?

---

### EC-04: Cron Job Failure and Retry

What happens if:
- The cron job throws an unhandled exception mid-batch?
- The server restarts during cron execution?
- The database connection pool is exhausted?
- Vercel's cron runner times out (Vercel cron has a 60-second timeout on Hobby, 300s on Pro)?

The existing cron at `/api/cron/refresh-webhooks` uses a try/catch with dead letter logging. This pattern should be replicated, but the ticket doesn't mention error handling at all.

**Required action:** Specify:
- Dead letter logging for failed cancellations
- Health monitoring (system_health table entry for the cron)
- Alerting when the cron hasn't run in > 2x expected interval

---

### EC-05: Refund API Failure -- Inconsistent State

The ticket says:

> "The order status should only move to `Cancelled` once the Payment Gateway returns a `Success` response."

But what if:
- Stripe returns `"pending"` (not success, not failure)?
- Stripe returns a network timeout?
- Stripe returns `"requires_action"` (3D Secure verification needed for refund -- rare but possible)?
- Stripe returns success but the webhook confirming the refund never arrives?

If the refund fails, the order stays in `Pending` status. But it has been identified as needing cancellation. On the next cron run, it will try again. This is good -- but only if the retry logic is idempotent and doesn't create duplicate Stripe refunds.

**Required action:** Specify an intermediate status like `cancellation_pending` or `refund_in_progress` to prevent:
- Double-processing by subsequent cron runs
- The vendor accepting the order while refund is in flight
- The customer seeing stale "Pending" status during refund processing

---

### EC-06: Race Condition -- Vendor Accepts at Hour 23:59

Scenario:
1. Order placed at 10:00 AM.
2. At 9:59 AM next day (23h 59m later), the vendor taps "Accept."
3. At 10:01 AM next day, the cron job runs and finds the order was placed >24h ago.

If the vendor acceptance is processed between the cron's query and its update, the cron could cancel an already-accepted order.

**Required action:** The cancellation query MUST include a WHERE clause like:
```sql
WHERE status = 'pending'
  AND created_at < NOW() - INTERVAL '24 hours'
  AND accepted_at IS NULL
```
And the update should use optimistic locking or a `WHERE status = 'pending'` condition on the UPDATE itself (not just the SELECT) to prevent TOCTOU (time-of-check-to-time-of-use) races.

---

### EC-07: Vendor's App Is Down for 24 Hours

If the vendor's phone dies, app crashes, or they're on vacation without closing their store:
- Is this the vendor's problem? (Probably yes, per the business model.)
- Should there be a warning at hour 12? Hour 18? Hour 22?
- Should the platform proactively notify the vendor at escalating intervals before auto-cancelling?

CUR-134 (Vendor New Order Notifications) specifies push notification within 3 seconds of order placement. But there's no "reminder" notification spec.

**Required action:** Consider adding escalation notifications (e.g., hour 12: "You have unaccepted orders", hour 22: "Orders will be cancelled in 2 hours").

---

### EC-08: Bulk Cancellation Storm

If a vendor goes on vacation and has 50+ unaccepted orders, the cron job will:
1. Cancel all 50 in one batch
2. Issue 50 Stripe refund API calls
3. Send 50 customer notifications (push + email = 100 notification calls)
4. Send 50 vendor notifications

This is:
- A potential Stripe rate limit issue (Stripe rate limit: 100 reads/sec, 100 writes/sec in test mode; varies in production)
- A potential notification service overload
- A potential database transaction timeout

**Required action:** Implement batch processing with:
- Rate limiting on Stripe API calls (max N refunds per cron run, or sequential with delays)
- Batch notification grouping for the vendor ("You have 50 auto-cancelled orders" instead of 50 individual alerts)
- Transaction batching or cursor-based processing

---

## 4. Edge Cases -- Safety Buffer (Sub-24h Orders)

### EC-09: Order Placed 1 Hour Before Scheduled Time

The ticket says auto-cancel "2 hours before the scheduled pickup/delivery time" for sub-24h orders. But:

What if the order is placed only 1 hour before the scheduled time? The 2-hour buffer has already passed. Should the system:
- Cancel immediately?
- Cancel 30 minutes before?
- Reject the order at placement time (prevent it from being placed)?

**Required action:** Define the minimum lead time between order placement and scheduled time. If the scheduled time is < 2 hours away, the order placement flow (CUR-148) should either reject the order or use a shorter acceptance window.

---

### EC-10: Scheduled Time Definition Ambiguity

"2 hours before the scheduled pickup/delivery time" -- but what is the "scheduled time"?

- The start of a delivery window? ("Between 6-8 PM" -> 6 PM)
- The end of a delivery window? ("Between 6-8 PM" -> 8 PM)
- A specific requested time? ("Deliver at 7 PM")
- The restaurant's estimated preparation time + transit?

**Required action:** Define which timestamp field is used. Suggest: `orders.scheduled_delivery_at` (a single TIMESTAMPTZ representing the target delivery time).

---

### EC-11: Customer Changes Scheduled Time After Order

If the customer changes the delivery time from "tomorrow 6 PM" to "tomorrow 12 PM" after placing the order:
- Does the safety buffer recalculate?
- Is the vendor notified of the change?
- What if changing the time to 2 hours from now triggers immediate auto-cancel?

**Required action:** Either (a) disallow schedule changes after placement, or (b) specify that schedule changes recalculate the cancellation deadline and notify the vendor.

---

### EC-12: The Formula Is Underspecified

For sub-24h orders, the cancellation logic needs two rules:
1. If `scheduled_time - now > 24h`: standard 24-hour rule applies.
2. If `scheduled_time - now <= 24h`: cancel at `scheduled_time - 2 hours`.

But what if:
- The order was placed 20 hours ago, and the scheduled time is 5 hours from now. Both rules could apply. Which takes precedence?
- The scheduled time is 2.5 hours from now and the order was placed 1 hour ago. Rule 2 says cancel in 30 minutes. But the vendor has only had 1 hour to respond.

**Required action:** Define the formula as: `cancellation_deadline = MIN(created_at + 24h, scheduled_time - 2h)`. Handle the edge case where this formula produces a deadline in the past (immediate cancellation).

---

## 5. Edge Cases -- Notifications

### EC-13: Push Notification Delivery Failure

The ticket specifies push notification and email to the customer. But:
- If the customer disabled push notifications, the push fails silently.
- If the customer's email bounces, they may never learn about the cancellation.
- There is no SMS fallback mentioned.

CUR-139 specifies "SMS Notifications for Critical Updates" -- auto-cancellation of a paid order is certainly critical. But CUR-139 is "To Do."

**Required action:** Define the notification fallback chain: Push -> Email -> SMS (if CUR-139 is available). At minimum, ensure the cancellation and refund are recorded in the Order History (visible in-app) regardless of notification delivery success.

---

### EC-14: Vendor Notification -- "Alert" Is Not a Channel

The ticket says:

> To Vendor: Alert: "Order #[ID] has been auto-cancelled..."

"Alert" is not a notification channel. Is this:
- A push notification (requires CUR-152 -- Firebase integration, currently "To Do")?
- An in-app notification (requires vendor dashboard notification system)?
- An email?
- An SMS?

**Required action:** Specify the exact notification channels for the vendor. The vendor notification system (CUR-134) must be implemented first.

---

### EC-15: Multi-User Vendor Accounts

CUR-134 specifies:

> Given I have multiple staff devices registered, When a new order arrives, Then all registered devices receive the notification

If a restaurant has multiple staff accounts, all of them should receive the cancellation alert. But the ticket doesn't specify whether the notification goes to:
- The "owner" account only
- All active staff accounts
- The specific user who was supposed to accept the order

**Required action:** Clarify notification recipient scope for vendor-side alerts.

---

### EC-16: Localization / i18n

The notification templates are in English:

> "Unfortunately, [Restaurant Name] was unable to confirm your scheduled order."

CurryDash appears to be targeting a market that may require multiple languages. Are notification templates localized? Where are they stored? Are they hardcoded strings or template references?

**Required action:** Define notification template storage strategy. At minimum, note that templates should be externalizable for future i18n.

---

### EC-17: Real-Time Order Status Update

When the order is auto-cancelled, does the customer's order tracking page update in real-time? CUR-20 (Order Status Timeline) shows a real-time progress view. If the customer is actively watching their order, they should see the cancellation appear without refreshing.

This requires Supabase Realtime broadcast on the order status change. The Central Hub codebase uses Realtime for dashboard widgets, but the customer app's Realtime implementation depends on CUR-149.

---

## 6. Edge Cases -- Financial and Legal

### EC-18: Expired Payment Method

If the customer's credit card has expired between order placement and the refund attempt (up to 24+ hours later):
- Stripe handles this: refunds to expired cards are typically processed by the issuing bank to the same account. Stripe will still succeed.
- But for other payment methods (if ever added), this may not be true.

**Low risk for Stripe, but document the assumption.**

---

### EC-19: Transaction Fee Absorption

When a payment is refunded via Stripe:
- Stripe keeps the original processing fee (~2.9% + $0.30). The platform does not get this back.
- On a $20 order, the platform loses ~$0.88 per auto-cancellation.
- If a vendor has 50 auto-cancelled orders, the platform loses ~$44 in fees alone.

**Required action:** Decide:
- Does the platform absorb transaction fees? (Yes, for now -- but track it.)
- Should repeat offender vendors be penalized?
- Should there be a vendor deactivation threshold (e.g., >20% cancellation rate)?

---

### EC-20: Audit Trail for Financial Compliance

Auto-refunds are financial transactions that may need:
- Audit logging (who triggered, when, why, amount, Stripe refund ID)
- Reconciliation reports (match Stripe refunds to order cancellations)
- Tax reporting implications (refunded orders may need tax adjustment)
- SOX/PCI compliance considerations

The existing `dead_letter_events` table is for failures. There is no `refund_events` or `financial_audit_log` table.

**Required action:** Define the audit trail schema. Every auto-cancellation must produce a record with: `order_id`, `refund_amount`, `stripe_refund_id`, `cancellation_reason`, `triggered_by` (system/cron), `timestamp`.

---

### EC-21: Abuse Vector -- Refund Farming

A malicious actor could:
1. Create a vendor account
2. Never accept orders
3. Have accomplice customers place orders with stolen cards
4. Orders auto-cancel, refund goes to the card
5. Original card owner does chargeback anyway

Or:
1. Place orders to a vendor they know won't respond
2. Get free money tied up for 24 hours (opportunity cost attack)
3. Use the refund delay to game loyalty/points systems

**Required action:** Implement monitoring:
- Alert if a vendor's auto-cancellation rate exceeds a threshold
- Alert if a customer has >N auto-cancelled orders in a period
- Rate limit order placement per customer per vendor

---

### EC-22: Promo Code / Discount Handling

If the customer used a promo code (e.g., "FIRST20" for 20% off):
- Is the promo code restored for reuse after auto-cancellation? (It should be.)
- If the promo was single-use and expired during the 24h window, can it be restored?
- What if the promo was "first order only" and this auto-cancelled order was their first? Do they get another "first order" chance?

**Required action:** Define promo code restoration behavior on auto-cancellation. This likely requires a dependency on a promotions system (CUR-38, CUR-53).

---

## 7. Implementation Readiness Assessment

### Infrastructure Gaps

| Component | Status | Blocker? |
|-----------|--------|----------|
| Orders table / schema | Does not exist in codebase | YES |
| Order status enum | Not defined | YES |
| Stripe integration | CUR-151: To Do | YES |
| Stripe Refund API wrapper | Not implemented | YES |
| Push notifications (Firebase) | CUR-152: To Do | YES |
| Email notification service | CUR-138: To Do | YES |
| Vendor notification system | CUR-134: To Do | YES |
| Cron job infrastructure | Exists (refresh-webhooks pattern) | No |
| Dead letter / error logging | Exists | No |
| System health monitoring | Exists | No |
| Vendor Response Rate table | Does not exist | YES |
| Cancellation reason enum | Not defined | YES |
| Order History display | CUR-27: To Do | Partial |
| Vendor dashboard alerts | Not implemented | YES |

### Existing Patterns to Reuse

The codebase has a well-established pattern at `src/app/api/cron/refresh-webhooks/route.ts` that should be used as the template:
- `CRON_SECRET` bearer token authentication
- Correlation ID generation
- Structured logging with source identification
- Dead letter event writing on failure
- System health table upsert

The `LogSource` type in `src/lib/logger.ts` currently only supports: `'webhook:jira' | 'webhook:github' | 'auth' | 'ai' | 'realtime' | 'admin'`. A new source like `'cron:order-cancellation'` would need to be added.

### Database Readiness

The current schema (`supabase/migrations/20260218000001_initial_schema.sql`) contains zero order-related tables. The following tables would need to exist before this ticket can be implemented:

- `orders` (with `status`, `created_at`, `scheduled_delivery_at`, `payment_intent_id`, `vendor_id`, `customer_id`)
- `order_items` (with snapshot fields per CAD-147's "Snapshot Rule")
- `order_cancellations` (audit table: `order_id`, `reason`, `refund_amount`, `stripe_refund_id`, `initiated_at`, `completed_at`)
- `vendor_metrics` (for Response Rate tracking)

### Idempotency Requirement

If the cron runs twice and picks up the same orders:
- The SELECT query will return orders that are still `'pending'` -- if the first run already changed them to `'cancelled'`, the second run won't find them. This is safe.
- But if the first run changed status to `'refund_in_progress'` (intermediate state) and crashed before completing, the second run needs to detect and retry. The query must account for this state.
- Stripe refunds are naturally idempotent if you pass an idempotency key. The implementation MUST use Stripe idempotency keys derived from the order ID.

---

## 8. Dependency Analysis

### Hard Dependencies (Must Exist Before CAR-206)

| Ticket | Description | Status | Why Blocking |
|--------|-------------|--------|--------------|
| CUR-149 | Order Management API | To Do | Orders table, status enum, cancellation endpoint |
| CUR-151 | Stripe Payment Integration | To Do | Refund API, PaymentIntent storage |
| CUR-148 | Cart & Checkout API | To Do | Order creation flow, `created_at` semantics |
| CUR-109 | Design Complete ERD | Ready for PROD | Order schema definition, status enums |

### Soft Dependencies (Should Exist, Could Be Stubbed)

| Ticket | Description | Status | Why Related |
|--------|-------------|--------|-------------|
| CUR-134 | Vendor New Order Notifications | To Do | Vendor alert infrastructure |
| CUR-135 | Order Status Change Notifications | To Do | Customer cancellation notification |
| CUR-136 | Customer Order Update Notifications | To Do | Customer push notification |
| CUR-138 | Email Notifications | To Do | Email channel for cancellation notice |
| CUR-152 | Firebase Push Notification Integration | To Do | Push notification delivery |
| CUR-139 | SMS Notifications | To Do | Fallback notification channel |
| CAD-147 | Inactive Food Items (Snapshot Rule) | In Progress | Order item snapshot pattern |

### Cross-Ticket Conflicts

CAR-206 acceptance criteria state:

> Order History correctly shows status as "Cancelled - Vendor Timeout"

But CUR-149 (Order Management API) acceptance criteria state:

> Given a customer wants to cancel, When they call POST `/api/v1/orders/{id}/cancel` before vendor accepts, Then the order is cancelled and refund initiated

These are two different cancellation paths (customer-initiated vs system-initiated). They must share:
- The same refund logic
- The same status transition rules
- Different cancellation reason values
- Different notification templates

This shared logic should be extracted into a common service, not duplicated.

---

## 9. Recommended Actions Before Implementation

### Must-Do (Blockers)

1. **Define the Order Status Enum** -- Create a formal enum with values like: `pending`, `accepted`, `preparing`, `ready`, `picked_up`, `in_transit`, `delivered`, `cancelled`, `refund_pending`, `refunded`. Get sign-off from all consuming tickets.

2. **Define the Cancellation Reason Enum** -- Values: `customer_requested`, `vendor_unresponsive`, `vendor_rejected`, `system_timeout`, `payment_failed`, `out_of_stock`.

3. **Implement CUR-149 and CUR-151 first** -- The orders table and Stripe integration are hard prerequisites. No orders table = no orders to cancel.

4. **Fix the cron frequency** -- Pick 30 minutes. Document that worst-case cancellation is 24h 30m.

5. **Define the safety buffer formula** -- `cancellation_deadline = MIN(created_at + 24h, scheduled_time - 2h)`. Handle edge cases where deadline is in the past.

6. **Design the refund state machine** -- `pending -> refund_in_progress -> cancelled` (on refund success) or `pending -> refund_in_progress -> refund_failed` (on refund failure, retry on next cron).

7. **Add the audit trail table** -- `order_cancellations` with full financial audit fields.

### Should-Do (High Value)

8. **Add Stripe idempotency keys** -- Use `order_id` as the idempotency key for refund requests to prevent duplicate refunds.

9. **Add batch size limits** -- Process max 50 cancellations per cron run to avoid Stripe rate limits and notification storms.

10. **Add escalation notifications** -- Warn vendors at 12h and 22h before auto-cancellation.

11. **Add monitoring dashboard** -- Track auto-cancellation volume, refund success rate, average time-to-cancel.

12. **Correct the "3-5 business days" claim** -- Change to "5-10 business days" or make it dynamic.

### Nice-to-Have (Defensive)

13. **Vendor deactivation threshold** -- Auto-disable vendors with >X% unaccepted orders.

14. **Customer abuse monitoring** -- Flag customers with suspiciously high auto-cancellation rates.

15. **Configurable timeout** -- Allow the 24-hour window to be adjusted per-vendor or globally via admin settings (CUR-140).

---

## 10. Test Scenarios the Ticket Misses

These test cases are not covered by the acceptance criteria and MUST be added:

| # | Scenario | Expected Result |
|---|----------|-----------------|
| T1 | Order placed exactly 24h ago, vendor accepts 1 second before cron runs | Order is NOT cancelled (vendor accepted in time) |
| T2 | Cron runs but Stripe returns HTTP 500 for refund | Order moves to intermediate state, retried on next run |
| T3 | Cron runs, Stripe returns `"pending"` refund status | Order stays in `refund_in_progress`, checked on next run |
| T4 | 100 orders eligible for cancellation in single cron run | Processed in batches, no Stripe rate limit hit |
| T5 | Order placed 3 hours before scheduled delivery, vendor hasn't accepted | Cancelled at `scheduled_time - 2h` (1 hour after placement) |
| T6 | Order placed 30 minutes before scheduled delivery | Should have been rejected at order placement, or cancelled immediately |
| T7 | Order with promo code auto-cancelled | Promo code restored for reuse |
| T8 | Order with partial loyalty points payment auto-cancelled | Points and payment both refunded |
| T9 | Cron job crashes mid-batch (after cancelling 3 of 10 orders) | Remaining 7 are picked up on next run; cancelled 3 are not re-processed |
| T10 | Customer's notification preferences are "email only" | No push sent, email sent, order history updated |
| T11 | Vendor has push notifications disabled | In-app notification still recorded |
| T12 | Same order picked up by two concurrent cron executions | Only one cancellation/refund is processed (idempotent) |
| T13 | Order auto-cancelled; customer views Order History | Shows "Cancelled - Vendor Timeout" with refund details and timeline |
| T14 | Database connection drops during cron execution | Error logged to dead_letter, system_health updated, next run recovers |
| T15 | Vendor is completely deactivated/deleted between order placement and auto-cancel | Order still cancelled and refunded normally |
| T16 | Order placed during DST transition | 24-hour calculation uses UTC, unaffected by DST |
| T17 | Customer changes scheduled time to 1 hour from now while order is pending | Safety buffer recalculates, order cancelled if within 2h buffer |

---

## Summary Verdict

**This ticket is not ready for implementation.** It has:

- **6 hard blocking dependencies** on unimplemented tickets (orders table, Stripe, notifications)
- **3 data model ambiguities** that will cause bugs if interpreted differently by different developers (status enum, cancellation reason, ID format)
- **1 dangerous typo** in a status value that could propagate to production
- **At least 12 unaddressed edge cases** involving real customer money
- **Zero specification** of error handling, retry logic, or state machine transitions for a financial operation

The ticket should be sent back to the product owner and architect for refinement, with this review attached. Implementation should be sequenced AFTER CUR-149, CUR-151, and CUR-148 are completed.
