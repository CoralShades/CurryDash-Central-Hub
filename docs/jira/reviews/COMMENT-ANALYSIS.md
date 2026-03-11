# Flagged Ticket Comment & Link Analysis

> **Date**: 2026-03-11 | **Tickets analyzed**: 7 flagged for potential issues
> **Method**: Fetched via Atlassian MCP — comments, issue links, cross-references

---

## Summary Matrix

| Ticket | Comments | Links | Assignee | Status | Key Finding |
|--------|----------|-------|----------|--------|-------------|
| CAD-202 | 0 | 1 (blocks CAD-114) | Ramesh | In Progress | No CAD-179 overlap visible from ticket |
| CAD-200 | 0 | 1 (blocks CAD-66) | Unassigned | To Do | Same root cause as CAD-202 |
| CAR-198 | 0 | 2 (blocks PACK-106, CAR-200) | Unassigned | To Do | Blocks 2 QA tasks; references PACK-206 |
| CAR-205 | 2 | 1 (blocked by CAD-147) | Unassigned | To Do | NOT READY; duplicate of CAR-146 |
| PACK-198 | 0 | 0 | Kasun | To Do | Isolated investigation — no links |
| PACK-226 | 0 | 0 | Unassigned | To Do | Isolated cart bug — should link to PACK-198 |
| CUR-156 | 1 | 0 | Unassigned | To Do | Confirmed duplicate of CAR-206 |

---

## Detailed Analysis

### CAD-202 — Package Module Permission

- **Issue Links**: Blocks CAD-114 (Story 6.2: Role Definition) — In Progress
- **Description references**: CAD-114 comment (focusedCommentId=16141) about permissions matrix missing None/View/Edit/Full levels
- **Overlap with CAD-179**: Not visible from this ticket alone. Both add Package to permissions.
- **Recommendation**: Check if CAD-179 should be merged into CAD-202

### CAD-200 — Package Section Not Accessible + No Audit Trail

- **Issue Links**: Blocks CAD-66 (Admin Package Detail & Modification) — DevTested
- **Two-part bug**: (1) Admin users can't see Package section (only Super Admin), (2) No audit trail on modify
- **Root cause**: Same as CAD-202 — Package not in module permissions list
- **Recommendation**: Link to CAD-202, fix together

### CAR-198 — Order Status "Placed" Before Payment

- **Issue Links**: Blocks PACK-106 (QA: Stripe test cards) — In Progress, blocks CAR-200 (QA: Stripe test) — In Progress
- **References**: PACK-206 (mobile order status display)
- **Reproduction**: Stripe declined test card `4000 0000 0000 0002`, Order ID 100088
- **Key insight**: Root cause = order lifecycle initialization before payment confirmation
- **High severity**: Affects backend order workflow, payment integrity, vendor notifications

### CAR-205 — Handling Inactive Food Items

- **Comments**: 2 from Demi (2026-03-06)
- **Comment 1**: QA Review — NOT Ready for Development
  - Zero acceptance criteria
  - Scope mismatch: title says food items, description only covers Package Unassign dialog
  - Description copy-pasted from CAD-147
  - 3 options proposed: (A) Merge into CAD-147, (B) Reduce to frontend-only, (C) Add full scope
- **Comment 2**: Duplicate & Overlap Findings
  - CAR-146 is seller-side version of CAD-147
  - PACK-203 (active bug) proves this is needed
  - Code check: `FoodResource.php` has `$record->carts()?->delete()` but only on hard-delete
  - Warning dialog described doesn't exist in code
- **Cross-references**: CAD-147, CAR-146, CAR-203, PACK-203
- **Recommendation**: Close as duplicate of CAR-146

### PACK-198 — INVESTIGATE: Package Ordering Related Bugs

- **Completely isolated**: 0 comments, 0 links
- **Should link to**: PACK-226, PACK-222, CAD-149

### PACK-226 — Editing Package Config Creates Duplicate Cart Item

- **Completely isolated**: 0 comments, 0 links
- **Has**: Screenshot attachment, clear reproduction steps
- **Should link to**: PACK-198 (investigation task)

### CUR-156 — Auto-Cancellation and Refund Logic

- **Comment** (2026-03-06 by Demi): Confirmed duplicate of CAR-206
  - CUR-156 is broader (ASAP + scheduled + vendor nudging)
  - CAR-206 only covers scheduled (24hr rule)
  - Recommendation: Merge CAR-206 → CUR-156, close CAR-206
- **Hard dependencies**: CUR-149 (Order API), CUR-151 (Stripe), CUR-148 (Cart API)
- **PRD note**: No auto-cancellation requirement in PRD. Only FR142 (refund on vendor rejection).
- **Beyond PRD scope**: PO sign-off recommended

---

## Orphaned Tickets (need links created)

| Ticket | Missing Links |
|--------|--------------|
| PACK-226 | → PACK-198 (investigation) |
| PACK-198 | → PACK-226, PACK-222, CAD-149 |
| CAD-200 | → CAD-202 (same root cause) |
| CAR-198 | → CAR-207 (premature status) |
| CUR-156 | → CAR-206 (confirmed duplicate) |

---

## All Jira Comments Posted (across all sessions)

### Session 2026-03-06
| Ticket | Comment ID | Content |
|--------|-----------|---------|
| CAR-203 | 16120 | QA review — blocked by CAR-205 |
| CAR-204 | 16121 | QA review — status/is_active undefined |
| CAR-205 | 16122 | QA review — zero ACs, 3 restructuring options |
| CAD-147 | 16123 | QA review — contradicts CAD-149 |
| CAR-206 | 16124 | QA review — 4 blocking deps |
| CAR-203 | 16127 | Duplicate follow-up |
| CAR-204 | 16128 | Duplicate follow-up |
| CAR-205 | 16129 | Duplicate follow-up |
| CAD-147 | 16130 | Duplicate follow-up |
| CAR-206 | 16131 | Duplicate follow-up |
| CUR-156 | 16132 | Duplicate alert |
| CAD-149 | 16133 | Related bugs alert |
| CAD-67 | 16134 | Contradiction with CAR-204 |
| CAD-199 | 16135 | Links to 5 reviewed tickets |
| CAR-146 | 16136 | Overlap with CAR-205 |

### Session 2026-03-10
| Ticket | Comment ID | Content |
|--------|-----------|---------|
| CAD-97 | 16292 | Request More Info workflow + email + privacy CMS |
| CAD-98 | 16293 | Audit log spec + multi-location + name sync |
| CAD-101 | 16294 | Performance tab + UI wireframe + Chart.js |
| CAR-156 | 16295 | Two-tier holidays + Aus holidays + Flutter |
| CAD-97 | 16299 | Confluence link + subtask list |
| CAD-98 | 16300 | Confluence link + subtask list |
| CAD-101 | 16301 | Confluence link + subtask list |
| CAR-156 | 16302 | Confluence link + subtask list |
| PACK-223 | 16336 | Architecture decision (Hybrid) |
| CAD-149 | 16337 | Hybrid spec + Ramesh alert |
| CAD-205 | 16338 | Architecture decision + Ruchiran scope |
| CAD-220 | 16339 | Enhancement following CAD-15 |
| CAD-206 | 16340 | Standalone security bug |

### Confluence Pages Published (5)
| Page | ID | Content |
|------|----|---------|
| Overview | 122191873 | Vendor Management — Implementation Review |
| CAD-97 | 122454017 | Application Approval — Review & Plan |
| CAD-98 | 122486786 | Vendor Profiles — Review & Plan |
| CAD-101 | 122519553 | Performance Metrics — Review & Plan |
| CAR-156 | 122093581 | Holiday Hours — Review & Plan |

### Jira Subtasks Created (17)
| Parent | Subtasks |
|--------|----------|
| CAD-97 | CAD-208, CAD-209, CAD-210, CAD-211 |
| CAD-98 | CAD-212, CAD-213, CAD-214, CAD-215 |
| CAD-101 | CAD-216, CAD-217, CAD-218, CAD-219 |
| CAR-156 | CAR-208, CAR-209, CAR-210, CAR-211, CAR-212 |

### Issue Links Created (5)
| Link | Type |
|------|------|
| CAD-149 ↔ CAD-205 | Relates |
| CAD-149 ↔ PACK-223 | Relates |
| CAD-205 ↔ PACK-223 | Relates |
| CAD-15 ↔ CAD-220 | Relates |
| CAD-195 ↔ CAD-206 | Relates |

### Issue Type Changes
| Ticket | From | To |
|--------|------|-----|
| CAR-156 | Bug | Story |

### Assignments Made
| Ticket | From | To |
|--------|------|-----|
| CAD-206 | Unassigned | Ruchiran Avishka |
