# Codebase Analysis Findings: Vendor Management

> Analysis Date: 2026-03-10
> Target: Laravel Admin-Seller Portal + Flutter User App
> Sources: Automated codebase exploration agents

## Laravel Codebase (Admin-Seller Portal)

### Existing Vendor Infrastructure

**VendorController** (`app/Http/Controllers/Admin/VendorController.php`, ~2416 lines)
- `store()` — Create new vendor/restaurant (lines 71-266)
- `edit($id)` / `update($request, Restaurant $restaurant)` — Profile editing (lines 279-449)
- `view($restaurant, $tab)` — Vendor detail with tab navigation
- `pending()` / `denied()` / `list()` — List views with search/filter
- `status($restaurant, $status)` — Approve/reject vendor (toggle status)
- `moderation_index($request)` — Moderation dashboard with suspension tracking (lines 2175-2277)
- `moderation_toggle($request)` — Single suspend/activate (lines 2283-2311)
- `bulk_moderation($request)` — Bulk suspend/activate (lines 2317-2352)
- `approve_abn($id)` / `reject_abn($id)` — ABN compliance (lines 2355-2415)
- `add_schedule()` / `remove_schedule()` — Admin-side schedule management

**Restaurant Model** (`app/Models/Restaurant.php`)
- Relationships: `vendor()` (BelongsTo, line 191), `schedules()` (HasMany, line 205), `orders()` (HasMany, line 215), `moderation_logs()` (HasMany, line 610), `restaurant_config()` (HasOne, line 142)
- Scopes: `scopeActive()` (lines 306-317), `scopeOpened()` (line 357), `scopeWeekday()` (line 367), `scopeWithOpen()` (line 362), `scopeDelivery()` (line 289), `scopeTakeaway()` (line 294)
- Key columns: `is_suspended` (boolean), `suspension_note` (text), `moderated_at` (timestamp), `abn_change_status` ('pending'|'approved'), `tin`, `tin_type` ('tin'|'abn'), `status` (1=approved, 0=pending), `rejection_reason`
- Appended attrs: `gst_status`, `gst_code`, `free_delivery_distance_status`, `package_available_days`

**RestaurantSchedule Model** (`app/Models/RestaurantSchedule.php`, lines 1-28)
- Schema: `id`, `restaurant_id` (FK), `day` (integer 1-7, Mon-Sun), `opening_time`, `closing_time`, timestamps
- **Note**: Day numbering is 1-7 (Mon=1, Sun=7) in Laravel, vs 0-6 (Sun=0) in Flutter — conversion needed

**RestaurantModerationLog Model** (`app/Models/RestaurantModerationLog.php`, lines 1-19)
- Schema: `id`, `restaurant_id` (FK), `admin_id` (nullable), `admin_name`, `action_type` ('suspended'|'activated'), `note`, timestamps
- Action types currently limited to suspension/activation — NOT used for approve/reject
- **Gap**: Does NOT track approval/rejection — `status()` method in VendorController handles those directly without moderation log

**RestaurantController (Vendor Side)** (`app/Http/Controllers/Vendor/RestaurantController.php`, lines 1-207)
- `view()` / `edit()` / `update()` — Vendor self-service profile management
- `update()` (lines 28-139) — Includes **ABN change detection** (lines 57-76): Sets `abn_change_status = 'pending'` and notifies admin
- QR code: `qr_view()`, `qr_store()`, `qr_pdf()`, `qr_print()`

**BusinessSettingsController** (`app/Http/Controllers/Vendor/BusinessSettingsController.php`, lines 1-320)
- `restaurant_index()` (lines 25-34) — Business settings dashboard
- `restaurant_setup()` (lines 70-155) — Update cuisine, tags, delivery settings
- `restaurant_status()` (lines 158-229) — Toggle delivery/takeaway/veg/dine-in/instant/schedule order
- `active_status()` (lines 232-237) — Toggle restaurant open/closed
- `add_schedule()` (lines 240-274) — Add business hours with overlap checking
- `remove_schedule()` (lines 277-288) — Delete schedule entry

**Review Model** (`app/Models/Review.php`)
- Scopes: `scopeActive()` (line 57), `scopePackageReviews()` (line 92), `scopeFoodReviews()` (line 100)
- Validation boot method ensures exactly ONE of `food_id` or `package_id` (lines 108-141)
- **Gap**: No scope for "complaints" (rating ≤ 2) — needs `scopeComplaints()` added

**Order Model** (`app/Models/Order.php`)
- Status values: 'delivered', 'refund_requested', 'canceled', 'payment_failed'
- Casts: `order_amount`, `coupon_discount_amount`, `total_tax_amount`, `delivery_charge` → float
- `scheduled` boolean for scheduled orders
- Key relationships: `payments()` (HasMany OrderPayment), `logs()` (HasMany Log)

**Vendor Model** (`app/Models/Vendor.php`, lines 43-104)
- Earning relationships: `todays_earning()`, `this_week_earning()`, `this_month_earning()`
- Order relationships: `todaysorders()`, `this_week_orders()`, `this_month_orders()` — all via HasManyThrough (Order via Restaurant)
- `restaurants()` — HasMany Restaurant (line 93)
- `orders()` — HasManyThrough Order via Restaurant (line 88)

**Mail Classes**
- `VendorSelfRegistration` (`app/Mail/VendorSelfRegistration.php`, lines 1-69): Statuses: 'approved', 'denied', 'registration'. Rejection reason appended with HTML escaping (lines 49-51). Uses `EmailTemplate` table.
- `VendorStatus` (`app/Mail/VendorStatus.php`, lines 1-59): Statuses: 'suspended', 'unsuspend'. Uses email templates.
- `VendorCampaignRequestMail` — Campaign participation notifications

**Routes**
- `routes/admin.php` (lines 213-281): Vendor routes under `restaurant` prefix. Includes moderation, ABN approve/reject, schedule management.
- `routes/vendor.php` (lines 271-282): Business settings under `business-settings` prefix. Schedule add/remove routes.

**Migrations**
- `2021_05_06_153204` — Base restaurants table
- `2022_01_19_060356` — `restaurant_schedule` table (day, opening_time, closing_time)
- `2026_01_06_111915` — Moderation: adds `is_suspended`, `suspension_note`, `moderated_at` to restaurants + creates `restaurant_moderation_logs`
- `2026_01_09_114420` — Adds `abn` column to restaurants
- `2026_01_16_161306` — Adds `tin_type` ('tin'|'abn')
- `2026_02_24_090054` — Adds `rejection_reason` to restaurants

**Admin Views** (`resources/views/admin-views/vendor/`)
- `index.blade.php`, `list.blade.php`, `edit.blade.php`
- `pending_list.blade.php`, `pending_list_view.blade.php`, `denied.blade.php`
- `moderation.blade.php` — Suspension/activation with activity logs
- `view/` — Vendor detail tabs

**Vendor Views** (`resources/views/vendor-views/`)
- `shop/` — Restaurant info, edit, QR code
- `business-settings/` — Restaurant setup, notifications, schedules

### Key Gaps Identified

1. **No field-level audit logging** — RestaurantModerationLog only tracks suspension/activation, not field changes
2. **No schedule exception support** — Only weekly day-based schedules (1-7)
3. **No global holiday system** — No admin-managed holiday list
4. **No "Request More Info" status** — Vendor lifecycle: pending → approved/denied/suspended only
5. **No performance metrics aggregation** — Basic rating via `getRatingAttribute()` but no trend/completion/cancellation analytics
6. **No CMS for legal pages** — Privacy policy not editable by admin
7. **Multi-location vendor management UI missing** — `restaurants()` relationship exists but no dedicated management interface
8. **Moderation log doesn't cover approval/rejection** — Only suspension/activation logged

---

## Flutter Codebase (User-Web-Mobile)

### Schedule & Restaurant Models

**Schedules Class** (`lib/common/models/restaurant_model.dart`, lines 427-453)
- Fields: `id`, `restaurantId`, `day` (0-6, Sun=0), `openingTime` (HH:MM), `closingTime` (HH:MM)
- Parsed from API `json['schedules']` array (lines 207-212)

**Restaurant Schedule Fields** (same file):
- `scheduleOrder` (line 59) — Enable/disable scheduled orders
- `schedules` (line 72) — `List<Schedules>` weekly schedule
- `customerDateOrderStatus` (line 90) — Allow customers to order for specific dates
- `customerOrderDate` (line 91) — Max days in advance (e.g., 7)
- `scheduleAdvanceDineInBookingDuration` (line 101) — Dine-in advance limit
- `packageAvailableDays` (line 106) — Days when packages available (0-6)

### RestaurantService — Schedule Methods

**File**: `lib/features/restaurant/domain/services/restaurant_service.dart`

**`isRestaurantClosed(DateTime, bool active, List<Schedules>?)`** (lines 174-189)
1. If `!active` → return true
2. Convert DateTime weekday to 0-6 (Sunday=0)
3. Check if any schedule entry matches the weekday
4. No match → closed; match found → potentially open

**`isRestaurantOpenNow(bool active, List<Schedules>?)`** (lines 192-207)
1. Calls `isRestaurantClosed(DateTime.now(), ...)`
2. For matching schedule, checks `DateConverter.isAvailable(openingTime, closingTime)`
3. Returns true only if day matches AND current time within hours

### Checkout Flow

**TimeSlotBottomSheet** (`lib/features/checkout/widgets/time_slot_bottom_sheet.dart`, lines 17-426)
- Three date tabs: Today (0), Tomorrow (1), Custom Date (2)
- `_canSelectDate()` (lines 303-330):
  - Must not be before today
  - Must be within `maxDuration` (customerOrderDate limit)
  - Must not be on a closed day (calls `isRestaurantClosed()`)
  - Must be available for packages if order contains packages
- `_maxSelectableDays()` (lines 332-336): Caps at 14 days
- Uses `SfDateRangePicker` with `selectableDayPredicate`
- Shows "restaurant_is_closed" message for closed dates

**CheckoutService** (`lib/features/checkout/domain/services/checkout_service.dart`)
- `initializeTimeSlot()` (lines 55-94): Generates time slots from weekly schedules using `scheduleOrderSlotDuration` intervals
- `validateTimeSlot()` (lines 97-119): Filters slots for selected date by matching weekday; for today, excludes past slots
- `validateSlotIndexes()` (lines 122-142): Returns original slot indices for UI selection tracking

**CheckoutController** (`lib/features/checkout/controllers/checkout_controller.dart`)
- Key state: `_customDateRestaurantClose`, `_selectedCustomDate`, `_timeSlots`, `_allTimeSlots`, `_slotIndexList`
- `initCheckoutData()` (lines 329-334): Fetches restaurant + initializes time slots
- `_validateSlot()` (lines 582-589): Re-validates when date changes
- `isRestaurantClosed()` (lines 336-338): Delegates to RestaurantController

**DineIn Date Select** (`lib/features/checkout/widgets/dine_in_date_select_bottom_sheet.dart`)
- `_canSelectDate()` (lines 143-161): Validates based on dine-in booking duration
- `checkRestaurantClose()` (lines 132-141): Checks if selected date is closed

### API Integration
**RestaurantRepository** (`lib/features/restaurant/domain/repositories/restaurant_repository.dart`, lines 82-95)
- `_getRestaurantDetails()`: Fetches restaurant details including `schedules[]` array
- Response includes: `schedule_order`, `customer_order_date`, `package_available_days`

### Key Flutter Gaps

1. **No ScheduleException model** — No class for date-specific closures
2. **No holiday awareness** — `isRestaurantClosed()` only checks weekly day (0-6)
3. **Checkout doesn't validate exceptions** — `validateTimeSlot()` uses weekday only
4. **Time slot picker shows closed dates as available** — `_canSelectDate()` only checks weekly schedule
5. **No "Holiday - Closed" indicator** — UI has no visual for holiday closures
6. **Day numbering mismatch** — Laravel uses 1-7 (Mon-Sun), Flutter uses 0-6 (Sun-Sat) — conversion logic exists but needs verification for exceptions
7. **No API endpoint for date-specific schedules** — Would need `GET /api/v1/restaurants/{id}/schedule?date=` endpoint
