# Jira Tickets Index

> Generated: 2026-03-06 | Source: Atlassian MCP

---

## Tickets Under Review (from QA tester)

| File | Key | Summary | Type | Status |
|------|-----|---------|------|--------|
| [CAR-206](./CAR-206.md) | CAR-206 | Auto-Cancellation Logic for Unaccepted Scheduled Orders (24-Hour Rule) | Backend | To Do |
| [CAR-205](./CAR-205.md) | CAR-205 | Handling Inactive Food Items | Backend | To Do |
| [CAR-204](./CAR-204.md) | CAR-204 | Disable 'Delete' Action for Packages | Frontend | To Do |
| [CAR-203](./CAR-203.md) | CAR-203 | Disable 'Delete' Action for Food Items | Frontend | To Do |
| [CAD-147](./CAD-147.md) | CAD-147 | Remove Deleted/Inactive Food Items Associated with Packages | Backend | In Progress |

### Ticket Relationships
```
CAR-203 ←→ CAR-204  (mirror: food items vs packages, same UI pattern)
CAR-205 → CAD-147   (explicit link: seller-side references admin-side)
CAD-147              (most complex: 3 subsystems — packages, carts, order snapshots)
CAR-206              (standalone: auto-cancellation, vendor responsiveness)
```

---

## Ramesh Sanjaya's Board Tickets

| File | Project | Count | Status Breakdown |
|------|---------|-------|------------------|
| [ramesh-cad-board.md](./ramesh-cad-board.md) | CAD (Admin Dashboard) | 46 | To Do (14), DEVTESTED (11), READY FOR UAT (9), In Progress (8), SIT (4) |
| [ramesh-cur-board.md](./ramesh-cur-board.md) | CUR (CurryDash) | 45 | To Do (44), Ready for PROD (1) |

**Total active tickets for Ramesh: 91**

### CAD Issue Types
- Story (14), Backend Task (13), Frontend Task (11), Bug (7), Epic (1)

### CUR Categories
- Customer App prototyping (CUR-20 to CUR-28)
- Seller Portal prototyping (CUR-32 to CUR-38)
- Driver Portal (CUR-42, CUR-44)
- Admin Portal prototyping (CUR-47 to CUR-53)
- ERD design (CUR-109)
- Notification stories Epic 10 (CUR-134 to CUR-139)
- Admin/API stories Epic 11 (CUR-140 to CUR-153)

---

## Reviews

| File | Description |
|------|-------------|
| [MASTER-REVIEW-SUMMARY](./reviews/MASTER-REVIEW-SUMMARY.md) | Cross-ticket summary — all 5 NOT READY |
| [DUPLICATE-ANALYSIS](./reviews/DUPLICATE-ANALYSIS.md) | Cross-project duplicate & overlap analysis — 1 direct dup, 5 pairs, 3 bugs, 7 PRD gaps |
| [CAR-203-review](./reviews/CAR-203-review.md) | 5 critical, 7 high — no toggle UI, no backend API |
| [CAR-204-review](./reviews/CAR-204-review.md) | 7 critical, 9 high — no packages table, cascade gaps |
| [CAR-205-review](./reviews/CAR-205-review.md) | Ghost ticket — zero acceptance criteria, scope overlap with CAD-147 |
| [CAD-147-review](./reviews/CAD-147-review.md) | 6 critical — contradicts CAD-149, scope tripled, should be 3-5 tickets |
| [CAR-206-review](./reviews/CAR-206-review.md) | 17 blocking — no payment infra, 4 hard dependencies unimplemented |

---

## Comment Analysis

| File | Description |
|------|-------------|
| [ramesh-mentions-and-requests](./ramesh-mentions-and-requests.md) | Demi mentions: 0, Clarification requests: 3 tickets |
| [ramesh-comment-requests](./ramesh-comment-requests.md) | 8 detail requests from testers/developers across 11 issues |
