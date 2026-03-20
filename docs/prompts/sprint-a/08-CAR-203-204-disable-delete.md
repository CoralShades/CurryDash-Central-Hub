# CAR-203 + CAR-204 — Disable Delete for Food Items & Packages (Vendor Portal)

> **Sprint A Quick Win #8** | Confidence: 95% | Est: 2 hrs (combined)
> **Type**: Frontend Task | **Status**: To Do | **Assignee**: Unassigned
> **Priority**: Medium | **Fix Version**: None
> **Jira**: https://coralshades.atlassian.net/browse/CAR-203 + https://coralshades.atlassian.net/browse/CAR-204
> **Note**: These two tickets share the same pattern — implement together

---

## PHASE 1 — SETUP

### 1.1 Jira Transition → In Progress (both tickets)
```
mcp__claude_ai_Atlassian__transitionJiraIssue: "CAR-203" → "In Progress"
mcp__claude_ai_Atlassian__transitionJiraIssue: "CAR-204" → "In Progress"
```

### 1.2 Create Branch
```bash
git checkout main && git pull origin main
git checkout -b feature/CAR-203-204-disable-delete-vendor
```

---

## PHASE 2 — INVESTIGATION

### Skills to Load
```
/find-bugs
```
Reference skills: `laravel-blade`, `laravel-controllers`

### What to Investigate

**For Food Items (CAR-203):**
```
Read: resources/views/vendor-views/food/index.blade.php (or list.blade.php)
Grep for: 'delete\|destroy\|remove' in resources/views/vendor-views/food/
Grep for: 'delete\|destroy' in app/Http/Controllers/Vendor/FoodController.php
Grep for: 'is_active\|status' in app/Models/Food.php
Read: app/Http/Controllers/Vendor/FoodController.php — find list/index method
```

**For Packages (CAR-204):**
```
Read: resources/views/vendor-views/package/index.blade.php (or list.blade.php)
Grep for: 'delete\|destroy\|remove' in resources/views/vendor-views/package/
Grep for: 'delete\|destroy' in app/Http/Controllers/Vendor/PackageController.php
Grep for: 'is_active\|status' in app/Models/Package.php
```

### Key Context
- Delete action changes are for **Vendor portal ONLY** — Admin portal retains delete ability
- Replace delete with toggle (Enable/Disable) using `is_active` field
- Implement tabbed navigation: Active Items (default) | Inactive Items
- Package status has 3 states: Active (1), Inactive (0), Draft (2) — Draft stays in Active tab

---

## PHASE 3 — IMPLEMENTATION

### Skills to Load
```
/bmad-quick-dev
```
Reference skills: `laravel-blade`, `laravel-controllers`, `frontend-ui-ux-engineer`

### Part A: Food Items (CAR-203)

**1. Food List View** (`resources/views/vendor-views/food/index.blade.php`):

Add tabbed navigation at the top of the list:
```blade
<ul class="nav nav-tabs mb-3">
    <li class="nav-item">
        <a class="nav-link {{ request('tab', 'active') == 'active' ? 'active' : '' }}"
           href="{{ route('vendor.food.list', ['tab' => 'active']) }}">
            Active Items
        </a>
    </li>
    <li class="nav-item">
        <a class="nav-link {{ request('tab') == 'inactive' ? 'active' : '' }}"
           href="{{ route('vendor.food.list', ['tab' => 'inactive']) }}">
            Inactive Items
        </a>
    </li>
</ul>
```

Remove the Delete button from the action column. Replace with toggle:
```blade
<td>
    <label class="toggle-switch">
        <input type="checkbox"
               class="toggle-switch-input"
               onchange="toggleFoodStatus({{ $food->id }})"
               {{ $food->is_active ? 'checked' : '' }}>
        <span class="toggle-switch-label">
            <span class="toggle-switch-indicator"></span>
        </span>
    </label>
    {{-- Keep Edit button, remove Delete button --}}
    <a href="{{ route('vendor.food.edit', $food->id) }}" class="btn btn-sm btn-primary">
        <i class="tio-edit"></i>
    </a>
</td>
```

Add empty state for both tabs:
```blade
@if($foods->isEmpty())
    <tr>
        <td colspan="8" class="text-center py-5">
            <img src="{{ asset('public/assets/admin/img/empty-box.png') }}" width="100" alt="">
            <p class="mt-3 text-muted">
                {{ request('tab') == 'inactive' ? 'No inactive food items' : 'No active food items' }}
            </p>
        </td>
    </tr>
@endif
```

Both tabs must include columns: Item number, Name, Category, Price, Recommended, Status, Action
Both tabs must include filters: Search field, Categories picklist, Dietary Type picklist

**2. Food Controller** (`app/Http/Controllers/Vendor/FoodController.php`):

Update the list/index method to filter by tab:
```php
public function index(Request $request)
{
    $tab = $request->get('tab', 'active');
    $isActive = $tab === 'active' ? 1 : 0;

    $foods = Food::where('restaurant_id', auth('vendor')->user()->restaurant_id)
        ->where('is_active', $isActive)
        ->when($request->search, function ($q) use ($request) {
            $q->where('name', 'like', "%{$request->search}%");
        })
        ->when($request->category_id, function ($q) use ($request) {
            $q->where('category_id', $request->category_id);
        })
        ->latest()
        ->paginate(25)
        ->appends($request->all());

    return view('vendor-views.food.index', compact('foods', 'tab'));
}
```

Add toggle status AJAX endpoint:
```php
public function toggleStatus(Request $request)
{
    $food = Food::where('restaurant_id', auth('vendor')->user()->restaurant_id)
        ->findOrFail($request->id);
    $food->is_active = !$food->is_active;
    $food->save();

    return response()->json([
        'success' => true,
        'message' => $food->is_active ? 'Food item activated' : 'Food item deactivated'
    ]);
}
```

Add route in `routes/vendor.php`:
```php
Route::post('food/toggle-status', 'FoodController@toggleStatus')->name('vendor.food.toggle-status');
```

**3. Add JS Toggle Function** (in the Blade view or shared JS):
```javascript
function toggleFoodStatus(foodId) {
    $.ajax({
        url: '{{ route("vendor.food.toggle-status") }}',
        method: 'POST',
        data: { id: foodId, _token: '{{ csrf_token() }}' },
        success: function(response) {
            toastr.success(response.message);
            setTimeout(() => location.reload(), 1000);
        },
        error: function() {
            toastr.error('Failed to update status');
        }
    });
}
```

### Part B: Packages (CAR-204) — Same Pattern

**Apply the exact same pattern to packages:**

1. **Package List View** (`resources/views/vendor-views/package/index.blade.php`):
   - Add Active/Inactive tab navigation (same as food)
   - Remove Delete button from actions
   - Add toggle switch for enable/disable
   - Add empty state illustrations
   - Active tab filters: Search field, Status picklist (Active, Draft), Reset button
   - Inactive tab filters: Search field, Reset button
   - Columns: Item number, Image, Name, Base price, Status, Actions

2. **Package Controller** (`app/Http/Controllers/Vendor/PackageController.php`):
   - Filter by tab (active vs inactive)
   - **IMPORTANT**: Packages with status 'Draft' (status=2) should remain in the Active tab
     ```php
     if ($tab === 'active') {
         $query->where(function($q) {
             $q->where('status', 1)->orWhere('status', 2); // Active + Draft
         });
     } else {
         $query->where('status', 0); // Inactive only
     }
     ```
   - Add toggleStatus endpoint (same pattern as food)

3. **Route** in `routes/vendor.php`:
   ```php
   Route::post('package/toggle-status', 'PackageController@toggleStatus')->name('vendor.package.toggle-status');
   ```

### DO NOT
- Remove delete functionality from Admin portal (admin retains delete)
- Delete the vendor-side delete controller methods (keep but guard or leave)
- Modify database schema
- Change package status values (1=Active, 0=Inactive, 2=Draft stays same)
- Touch `app/CentralLogics/helpers.php`

---

## PHASE 4 — QUALITY

### 4.1 Write Tests
Create `tests/Feature/Vendor/FoodToggleStatusTest.php`:
```php
// Test 1: Toggle food from active to inactive (returns success)
// Test 2: Toggle food from inactive to active (returns success)
// Test 3: Food list with 'active' tab only shows active items
// Test 4: Food list with 'inactive' tab only shows inactive items
// Test 5: Cannot toggle food from another vendor's restaurant (403)
```

Create `tests/Feature/Vendor/PackageToggleStatusTest.php`:
```php
// Test 1: Toggle package from active to inactive (returns success)
// Test 2: Active tab shows both Active and Draft packages
// Test 3: Inactive tab shows only inactive packages
// Test 4: Cannot toggle package from another vendor's restaurant (403)
```

### 4.2 Run Tests
```bash
php artisan test --filter=FoodToggleStatus
php artisan test --filter=PackageToggleStatus
php artisan test
```

### 4.3 Code Review
```
/bmad-code-review
```

---

## PHASE 5 — DELIVERY

### 5.1 Commit
```bash
git add app/Http/Controllers/Vendor/FoodController.php
git add app/Http/Controllers/Vendor/PackageController.php
git add resources/views/vendor-views/food/
git add resources/views/vendor-views/package/
git add routes/vendor.php
git add tests/Feature/Vendor/FoodToggleStatusTest.php
git add tests/Feature/Vendor/PackageToggleStatusTest.php

git commit -m "feat(blade): replace delete with toggle for food items and packages [CAR-203] [CAR-204]

Vendor portal: removed delete action for food items (CAR-203) and
packages (CAR-204). Added Active/Inactive tabbed navigation with
enable/disable toggle. Draft packages remain in Active tab.
Admin portal delete functionality unchanged.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 5.2 Push & Create Draft PR
```bash
git push -u origin feature/CAR-203-204-disable-delete-vendor

gh pr create --draft \
  --title "[CAR-203][CAR-204] feat: replace delete with enable/disable toggle in vendor portal" \
  --body "$(cat <<'EOF'
## Summary
- **CAR-203**: Food items — removed delete, added Active/Inactive tabs + toggle
- **CAR-204**: Packages — removed delete, added Active/Inactive tabs + toggle
- Both use tabbed navigation with proper empty states
- Draft packages stay in Active tab
- Admin portal delete functionality is unchanged

## Jira
- https://coralshades.atlassian.net/browse/CAR-203
- https://coralshades.atlassian.net/browse/CAR-204

## Test Plan
### Food Items (CAR-203)
- [ ] Delete button removed from vendor food list
- [ ] Active tab shows active food items (default)
- [ ] Inactive tab shows inactive food items
- [ ] Toggle switch activates/deactivates food item
- [ ] Both tabs have Search, Categories, Dietary Type filters

### Packages (CAR-204)
- [ ] Delete button removed from vendor package list
- [ ] Active tab shows Active + Draft packages
- [ ] Inactive tab shows only inactive packages
- [ ] Toggle switch activates/deactivates package
- [ ] Active tab: Search, Status (Active/Draft), Reset filters
- [ ] Inactive tab: Search, Reset filters

## Screenshots
<!-- Food items tabs + toggle, Package tabs + toggle -->

🤖 Generated with Claude Code
EOF
)"
```

### 5.3 Browser Test
```
1. Login as vendor
2. Navigate to Food Items → verify no delete button, tabs visible
3. Toggle a food item inactive → verify it moves to Inactive tab
4. Navigate to Packages → verify no delete button, tabs visible
5. Toggle a package inactive → verify it moves to Inactive tab
6. Verify Draft packages stay in Active tab
7. Login as admin → verify delete buttons STILL exist
8. Take screenshots of all states
```

---

## PHASE 6 — JIRA UPDATES (MCP)

### 6.1 Transition Both to Code Review
```
mcp__claude_ai_Atlassian__transitionJiraIssue: "CAR-203" → "Code Review"
mcp__claude_ai_Atlassian__transitionJiraIssue: "CAR-204" → "Code Review"
```

### 6.2 Add Comments (both tickets)
```
mcp__claude_ai_Atlassian__addCommentToJiraIssue:
  issueIdOrKey: "CAR-203"
  body: "Implemented. Delete removed, replaced with Active/Inactive tabs + toggle.\n\nPR: [link] (combined with CAR-204)\nBranch: feature/CAR-203-204-disable-delete-vendor\n\nAwaiting review."

mcp__claude_ai_Atlassian__addCommentToJiraIssue:
  issueIdOrKey: "CAR-204"
  body: "Implemented. Delete removed, replaced with Active/Inactive tabs + toggle.\nDraft packages remain in Active tab.\n\nPR: [link] (combined with CAR-203)\nBranch: feature/CAR-203-204-disable-delete-vendor\n\nAwaiting review."
```

### 6.3 WAIT — Do NOT transition further until Demi approves the Draft PR
