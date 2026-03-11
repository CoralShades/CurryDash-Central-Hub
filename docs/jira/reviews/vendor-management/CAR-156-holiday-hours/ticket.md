# CAR-156: Unable to Add Holiday Hours / Specific Dates

> Snapshot captured: 2026-03-10
> Source: [CAR-156](https://coralshades.atlassian.net/browse/CAR-156)

## Ticket Details

| Field | Value |
|-------|-------|
| **Key** | CAR-156 |
| **Type** | Bug |
| **Project** | CurryPackApp - Seller Dashboard (CAR) |
| **Epic** | Epic 4: Vendor Management |
| **Status** | To Do |
| **Priority** | Medium |
| **Assignee** | Ramesh Sanjaya |
| **Reporter** | Minuri Rubasinghe |
| **Created** | 2026-01-14 |
| **Updated** | 2026-03-09 |
| **FR Reference** | FR5 |
| **Related** | CAR-109 (parent story), CAR-102 (operational config subtask) |

## Description

In the **Operating Hours Configuration** section, vendors are unable to add exceptions for holidays or specific dates.

**Environment**
- Platform: Web (Vendor / Restaurant Panel)
- URL: https://merchants.currydash.au/restaurant-panel/business-settings/restaurant-setup
- Browser: Safari (latest)

## Expected Result
- Holiday or specific date appears correctly in the vendor schedule grid
- Customers see the correct availability for that date on the app

## Actual Result
- Holiday / specific date is **not saved or displayed** in the schedule
- Customers see the default operating hours, ignoring the holiday exception

---

## Comments History

### Comment 1 — Ramesh Sanjaya (2026-03-09) ⭐ LATEST
> @Deshan Thathsara @Kasun Mendis
>
> - Holiday / specific date is **not saved or displayed** in the schedule — **"What are the holidays/Special days"?**
> - If they are defined by vendors, How/From where they define it?

---

## Current Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| Weekly schedule (Mon-Sun) | ✅ Exists | RestaurantSchedule model: day (0-6), opening_time, closing_time |
| Off-day support | ✅ Exists | `off_day` column on restaurants (concatenated day numbers) |
| Holiday/exception dates | ❌ Missing | No table, model, or UI exists for date-specific exceptions |
| Global holidays | ❌ Missing | No admin-managed holiday list |
| Flutter app schedule check | ✅ Partial | Checks weekly schedule only, no exception awareness |

## Ramesh's Open Questions (2026-03-09)
1. What are the "holidays/special days"? Pre-defined list or vendor-defined?
2. How/where do vendors define holiday hours?

## Design Decision (from plan)
**Decision**: Two-tier system — Global holidays (admin-defined) + Vendor overrides
- Admin defines global holidays (Settings > Holidays) with Australian public holidays pre-populated
- Vendors inherit global holidays automatically (shown as "Inherited")
- Vendors can override: add custom closed dates, modify hours for specific dates
- New tables: `global_holidays`, `restaurant_schedule_exceptions`

## Root Cause Analysis
This is **not actually a bug** — the feature was never implemented. The ticket is filed as a Bug because the UI hints at holiday support but no backend/database support exists. Should be **reclassified as a Feature/Story**.
