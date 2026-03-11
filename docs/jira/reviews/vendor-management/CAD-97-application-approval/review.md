# CAD-97 Review: Application Approval/Rejection

> Review Date: 2026-03-10
> Reviewer: AI Agent (Adversarial + Edge Case + Readiness)

## 1. Adversarial Review

### Gaps & Contradictions

| # | Finding | Severity | Details |
|---|---------|----------|---------|
| 1 | **"Request More Info" has no AC detail** | HIGH | AC says "Request More Info option for additional documents" but specifies nothing about: what documents can be requested, what happens to vendor status, how the vendor responds, or what the admin sees after response. |
| 2 | **No "Pending Info" status defined** | HIGH | If "Request More Info" creates a new status, the AC doesn't define it. This status needs to be added to the vendor lifecycle state machine. |
| 3 | **"Documents Complete" filter referenced but no status exists** | MEDIUM | Ramesh confirmed (Comment 3) this filter can't be implemented. The AC doesn't mention it, but the codebase apparently has a filter reference without the underlying status. |
| 4 | **Email template setup not in AC** | MEDIUM | AC says "Rejected users should be notified via email" but doesn't mention approve email or info-request email. Ramesh's screenshots show email_templates table needs configuration. |
| 5 | **Privacy policy page not in AC** | MEDIUM | Ramesh flagged this as needed (Comment 5) but it's not in any AC. This is scope creep or a missing prerequisite discovered during implementation. |
| 6 | **No push notification mentioned in AC** | LOW | Plan references push notifications for "Request More Info" but the AC only mentions email for rejection. |
| 7 | **No AC for vendor response workflow** | HIGH | When vendor provides requested documents, who reviews? Auto-transition back to pending? Admin gets notification? |

### Missing Acceptance Criteria

1. **Request More Info workflow**: What documents can be requested? Is it a checklist or free-form? What's the vendor's response mechanism?
2. **Email templates**: Which emails are needed (approve, reject, info request)? What dynamic fields?
3. **Privacy policy page**: Admin-editable CMS or static page? Where is it linked from?
4. **Status transitions**: What is the complete state machine? (Pending → Approved/Rejected/PendingInfo → ?)
5. **Notification channels**: Email only? Push? In-app?

## 2. Edge Cases

| # | Edge Case | Risk | Mitigation |
|---|-----------|------|------------|
| 1 | Admin clicks "Request More Info" multiple times on same vendor | MEDIUM | Upsert or append? Track request history. |
| 2 | Vendor submits partial documents (some but not all requested) | MEDIUM | Allow partial response or require all? |
| 3 | Admin approves while vendor is responding to info request | LOW | Lock status transitions during info request? |
| 4 | Rejection reason is empty | HIGH | Validate non-empty reason on reject action. |
| 5 | Concurrent admin actions on same vendor | LOW | Optimistic locking or last-write-wins? |
| 6 | Email delivery failure | MEDIUM | Queue emails, log failures, don't block approval flow. |
| 7 | Very long rejection reason text | LOW | Character limit needed? Textarea max length? |
| 8 | Re-application after rejection | HIGH | Can vendors reapply? What happens to previous rejection? |

## 3. PRD Alignment (FR48)

- **FR48**: "Admin can approve or reject vendor applications with notes"
- The AC covers approve/reject with notes ✅
- "Request More Info" is an extension beyond FR48's scope — but valuable
- NFR17 (audit trail) is covered ✅

## 4. Implementation Readiness Assessment

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC clarity | ⚠️ PARTIAL | Core approve/reject clear; "Request More Info" undefined |
| Design decisions made | ⚠️ PARTIAL | Plan defines approach but Demi hasn't formally confirmed on Jira |
| Technical feasibility | ✅ READY | Existing VendorController + RestaurantModerationLog provide foundation |
| Dependencies clear | ⚠️ PARTIAL | Email template system, privacy policy page scope unclear |
| Testable ACs | ⚠️ PARTIAL | Need concrete scenarios for "Request More Info" |

### Overall: **CONDITIONALLY READY**
Core approve/reject is done and in SIT. "Request More Info" feature needs formal design spec before implementation can proceed confidently. Privacy policy page should be a separate ticket.

## 5. Recommendations

1. **Split "Request More Info" into subtask**: Separate the remaining work from the done work
2. **Create separate ticket for privacy policy page**: Not in original AC scope
3. **Define email template requirements**: List all templates, dynamic fields, and triggers
4. **Clarify vendor response workflow**: Document the full info-request lifecycle
5. **Add "Pending Info" status to vendor state machine**: Needs migration + UI update
