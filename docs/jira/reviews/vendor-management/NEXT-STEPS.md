# Next Steps: Vendor Management (Epic 4)

> Generated: 2026-03-10
> Status: Reviews complete, awaiting Demi's design confirmations

## Immediate Actions (This Week)

### 1. Post Jira Comments with Design Decisions
Post review comments to all 4 tickets responding to Ramesh's questions with Demi's design decisions.

| Ticket | Action | Status |
|--------|--------|--------|
| CAD-97 | Reply with "Request More Info" design + email template specs + privacy policy approach | 🔲 Pending |
| CAD-98 | Reply with audit log page specs + multi-location functionality definition | 🔲 Pending |
| CAD-101 | Reply with "separate tab" decision + UI wireframe guidance | 🔲 Pending |
| CAR-156 | Reply with two-tier holiday system + Australian holidays list + vendor override UX | 🔲 Pending |

### 2. Ticket Hygiene
- [ ] **CAR-156**: Reclassify from Bug → Story/Feature
- [ ] **CAR-156**: Link to CAR-109 (parent) and CAR-102 (operational config)
- [ ] **CAD-97**: Create subtask for "Request More Info" remaining work
- [ ] **CAD-97**: Create separate ticket for Privacy Policy CMS page
- [ ] **CAD-98**: Create subtasks for Audit Log and Multi-Location

### 3. Write Missing ACs
- [ ] **CAR-156**: Write full ACs for holiday system (currently has none — only bug report format)
- [ ] **CAD-101**: Add UI specifications to ACs (chart types, date ranges, layout)

## Sprint Planning (Recommended Sequence)

### Sprint N (Current — Focus: Vendor Operations)

**CAR-156 — Holiday Hours (Backend + Admin)**
- [ ] Create `global_holidays` + `restaurant_schedule_exceptions` migrations
- [ ] Create `GlobalHoliday` + `RestaurantScheduleException` models
- [ ] Run `AustralianHolidaysSeeder` with 2026-2027 dates
- [ ] Build admin holiday management page
- [ ] Update `Restaurant::isOpenOnDate()` logic
- [ ] Add vendor schedule exceptions UI
- [ ] Add API endpoint for schedule checking

**CAD-97 — Request More Info + Emails**
- [ ] Create `vendor_info_requests` migration + model
- [ ] Add `requestMoreInfo()` to VendorController
- [ ] Build info request modal + admin list view
- [ ] Build vendor response upload flow
- [ ] Configure email templates (approve/reject/info-request)

### Sprint N+1 (Next — Focus: Profile + Analytics)

**CAR-156 — Flutter App Updates**
- [ ] Add `ScheduleException` model
- [ ] Update `RestaurantService` open/closed checks
- [ ] Update checkout flow with holiday validation
- [ ] Update time slot picker with holiday indicators

**CAD-98 — Audit Log + Multi-Location**
- [ ] Create `vendor_audit_logs` migration
- [ ] Build `HasAuditLog` trait and apply to Vendor + Restaurant models
- [ ] Build admin audit log page with filters + export
- [ ] Build multi-location management section
- [ ] Fix restaurant name sync bug (QA reported Jan 23)

**CAD-97 — Privacy Policy CMS** (if separate ticket created)
- [ ] Create `legal_pages` migration + model
- [ ] Build admin CMS editor
- [ ] Create public route + view
- [ ] Link from vendor registration + footer

### Sprint N+2 (Future — Focus: Analytics)

**CAD-101 — Performance Metrics**
- [ ] Build `VendorPerformanceService` with all metric calculations
- [ ] Build performance controller
- [ ] Create performance tab in restaurant details
- [ ] Integrate Chart.js for rating trend chart
- [ ] Add platform benchmark comparison
- [ ] Configure warning thresholds

## Blockers

| Blocker | Ticket | Resolution |
|---------|--------|------------|
| Design decisions not confirmed on Jira | All 4 | Post Demi's decisions as Jira comments |
| CAR-156 has no ACs | CAR-156 | Write and add to ticket |
| CAD-98 restaurant name sync bug | CAD-98 | Fix before adding audit log |
| Flutter app requires API changes first | CAR-156 | Backend API must be deployed before Flutter work |

## Decision Log

| Decision | Source | Tickets |
|----------|--------|---------|
| "Request More Info" = Pending Info status + doc checklist + email + push | Plan (Demi's direction) | CAD-97 |
| Dedicated audit log page with filters | Plan (Demi's direction) | CAD-98 |
| Separate "Performance" tab in restaurant details | Plan (Demi's direction) | CAD-101 |
| Global holidays (admin-defined) + vendor overrides | Plan (Demi's direction) | CAR-156 |
| Pre-populate Australian public holidays (state-aware) | Plan (Demi's direction) | CAR-156 |
| Warning thresholds: rating <3.5, cancellation >10% | AC + Plan | CAD-101 |

## File Organization

```
docs/jira/reviews/vendor-management/
├── CAD-97-application-approval/
│   ├── ticket.md              ✅ Created
│   ├── review.md              ✅ Created
│   └── implementation-plan.md ✅ Created
├── CAD-98-vendor-profiles/
│   ├── ticket.md              ✅ Created
│   ├── review.md              ✅ Created
│   └── implementation-plan.md ✅ Created
├── CAD-101-performance-metrics/
│   ├── ticket.md              ✅ Created
│   ├── review.md              ✅ Created
│   └── implementation-plan.md ✅ Created
├── CAR-156-holiday-hours/
│   ├── ticket.md              ✅ Created
│   ├── review.md              ✅ Created
│   └── implementation-plan.md ✅ Created
├── CROSS-TICKET-ANALYSIS.md   ✅ Created
├── FINDINGS.md                ✅ Created
└── NEXT-STEPS.md              ✅ Created (this file)
```
