# CAR-179 — Date Range Filter Not Available on Order History

> **Sprint A Quick Win #5** | Confidence: 95% | Est: 1-2 hrs
> **Type**: Bug | **Status**: In Progress | **Assignee**: Demi
> **Priority**: Medium | **Fix Version**: v1.0-Beta (2026-03-28)
> **Labels**: backend, prd-epic-3
> **Jira**: https://coralshades.atlassian.net/browse/CAR-179
> **Parallelizable**: Yes — independent of all other Sprint A tickets

---

## PHASE 1 — SETUP

### 1.1 Jira Transition → In Progress
```
Use mcp__claude_ai_Atlassian__getTransitionsForJiraIssue with issueIdOrKey: "CAR-179"
Then mcp__claude_ai_Atlassian__transitionJiraIssue to "In Progress" (if not already)
```

### 1.2 Create Branch
```bash
git checkout main && git pull origin main
git checkout -b fix/CAR-179-order-date-range-filter
```

---

## PHASE 2 — INVESTIGATION

### Skills to Load
```
/find-bugs
```
Reference skills: `laravel-controllers`, `laravel-blade`, `laravel-eloquent`

### What to Investigate
```
Read: app/Traits/ReportFilter.php — check existing date filter logic
Grep for: 'ReportFilter' in app/Http/Controllers/Vendor/ — which controllers use it
Read: app/Http/Controllers/Vendor/OrderController.php — find order history/list method
Read: resources/views/vendor-views/order/list.blade.php (or similar) — check if date picker UI exists
Grep for: 'from_date\|to_date\|date_range\|daterangepicker' in resources/views/vendor-views/
Grep for: 'from\|to\|date' in the vendor OrderController
```

### Root Cause (likely)
- `ReportFilter` trait already has date scoping logic
- The Vendor OrderController either:
  - Doesn't use the `ReportFilter` trait, OR
  - Uses it but doesn't pass `from`/`to` request parameters, OR
  - The Blade view is missing the date picker input fields

### Expected Behavior
Vendor staff can select From date and To date. Only orders within range are displayed. Orders outside range are excluded.

---

## PHASE 3 — IMPLEMENTATION

### Skills to Load
```
/bmad-quick-dev
```

### Changes Required

**1. Check ReportFilter Trait** (`app/Traits/ReportFilter.php`):
- Verify it has date range filtering (likely `scopeDateFilter` or similar)
- If it accepts `from` and `to` query params, just wire them up
- If trait doesn't exist or is different, implement inline date filtering

**2. Vendor OrderController** (`app/Http/Controllers/Vendor/OrderController.php`):
- Ensure the controller uses `ReportFilter` trait (add `use ReportFilter;` if missing)
- In the order list method, apply date filter:
  ```php
  $orders = Order::where('restaurant_id', auth('vendor')->user()->restaurant_id)
      ->when($request->from && $request->to, function ($query) use ($request) {
          $query->whereBetween('created_at', [
              $request->from . ' 00:00:00',
              $request->to . ' 23:59:59'
          ]);
      })
      ->latest()
      ->paginate(25);
  ```
- Pass `from` and `to` back to the view for form persistence

**3. Blade View — Add Date Picker** (`resources/views/vendor-views/order/list.blade.php`):
- Add From/To date inputs near the existing search/filter area:
  ```blade
  <div class="row mb-3">
      <div class="col-md-4">
          <label>From Date</label>
          <input type="date" name="from" class="form-control"
                 value="{{ request('from') }}">
      </div>
      <div class="col-md-4">
          <label>To Date</label>
          <input type="date" name="to" class="form-control"
                 value="{{ request('to') }}">
      </div>
      <div class="col-md-4 d-flex align-items-end">
          <button type="submit" class="btn btn-primary">Filter</button>
          <a href="{{ route('vendor.order.list') }}" class="btn btn-secondary ml-2">Reset</a>
      </div>
  </div>
  ```
- Ensure the filter inputs are inside the existing form (GET method)
- Check if there's a daterangepicker JS library loaded — use it if available

### DO NOT
- Install new JS libraries (use native HTML date inputs or existing daterangepicker)
- Modify the ReportFilter trait itself
- Touch other controllers
- Touch `app/CentralLogics/helpers.php`

---

## PHASE 4 — QUALITY

### 4.1 Write Tests
Create `tests/Feature/Vendor/OrderDateFilterTest.php`:
```php
// Test 1: Order list loads without date filter (all orders shown)
// Test 2: Order list with valid from/to date range returns filtered orders
// Test 3: Orders outside date range are excluded
// Test 4: Invalid date range (from > to) handled gracefully
```

### 4.2 Run Tests
```bash
php artisan test --filter=OrderDateFilter
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
git add app/Http/Controllers/Vendor/OrderController.php
git add resources/views/vendor-views/order/
git add tests/Feature/Vendor/OrderDateFilterTest.php

git commit -m "fix(blade): add date range filter to vendor order history [CAR-179]

Added From/To date picker inputs to order history page.
Orders filtered using whereBetween on created_at column.
Existing search functionality preserved.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 5.2 Push & Create Draft PR
```bash
git push -u origin fix/CAR-179-order-date-range-filter

gh pr create --draft \
  --title "[CAR-179] fix: add date range filter to vendor order history" \
  --body "$(cat <<'EOF'
## Summary
- Added From/To date picker inputs to vendor order history page
- Orders filtered via `whereBetween('created_at', ...)` when dates provided
- Filter values persist in form after submission
- Reset button clears filters

## Jira
https://coralshades.atlassian.net/browse/CAR-179

## Test Plan
- [ ] Order list loads normally without date filter
- [ ] Selecting date range filters orders correctly
- [ ] Orders outside range are excluded
- [ ] Reset button clears filter and shows all orders
- [ ] Filter values persist after submission

## Screenshots
<!-- Date picker UI + filtered results -->

🤖 Generated with Claude Code
EOF
)"
```

### 5.3 Browser Test
```
1. Login as vendor staff
2. Navigate to Regular Orders
3. Verify From/To date picker inputs are visible
4. Select a date range → verify filtered results
5. Click Reset → verify all orders shown
6. Take screenshots
```

---

## PHASE 6 — JIRA UPDATES (MCP)

### 6.1 Transition to Code Review
```
mcp__claude_ai_Atlassian__transitionJiraIssue: "CAR-179" → "Code Review"
```

### 6.2 Add Comment
```
mcp__claude_ai_Atlassian__addCommentToJiraIssue:
  issueIdOrKey: "CAR-179"
  body: "Implementation complete. Date range filter added to vendor order history.\n\nPR: [link]\nBranch: fix/CAR-179-order-date-range-filter\n\nAwaiting review."
```

### 6.3 WAIT — Do NOT transition further until Demi approves the Draft PR
