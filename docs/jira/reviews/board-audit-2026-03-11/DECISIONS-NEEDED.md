# Decisions Needed From Demi — 2026-03-11

> **Context**: Full 4-project board audit (490 tickets analyzed)
> **Action**: Review each decision below. Mark your choice and return to Claude for execution.

---

## Decision 1: Package Delete Contradiction

**Conflict**: CAD-67 (DevTested) implemented hard delete for packages. CAR-204 (To Do) wants to disable the delete action entirely.

**Options**:
- [ ] **A) Keep CAD-67** — hard delete stays, close CAR-204
- [ ] **B) Rollback CAD-67** — disable delete per CAR-204, use Draft workflow instead
- [ ] **C) Soft delete** — keep button but mark as archived, not hard delete

**Affected tickets**: CAD-67, CAR-204, CAR-203

---

## Decision 2: Close CAR-206 as Duplicate of CUR-156?

**Context**: Both implement auto-cancellation of stale orders. CUR-156 is broader (ASAP + scheduled + vendor nudging). CAR-206 only covers scheduled orders (24hr rule).

**Options**:
- [ ] **A) Yes** — merge details into CUR-156, close CAR-206
- [ ] **B) No** — keep both, CAR-206 for current platform, CUR-156 for new

**Affected tickets**: CAR-206, CUR-156

---

## Decision 3: Close CAR-205 as Duplicate of CAR-146?

**Context**: CAR-205 (Handling inactive food items) has 0 acceptance criteria, description copy-pasted from CAD-147. CAR-146 (Removing food items from packages) covers the same scope. Both unassigned.

**Options**:
- [ ] **A) Yes** — merge into CAR-146, close CAR-205
- [ ] **B) No** — restructure CAR-205 with proper ACs (Option B from review)

**Affected tickets**: CAR-205, CAR-146, CAD-147

---

## Decision 4: Merge CAD-179 into CAD-202?

**Context**: CAD-179 (New Employee Permission Module: Packages) and CAD-202 (Add Package Module Permission) are both about adding Package to the permissions system. CAD-202 is In Progress, CAD-179 is To Do. CAD-200 (Package Section Not Accessible) is the same root cause.

**Options**:
- [ ] **A) Yes** — merge CAD-179 into CAD-202, link CAD-200 as related
- [ ] **B) No** — keep separate (CAD-202 = backend, CAD-179 = UI)

**Affected tickets**: CAD-179, CAD-202, CAD-200

---

## Decision 5: Close CAD-148 (Hide/Archive) as Obsolete?

**Context**: CAD-148 (Replace Delete with Hide/Archive) is parked. The Draft workflow (CAD-180 DevTested, CAR-170 In Progress, CAD-181 To Do) provides similar "don't actually delete" functionality. Draft is the active approach.

**Options**:
- [ ] **A) Yes** — close CAD-148 as superseded by Draft workflow
- [ ] **B) No** — keep for future, Draft and Hide/Archive serve different purposes

**Affected tickets**: CAD-148, CAD-180, CAD-181, CAR-170

---

## Decision 6: Deprioritize CUR Prototyping (37 tickets)?

**Context**: Ramesh has 92 active tickets. 37 of them are CUR prototyping stories (non-prd-scope) with subtasks assigned to Ruchiran. Deprioritizing frees both for current platform bug fixes.

**Options**:
- [ ] **A) Yes** — move all CUR prototyping to backlog/future
- [ ] **B) Partially** — keep Ruchiran's UAT items, pause Ramesh's To Do items
- [ ] **C) No** — keep as is

**Affected tickets**: CUR-47..53 (7 stories), CUR-54..78 (22 subtasks), CUR-20..44 (13 stories)

---

## Decision 7: CUR-156 Auto-Cancellation — PO Sign-Off?

**Context**: CUR-156 (auto-cancel stale orders + refund) extends beyond PRD scope. The PRD only has automatic refund on vendor rejection (FR142). This ticket adds time-based auto-cancellation which is new scope.

**Options**:
- [ ] **A) Approve** — accept as new requirement, add to PRD
- [ ] **B) Defer** — park until new platform PRD is updated
- [ ] **C) Reduce scope** — implement vendor rejection refund only (per PRD FR142)

**Affected tickets**: CUR-156, CAR-206

---

## Decision 8: Unpark CAD-177 (Suspended Restaurant)?

**Context**: CAD-177 (Suspended Restaurant Remains Visible to Customers) is parked. PACK-216 (Cart not cleared on suspended restaurant) is blocked by this.

**Options**:
- [ ] **A) Yes** — unpark and assign to Ramesh
- [ ] **B) No** — keep parked, PACK-216 stays blocked
- [ ] **C) Partially** — unpark but lower priority (Sprint N+3 or later)

**Affected tickets**: CAD-177, PACK-216

---

## Quick Reference: Impact Matrix

| Decision | If Yes | If No | Urgency |
|----------|--------|-------|---------|
| D1: Package delete | Cleans contradiction | Stays conflicted | Medium |
| D2: CAR-206 dup | -1 ticket | Double work risk | High |
| D3: CAR-205 dup | -1 ticket | Unclear scope stays | High |
| D4: CAD-179 merge | -1 ticket, cleaner perms | 2 overlapping tickets | Medium |
| D5: CAD-148 close | -1 parked ticket | No impact | Low |
| D6: CUR deprioritize | Frees Ramesh (37 tickets!) | Ramesh stays at 92 | **Critical** |
| D7: CUR-156 scope | New PRD requirement | Blocks auto-cancel feature | Medium |
| D8: CAD-177 unpark | Unblocks PACK-216 | PACK-216 stays blocked | Low |
