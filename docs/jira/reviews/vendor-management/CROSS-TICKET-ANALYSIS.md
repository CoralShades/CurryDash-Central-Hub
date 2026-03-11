# Cross-Ticket Analysis: Vendor Management (Epic 4)

> Analysis Date: 2026-03-10
> Tickets: CAD-97, CAD-98, CAD-101, CAR-156

## 1. Dependencies & Shared Code

### VendorController Conflict Zone
Both **CAD-97** and **CAD-98** modify `app/Http/Controllers/Admin/VendorController.php`:
- CAD-97: adds `requestMoreInfo()` method
- CAD-98: adds `restaurants()`, `addRestaurant()`, `transferRestaurant()` methods

**Recommendation**: Implement sequentially (CAD-97 first since it's in SIT), or coordinate to avoid merge conflicts. Consider splitting into a `VendorApplicationController` and `VendorProfileController` if the file grows too large.

### Audit Logging Unification
- CAD-97 uses existing `RestaurantModerationLog` for approval/rejection actions
- CAD-98 proposes new `VendorAuditLog` + `HasAuditLog` trait for field-level changes

**Recommendation**: Keep both systems — they serve different purposes:
- `RestaurantModerationLog` → discrete admin actions (approve, reject, request info, suspend)
- `VendorAuditLog` → field-level change tracking (who changed what, old/new values)

The `HasAuditLog` trait (CAD-98) could also capture CAD-97's info request actions as audit entries. Apply trait after moderation log write, not instead of it.

### Restaurant Model Touches
Three tickets modify `app/Models/Restaurant.php`:
- CAD-98: Apply `HasAuditLog` trait
- CAR-156: Add `scheduleExceptions()` relationship + `isOpenOnDate()` method
- CAD-101 (indirect): Reads from Restaurant via performance service

**Recommendation**: No conflicts if merged in order. Apply trait (CAD-98) first, then add methods (CAR-156).

### Routes File Growth
All 4 tickets add routes to `routes/admin.php`:
- CAD-97: request-info, legal-pages
- CAD-98: audit-log, restaurant management
- CAD-101: performance
- CAR-156: holidays

**Recommendation**: Consider grouping vendor routes under a prefix:
```php
Route::prefix('vendor')->group(function () {
    // CAD-97
    // CAD-98
    // CAD-101
    // CAR-156
});
```

## 2. Shared Work Opportunities

### Email Template System (CAD-97)
CAD-97 introduces email templates in the `email_templates` table. This system could be reused for:
- CAR-156: "Your restaurant will be closed on [holiday]" notification to vendors
- CAD-98: "Your profile was updated by admin" notification
- Future: Any vendor notification

### Chart.js Setup (CAD-101)
CAD-101 introduces Chart.js for performance metrics. This can be reused for:
- Future dashboards or analytics views
- Order volume trends on admin dashboard

### HasAuditLog Trait (CAD-98)
The generic audit trait can be applied beyond Vendor/Restaurant:
- `User` model (admin actions)
- `RestaurantConfig` model (settings changes)
- Any model requiring change history

## 3. Overlapping Concerns

### CAR-156 ↔ CAD-147 (Inactive Items in Carts)
CAR-156 schedule exceptions affect when restaurants are open. If a restaurant is closed for a holiday, customers shouldn't be able to checkout with items from that restaurant. This overlaps with CAD-147's concern about inactive items in carts.

**Recommendation**: CAR-156's `isOpenOnDate()` should be checked during cart validation alongside item availability checks from CAD-147.

### CAD-97 Privacy Policy ↔ Vendor Registration Flow
The privacy policy page (CAD-97) links from the vendor registration flow. This means changes to the registration flow could impact where the link appears.

**Recommendation**: Create privacy policy as a standalone CMS page with a fixed URL. Link from registration via configuration, not hardcoded.

## 4. Priority Order (Recommended)

| Priority | Ticket | Rationale |
|----------|--------|-----------|
| 1 | **CAR-156** | Bug fix (actually feature), affects customer experience directly — customers may order from closed restaurants |
| 2 | **CAD-97** | In SIT, partially done, Ramesh just needs design clarity to finish remaining work |
| 3 | **CAD-98** | In Progress, audit log + multi-location are additive features |
| 4 | **CAD-101** | To Do, greenfield, lowest urgency (read-only analytics) |

### Suggested Sprint Allocation
- **Sprint N (current)**: CAR-156 backend + admin + vendor views
- **Sprint N**: CAD-97 "Request More Info" + email templates
- **Sprint N+1**: CAR-156 Flutter app + CAD-98 audit log + multi-location
- **Sprint N+1**: CAD-101 performance metrics (greenfield)

## 5. Risk Matrix

| Risk | Tickets | Likelihood | Impact | Mitigation |
|------|---------|------------|--------|------------|
| VendorController merge conflicts | CAD-97 + CAD-98 | Medium | Medium | Implement sequentially, PR review |
| Restaurant model bloat | CAD-98 + CAR-156 | Low | Low | Trait-based composition, keep methods focused |
| Flutter app not updated with backend | CAR-156 | Medium | High | Implement API first, Flutter in same sprint |
| Email delivery failures | CAD-97 | Low | Medium | Queue emails, log failures, don't block core flow |
| Performance query slowness | CAD-101 | Medium | Medium | Cache metrics, consider materialized views |
| Holiday data accuracy | CAR-156 | Low | Medium | Use government source for Australian holidays, annual review |
