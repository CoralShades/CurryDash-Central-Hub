# AI-Achievability Audit — Claude Code Implementation Assessment

> **Date**: 2026-03-12 | **Scope**: All 4 Jira projects (CAD, CAR, PACK, CUR)
> **Purpose**: Filter tickets that can be implemented using Claude Code + AI agents in local projects
> **Codebases assessed**:
> - `D:\ailocal\currydash\Admin-Seller_Portal` — Laravel 10 (123 models, 105 controllers, 343 migrations)
> - `D:\ailocal\currydash\User-Web-Mobile` — Flutter/Dart (30+ feature modules, GetX state)
> - `D:\ailocal\CurryDash-Central-Hub` — Next.js 15 (App Router, Supabase, shadcn/ui)
> **This is an audit document only — no implementation has been done.**

---

## Dashboard Summary

| Category | Count | Description |
|----------|-------|-------------|
| **HIGH** (80%+ confidence) | **38** | Claude Code can implement autonomously with minimal guidance |
| **MEDIUM** (50-80%) | **27** | Claude Code can implement with human guidance and review |
| **LOW** (20-50%) | **18** | Blocked, complex integrations, or need significant human input |
| **NOT AI-ACHIEVABLE** | **52+** | QA stories, manual testing, decisions pending, parked |
| **QUICK WINS** | **10** | Can implement TODAY in < 2 hours each |

### By Project & Codebase

| Codebase | HIGH | MEDIUM | LOW | Skills |
|----------|------|--------|-----|--------|
| **Laravel** (CAD+CAR) | 28 | 18 | 8 | /bmad-bmm-dev-story, /find-bugs, /systematic-debugging |
| **Flutter** (PACK) | 7 | 4 | 7 | /find-bugs, /systematic-debugging |
| **Next.js** (CUR) | 3 | 5 | 3 | /bmad-bmm-dev-story, /bmad-bmm-create-story |

### By Effort Tier

| Effort | Tickets | Examples |
|--------|---------|---------|
| **< 1 hour** | 6 | CAR-201, CAR-144, CAR-195, CAR-202, CAR-203, CAR-204 |
| **1-2 hours** | 8 | CAD-207, CAD-203, CAR-179, PACK-177, PACK-221, PACK-193, PACK-209, PACK-194 |
| **2-4 hours** | 14 | CAD-202, CAD-210, CAD-211, CAD-217, CAR-148, CAR-169, CAR-211, etc. |
| **4-8 hours** | 18 | CAD-181, CAD-212, CAD-213, CAD-149, CAD-183, CAR-28, CAR-170, etc. |
| **8+ hours** | 7 | CUR-141, CUR-140, CAR-29+30, CAD-214, multi-step clusters |

---

## TOP 10 QUICK WINS — Implement Today

These are the safest, fastest tickets Claude Code can knock out immediately. Each is isolated, has clear patterns in the codebase, and low blast radius.

### QW-1: CAR-201 — ABN Field Not Mandatory
- **Confidence**: 98% | **Effort**: 30 min | **Project**: Laravel
- **What**: Change ABN validation from `nullable` to `required` in vendor registration/update
- **Files to modify**:
  - `app/Http/Controllers/Vendor/RestaurantController.php` — update validation rules
  - `app/Http/Controllers/Admin/VendorController.php` — update validation rules
  - Possibly `app/Http/Requests/` if FormRequest classes are used
- **Pattern**: ABN column already exists (`2026_01_09_114420_add_abn_to_restaurants_table.php`). Just change validation rule.
- **Skills**: `/find-bugs` to locate all validation points, then `/bmad-bmm-quick-dev`
- **Risk**: LOW — only affects new registrations/updates, not existing data

### QW-2: CAR-144 — Display ABN in Vendor Portal
- **Confidence**: 98% | **Effort**: 30 min | **Project**: Laravel
- **What**: Show ABN field on vendor profile page
- **Files to modify**:
  - `resources/views/vendor-views/profile/` — add `{{ $restaurant->abn }}` display
- **Pattern**: Field already in DB and model. Pure view change.
- **Skills**: `/bmad-bmm-quick-dev`
- **Risk**: ZERO — read-only display

### QW-3: CAD-207 — User Role Not Displayed in Employee List
- **Confidence**: 95% | **Effort**: 1-2 hrs | **Project**: Laravel
- **What**: Employee list page doesn't show the role name
- **Files to modify**:
  - `app/Http/Controllers/Admin/EmployeeController.php` — add `->with('role')` eager load
  - `resources/views/admin-views/employee/list.blade.php` — add role column
- **Pattern**: `VendorEmployee` belongsTo `EmployeeRole`. Likely missing eager load or view column.
- **Skills**: `/find-bugs` → `/systematic-debugging`
- **Risk**: LOW — read-only display fix

### QW-4: CAD-203 — Customer Name Search Not Returning Matching Orders
- **Confidence**: 95% | **Effort**: 1 hr | **Project**: Laravel
- **What**: Order search doesn't match by customer name
- **Files to modify**:
  - `app/Http/Controllers/Admin/OrderController.php` — add JOIN to users table + LIKE clause
- **Pattern**: Order belongsTo User. Add `->whereHas('customer', fn($q) => $q->where('f_name', 'LIKE', "%$search%"))`.
- **Skills**: `/find-bugs`
- **Risk**: LOW — search enhancement, doesn't modify data

### QW-5: CAR-179 — Date Range Filter Not Available
- **Confidence**: 95% | **Effort**: 1-2 hrs | **Project**: Laravel
- **What**: Dashboard/reports missing date range filter
- **Files to modify**:
  - `app/Traits/ReportFilter.php` — check filter logic
  - Relevant controller that uses the trait — ensure filter params are passed
  - Blade view — add date picker inputs if missing
- **Pattern**: `ReportFilter` trait already exists with date scoping. Likely missing parameter binding.
- **Skills**: `/find-bugs`
- **Risk**: LOW — filter addition, doesn't modify data

### QW-6: CAR-195 — Misleading Error on Config Group Reorder
- **Confidence**: 95% | **Effort**: 1 hr | **Project**: Laravel
- **What**: Package configuration group reorder shows wrong error
- **Files to modify**:
  - `app/Http/Controllers/Vendor/PackageController.php` or Admin equivalent — fix error message
  - Possibly validation response
- **Pattern**: Error string fix or validation logic adjustment.
- **Skills**: `/find-bugs`
- **Risk**: ZERO — error message fix

### QW-7: CAR-202 — Verification Email Wrong Link/Username
- **Confidence**: 95% | **Effort**: 1 hr | **Project**: Laravel
- **What**: Email verification sends incorrect URL or username
- **Files to modify**:
  - `app/Mail/EmailVerification.php` — fix URL generation
  - `resources/views/email-templates/` — fix Blade variables
- **Pattern**: 38 mail classes as reference. Fix variable binding.
- **Skills**: `/find-bugs`
- **Risk**: LOW — email template fix

### QW-8: PACK-177 — Deleted Address Persists After Logout/Login
- **Confidence**: 90% | **Effort**: 1-2 hrs | **Project**: Flutter
- **What**: Address data not cleared on logout
- **Files to modify**:
  - `lib/features/auth/controllers/auth_controller.dart` — `logout()` method
  - Check `SharedPreferences` keys for address data — clear them
  - `lib/features/address/` — verify address cache lifecycle
- **Pattern**: Other caches (cart, user info) are cleared on logout. Address missed.
- **Skills**: `/find-bugs` → `/systematic-debugging`
- **Risk**: LOW — cleanup on logout

### QW-9: PACK-221 — Bottom Nav Hidden by Order Processing Bar
- **Confidence**: 90% | **Effort**: 1-2 hrs | **Project**: Flutter
- **What**: Order processing overlay covers bottom navigation
- **Files to modify**:
  - `lib/features/dashboard/screens/dashboard_screen.dart` — adjust Stack/layout
  - Order processing widget — add bottom padding for nav bar height
- **Pattern**: Layout issue. Add `bottomNavigationBar` padding or adjust widget stacking.
- **Skills**: `/find-bugs`
- **Risk**: LOW — UI layout fix

### QW-10: CAR-203 + CAR-204 — Disable Delete Buttons
- **Confidence**: 95% | **Effort**: 1 hr total | **Project**: Laravel
- **What**: Remove or disable delete action for packages (CAR-204) and food items (CAR-203)
- **Files to modify**:
  - `resources/views/vendor-views/package/` — remove/disable delete button
  - `resources/views/vendor-views/food/` — remove/disable delete button
  - Optionally: controller method guard
- **Pattern**: Conditional `@if` in Blade or remove the button entirely. Note: **Decision D1 needed** — contradicts CAD-67.
- **Skills**: `/bmad-bmm-quick-dev`
- **Risk**: LOW — but check Decision D1 first (package delete contradiction)

---

## HIGH AI-ACHIEVABLE — Full Breakdown (38 tickets)

### H1: CAD-181 — Implement Draft Status for Food Items
- **Confidence**: 95% | **Effort**: 3-4 hrs | **Project**: Laravel
- **What**: Add draft/publish workflow for food items (same as packages)
- **Exact pattern to follow**: Package model already has `status` field with semantics: `1=Active, 0=Inactive, 2=Draft`
- **Files to modify**:
  - `database/migrations/` — new migration: `add_draft_status_to_foods_table.php` (change `status` from boolean to tinyint if needed)
  - `app/Models/Food.php` — add `scopeActive()`, `getIsDraftAttribute()`, `getStatusLabelAttribute()`
  - `app/Http/Controllers/Admin/FoodController.php` — add `withoutGlobalScopes()` for edit, status filter for list
  - `app/Http/Controllers/Vendor/FoodController.php` — same changes
  - `resources/views/admin-views/food/` — add draft status badge, filter dropdown
  - `resources/views/vendor-views/food/` — same
- **Skills**: `/bmad-bmm-dev-story` (follow Package draft implementation), `/test-driven-development`
- **Depends on**: Nothing — can start immediately
- **Blocks**: CAD-181 → CAR-170 (seller side draft for food) uses same pattern

### H2: CAD-202 + CAD-200 — Add Package Module Permission
- **Confidence**: 90% | **Effort**: 2-3 hrs | **Project**: Laravel
- **What**: Add "packages" to the module permission system so employees can be granted/denied access
- **Files to modify**:
  - `routes/admin.php` — verify `'middleware' => ['module:packages']` is on all package routes (may already exist)
  - `app/CentralLogics/helpers.php` — check `module_permission_check()` handles 'packages' module
  - `resources/views/admin-views/employee/` — add packages checkbox to role creation form
  - Admin role seeder — add 'packages' to default module list
  - `app/Http/Controllers/Admin/CustomRoleController.php` — ensure packages shows in module list
- **Pattern**: AdminRole `modules` is JSON array. EmployeeRole same pattern. ModulePermissionMiddleware checks inclusion.
- **Skills**: `/bmad-bmm-dev-story`
- **Note**: CAD-179 is a DUPLICATE — close it. CAD-200 (Package Section Not Accessible) is SAME ROOT CAUSE.

### H3: CAD-186 — Image Compression for All Media Uploads
- **Confidence**: 90% | **Effort**: 3-4 hrs | **Project**: Laravel
- **What**: Compress images on upload across all upload endpoints
- **Files to modify**:
  - `app/CentralLogics/filemanager.php` — add compression step using `intervention/image`
  - Or create new `app/Traits/CompressesImages.php` trait
  - Apply to FileManagerController, FoodController (image upload), PackageController (image upload), RestaurantController, etc.
- **Pattern**: `intervention/image` v2.5 already in `composer.json`. Use `Image::make($file)->resize(null, 800, fn($c) => $c->aspectRatio())->encode('jpg', 80)`.
- **Skills**: `/bmad-bmm-dev-story`
- **Depends on**: Nothing
- **Note**: Create as reusable trait for consistency

### H4: CAD-210 — Email Templates Setup (subtask of CAD-97)
- **Confidence**: 95% | **Effort**: 2-3 hrs | **Project**: Laravel
- **What**: Create email templates for vendor application flow (approval, rejection, request more info)
- **Files to modify**:
  - `app/Mail/` — create 3 new mail classes following existing pattern (38 examples)
  - `resources/views/email-templates/` — create Blade templates
  - `database/seeders/` — seed template entries into `email_templates` table
- **Pattern**: Copy structure from `app/Mail/VendorStatus.php` or `app/Mail/RestaurantRegistration.php`
- **Skills**: `/bmad-bmm-dev-story`

### H5: CAD-211 — Privacy Policy CMS Page (subtask of CAD-97)
- **Confidence**: 95% | **Effort**: 2 hrs | **Project**: Laravel
- **What**: Add privacy policy page to CMS
- **Files to modify**:
  - `app/Http/Controllers/Admin/PageSetupController.php` — add privacy policy page type
  - `resources/views/admin-views/` — CMS editor page (TinyMCE)
  - `routes/admin.php` — add route if not present
  - `routes/web.php` — public route for rendering
- **Pattern**: `PageSetupController` and `LandingPageController` already exist. Standard CRUD + editor.
- **Skills**: `/bmad-bmm-dev-story`

### H6: CAD-212 — Audit Log Backend (HasAuditLog Trait)
- **Confidence**: 90% | **Effort**: 4-5 hrs | **Project**: Laravel
- **What**: Create reusable trait that automatically logs model changes
- **Files to create/modify**:
  - `app/Traits/HasAuditLog.php` — NEW: trait using model `boot()` to capture `updating`, `creating`, `deleting` events
  - `database/migrations/` — `create_audit_logs_table.php` (or reuse existing `logs` table)
  - `app/Models/AuditLog.php` — NEW model (or enhance existing `Log` model)
  - Apply trait to key models: Package, Food, Order, Restaurant, Admin
- **Pattern**: Existing polymorphic `Log` model (`app/Models/Log.php`) tracks `model`, `model_id`, `restaurant_id`, `changes`. Extend this.
  - 10 traits already exist in `app/Traits/` — follow same conventions
  - `HasUuid` trait is a good structural reference
- **Skills**: `/bmad-bmm-dev-story`, `/test-driven-development`
- **Blocks**: CAD-213 (UI), CAR-147 (vendor audit), CAD-119 (comprehensive trail)

### H7: CAD-213 — Audit Log Admin UI
- **Confidence**: 90% | **Effort**: 3-4 hrs | **Project**: Laravel
- **What**: Admin panel page showing audit trail with filters
- **Files to create/modify**:
  - `app/Http/Controllers/Admin/AuditLogController.php` — NEW: list, filter, export
  - `resources/views/admin-views/audit-log/` — NEW: `index.blade.php` (table view), `show.blade.php` (detail)
  - `routes/admin.php` — add audit-log routes
- **Pattern**: Follow `app/Http/Controllers/Admin/OrderController.php` list pattern with pagination, date filters, model type filter.
- **Skills**: `/bmad-bmm-dev-story`
- **Depends on**: H6 (CAD-212)

### H8: CAD-208 — Request More Info Backend (subtask of CAD-97)
- **Confidence**: 90% | **Effort**: 3-4 hrs | **Project**: Laravel
- **What**: Backend for "Request More Info" flow during vendor application review
- **Files to create/modify**:
  - `database/migrations/` — `create_vendor_info_requests_table.php` (vendor_id, admin_id, fields_requested JSON, message, status, responded_at)
  - `app/Models/VendorInfoRequest.php` — NEW model with relationships
  - `app/Http/Controllers/Admin/VendorController.php` — add `requestInfo()` method
  - `app/Mail/VendorInfoRequest.php` — NEW mail class
  - `app/Http/Controllers/Api/V1/VendorController.php` — add API endpoint for vendor response
- **Pattern**: Follow approve/reject pattern already in VendorController. Mail class follows existing 38 examples.
- **Skills**: `/bmad-bmm-dev-story`

### H9: CAD-209 — Request More Info UI (subtask of CAD-97)
- **Confidence**: 85% | **Effort**: 3-4 hrs | **Project**: Laravel
- **What**: Admin UI for requesting info + vendor UI for responding
- **Files to create/modify**:
  - `resources/views/admin-views/vendor/` — add "Request Info" modal/form to application view
  - `resources/views/vendor-views/profile/` — add pending info request banner/form
- **Pattern**: Existing approve/reject buttons in vendor detail page. Add third action button.
- **Skills**: `/bmad-bmm-dev-story`
- **Depends on**: H8 (CAD-208 backend)

### H10: CAD-216 — Performance Service (subtask of CAD-101)
- **Confidence**: 90% | **Effort**: 4-5 hrs | **Project**: Laravel
- **What**: Service class calculating vendor performance metrics
- **Files to create**:
  - `app/Services/PerformanceService.php` — NEW: methods for avg rating, order completion rate, response time, revenue trends
  - OR `app/CentralLogics/PerformanceLogic.php` following existing pattern
- **Pattern**: Aggregation queries on Order, Review, OrderDeliveryHistory models. Similar to `app/Http/Controllers/Admin/ReportController.php`.
- **Skills**: `/bmad-bmm-dev-story`

### H11: CAD-217 — Performance Controller & Routes (subtask of CAD-101)
- **Confidence**: 95% | **Effort**: 2 hrs | **Project**: Laravel
- **What**: Admin controller + routes for performance metrics
- **Files to create/modify**:
  - `app/Http/Controllers/Admin/PerformanceController.php` — NEW: `index()`, `vendorDetail($id)`, `export()`
  - `routes/admin.php` — add performance routes under module middleware
- **Pattern**: Standard controller registration. 56 admin controllers as reference.
- **Skills**: `/bmad-bmm-dev-story`
- **Depends on**: H10 (CAD-216 service)

### H12: CAR-178 — Employees Cannot Log Into Merchant Panel
- **Confidence**: 90% | **Effort**: 2-3 hrs | **Project**: Laravel
- **What**: Auth/middleware bug preventing employee login
- **Files to investigate**:
  - `app/Http/Middleware/VendorMiddleware.php` — check guard logic
  - `app/Http/Controllers/Vendor/Auth/` — login controller
  - `config/auth.php` — verify `vendor_employee` guard configuration
  - `app/Models/VendorEmployee.php` — verify Authenticatable trait
- **Pattern**: Auth guard issue. `vendor_employee` guard exists in config. Likely middleware null check or guard selection.
- **Skills**: `/systematic-debugging`, `/find-bugs`
- **Note**: **BLOCKER** — employees locked out. Prioritize highly.

### H13: CAR-170 — Draft Status for Food Items (Seller Side)
- **Confidence**: 92% | **Effort**: 3-4 hrs | **Project**: Laravel
- **What**: Vendor portal UI for food item draft workflow
- **Files to modify**:
  - `app/Http/Controllers/Vendor/FoodController.php` — add draft status handling
  - `resources/views/vendor-views/food/` — add draft badge, save-as-draft button, status filter
- **Pattern**: Copy from admin side (H1/CAD-181). Also follow Package draft pattern in vendor portal.
- **Skills**: `/bmad-bmm-dev-story`
- **Depends on**: H1 (CAD-181 — admin side must exist first for shared model changes)

### H14: CAR-169 — Draft for Packages (Seller UI)
- **Confidence**: 92% | **Effort**: 3 hrs | **Project**: Laravel
- **What**: Vendor portal draft workflow for packages (admin side already DevTested in CAD-180)
- **Files to modify**:
  - `app/Http/Controllers/Vendor/PackageController.php` — add `withoutGlobalScopes()` for edit, draft filter for list
  - `resources/views/vendor-views/package/` — add draft badge, save-as-draft, status filter
- **Pattern**: Admin draft (CAD-180) is DevTested. Mirror the exact same pattern for vendor side.
- **Skills**: `/bmad-bmm-dev-story`
- **Depends on**: CAD-180 QA pass (already DevTested)

### H15: CAR-148 — ABN Validation for Vendor CRUD
- **Confidence**: 90% | **Effort**: 2 hrs | **Project**: Laravel
- **What**: Add proper ABN format validation (11-digit Australian Business Number)
- **Files to modify**:
  - `app/Rules/` — NEW: `ValidAbn.php` custom validation rule (Luhn-like checksum for ABN)
  - `app/Http/Controllers/Vendor/RestaurantController.php` — apply rule to store/update
  - `app/Http/Controllers/Admin/VendorController.php` — apply rule to admin create/update
- **Pattern**: Standard Laravel custom validation rule. See existing rules in `app/Rules/`.
- **Skills**: `/bmad-bmm-dev-story`
- **Depends on**: QW-1 (CAR-201 makes ABN required first)

### H16: CAR-147 — Vendor Panel Audit Logs
- **Confidence**: 85% | **Effort**: 3 hrs | **Project**: Laravel
- **What**: Vendor-side audit log view
- **Files to create/modify**:
  - `app/Http/Controllers/Vendor/AuditLogController.php` — NEW: vendor-scoped audit log list
  - `resources/views/vendor-views/audit-log/` — NEW: `index.blade.php`
  - `routes/vendor.php` — add audit-log routes
- **Pattern**: Same as H7 (CAD-213 admin UI) but scoped to `restaurant_id` from auth.
- **Skills**: `/bmad-bmm-dev-story`
- **Depends on**: H6 (CAD-212 HasAuditLog trait)

### H17: CAR-28 — PKG-001: Database Schema Enhancement
- **Confidence**: 90% | **Effort**: 3-4 hrs | **Project**: Laravel
- **What**: Enhance package database schema for vendor package management
- **Files to modify**:
  - `database/migrations/` — enhancement migration for packages, package_configurations, package_options tables
  - `app/Models/Package.php` — update fillable, casts, relationships
  - `app/Models/PackageConfiguration.php` — update if needed
  - `app/Models/PackageOption.php` — update if needed
- **Pattern**: 5 existing package migrations provide the base. Enhancement follows standard migration pattern.
- **Skills**: `/bmad-bmm-dev-story`
- **Blocks**: CAR-29 (backend logic), CAR-30 (UI), PACK-146, PACK-190

### H18: CAR-208 — Holiday System DB & Models (subtask of CAR-156)
- **Confidence**: 85% | **Effort**: 3 hrs | **Project**: Laravel
- **What**: Database tables and Eloquent models for restaurant holidays
- **Files to create**:
  - `database/migrations/create_restaurant_holidays_table.php` — restaurant_id, date, type (full_day/custom), open_time, close_time, reason, is_recurring
  - `database/migrations/create_restaurant_schedule_exceptions_table.php` — for vendor override dates
  - `app/Models/RestaurantHoliday.php` — NEW with Restaurant relationship
  - `app/Models/RestaurantScheduleException.php` — NEW
- **Pattern**: `RestaurantSchedule` model already exists. Follow same relationship pattern.
- **Skills**: `/bmad-bmm-dev-story`
- **Blocks**: CAR-209 (admin), CAR-210 (vendor), CAR-211 (API), CAR-212 (Flutter)

### H19: CAR-211 — Schedule API Endpoint (subtask of CAR-156)
- **Confidence**: 85% | **Effort**: 2-3 hrs | **Project**: Laravel
- **What**: API endpoint returning restaurant schedule including holidays
- **Files to modify**:
  - `routes/api/v1/api.php` — add schedule endpoint
  - `app/Http/Controllers/Api/V1/` — NEW or existing restaurant controller method
  - Response includes: regular schedule + holidays + exceptions
- **Pattern**: 316 API v1 routes exist. Standard REST endpoint.
- **Skills**: `/bmad-bmm-dev-story`
- **Depends on**: H18 (CAR-208 DB & models)

### H20: PACK-178 — Network Failure Infinite Loading
- **Confidence**: 85% | **Effort**: 2 hrs | **Project**: Flutter
- **What**: Loading state never resets on network failure
- **Files to modify**:
  - `lib/api/api_checker.dart` — ensure error handler resets loading state
  - Relevant controller(s) — add `finally` block to reset `_isLoading = false`
  - Possibly `lib/api/api_client.dart` — verify timeout handling (currently 30s)
- **Pattern**: GetX controllers use `_isLoading` flag. Need to ensure it resets in error path.
- **Skills**: `/find-bugs`, `/systematic-debugging`

### H21: PACK-193 — UI Overflow on Android
- **Confidence**: 85% | **Effort**: 1-2 hrs | **Project**: Flutter
- **What**: Layout overflow on certain Android screen sizes
- **Files to modify**:
  - Identify specific screen with overflow (need to check issue details)
  - Wrap content in `SingleChildScrollView` or use `Expanded`/`Flexible` widgets
- **Pattern**: Standard Flutter layout fix. Common issue with fixed-height containers.
- **Skills**: `/find-bugs`

### H22: PACK-209 — Dietary Notes Warning Icons Not Applicable
- **Confidence**: 85% | **Effort**: 1-2 hrs | **Project**: Flutter
- **What**: Dietary note icons showing incorrectly
- **Files to modify**:
  - Product detail widget — fix icon mapping logic
  - `lib/features/product/` or `lib/common/widgets/` — dietary icon widget
- **Pattern**: Icon/enum mapping fix.
- **Skills**: `/find-bugs`

### H23: PACK-194 — Full Name Field in Registration
- **Confidence**: 95% | **Effort**: 2 hrs | **Project**: Flutter + Laravel
- **What**: Add full name field to user registration form
- **Files to modify (Flutter)**:
  - `lib/features/auth/screens/sign_up_screen.dart` — add name TextFormField
  - `lib/features/auth/controllers/auth_controller.dart` — pass name to API
  - `lib/features/auth/domain/reposotories/auth_repo.dart` — add name param
- **Files to modify (Laravel)**:
  - `app/Http/Controllers/Api/V1/Auth/CustomerAuthController.php` — accept `name` field
  - Validation rules — add `name` as required
- **Pattern**: Registration already handles `f_name`, `l_name` in User model. May just need UI field.
- **Skills**: `/bmad-bmm-dev-story`

### H24-H28: Remaining Laravel HIGH tickets

**H24: CAD-222 — OTP + Registration Emails Simultaneous**
- Confidence: 80% | Effort: 3-4 hrs | Laravel
- Debug auth flow to find where both `EmailVerification` and `CustomerRegistration` mail classes fire simultaneously
- Skills: `/systematic-debugging`

**H25: CAD-221 — Vendor Not Receiving Cancel Notification**
- Confidence: 80% | Effort: 3-4 hrs | Laravel
- Trace order cancellation in `PlaceNewOrder` trait → notification dispatch → FCM push
- Skills: `/systematic-debugging`

**H26: CAD-220 — Incomplete Order Timeline**
- Confidence: 80% | Effort: 3-4 hrs | Laravel
- `OrderDeliveryHistory` model tracks status changes. Check what events are missing from the timeline.
- Skills: `/find-bugs`

**H27: CAD-206 — No Email on Admin Password Change (assigned to Ruchiran)**
- Confidence: 85% | Effort: 2 hrs | Laravel
- `AdminPasswordReset` mail class exists. Need to trigger it from admin password update method.
- Skills: `/find-bugs`

**H28: CAD-198 — Live Streaming Polling for Chat**
- Confidence: 75% | Effort: 4-5 hrs | Laravel
- `beyondcode/laravel-websockets` already in composer.json. `Conversation` model exists.
- Skills: `/bmad-bmm-dev-story`

### H29-H38: CUR + Additional HIGH tickets

**H29: CUR-144 — Category Management**
- Confidence: 80% | Effort: 4-6 hrs | Next.js
- Standard CRUD with Supabase + shadcn/ui. Category model in Central Hub.
- Skills: `/bmad-bmm-dev-story`

**H30: CUR-145 — Feature Flags**
- Confidence: 80% | Effort: 4-6 hrs | Next.js
- Key-value config table in Supabase. Admin UI with shadcn/ui toggles.
- Skills: `/bmad-bmm-dev-story`

**H31: CUR-142 — Promotional Banners**
- Confidence: 80% | Effort: 4-6 hrs | Next.js
- Banner model exists in Laravel (reference). CRUD with image upload + scheduling.
- Skills: `/bmad-bmm-dev-story`

**H32-H38: CAR Epic 9 Report Stories (5 tickets)**
- CAR-189 (Vendor Metrics Dashboard) — 80%, 4-6 hrs
- CAR-190 (Sales Trends Analysis) — 75%, 4-6 hrs
- CAR-191 (Platform Benchmarking) — 70%, 6-8 hrs
- CAR-192 (Ratings & Feedback View) — 80%, 4-6 hrs
- CAR-193 (Report Export) — 85%, 3-4 hrs
- Pattern: `ReportFilter` trait + `app/Exports/` (55+ export classes) + `maatwebsite/excel`
- Skills: `/bmad-bmm-dev-story`

---

## MEDIUM AI-ACHIEVABLE — Full Breakdown (27 tickets)

### Laravel Backend (18 tickets)

| Key | Summary | Confidence | Effort | Why Medium | Skills |
|-----|---------|------------|--------|------------|--------|
| **CAD-149** | Remove inactive items from carts | 75% | 6-8 hrs | Critical order flow — needs careful testing. Cart model is polymorphic (Food + Package). Checkout validation affects payments. | `/bmad-bmm-dev-story`, `/test-driven-development` |
| **CAD-183** | Admin Global Notification Panel | 75% | 6-8 hrs | FCM integration + multi-channel (push, email, SMS). `NotificationDataSetUpTrait` exists but complex. | `/bmad-bmm-dev-story` |
| **CAD-218** | Performance Tab UI | 70% | 4-5 hrs | Blade + Chart.js frontend. AI can generate but chart configuration may need iteration. | `/bmad-bmm-dev-story` |
| **CAD-219** | Platform Benchmarks & Warnings | 70% | 4-5 hrs | Aggregation queries + config thresholds. Business rules need validation. | `/bmad-bmm-dev-story` |
| **CAD-214** | Multi-Location Management | 65% | 6-8 hrs | Restaurant already has `zone_id`. But multi-location = new relationship pattern. | `/bmad-bmm-dev-story` |
| **CAD-215** | ABN Approval Queue + Name Sync | 70% | 4-5 hrs | `abn_change_status` field exists. Need queue view + admin workflow. | `/bmad-bmm-dev-story` |
| **CAD-193** | Admin Menu Standards Config | 65% | 4-5 hrs | Requirements are vague. Category/Food standards need definition. | `/bmad-bmm-dev-story` |
| **CAR-207** | Order Notification Before Placed | 65% | 4-5 hrs | Timing issue in `PlaceNewOrder` trait. Complex state machine with payment hooks. | `/systematic-debugging` |
| **CAR-146** | Removing food items from packages | 70% | 4-5 hrs | Cascade logic on PackageOption → Food relationship. Edge cases with active orders. | `/bmad-bmm-dev-story` |
| **CAR-29** | PKG-002: Backend Logic | 70% | 6-8 hrs | Full vendor package CRUD business logic. Complex validation + pricing. | `/bmad-bmm-dev-story` |
| **CAR-30** | PKG-003a: Vendor Package UI | 65% | 6-8 hrs | Complex forms with dynamic configuration groups. Blade + JS interactions. | `/bmad-bmm-dev-story` |
| **CAR-96** | Global Delivery Date Setting | 65% | 5-6 hrs | BusinessSetting + RestaurantConfig integration. Delivery logic is complex. | `/bmad-bmm-dev-story` |
| **CAR-198** | Order Status "Placed" Before Payment | 60% | 5-6 hrs | `PlaceNewOrder` trait state machine. Payment webhook timing. **Blocks 2 QA tasks.** | `/systematic-debugging` |
| **CAR-209** | Admin Holiday Management | 80% | 4-5 hrs | CRUD controller + Blade. Depends on H18 (CAR-208 DB). | `/bmad-bmm-dev-story` |
| **CAR-210** | Vendor Schedule Exceptions | 75% | 4-5 hrs | RestaurantSchedule model exists. Add exception management. | `/bmad-bmm-dev-story` |
| **CAR-212** | Flutter App — Holiday Awareness | 75% | 4-5 hrs | New model + service update + UI indicator in Flutter. | `/bmad-bmm-dev-story` |
| **CAR Epic 7** | Financial (5 tickets: CAR-184..188) | 65% | 5-6 hrs each | Wallet/transaction models exist but financial logic is critical. | `/bmad-bmm-dev-story` |
| **CAD-71** | Global System Activity Log | 70% | 5-6 hrs | Related to audit trail. Complex data aggregation. | `/bmad-bmm-dev-story` |

### Flutter (4 tickets)

| Key | Summary | Confidence | Effort | Why Medium | Skills |
|-----|---------|------------|--------|------------|--------|
| **PACK-184** | Address/time not retained at checkout | 65% | 3-4 hrs | GetX state management issue. CheckoutController has complex flow. | `/systematic-debugging` |
| **PACK-224** | Can't navigate back from payment | 70% | 2-3 hrs | InAppWebView navigation. WillPopScope or Navigator handling. | `/find-bugs` |
| **PACK-212** | Restaurants not sorted by distance | 65% | 4-5 hrs | Backend query needs `eloquent-spatial` integration + Flutter sort. | `/bmad-bmm-dev-story` |
| **PACK-151** | Story 6.5: Complete Payment | 60% | 6-8 hrs | Payment flow end-to-end. WebView + status polling. | `/bmad-bmm-dev-story` |

### Next.js / CUR (5 tickets)

| Key | Summary | Confidence | Effort | Why Medium | Skills |
|-----|---------|------------|--------|------------|--------|
| **CUR-140** | Platform Settings Config | 75% | 6-8 hrs | Supabase settings CRUD. Well-documented in CLAUDE.md but broad scope. | `/bmad-bmm-dev-story` |
| **CUR-141** | Zone Management | 70% | 8-10 hrs | Maps integration + CRUD. Geospatial queries. | `/bmad-bmm-dev-story` |
| **CUR-143** | Commission Structure Config | 70% | 6-8 hrs | Financial configuration. Needs careful validation rules. | `/bmad-bmm-dev-story` |
| **CUR-153** | API Auth & Security | 70% | 6-8 hrs | Auth.js v5 + Supabase RLS. Critical path. | `/bmad-bmm-dev-story` |
| **CUR-152** | Firebase Push Notifications | 65% | 6-8 hrs | Firebase + Next.js integration. Server-side FCM. | `/bmad-bmm-dev-story` |

---

## LOW AI-ACHIEVABLE — Full Breakdown (18 tickets)

### Blocked by Upstream (10 tickets)

These tickets are technically implementable but **blocked by unfinished upstream work**:

| Key | Summary | Blocked By | When Unblocked |
|-----|---------|------------|---------------|
| PACK-222 | ISE when cart item deleted from menu | CAD-149 (In Progress) | Becomes HIGH after CAD-149 |
| PACK-226 | Editing config creates duplicate cart | CAD-149 investigation | Becomes HIGH after CAD-149 |
| PACK-216 | Cart not cleared on suspended restaurant | CAD-177 (Parked) | Blocked until Decision D8 |
| PACK-205 | Signup "Failed to send mail" | CAD-222 | Becomes HIGH after CAD-222 |
| PACK-199 | Wrong notification text | CAR-207 fix | Becomes HIGH after CAR-207 |
| PACK-210 | Track Order + delivery time | CUR-149 | Far future |
| PACK-200 | Filter by delivery availability | CAR-96 | Becomes MEDIUM after CAR-96 |
| PACK-190 | Replace Cuisines with Packages | CAR-28/29/30 | Becomes MEDIUM after PKG chain |
| PACK-146 | Package Config Backend Support | CAR-28/29 | Becomes MEDIUM after PKG chain |
| PACK-136 | Payment Method Management | CUR-151 coordination | Far future |

### Complex Integrations (5 tickets)

| Key | Summary | Confidence | Why Low | Notes |
|-----|---------|------------|---------|-------|
| PACK-105 | Stripe SDK Integration | 35% | Needs Stripe keys, webhook config, cross-project coordination | 3 Stripe tickets across 3 projects |
| CUR-151 | Stripe Payment Integration | 40% | Same as above — needs coordinated Stripe setup | New platform API |
| CUR-146 | Customer Auth API | 40% | Auth is critical path. JWT, social login, token refresh. | High risk if wrong |
| CUR-148 | Cart & Checkout API | 40% | Must mirror complex Laravel logic. Order lifecycle critical. | Needs deep domain knowledge |
| CUR-150 | Subscription Management API | 35% | Complex billing cycles, renewals, refunds | Financial critical |

### Too Broad (3 tickets)

| Key | Summary | Why Low | Recommendation |
|-----|---------|---------|---------------|
| CAD-2 | User Access Control & Role Management | Very broad scope, no clear ACs | Break into subtasks first |
| CAD-195 | Comprehensive Notification System | Umbrella story, 16 tickets underneath | Work individual tickets instead |
| CAD-189/190 | Subscription Plans + Trials | Complex billing, trial logic, renewals | Need detailed specs first |

---

## NOT AI-ACHIEVABLE (52+ tickets)

### QA/Testing Stories — Need Human (22 tickets)
Kasun's stories (CAD-105, 104, 113, 135, 112, 110, 109, 103, 111, 107, 106, 102, 140, 136, 134, 131, 130, 129, 127, 126, 125, 124, 123, 122, 121, 120, 119, 118) and testing tasks (CAD-74..93) require manual testing, human judgment on quality, and QA processes.

### Minuri's Story Writing (20+ tickets)
CAR-106..142 — These are product stories that need human PM writing and stakeholder review.

### Parked / DO NOT ACTION (5 tickets)
CAD-148, CAD-150, CAD-177, CAD-204, CAR-98 — Explicitly parked by team.

### Pending Decisions (8 items)
D1-D8 in `DECISIONS-NEEDED.md` — Require Demi's input before work can proceed.

### CUR Prototyping (37 tickets — special case)
CUR-47..78, CUR-20..44 — Prototyping work. **Actually HIGH for AI** (UI prototyping is ideal for Claude Code). But Decision D6 recommends deprioritizing to free Ramesh's capacity. If Demi approves keeping them, these move to HIGH.

### PACK Brand Tasks (11 tickets)
PACK-21..34 — Brand identity tasks (colors, fonts, buttons). Need design decisions first.

### Infrastructure / External (3 tickets)
- CUR-122..132 — Stripe Admin Dashboard (Santhuka's scope, needs Stripe credentials)
- CUR-134..139 — Notification stories (need Firebase + SMS provider setup)
- CAD-140 — Zone setup for specific postcodes (needs geolocation data)

---

## Skills Map — What to Use When

### For Bug Fixes
```
/find-bugs          → Locate the bug in codebase (searches patterns, traces logic)
/systematic-debugging → Multi-step debugging (hypothesize → test → fix cycle)
/bmad-bmm-code-review → Post-fix review to catch regressions
```
**Best for**: QW-3 through QW-9, H12, H20, H24-H26

### For Feature Implementation
```
/bmad-bmm-create-story   → Generate story file with full context from Jira ticket
/bmad-bmm-dev-story      → Execute story implementation with test-first approach
/bmad-bmm-quick-dev      → Quick implementation for small features (< 2 hrs)
/test-driven-development → Write tests first, then implement
/ralph-run               → Autonomous story implementation loop
```
**Best for**: H1-H11, H13-H19, H29-H38

### For Planning Complex Work
```
/planning-with-files     → File-based planning for multi-step tasks
/bmad-bmm-create-epics-and-stories → Break large tickets into epics
/writing-plans           → Design implementation plans
```
**Best for**: CAD-149 (cart validation), CAD-195 (notification system), Package Management chain

### For Code Quality
```
/code-review             → Sentry-style code review
/bmad-bmm-code-review    → Adversarial code review
/verification-before-completion → Final check before marking done
/simplify                → Review changed code for reuse and quality
```
**Best for**: All implementations — run after completing each ticket

### For Testing
```
/test-driven-development → TDD cycle
/bmad-tea-testarch-automate → Expand test automation coverage
/bmad-tea-testarch-test-design → Create test plans for complex features
```
**Best for**: H1, H6 (audit trait), H17 (schema), CAD-149

---

## Recommended Implementation Order

### Sprint A: Quick Wins (1-2 days)
Execute in a single Claude Code session per project:

**Laravel session** (same codebase, same session):
1. CAR-201 (ABN mandatory) — 30 min
2. CAR-144 (Display ABN) — 30 min
3. CAD-207 (Role display) — 1 hr
4. CAD-203 (Name search) — 1 hr
5. CAR-179 (Date filter) — 1 hr
6. CAR-195 (Error message) — 1 hr
7. CAR-202 (Email template) — 1 hr
**Total: ~6 hours, 7 bug fixes**

**Flutter session**:
1. PACK-177 (Address persist) — 1 hr
2. PACK-221 (Nav bar) — 1 hr
3. PACK-193 (Overflow) — 1 hr
**Total: ~3 hours, 3 UI fixes**

### Sprint B: Draft Workflow (2-3 days)
Complete the draft system across both portals:
1. CAD-181 (Food draft — admin) — 4 hrs
2. CAR-170 (Food draft — vendor) — 4 hrs
3. CAR-169 (Package draft — vendor) — 3 hrs
**Total: ~11 hours, completes Draft cluster**

### Sprint C: Permission & Audit (3-4 days)
1. CAD-202 + CAD-200 (Package permission) — 3 hrs
2. CAD-212 (HasAuditLog trait) — 5 hrs
3. CAD-213 (Audit admin UI) — 4 hrs
4. CAR-147 (Audit vendor UI) — 3 hrs
**Total: ~15 hours, completes Permission + Audit clusters**

### Sprint D: Vendor Management Subtasks (3-4 days)
1. CAD-208 (Request Info backend) — 4 hrs
2. CAD-209 (Request Info UI) — 4 hrs
3. CAD-210 (Email templates) — 3 hrs
4. CAD-211 (Privacy CMS) — 2 hrs
5. CAD-216 (Performance service) — 5 hrs
6. CAD-217 (Performance controller) — 2 hrs
**Total: ~20 hours, completes Vendor Management subtasks**

### Sprint E: ABN + Holiday (2-3 days)
1. CAR-148 (ABN validation) — 2 hrs
2. CAR-208 (Holiday DB) — 3 hrs
3. CAR-209 (Admin holidays) — 5 hrs
4. CAR-210 (Vendor exceptions) — 5 hrs
5. CAR-211 (Schedule API) — 3 hrs
**Total: ~18 hours, completes ABN + Holiday clusters**

### Sprint F: Image + Blocker Bugs (2-3 days)
1. CAD-186 (Image compression) — 4 hrs
2. CAR-178 (Employee login blocker) — 3 hrs
3. CAD-222 (Dual emails) — 4 hrs
4. CAD-221 (Cancel notification) — 4 hrs
**Total: ~15 hours**

---

## How to Start an Implementation Session

For each ticket, open Claude Code in the target project directory and run:

```bash
# For Laravel tickets:
cd D:\ailocal\currydash\Admin-Seller_Portal

# For Flutter tickets:
cd D:\ailocal\currydash\User-Web-Mobile

# For CUR/Central Hub tickets:
cd D:\ailocal\CurryDash-Central-Hub
```

Then use these skills in order:
1. `/bmad-bmm-create-story` — Generate story file from Jira ticket context
2. `/test-driven-development` — Write failing tests first
3. `/bmad-bmm-dev-story` — Implement the feature
4. `/bmad-bmm-code-review` — Review the implementation
5. `/verification-before-completion` — Final check
6. `/commit` — Commit changes

For bugs, replace steps 1-3 with:
1. `/find-bugs` — Locate the issue
2. `/systematic-debugging` — Debug and fix
3. `/bmad-bmm-code-review` — Review the fix

---

## Appendix: Codebase Readiness Summary

### Laravel (Admin-Seller_Portal) — READY
- 123 models with clear relationships
- 105 controllers with consistent patterns
- 343 migrations (schema well-established)
- 38 mail classes (email pattern clear)
- 10 traits (reusable pattern established)
- ModulePermissionMiddleware (RBAC pattern clear)
- `intervention/image` installed (compression ready)
- `beyondcode/laravel-websockets` installed (real-time ready)
- `stripe/stripe-php` installed (payment ready)
- PHPUnit + Mockery (testing framework in place)
- **Risk**: `Helpers.php` is 5189 lines (god class) — AI may struggle with context

### Flutter (User-Web-Mobile) — READY (with caveats)
- 30+ feature modules with clean architecture
- GetX state management (straightforward pattern)
- Service interfaces for dependency injection
- Firebase messaging configured
- **Caveat**: Only 5 tests (model serialization only) — need to add tests
- **Caveat**: No Stripe SDK — payment via webview to backend
- **Caveat**: Some features partially implemented (packages)

### Next.js (Central Hub) — PARTIALLY READY
- Well-documented in CLAUDE.md with clear rules
- shadcn/ui + Supabase + Auth.js v5 stack defined
- **Caveat**: New project — less established code to follow
- **Caveat**: Supabase tables need to be created for most features
- **Caveat**: More planning needed before implementation
