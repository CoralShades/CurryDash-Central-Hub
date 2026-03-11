# CAR-156 Review: Holiday Hours / Specific Dates

> Review Date: 2026-03-10
> Reviewer: AI Agent (Adversarial + Edge Case + Readiness)

## 1. Adversarial Review

### Gaps & Contradictions

| # | Finding | Severity | Details |
|---|---------|----------|---------|
| 1 | **Filed as Bug, but it's a missing feature** | HIGH | No holiday/exception functionality was ever implemented. This is a new feature request disguised as a bug. Should be reclassified. |
| 2 | **No AC in ticket at all** | CRITICAL | The ticket has expected/actual results but no acceptance criteria. What constitutes "done"? |
| 3 | **Global vs vendor holidays not defined** | HIGH | Who defines holidays? Admin only? Vendors only? Both? The plan proposes a two-tier system but this isn't in the ticket. |
| 4 | **Flutter app impact not mentioned** | HIGH | Bug report only mentions the vendor web panel, but the Flutter user app also needs to respect holiday hours for checkout validation. |
| 5 | **No timezone handling mentioned** | MEDIUM | Australian holidays vary by state/territory. A vendor in NSW has different holidays than QLD. |
| 6 | **No recurring holiday support mentioned** | MEDIUM | Christmas is every Dec 25. Need recurring vs one-off holiday distinction. |
| 7 | **Related tickets not linked** | MEDIUM | CAR-109 (parent story) and CAR-102 (operational config subtask) are related but not linked in Jira. |
| 8 | **No validation rules for exception dates** | MEDIUM | Can vendors set exceptions in the past? How far in advance? |

### Missing Acceptance Criteria

1. **Holiday definition**: What holidays are supported (national, state, custom)?
2. **Admin functionality**: CRUD for global holidays, pre-populated list
3. **Vendor functionality**: Override hours for specific dates, add custom closed dates
4. **Customer-facing**: How holidays appear in the app (closed indicator, modified hours)
5. **API contract**: Schedule endpoint that returns effective schedule for a given date
6. **Checkout validation**: Orders rejected for holiday-closed restaurants
7. **Notification**: Should vendors/customers be notified of upcoming closures?

## 2. Edge Cases

| # | Edge Case | Risk | Mitigation |
|---|-----------|------|------------|
| 1 | Vendor sets exception for today (same-day closure) | HIGH | Active orders in progress — need handling policy |
| 2 | Customer has item in cart, restaurant closes for holiday | HIGH | Cart validation must check exceptions before checkout |
| 3 | Vendor overrides global holiday to stay open | MEDIUM | Override must take precedence over global closure |
| 4 | Vendor in multiple timezones (hypothetical) | LOW | Use restaurant's timezone for schedule checking |
| 5 | Recurring holiday falls on different days (Easter) | MEDIUM | Recurring flag only works for fixed-date holidays; movable feasts need annual setup |
| 6 | Exception spans multiple days (e.g., holiday week) | MEDIUM | UI for single date vs date range? |
| 7 | Vendor creates exception, then admin adds global holiday for same date | LOW | Vendor exception should take precedence |
| 8 | Past exception dates cluttering the list | LOW | Auto-archive past exceptions |
| 9 | API returns schedule for date 1 year in future | LOW | No exceptions defined yet — fall back to weekly schedule |
| 10 | 100+ exceptions defined by a single vendor | LOW | Pagination + cleanup of past dates |

## 3. PRD Alignment (FR5)

- **FR5** (assumed): Operating hours configuration including exceptions
- The ticket addresses a gap in FR5 implementation
- Current system only supports weekly schedules (Mon-Sun), not date-specific exceptions
- Both admin and vendor portal changes needed

## 4. Implementation Readiness Assessment

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC clarity | ❌ MISSING | No ACs in ticket — only bug symptoms |
| Design decisions made | ⚠️ PARTIAL | Plan defines two-tier approach, Demi hasn't confirmed on Jira |
| Technical feasibility | ✅ READY | RestaurantSchedule exists, can add exception table alongside |
| Dependencies clear | ⚠️ PARTIAL | Touches Laravel backend + Flutter app — cross-platform coordination |
| Testable ACs | ❌ MISSING | Need ACs first |

### Overall: **NOT READY — NEEDS ACs + DESIGN CONFIRMATION**
This ticket needs to be rewritten as a Story with proper ACs before implementation begins. The bug classification is misleading — this is new feature development.

## 5. Recommendations

1. **Reclassify as Story**: This is a feature, not a bug
2. **Write proper ACs**: Based on two-tier holiday system design
3. **Link to CAR-109 and CAR-102**: Establish ticket relationships
4. **Create subtasks**: Separate backend (Laravel), frontend (Blade), Flutter app, and Australian holiday seeder work
5. **Pre-populate Australian holidays**: Use official government holiday dates for 2026-2027
6. **State-aware holidays**: Account for state-specific public holidays (NSW, VIC, QLD, SA, WA, TAS, NT, ACT)
7. **Prioritize over other tickets**: This affects customer experience directly — customers may try to order from closed restaurants
