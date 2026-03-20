# CAD-203 — Customer Name Search Not Returning Matching Orders

> **Sprint A Quick Win #4** | Confidence: 95% | Est: 1 hr
> **Type**: Bug | **Status**: In Progress | **Assignee**: Demi
> **Priority**: Medium | **Fix Version**: None
> **Jira**: https://coralshades.atlassian.net/browse/CAD-203
> **Parallelizable**: Yes — independent of all other Sprint A tickets

---

## PHASE 1 — SETUP

### 1.1 Jira Transition → In Progress
```
Use mcp__claude_ai_Atlassian__getTransitionsForJiraIssue with issueIdOrKey: "CAD-203"
Then mcp__claude_ai_Atlassian__transitionJiraIssue to "In Progress" (if not already)
```

### 1.2 Create Branch
```bash
git checkout main && git pull origin main
git checkout -b fix/CAD-203-order-customer-name-search
```

---

## PHASE 2 — INVESTIGATION

### Skills to Load
```
/find-bugs
```
Reference skills: `laravel-controllers`, `laravel-eloquent`, `sql-optimization`

### What to Investigate
Order Monitoring search doesn't return results when searching by customer name. Only Order ID search works.

```
Read: app/Http/Controllers/Admin/OrderController.php — find index/list/search method
Grep for: 'search' or 'filter' in OrderController.php
Read: app/Models/Order.php — check customer/user relationship
Grep for: 'belongsTo.*User' or 'customer' in app/Models/Order.php
Read: resources/views/admin-views/order/ — find the list/index view with search form
Grep for: 'whereHas' or 'join.*users' in OrderController.php
```

### Root Cause (likely)
- OrderController search only queries `orders.id` with the search term
- Missing: JOIN to `users` table or `whereHas('customer')` with name LIKE clause
- Order model likely has `belongsTo(User::class, 'user_id')` — need to search through this relationship

### Expected Behavior
When admin searches by customer name, system should return all orders linked to customers matching that name (first name or last name).

---

## PHASE 3 — IMPLEMENTATION

### Skills to Load
```
/bmad-quick-dev
```

### Changes Required

**1. OrderController — Add Name Search** (`app/Http/Controllers/Admin/OrderController.php`):
- Find the search/filter logic in the index method
- Add customer name search to the existing query:
  ```php
  // Existing (likely):
  $query->where('id', 'like', "%{$search}%");

  // Add:
  $query->where(function ($q) use ($search) {
      $q->where('id', 'like', "%{$search}%")
        ->orWhereHas('customer', function ($userQuery) use ($search) {
            $userQuery->where('f_name', 'like', "%{$search}%")
                      ->orWhere('l_name', 'like', "%{$search}%")
                      ->orWhereRaw("CONCAT(f_name, ' ', l_name) LIKE ?", ["%{$search}%"]);
        });
  });
  ```

**2. Verify Order→User Relationship** (`app/Models/Order.php`):
- Confirm the relationship method name: `customer()`, `user()`, or similar
- It should be: `return $this->belongsTo(User::class, 'user_id');`
- Use the correct relationship name in `whereHas()`

**3. Eager Load Customer** (if not already):
- Add `->with('customer')` to the order query for display purposes
- This prevents N+1 queries when rendering customer names in the table

### Performance Note
- Use `whereHas` (subquery) NOT `join` — cleaner, less risk of duplicate rows
- If the orders table is very large, consider adding an index on `users.f_name` and `users.l_name`
- The `CONCAT` + `LIKE` is intentional for full name search ("John Doe")

### DO NOT
- Modify the users table or User model
- Add new columns to orders table
- Touch `app/CentralLogics/helpers.php`
- Over-engineer: basic LIKE search is sufficient for this ticket

---

## PHASE 4 — QUALITY

### 4.1 Write Tests
Create `tests/Feature/Admin/OrderCustomerSearchTest.php`:
```php
// Test 1: Search by order ID returns matching order (existing behavior preserved)
// Test 2: Search by customer first name returns matching orders
// Test 3: Search by customer last name returns matching orders
// Test 4: Search by full name ("John Doe") returns matching orders
// Test 5: Search with no matches returns empty result (no errors)
```

### 4.2 Run Tests
```bash
php artisan test --filter=OrderCustomerSearch
php artisan test  # Full regression
```

### 4.3 Code Review
```
/bmad-code-review
```

---

## PHASE 5 — DELIVERY

### 5.1 Commit
```bash
git add app/Http/Controllers/Admin/OrderController.php
git add tests/Feature/Admin/OrderCustomerSearchTest.php

git commit -m "fix(api): add customer name search to order monitoring [CAD-203]

Order search now matches by customer name (first, last, or full name)
in addition to order ID. Uses whereHas with LIKE for clean subquery.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 5.2 Push & Create Draft PR
```bash
git push -u origin fix/CAD-203-order-customer-name-search

gh pr create --draft \
  --title "[CAD-203] fix: add customer name search to order monitoring" \
  --body "$(cat <<'EOF'
## Summary
- Order Monitoring search now supports customer name (first, last, full name)
- Uses `whereHas('customer')` with LIKE clause — clean subquery approach
- Preserves existing Order ID search behavior
- Added eager loading for customer relationship

## Jira
https://coralshades.atlassian.net/browse/CAD-203

## Test Plan
- [ ] Search by order ID still works
- [ ] Search by customer first name returns correct orders
- [ ] Search by customer last name returns correct orders
- [ ] Search by full name "John Doe" returns correct orders
- [ ] Empty search returns all orders
- [ ] No matches returns empty (no error)

## Screenshots
<!-- Add browser test screenshots here -->

🤖 Generated with Claude Code
EOF
)"
```

### 5.3 Browser Test
```
Use chrome-devtools or playwright MCP to:
1. Login as admin
2. Navigate to Order Monitoring
3. Search by a known customer name → verify orders appear
4. Search by order ID → verify still works
5. Take screenshots
```

---

## PHASE 6 — JIRA UPDATES (MCP)

### 6.1 Transition to Code Review
```
Use mcp__claude_ai_Atlassian__getTransitionsForJiraIssue with issueIdOrKey: "CAD-203"
Use mcp__claude_ai_Atlassian__transitionJiraIssue to "Code Review"
```

### 6.2 Add Comment
```
Use mcp__claude_ai_Atlassian__addCommentToJiraIssue with:
  issueIdOrKey: "CAD-203"
  body: "Implementation complete.\n\nOrder Monitoring search now supports customer name matching (first, last, full name) via whereHas subquery.\n\nPR: [Draft PR link]\nBranch: fix/CAD-203-order-customer-name-search\n\nAwaiting review."
```

### 6.3 WAIT — Do NOT transition further until Demi approves the Draft PR
