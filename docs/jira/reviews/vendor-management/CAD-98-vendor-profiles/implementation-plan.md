# CAD-98 Implementation Plan: Vendor Profile Management

> Target Codebase: `D:\ailocal\currydash\Admin-Seller_Portal` (Laravel)
> FR: FR49 | Status: In Progress — audit log + multi-location remaining

## What's Already Done

- `Vendor` model with `restaurants()` hasMany relationship
- `Restaurant` model with complete profile fields
- `RestaurantConfig` model for per-restaurant settings
- Admin edit: `VendorController@edit()` + `update()`
- Vendor edit: `Vendor/RestaurantController@edit()` + `update()`
- ABN/TIN change detection (sets `abn_change_status` to 'pending')
- Views: `admin-views/vendor/edit.blade.php`, `view/index.blade.php`

## Remaining Work

### Phase 1: Audit Log Backend

#### 1.1 New Migration — `vendor_audit_logs` table
```
Schema::create('vendor_audit_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('vendor_id')->constrained();
    $table->foreignId('restaurant_id')->nullable()->constrained();
    $table->unsignedBigInteger('user_id')->nullable(); // admin or vendor who made change
    $table->string('field_name');
    $table->text('old_value')->nullable();
    $table->text('new_value')->nullable();
    $table->string('action_type'); // 'update', 'create', 'delete'
    $table->ipAddress('ip_address')->nullable();
    $table->timestamps();

    $table->index(['vendor_id', 'created_at']);
    $table->index(['restaurant_id', 'created_at']);
});
```

#### 1.2 New Model — `VendorAuditLog`
- **File**: `app/Models/VendorAuditLog.php`
- Relationships: `vendor()`, `restaurant()`, `user()`
- Scopes: `byVendor($id)`, `byRestaurant($id)`, `byField($name)`, `byDateRange($from, $to)`, `byUser($id)`

#### 1.3 New Trait — `HasAuditLog`
- **File**: `app/Traits/HasAuditLog.php`
- Uses Eloquent `updating` event to capture changes
- For each dirty field: records `old_value` → `new_value`
- Captures: `user_id` (from auth), `ip_address` (from request), `action_type`
- Sensitive fields excluded from logging (passwords, tokens)

```php
trait HasAuditLog
{
    public static function bootHasAuditLog()
    {
        static::updating(function ($model) {
            foreach ($model->getDirty() as $field => $newValue) {
                if (in_array($field, $model->auditExcluded ?? [])) continue;
                VendorAuditLog::create([
                    'vendor_id' => $model->getAuditVendorId(),
                    'restaurant_id' => $model->getAuditRestaurantId(),
                    'user_id' => auth()->id(),
                    'field_name' => $field,
                    'old_value' => $model->getOriginal($field),
                    'new_value' => $newValue,
                    'action_type' => 'update',
                    'ip_address' => request()->ip(),
                ]);
            }
        });
    }

    abstract protected function getAuditVendorId(): ?int;
    abstract protected function getAuditRestaurantId(): ?int;
}
```

#### 1.4 Apply Trait
- `app/Models/Vendor.php` — `use HasAuditLog;`
  - `getAuditVendorId()` returns `$this->id`
  - `getAuditRestaurantId()` returns `null`
- `app/Models/Restaurant.php` — `use HasAuditLog;`
  - `getAuditVendorId()` returns `$this->vendor_id`
  - `getAuditRestaurantId()` returns `$this->id`

### Phase 2: Audit Log Controller & UI

#### 2.1 New Controller — `VendorAuditLogController`
- **File**: `app/Http/Controllers/Admin/VendorAuditLogController.php`
- `index($vendorId)` — paginated audit log with filters
  - Query params: `field`, `user_id`, `date_from`, `date_to`, `restaurant_id`
  - Pagination: 25 per page
- `export($vendorId)` — CSV download

#### 2.2 Audit Log View
- **File**: `resources/views/admin-views/vendor/audit-log.blade.php`
- Accessible from vendor detail page → "Audit Log" tab/button
- Table columns: Timestamp, User, Restaurant (if applicable), Field Changed, Old Value, New Value, Action
- Filters row: Date range picker, Field dropdown, User dropdown
- Pagination
- "Export CSV" button

#### 2.3 Route
```php
// routes/admin.php
Route::get('vendor/{vendor}/audit-log', [VendorAuditLogController::class, 'index'])
    ->name('admin.vendor.audit-log');
Route::get('vendor/{vendor}/audit-log/export', [VendorAuditLogController::class, 'export'])
    ->name('admin.vendor.audit-log.export');
```

### Phase 3: Multi-Location Management

#### 3.1 Controller Methods
Add to `VendorController`:
- `restaurants($vendorId)` — list all restaurants for vendor
- `addRestaurant(Request $request, $vendorId)` — create new restaurant under vendor
- `transferRestaurant(Request $request, $restaurantId)` — transfer to different vendor
  - Validates: no active orders on restaurant
  - Updates `vendor_id` on restaurant
  - Creates audit log entry

#### 3.2 Multi-Location UI
- Update `resources/views/admin-views/vendor/view/index.blade.php`
- Add "Restaurants" section showing:
  - Table: restaurant name, address, status, orders (count), actions
  - "Add Restaurant" button → create form
  - Per row: "Edit", "Transfer to Vendor" button
  - Per row: Status indicator (active/inactive/suspended)

#### 3.3 Routes
```php
// routes/admin.php
Route::get('vendor/{vendor}/restaurants', [VendorController::class, 'restaurants'])
    ->name('admin.vendor.restaurants');
Route::post('vendor/{vendor}/restaurants', [VendorController::class, 'addRestaurant'])
    ->name('admin.vendor.restaurants.add');
Route::post('restaurant/{restaurant}/transfer', [VendorController::class, 'transferRestaurant'])
    ->name('admin.vendor.restaurants.transfer');
```

### Phase 4: ABN Change Approval (Bonus)

#### 4.1 ABN Approval Queue
- New view listing restaurants with `abn_change_status = 'pending'`
- Admin can approve/reject ABN changes
- On approve: update ABN, set status to 'approved', create audit log
- On reject: set status to 'rejected', notify vendor

---

## Files Summary

### New Files
| File | Type |
|------|------|
| `database/migrations/xxxx_create_vendor_audit_logs_table.php` | Migration |
| `app/Models/VendorAuditLog.php` | Model |
| `app/Traits/HasAuditLog.php` | Trait |
| `app/Http/Controllers/Admin/VendorAuditLogController.php` | Controller |
| `resources/views/admin-views/vendor/audit-log.blade.php` | View |

### Modified Files
| File | Changes |
|------|---------|
| `app/Models/Vendor.php` | Apply `HasAuditLog` trait |
| `app/Models/Restaurant.php` | Apply `HasAuditLog` trait |
| `app/Http/Controllers/Admin/VendorController.php` | Add multi-location methods |
| `resources/views/admin-views/vendor/view/index.blade.php` | Add restaurants section + audit log link |
| `routes/admin.php` | Add audit-log + restaurant management routes |

---

## Testing Checklist

- [ ] Editing a vendor field creates audit log entry with old/new values
- [ ] Editing a restaurant field creates audit log entry linked to vendor
- [ ] Audit log page shows entries with correct filters
- [ ] Date range filter works
- [ ] Field filter dropdown populated from actual changed fields
- [ ] CSV export downloads correctly
- [ ] Multi-location: add new restaurant to vendor
- [ ] Multi-location: transfer restaurant blocks if active orders exist
- [ ] Multi-location: transfer updates vendor_id and creates audit entry
- [ ] ABN change detection creates audit log entry
- [ ] Sensitive fields (password, token) excluded from audit log
