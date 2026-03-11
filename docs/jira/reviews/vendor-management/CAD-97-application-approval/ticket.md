# CAD-97: Story 4.2 — Application Approval/Rejection

> Snapshot captured: 2026-03-10
> Source: [CAD-97](https://coralshades.atlassian.net/browse/CAD-97)

## Ticket Details

| Field | Value |
|-------|-------|
| **Key** | CAD-97 |
| **Type** | Story |
| **Project** | CurryPackApp - Admin Dashboard (CAD) |
| **Epic** | Epic 4: Vendor Management |
| **Status** | SIT (In Progress) |
| **Priority** | Medium |
| **Assignee** | Ramesh Sanjaya |
| **Reporter** | Deshan Thathsara (Demi) |
| **Created** | 2025-12-17 |
| **Updated** | 2026-03-09 |
| **FR Reference** | FR48 |

## Description

As an **admin**,
I want **to approve or reject vendor applications with notes**,
So that **vendors receive clear decisions and feedback on their applications**.

## Acceptance Criteria

1. Approve changes status to "Active" with notification
2. Reject with reason and notes, logged in audit trail
   - Rejected users should be notified via email
3. "Request More Info" option for additional documents
4. All actions logged with timestamp (NFR17)

---

## Comments History

### Comment 1 — Ramesh Sanjaya (2026-02-25)
> Done

### Comment 2 — Ramesh Sanjaya (2026-02-26)
> @Kasun Mendis @Minuri Rubasinghe
> - "Request More Info" option for additional documents functionality need to be discussed ⚠️
>
> Other mentioned options implemented ✅
>
> Moving the ticket to dev tested column

### Comment 3 — Ramesh Sanjaya (2026-02-26)
> @Kasun Mendis @Minuri Rubasinghe
> - Filter by "Documents Complete" option can't be implemented since there is no document complete status
>
> Other functions done
>
> **TEST PASS** ✅

### Comment 4 — Minuri Rubasinghe (2026-03-03)
> @Ramesh Sanjaya As discussed in the meeting, please proceed with the necessary implementation.
>
> Pushing the ticket back to SIT

### Comment 5 — Ramesh Sanjaya (2026-03-09) ⭐ LATEST
> @Deshan Thathsara @Kasun Mendis
>
> - To fully complete the ticket, we need to add the **"Request More Info"** functionality.
> - Also need the Approve/reject email templates to be set up.
>   - [Screenshot: email_templates table showing approve/reject templates]
>   - [Screenshot: email template editor]
> - We need to setup privacy policy page.
>   - [Screenshot: privacy policy page in vendor registration flow]

---

## Current Implementation Status

| AC Item | Status | Notes |
|---------|--------|-------|
| Approve → "Active" + notification | ✅ Done | Implemented in VendorController |
| Reject with reason + audit trail | ✅ Done | RestaurantModerationLog captures action |
| Rejection email notification | ⚠️ Partial | Email template needs setup in email_templates table |
| "Request More Info" option | ❌ Not Started | Needs design decision — pushed back to SIT |
| All actions logged (NFR17) | ✅ Done | Via RestaurantModerationLog |
| Privacy policy page | ❌ Not Started | Ramesh flagged as needed |
| "Documents Complete" filter | ❌ Blocked | No document complete status exists |

## Ramesh's Open Questions (2026-03-09)
1. How should "Request More Info" work? (Document checklist? Free-form?)
2. Email templates need to be configured in `email_templates` table
3. Privacy policy page needs to be created
