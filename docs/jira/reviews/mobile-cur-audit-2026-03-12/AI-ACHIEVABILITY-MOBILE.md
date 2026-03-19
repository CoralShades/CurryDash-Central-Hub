# AI-Achievability Assessment — PACK (Mobile/Flutter)

> **Date**: 2026-03-12 | **Total PACK tickets**: 100 active
> **Codebase**: `D:\ailocal\currydash\User-Web-Mobile` (Flutter/Dart, GetX)
> **Assessment criteria**: Can Claude Code implement this ticket in the Flutter codebase?

---

## Dashboard

| Category | Count | Description |
|----------|-------|-------------|
| **HIGH** (80%+) | **11** | Claude Code can implement autonomously |
| **MEDIUM** (50-80%) | **7** | Needs human guidance or review |
| **LOW** (20-50%) | **10** | Blocked by backend or complex integrations |
| **NOT AI-ACHIEVABLE** | **72** | Backend-dependent, QA, process, brand decisions, epics |

### Why so few HIGH?
Unlike the Laravel codebase (28 HIGH), Flutter has:
- Only 5 existing tests → no test patterns to follow
- 68% of required APIs don't exist → most features blocked
- Brand/design tasks need human design decisions
- Testing/process tasks aren't code tasks

---

## HIGH AI-ACHIEVABLE (11 tickets)

### H1: PACK-177 — Deleted Address Persists After Logout/Login
- **Confidence**: 92% | **Effort**: 1-2 hrs | **Size**: S
- **What**: Address cache not cleared on logout
- **Files to modify**:
  - `lib/features/auth/controllers/auth_controller.dart` — `logout()` method
  - `lib/util/shared_pref_helper.dart` or equivalent — clear address keys
  - `lib/features/address/controllers/address_controller.dart` — verify cache lifecycle
- **Pattern**: Other data (cart, user info) already cleared on logout. Address missed.
- **Skills**: `/find-bugs`, `/systematic-debugging`
- **Risk**: LOW — cleanup on logout
- **Blockers**: None

### H2: PACK-221 — Bottom Nav Hidden by Order Processing Bar
- **Confidence**: 90% | **Effort**: 1-2 hrs | **Size**: S
- **What**: Order processing notification bar overlays bottom navigation
- **Files to modify**:
  - `lib/features/dashboard/screens/dashboard_screen.dart` — adjust Stack/layout
  - Order processing widget — add `bottomNavigationBar` height padding
- **Pattern**: Standard Flutter layout fix. `Stack` → adjust `Positioned` or add padding.
- **Skills**: `/find-bugs`
- **Risk**: ZERO — UI layout only

### H3: PACK-193 — UI Overflow "Right overflowed by 12 pixels" on Android
- **Confidence**: 90% | **Effort**: 1 hr | **Size**: S
- **What**: Layout overflow on Android devices
- **Files to modify**:
  - Identify specific screen from error trace → wrap in `SingleChildScrollView` or use `Flexible`/`Expanded`
- **Pattern**: Common Flutter issue with fixed-width containers on smaller screens
- **Skills**: `/find-bugs`
- **Risk**: ZERO — layout fix

### H4: PACK-209 — Dietary Notes Warning Icons Not Applicable
- **Confidence**: 85% | **Effort**: 1-2 hrs | **Size**: S
- **What**: Dietary note icons showing incorrectly on product details
- **Files to modify**:
  - Product detail widget — fix icon/enum mapping logic
  - `lib/features/product/` or `lib/common/widgets/` — dietary icon widget
- **Pattern**: Icon mapping fix — correct the condition or enum values
- **Skills**: `/find-bugs`
- **Risk**: LOW

### H5: PACK-178 — Network Failure Infinite Loading
- **Confidence**: 85% | **Effort**: 2-3 hrs | **Size**: M
- **What**: Loading state never resets on network failure across multiple flows
- **Files to modify**:
  - `lib/api/api_checker.dart` — ensure error handler resets loading state
  - Multiple controllers — add `finally` blocks to reset `_isLoading = false`
  - `lib/api/api_client.dart` — verify timeout handling (currently 30s)
- **Pattern**: GetX controllers use `_isLoading` flags. Need `try/catch/finally` pattern.
- **Skills**: `/find-bugs`, `/systematic-debugging`
- **Risk**: MEDIUM — affects multiple flows, but pattern is repetitive
- **Note**: Blocks 4 other tickets (PACK-133, 134, 135, 148)

### H6: PACK-194 — Full Name Field in Registration
- **Confidence**: 90% | **Effort**: 2 hrs | **Size**: S
- **What**: Add full name text field to signup form
- **Files to modify (Flutter)**:
  - `lib/features/auth/screens/sign_up_screen.dart` — add `TextFormField`
  - `lib/features/auth/controllers/auth_controller.dart` — pass name to API
  - `lib/features/auth/domain/repositories/auth_repo.dart` — add name param to register call
- **Files to modify (Laravel)**:
  - `app/Http/Controllers/Api/V1/Auth/CustomerAuthController.php` — accept `name` field
- **Pattern**: Registration already handles `f_name`, `l_name`. May just need UI field + API param.
- **Skills**: `/bmad-bmm-dev-story`
- **Risk**: LOW — additive, doesn't change existing flow
- **Note**: Cross-project — needs both Flutter and Laravel changes

### H7: PACK-118 — Refactor to Centralized AppColors Constants
- **Confidence**: 88% | **Effort**: 3-4 hrs | **Size**: M
- **What**: Replace scattered color hex values with centralized constants
- **Files to modify**:
  - `lib/util/app_constants.dart` or new `lib/util/app_colors.dart` — define constants
  - All files using hardcoded `Color(0xFF...)` values — replace with constants
- **Pattern**: Find-and-replace across codebase. Mechanical but tedious.
- **Skills**: `/find-bugs` (to locate all hardcoded colors)
- **Risk**: LOW — visual only, no logic changes

### H8: PACK-117 — Migrate Theme Files to Brand Colors v2.0
- **Confidence**: 85% | **Effort**: 2-3 hrs | **Size**: M
- **What**: Update theme definition files to use new brand color palette
- **Files to modify**:
  - `lib/theme/` — update `ThemeData` with new colors
  - `lib/util/styles.dart` — update color constants
- **Pattern**: Theme configuration change. Depends on brand color decisions.
- **Skills**: `/bmad-bmm-quick-dev`
- **Risk**: LOW — requires brand color hex values to be decided first

### H9: PACK-130 — StackFood Reference Removal
- **Confidence**: 95% | **Effort**: 2-3 hrs | **Size**: M
- **What**: Remove/rename all StackFood branding references to CurryDash
- **Files to modify**:
  - All files containing "StackFood", "stackfood", "stack_food" strings
  - `lib/util/app_constants.dart` — app name, URLs
  - Asset files — icons, splash
- **Pattern**: Global search-and-replace. Mechanical.
- **Skills**: `/find-bugs` (search), then bulk edit
- **Risk**: LOW — must not change API endpoint paths that backend expects

### H10: PACK-224 — Cannot Navigate Back from Payment Page
- **Confidence**: 82% | **Effort**: 2-3 hrs | **Size**: M
- **What**: InAppWebView payment page doesn't handle back navigation properly
- **Files to modify**:
  - Payment WebView screen — add `WillPopScope` or `onNavigationRequest` handler
  - Check `InAppWebView` `shouldOverrideUrlLoading` callback
  - Verify payment callback URL detection
- **Pattern**: WebView navigation handling — intercept back button and URL changes
- **Skills**: `/find-bugs`, `/systematic-debugging`
- **Risk**: MEDIUM — payment flow is sensitive

### H11: PACK-212 — Restaurants Not Sorted by Distance
- **Confidence**: 80% | **Effort**: 2-3 hrs | **Size**: M
- **What**: Restaurant list not sorted by proximity to user
- **Files to modify**:
  - Restaurant list controller — add client-side distance sort
  - Or verify backend `latitude`/`longitude` params are being sent in API call
  - `lib/features/restaurant/` — sort logic
- **Pattern**: Use `Geolocator` package (likely already installed) for distance calculation
- **Skills**: `/find-bugs`
- **Risk**: LOW — sort order change only
- **Note**: May also need backend change if API doesn't support distance sorting

---

## MEDIUM AI-ACHIEVABLE (7 tickets)

| Key | Summary | Confidence | Effort | Why Medium | Skills |
|-----|---------|------------|--------|------------|--------|
| PACK-184 | Address/time not retained at checkout | 70% | 3-4 hrs | Complex GetX state flow in CheckoutController. Multiple navigation paths. | `/systematic-debugging` |
| PACK-197 | Homepage improvements | 65% | 4-6 hrs | UI redesign without mockups. Need design direction. | `/bmad-bmm-dev-story` |
| PACK-196 | Order details visual sync | 65% | 3-4 hrs | UI alignment with design system. Depends on PACK-9 reference. | `/bmad-bmm-dev-story` |
| PACK-195 | Cart card redesign | 65% | 3-4 hrs | UI redesign without mockups. Need design specs. | `/bmad-bmm-dev-story` |
| PACK-127 | App icon & splash screen update | 70% | 2-3 hrs | Need actual icon/splash assets from designer | `/bmad-bmm-quick-dev` |
| PACK-34 | Accessibility: ARIA labels & touch targets | 75% | 4-6 hrs | Systematic but needs full app audit | `/find-bugs` |
| PACK-198 | INVESTIGATE: Package ordering bugs | 70% | 2-4 hrs | Investigation task — can search codebase but may need live testing | `/find-bugs` |

---

## LOW AI-ACHIEVABLE (10 tickets)

### Blocked by Missing Backend APIs

| Key | Summary | Blocked By | When Unblocked |
|-----|---------|-----------|---------------|
| PACK-222 | ISE on cart item deletion | CAD-149 (In Progress) | HIGH after CAD-149 |
| PACK-226 | Duplicate cart on config edit | CAD-149 (In Progress) | HIGH after CAD-149 |
| PACK-216 | Cart + suspended restaurant | CAD-177 (Parked) | Blocked indefinitely |
| PACK-205 | Signup "Failed to send mail" | CAD-222 (To Do) | HIGH after CAD-222 |
| PACK-200 | Filter by delivery availability | CAR-96 (To Do) | MEDIUM after CAR-96 |
| PACK-199 | Wrong notification text | CAR-207 (In Progress) | HIGH after CAR-207 |
| PACK-210 | Track order + delivery time | CUR-149 (To Do) | Far future |
| PACK-190 | Replace Cuisines with Packages | CAR-28/29/30 (To Do) | MEDIUM after PKG chain |
| PACK-146 | Package Config Backend | CAR-28/29 (To Do) | MEDIUM after PKG chain |
| PACK-136 | Payment method management | CUR-151 coordination | Far future |

---

## NOT AI-ACHIEVABLE (72 tickets)

### Reason Breakdown

| Reason | Count | Tickets |
|--------|-------|---------|
| Backend API doesn't exist | 18 | PACK-86-91, 93-98, 105, 107, 108, 146, 151, 164-170 |
| Brand/design decisions needed | 14 | PACK-21-34 |
| Process/documentation tasks | 12 | PACK-121-126, 131, 171-175 |
| Epics (containers, not work) | 15 | PACK-13-120 (all epics) |
| QA subtasks | 4 | PACK-112, 114, 116, 108 |
| DEV subtasks blocked by backend | 3 | PACK-111, 113, 115 |
| Duplicate stories | 6 | PACK-91≈168, 93≈169, 94≈170, 95≈164, 96≈165 |

---

## Quick Wins — PACK Tickets Implementable TODAY

| Rank | Key | Summary | Effort | Confidence | Files |
|------|-----|---------|--------|------------|-------|
| 1 | PACK-193 | UI overflow fix | 1 hr | 90% | Layout screen TBD |
| 2 | PACK-221 | Bottom nav fix | 1-2 hrs | 90% | `dashboard_screen.dart` |
| 3 | PACK-177 | Address cache fix | 1-2 hrs | 92% | `auth_controller.dart`, SharedPrefs |
| 4 | PACK-209 | Dietary icons fix | 1-2 hrs | 85% | Product detail widget |
| 5 | PACK-130 | StackFood reference removal | 2-3 hrs | 95% | Global search/replace |
| 6 | PACK-178 | Network error handling | 2-3 hrs | 85% | `api_checker.dart`, controllers |
| 7 | PACK-118 | Centralize AppColors | 3-4 hrs | 88% | `app_colors.dart`, all UI files |
| 8 | PACK-194 | Full name in registration | 2 hrs | 90% | `sign_up_screen.dart`, auth controller |
| 9 | PACK-224 | Payment back-nav fix | 2-3 hrs | 82% | Payment WebView screen |
| 10 | PACK-212 | Restaurant distance sort | 2-3 hrs | 80% | Restaurant controller |

**Total estimated: ~18 hours for 10 tickets**

### How to Execute

```bash
# Open Claude Code in Flutter project
cd D:\ailocal\currydash\User-Web-Mobile

# For each bug fix:
# 1. /find-bugs → locate the issue
# 2. /systematic-debugging → fix
# 3. /verification-before-completion → verify
# 4. /commit → commit

# For PACK-194 (cross-project):
# Start in Laravel: cd D:\ailocal\currydash\Admin-Seller_Portal
# Add name param to registration API
# Then switch to Flutter for UI
```
