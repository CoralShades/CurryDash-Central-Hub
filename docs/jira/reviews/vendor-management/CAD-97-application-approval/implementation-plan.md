# CAD-97 Implementation Plan: Application Approval/Rejection

> Target Codebase: `D:\ailocal\currydash\Admin-Seller_Portal` (Laravel)
> FR: FR48 | Status: SIT — completing remaining work

## What's Already Done

- `VendorController@update_application()` — approve/reject with audit log
- `RestaurantModerationLog` model — action_type: approved_application, rejected_application
- `VendorSelfRegistration` mail — supports approved/denied with reason
- Migration: `rejection_reason` column on restaurants
- Migration: `restaurant_moderation_logs` table + `is_suspended`, `moderated_at`
- Routes: `/admin/vendor/restaurant/update-application/{id}`
- Views: `pending_list.blade.php`, `pending_list_view.blade.php`, `denied.blade.php`

## Remaining Work

### Phase 1: "Request More Info" Backend

#### 1.1 New Migration — `vendor_info_requests` table
```
Schema::create('vendor_info_requests', function (Blueprint $table) {
    $table->id();
    $table->foreignId('restaurant_id')->constrained();
    $table->foreignId('admin_id')->nullable(); // admin who requested
    $table->json('requested_documents');       // checklist of doc types
    $table->text('note')->nullable();          // admin note to vendor
    $table->enum('status', ['pending', 'responded', 'reviewed']);
    $table->timestamp('responded_at')->nullable();
    $table->timestamps();
});
```
Also add to `restaurants` table:
```
$table->enum('info_request_status', ['none', 'pending', 'responded'])->default('none');
```

#### 1.2 New Model — `VendorInfoRequest`
- **File**: `app/Models/VendorInfoRequest.php`
- Relationships: `restaurant()`, `admin()` (user who created)
- Scopes: `pending()`, `responded()`, `byRestaurant($id)`

#### 1.3 Controller Update — `VendorController`
Add method `requestMoreInfo(Request $request, $id)`:
1. Validate: `requested_documents` (array, non-empty), `note` (string, optional)
2. Create `VendorInfoRequest` record
3. Create `RestaurantModerationLog` with `action_type: 'requested_info'`
4. Update restaurant `info_request_status` to `'pending'`
5. Dispatch `VendorInfoRequestMail` to vendor email
6. Flash success message, redirect back

**File**: `app/Http/Controllers/Admin/VendorController.php`

#### 1.4 New Mail — `VendorInfoRequestMail`
- **File**: `app/Mail/VendorInfoRequestMail.php`
- Template shows: vendor name, requested document list, admin note, link to respond
- Subject: "Additional Documents Required — CurryDash"

#### 1.5 New Route
```php
// routes/admin.php
Route::post('vendor/restaurant/request-info/{id}', [VendorController::class, 'requestMoreInfo'])
    ->name('admin.vendor.request-info');
```

### Phase 2: "Request More Info" Frontend (Admin)

#### 2.1 Update `pending_list_view.blade.php`
- Add "Request More Info" button alongside existing Approve/Reject buttons
- Button opens modal with:
  - Document checklist (checkboxes): Business Registration, Insurance Certificate, Food Safety Certificate, Tax Document, Other
  - Notes textarea
  - Send button

#### 2.2 New Blade Partial — `info-request-modal.blade.php`
- **File**: `resources/views/admin-views/vendor/partials/info-request-modal.blade.php`
- AJAX form submission to `requestMoreInfo` route

#### 2.3 Info Requests List View
- **File**: `resources/views/admin-views/vendor/info-requests.blade.php`
- Table: restaurant name, requested docs, status, date requested, date responded
- Filter: status (pending/responded)
- Action: view response, approve/reject based on response

### Phase 3: Vendor Response (Vendor Side)

#### 3.1 Vendor Controller Update
- **File**: `app/Http/Controllers/Vendor/RestaurantController.php`
- New method: `respondToInfoRequest(Request $request, $id)`
  - Upload documents for each requested type
  - Update `VendorInfoRequest.status` to 'responded'
  - Update `VendorInfoRequest.responded_at`
  - Update restaurant `info_request_status` to 'responded'

#### 3.2 Vendor Dashboard Notification
- Show alert banner: "Admin has requested additional documents"
- Link to upload form

#### 3.3 Vendor Response View
- **File**: `resources/views/vendor-views/info-request-response.blade.php`
- List of requested documents with file upload per type
- Submit button

#### 3.4 Vendor Routes
```php
// routes/vendor.php
Route::get('restaurant/info-request/{id}', [RestaurantController::class, 'showInfoRequest'])
    ->name('vendor.info-request.show');
Route::post('restaurant/info-request/{id}/respond', [RestaurantController::class, 'respondToInfoRequest'])
    ->name('vendor.info-request.respond');
```

### Phase 4: Email Templates

#### 4.1 Seed Email Templates
Insert into `email_templates` table:
- **vendor_approved**: Subject, body with `{vendorName}`, `{restaurantName}` variables
- **vendor_rejected**: Subject, body with `{vendorName}`, `{rejectionReason}` variables
- **vendor_info_request**: Subject, body with `{vendorName}`, `{requestedDocs}`, `{adminNote}` variables

#### 4.2 Update Existing Mail Classes
- `VendorSelfRegistration` mail — use `email_templates` table for dynamic content
- Ensure all templates support HTML with dynamic field replacement

### Phase 5: Privacy Policy Page (CMS)

#### 5.1 New Migration — `legal_pages` table
```
Schema::create('legal_pages', function (Blueprint $table) {
    $table->id();
    $table->string('slug')->unique();
    $table->string('title');
    $table->longText('content');
    $table->boolean('is_published')->default(false);
    $table->foreignId('updated_by')->nullable();
    $table->timestamps();
});
```

#### 5.2 New Model — `LegalPage`
- **File**: `app/Models/LegalPage.php`
- Slug-based lookup: `LegalPage::findBySlug('privacy-policy')`

#### 5.3 Admin Controller — `LegalPageController`
- **File**: `app/Http/Controllers/Admin/LegalPageController.php`
- CRUD: `index()`, `edit($slug)`, `update(Request $request, $slug)`
- Rich text editor (TinyMCE or Trix) for content

#### 5.4 Public Route
```php
// routes/web.php
Route::get('/privacy-policy', function () {
    $page = LegalPage::where('slug', 'privacy-policy')->where('is_published', true)->firstOrFail();
    return view('public.legal-page', compact('page'));
})->name('privacy-policy');
```

#### 5.5 Seeder — `LegalPagesSeeder`
- Create initial 'privacy-policy' and 'terms-of-service' entries with placeholder content

#### 5.6 Link Integration
- Add privacy policy link in vendor registration flow
- Add to site footer

---

## Files Summary

### New Files
| File | Type |
|------|------|
| `database/migrations/xxxx_create_vendor_info_requests_table.php` | Migration |
| `database/migrations/xxxx_add_info_request_status_to_restaurants.php` | Migration |
| `database/migrations/xxxx_create_legal_pages_table.php` | Migration |
| `app/Models/VendorInfoRequest.php` | Model |
| `app/Models/LegalPage.php` | Model |
| `app/Mail/VendorInfoRequestMail.php` | Mail |
| `app/Http/Controllers/Admin/LegalPageController.php` | Controller |
| `database/seeders/LegalPagesSeeder.php` | Seeder |
| `resources/views/admin-views/vendor/partials/info-request-modal.blade.php` | View |
| `resources/views/admin-views/vendor/info-requests.blade.php` | View |
| `resources/views/admin-views/settings/legal-pages.blade.php` | View |
| `resources/views/vendor-views/info-request-response.blade.php` | View |
| `resources/views/public/legal-page.blade.php` | View |

### Modified Files
| File | Changes |
|------|---------|
| `app/Http/Controllers/Admin/VendorController.php` | Add `requestMoreInfo()` method |
| `app/Http/Controllers/Vendor/RestaurantController.php` | Add info request response methods |
| `resources/views/admin-views/vendor/pending_list_view.blade.php` | Add "Request More Info" button + modal |
| `routes/admin.php` | Add request-info + legal-pages routes |
| `routes/vendor.php` | Add info-request routes |
| `routes/web.php` | Add privacy-policy public route |

---

## Testing Checklist

- [ ] Admin can request more info with document checklist
- [ ] Restaurant status changes to 'pending_info'
- [ ] Vendor receives email with requested documents list
- [ ] Vendor can upload documents and respond
- [ ] Admin sees response in info requests list
- [ ] Moderation log captures all info request actions
- [ ] Approve/reject emails use templates from email_templates table
- [ ] Privacy policy page renders from CMS content
- [ ] Admin can edit privacy policy content with rich text editor
- [ ] Privacy policy link works from vendor registration + footer
