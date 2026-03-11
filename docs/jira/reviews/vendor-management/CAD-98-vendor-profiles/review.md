# CAD-98 Review: Vendor Profile Management

> Review Date: 2026-03-10
> Reviewer: AI Agent (Adversarial + Edge Case + Readiness)

## 1. Adversarial Review

### Gaps & Contradictions

| # | Finding | Severity | Details |
|---|---------|----------|---------|
| 1 | **"Audit log" AC is vague** | HIGH | "Edit fields with immediate save and audit log" — doesn't specify: which fields trigger logging, what's logged (old/new values?), where the log is displayed, retention policy, or who can view it. |
| 2 | **"Manage multi-location vendors" undefined** | HIGH | AC says "Manage multi-location vendors" but doesn't specify: add restaurant to vendor, remove restaurant, transfer between vendors, view all locations, or any of the CRUD operations involved. |
| 3 | **Restaurant name sync bug unfixed** | MEDIUM | QA (Kasun, Jan 23) reported "Restaurant name changes are not reflected in admin, merchant and web app portals" — this remains open. |
| 4 | **No AC for ABN/TIN change workflow** | MEDIUM | Code has `abn_change_status` = 'pending' detection, but no AC describes the admin approval flow for ABN changes. |
| 5 | **"Immediate save" undefined** | LOW | Does "immediate save" mean AJAX/inline editing? Or standard form submit? Current implementation uses form submit. |
| 6 | **Document history not specified** | LOW | AC says "view complete vendor info (business, restaurants, documents, history)" — "history" could mean: application history, change history, moderation history, or order history. Ambiguous. |

### Missing Acceptance Criteria

1. **Audit log specifics**: Table schema, fields tracked, UI location, filters, pagination, export
2. **Multi-location CRUD**: Add/remove/transfer restaurant operations, UI for management
3. **ABN change approval**: Admin queue for pending ABN changes
4. **Restaurant name propagation**: How name changes sync across all portals
5. **Access control**: Which admin roles can edit vendor profiles?

## 2. Edge Cases

| # | Edge Case | Risk | Mitigation |
|---|-----------|------|------------|
| 1 | Editing a field with a very long value (address, business name) | LOW | Max length validation |
| 2 | Concurrent edits by two admins on same vendor | MEDIUM | Optimistic locking or conflict detection |
| 3 | Vendor with 10+ restaurants (multi-location) | MEDIUM | Pagination on restaurant list |
| 4 | Transferring a restaurant with active orders | HIGH | Block transfer until orders complete? |
| 5 | Audit log for bulk operations | MEDIUM | Log each field change individually vs. one entry per save |
| 6 | Audit log storage growth | LOW | Retention policy needed for large vendors |
| 7 | Editing vendor while vendor is also editing own profile | MEDIUM | Who wins? Admin override? |
| 8 | Deleting a restaurant from multi-location vendor | HIGH | Soft delete? What about historical data/orders? |

## 3. PRD Alignment (FR49)

- **FR49**: "Admin can view and edit vendor profiles"
- View complete info ✅ (implemented)
- Edit with audit log ⚠️ (editing works, audit log missing)
- Multi-location ⚠️ (not implemented)
- The AC captures FR49 requirements, but specifics are missing

## 4. Implementation Readiness Assessment

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC clarity | ⚠️ PARTIAL | Core view/edit clear; audit log and multi-location need specs |
| Design decisions made | ⚠️ PARTIAL | Plan proposes HasAuditLog trait and audit page, needs Demi's confirmation |
| Technical feasibility | ✅ READY | Vendor/Restaurant models with relationships exist |
| Dependencies clear | ✅ CLEAR | No external dependencies |
| Testable ACs | ⚠️ PARTIAL | Need specific audit log scenarios |

### Overall: **CONDITIONALLY READY**
View/edit is done. Audit log and multi-location need design specs. Restaurant name sync bug should be fixed before adding new features.

## 5. Recommendations

1. **Fix restaurant name sync bug first**: QA reported it Jan 23, still open
2. **Design audit log page**: Wireframe with filters, columns, pagination
3. **Define multi-location operations**: Enumerate exactly what "manage" means
4. **Use HasAuditLog trait**: Generic trait applied to Vendor + Restaurant models
5. **Consider subtasking**: Split audit log and multi-location into separate subtasks
