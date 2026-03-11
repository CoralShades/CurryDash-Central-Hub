# CAD-98: Story 4.3 — Vendor Profile Management

> Snapshot captured: 2026-03-10
> Source: [CAD-98](https://coralshades.atlassian.net/browse/CAD-98)

## Ticket Details

| Field | Value |
|-------|-------|
| **Key** | CAD-98 |
| **Type** | Story |
| **Project** | CurryPackApp - Admin Dashboard (CAD) |
| **Epic** | Epic 4: Vendor Management |
| **Status** | In Progress |
| **Priority** | Medium |
| **Assignee** | Ramesh Sanjaya |
| **Reporter** | Deshan Thathsara (Demi) |
| **Created** | 2025-12-17 |
| **Updated** | 2026-03-09 |
| **FR Reference** | FR49 |

## Description

As an **admin**,
I want **to view and edit vendor profiles**,
So that **I can help vendors update information or correct issues**.

## Acceptance Criteria

1. View complete vendor info (business, restaurants, documents, history)
2. Edit fields with immediate save and audit log
3. Update business name with notes
4. Manage multi-location vendors

---

## Comments History

### Comment 1 — Ramesh Sanjaya (2025-12-29)
> Tested in server. Functionality working as expected.

### Comment 2 — Kasun Mendis (2026-01-06) — QA
> 2026-01-05 Tested as admin user
> **TEST PASS**
> - Restaurant name, banner, restaurant photo
> - Zone, address information
> - TIN number, expiration dates, Business TIN (document)
> - Packages, food item modification

### Comment 3 — Kasun Mendis (2026-01-19) — QA
> 2026-01-19 Tested as admin user (merchants.currydash.au)
> **TEST FAIL**
> - Modify restaurant action leads to a 500 screen ⚠️
> - Create restaurant action (save) leads to a 500 screen ⚠️

### Comment 4 — Ramesh Sanjaya (2026-01-20)
> @Ruchiran Avishka We need to run the DB migrations again

### Comment 5 — Ramesh Sanjaya (2026-01-21)
> Tested in server. Bug fixed.

### Comment 6 — Kasun Mendis (2026-01-23) — QA
> 2026-01-22 Tested as admin user
> - View complete vendor info (business, restaurants, documents, history) ✅
> - Edit fields with immediate save and audit log — **audit log not yet implemented** ⚠️
> - Update business name with notes ✅
> - Manage multi-location vendors — **feature not yet implemented** ⚠️
> - Restaurant name changes are not reflected in admin, merchant and web app portals ⚠️

### Comment 7 — Ramesh Sanjaya (2026-03-09) ⭐ LATEST
> @Deshan Thathsara @Kasun Mendis
>
> Need to clarify:
> - **Audit log**: Page location, content, filters
> - **Manage multi-location vendors**: Need more info about this functionality

---

## Current Implementation Status

| AC Item | Status | Notes |
|---------|--------|-------|
| View complete vendor info | ✅ Done | Business, restaurants, documents, history visible |
| Edit fields with immediate save | ✅ Done | Working after Jan 21 bug fix |
| Audit log | ❌ Not Started | Ramesh asking for design specs (location, content, filters) |
| Update business name with notes | ✅ Done | |
| Manage multi-location vendors | ❌ Not Started | Ramesh asking for functionality details |
| Restaurant name sync across portals | ⚠️ Bug | Name changes not reflected in admin/merchant/web portals |

## Ramesh's Open Questions (2026-03-09)
1. Where should the audit log page live? (Separate tab? Vendor detail page?)
2. What fields/actions should the audit log track?
3. What filters should be available?
4. How should multi-location vendor management work?
