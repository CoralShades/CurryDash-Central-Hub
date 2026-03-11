# CAR-156 Implementation Plan: Holiday Hours / Special Dates

> Target Codebase: `D:\ailocal\currydash\Admin-Seller_Portal` (Laravel) + `D:\ailocal\currydash\User-Web-Mobile` (Flutter)
> FR: FR5 | Status: To Do — new feature (despite Bug classification)
> Related: CAR-109 (parent), CAR-102 (operational config subtask)

## Existing Infrastructure

### Laravel
- `RestaurantSchedule` model: `day` (0-6), `opening_time`, `closing_time` — weekly only
- `Restaurant::schedules()`, `schedule_today()`
- `BusinessSettingsController@add_schedule()` + `remove_schedule()` — vendor CRUD
- `Restaurant::withOpen()` scope — checks if currently open
- `off_day` column on restaurants (concatenated day numbers like "0,6")

### Flutter
- `Schedules` class: `day` (0-6), `openingTime`, `closingTime`
- `RestaurantService.isRestaurantClosed()` — checks day only
- `RestaurantService.isRestaurantOpenNow()` — checks day + time
- `TimeSlotBottomSheet` — no holiday awareness
- `CheckoutService.validateTimeSlot()` — no holiday check

## Implementation

### Phase 1: Database & Models (Laravel)

#### 1.1 New Migration — `global_holidays` table
```sql
Schema::create('global_holidays', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->date('date');
    $table->boolean('is_recurring')->default(false); // same date every year
    $table->string('country_code', 2)->default('AU');
    $table->string('state_code', 3)->nullable(); // NSW, VIC, QLD, etc. NULL = national
    $table->unsignedBigInteger('created_by')->nullable();
    $table->timestamps();

    $table->index(['date']);
    $table->index(['country_code', 'state_code']);
});
```

#### 1.2 New Migration — `restaurant_schedule_exceptions` table
```sql
Schema::create('restaurant_schedule_exceptions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
    $table->date('exception_date');
    $table->boolean('is_closed')->default(true);
    $table->time('opening_time')->nullable(); // if not closed, modified hours
    $table->time('closing_time')->nullable();
    $table->string('reason')->nullable(); // "Christmas Day", "Staff Training"
    $table->unsignedBigInteger('created_by')->nullable();
    $table->timestamps();

    $table->unique(['restaurant_id', 'exception_date']);
    $table->index(['exception_date']);
});
```

#### 1.3 New Model — `GlobalHoliday`
- **File**: `app/Models/GlobalHoliday.php`
- Scopes: `upcoming()`, `forDate($date)`, `forState($state)`, `national()`, `recurring()`
- Method: `isHolidayOnDate(Carbon $date, ?string $state)` — checks fixed + recurring

#### 1.4 New Model — `RestaurantScheduleException`
- **File**: `app/Models/RestaurantScheduleException.php`
- Relationships: `restaurant()`
- Scopes: `upcoming()`, `forDate($date)`, `closedDates()`, `modifiedHours()`

#### 1.5 Update `Restaurant` Model
- Add relationships:
  ```php
  public function scheduleExceptions() { return $this->hasMany(RestaurantScheduleException::class); }
  ```
- New method: `isOpenOnDate(Carbon $date)`
  1. Check `restaurant_schedule_exceptions` for exact date match
     - If found and `is_closed = true` → CLOSED
     - If found and `is_closed = false` → use exception hours
  2. Check `global_holidays` for date match (considering restaurant's state)
     - If holiday and no vendor override → CLOSED
  3. Fall back to weekly `RestaurantSchedule` for day of week
- New method: `getEffectiveScheduleForDate(Carbon $date)` — returns hours or "closed"
- Update `withOpen()` scope to check exceptions

### Phase 2: Admin Holiday Management

#### 2.1 New Controller — `HolidayController`
- **File**: `app/Http/Controllers/Admin/HolidayController.php`
- CRUD: `index()`, `store()`, `update()`, `destroy()`
- `index()`: List all holidays with state filter, year filter
- `store()`: Validate name, date, is_recurring, state_code

#### 2.2 Admin View — Holidays
- **File**: `resources/views/admin-views/settings/holidays.blade.php`
- Table: Name, Date, State, Recurring?, Actions (Edit/Delete)
- "Add Holiday" button → modal with: name, date picker, recurring toggle, state dropdown (All/NSW/VIC/etc.)
- Year filter tabs

#### 2.3 Admin Routes
```php
// routes/admin.php
Route::resource('holidays', HolidayController::class)->except(['show', 'create', 'edit']);
```

#### 2.4 Seeder — `AustralianHolidaysSeeder`
- **File**: `database/seeders/AustralianHolidaysSeeder.php`

**National Holidays (recurring):**
| Holiday | Date | Recurring |
|---------|------|-----------|
| New Year's Day | Jan 1 | Yes |
| Australia Day | Jan 26 | Yes |
| Anzac Day | Apr 25 | Yes |
| Christmas Day | Dec 25 | Yes |
| Boxing Day | Dec 26 | Yes |

**Non-recurring (2026 specific dates):**
| Holiday | Date | State |
|---------|------|-------|
| Good Friday | Apr 3, 2026 | National |
| Easter Saturday | Apr 4, 2026 | National |
| Easter Monday | Apr 6, 2026 | National |
| Queen's Birthday | Jun 8, 2026 | NSW/VIC/SA/TAS/ACT |
| Queen's Birthday | Jun 22, 2026 | QLD |
| Queen's Birthday | Sep 28, 2026 | WA |
| Reconciliation Day | May 27, 2026 | ACT |
| Melbourne Cup Day | Nov 3, 2026 | VIC (metro) |

### Phase 3: Vendor Schedule Exceptions

#### 3.1 Controller Update — `BusinessSettingsController`
- **File**: `app/Http/Controllers/Vendor/BusinessSettingsController.php`

Add methods:
- `getScheduleExceptions($restaurantId)` — list vendor's exceptions + inherited global holidays
- `addScheduleException(Request $request, $restaurantId)` — create date-specific override
  - Validate: `exception_date` (future only), `is_closed`, `opening_time`/`closing_time` (if not closed)
  - Unique constraint on restaurant_id + exception_date
- `removeScheduleException($id)` — delete vendor exception
- `overrideGlobalHoliday(Request $request, $restaurantId)` — vendor overrides global holiday (stays open or modified hours)

#### 3.2 Vendor View — Schedule Exceptions
- **File**: `resources/views/vendor-views/business-settings/schedule-exceptions.blade.php`

**Layout:**
```
┌──────────────────────────────────────────────┐
│ Weekly Schedule (existing)                    │
│ Mon: 10:00 - 22:00                           │
│ Tue: 10:00 - 22:00                           │
│ ...                                          │
├──────────────────────────────────────────────┤
│ Schedule Exceptions                          │
│ ┌────────────────────────────────────────┐   │
│ │ 📅 Upcoming Holidays (Inherited)       │   │
│ │ Apr 3 - Good Friday    [Closed] [Override]│ │
│ │ Apr 6 - Easter Monday  [Closed] [Override]│ │
│ │ Apr 25 - Anzac Day     [Closed] [Override]│ │
│ ├────────────────────────────────────────┤   │
│ │ 📋 Custom Exceptions                   │   │
│ │ Mar 15 - Staff Training  [Closed] [Del]│   │
│ │ Apr 3 - Good Friday [Open 12-18] [Del] │   │
│ └────────────────────────────────────────┘   │
│ [+ Add Closed Date] [+ Add Modified Hours]   │
└──────────────────────────────────────────────┘
```

#### 3.3 Vendor Routes
```php
// routes/vendor.php
Route::get('restaurant/{id}/schedule-exceptions', [BusinessSettingsController::class, 'getScheduleExceptions']);
Route::post('restaurant/{id}/schedule-exceptions', [BusinessSettingsController::class, 'addScheduleException']);
Route::delete('schedule-exceptions/{id}', [BusinessSettingsController::class, 'removeScheduleException']);
Route::post('restaurant/{id}/override-holiday', [BusinessSettingsController::class, 'overrideGlobalHoliday']);
```

### Phase 4: API Endpoint

#### 4.1 Schedule API
- **File**: `app/Http/Controllers/Api/V1/RestaurantController.php`

```php
// GET /api/v1/restaurants/{id}/schedule?date=2026-03-25
public function schedule(Request $request, int $id): JsonResponse
{
    $date = Carbon::parse($request->query('date', now()));
    $restaurant = Restaurant::findOrFail($id);

    return response()->json([
        'date' => $date->toDateString(),
        'is_open' => $restaurant->isOpenOnDate($date),
        'hours' => $restaurant->getEffectiveScheduleForDate($date),
        'reason' => $restaurant->getClosureReason($date), // null if open
        'is_holiday' => GlobalHoliday::isHolidayOnDate($date, $restaurant->state),
    ]);
}
```

#### 4.2 API Route
```php
// routes/api.php
Route::get('v1/restaurants/{id}/schedule', [Api\V1\RestaurantController::class, 'schedule']);
```

### Phase 5: Flutter App Updates

#### 5.1 New Model — `ScheduleException`
- **File**: `lib/common/models/schedule_exception.dart`
```dart
class ScheduleException {
  final int id;
  final DateTime date;
  final bool isClosed;
  final String? openingTime;
  final String? closingTime;
  final String? reason;
}
```

#### 5.2 Update Restaurant Model
- **File**: `lib/common/models/restaurant_model.dart`
- Add: `List<ScheduleException>? scheduleExceptions;`
- Parse from API response JSON

#### 5.3 Update RestaurantService
- **File**: `lib/features/restaurant/domain/services/restaurant_service.dart`
- `isRestaurantClosed(DateTime date)`:
  1. Check `scheduleExceptions` for date match → if closed, return true
  2. Check weekly schedule
- `isRestaurantOpenNow()`:
  1. Check exceptions for today
  2. If exception with modified hours → use exception hours
  3. Fall back to weekly schedule

#### 5.4 Update Checkout Flow
- **File**: `lib/features/checkout/domain/services/checkout_service.dart`
  - `validateTimeSlot()` must check exceptions
- **File**: `lib/features/checkout/widgets/time_slot_bottom_sheet.dart`
  - `_canSelectDate()` must check closed dates
  - Show "Holiday - Closed" indicator for exception dates
  - Disable date selection for closed dates

#### 5.5 API Integration
- Fetch exceptions with restaurant data (include in restaurant detail response)
- Optional: dedicated schedule endpoint for date-specific checks

---

## Files Summary

### New Files (Laravel)
| File | Type |
|------|------|
| `database/migrations/xxxx_create_global_holidays_table.php` | Migration |
| `database/migrations/xxxx_create_restaurant_schedule_exceptions_table.php` | Migration |
| `app/Models/GlobalHoliday.php` | Model |
| `app/Models/RestaurantScheduleException.php` | Model |
| `app/Http/Controllers/Admin/HolidayController.php` | Controller |
| `database/seeders/AustralianHolidaysSeeder.php` | Seeder |
| `resources/views/admin-views/settings/holidays.blade.php` | View |
| `resources/views/vendor-views/business-settings/schedule-exceptions.blade.php` | View |

### Modified Files (Laravel)
| File | Changes |
|------|---------|
| `app/Models/Restaurant.php` | Add `scheduleExceptions()`, `isOpenOnDate()`, `getEffectiveScheduleForDate()` |
| `app/Http/Controllers/Vendor/BusinessSettingsController.php` | Add exception CRUD methods |
| `app/Http/Controllers/Api/V1/RestaurantController.php` | Add `schedule()` endpoint |
| `routes/admin.php` | Add holidays resource routes |
| `routes/vendor.php` | Add schedule-exceptions routes |
| `routes/api.php` | Add schedule API route |

### New/Modified Files (Flutter)
| File | Changes |
|------|---------|
| `lib/common/models/schedule_exception.dart` | New model |
| `lib/common/models/restaurant_model.dart` | Add `scheduleExceptions` field |
| `lib/features/restaurant/domain/services/restaurant_service.dart` | Update open/closed checks |
| `lib/features/checkout/domain/services/checkout_service.dart` | Add exception validation |
| `lib/features/checkout/widgets/time_slot_bottom_sheet.dart` | Holiday awareness UI |

---

## Testing Checklist

### Laravel
- [ ] Admin can create/edit/delete global holidays
- [ ] Australian holidays seeded correctly (national + state-specific)
- [ ] Recurring holidays resolve to correct date for current year
- [ ] Vendor sees inherited global holidays in schedule exceptions
- [ ] Vendor can add custom closed date
- [ ] Vendor can add modified hours for specific date
- [ ] Vendor can override global holiday (stay open)
- [ ] `Restaurant::isOpenOnDate()` checks exceptions first, then weekly schedule
- [ ] API returns correct effective schedule for given date
- [ ] Duplicate exception date prevented (unique constraint)
- [ ] Past date exception rejected on creation

### Flutter
- [ ] Schedule exceptions parsed from API response
- [ ] `isRestaurantClosed()` respects exceptions
- [ ] `isRestaurantOpenNow()` uses exception hours when applicable
- [ ] Time slot picker disables holiday-closed dates
- [ ] "Holiday - Closed" indicator shown for closed dates
- [ ] Checkout validation rejects orders for closed-date time slots
