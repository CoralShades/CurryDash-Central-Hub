# CAD-207 — User Role Not Displayed in Employee List

> **Sprint A Quick Win #3** | Confidence: 95% | Est: 1-2 hrs
> **Type**: Bug | **Status**: In Progress | **Assignee**: Demi
> **Priority**: Medium | **Fix Version**: None
> **Jira**: https://coralshades.atlassian.net/browse/CAD-207
> **Parallelizable**: Yes — independent of all other Sprint A tickets

---

## PHASE 1 — SETUP

### 1.1 Jira Transition → In Progress
```
Use mcp__claude_ai_Atlassian__getTransitionsForJiraIssue with issueIdOrKey: "CAD-207"
Then mcp__claude_ai_Atlassian__transitionJiraIssue to "In Progress" (if not already)
```

### 1.2 Create Branch
```bash
git checkout main && git pull origin main
git checkout -b fix/CAD-207-employee-role-display
```

---

## PHASE 2 — INVESTIGATION

### Skills to Load
```
/find-bugs
```
Reference skills: `laravel-controllers`, `laravel-eloquent`, `laravel-blade`

### What to Investigate
The Employee List table in Admin Portal shows: SL | Employee Name | Phone | Email | Created At | Action — but NO role column. Need to add role display.

```
Read: app/Http/Controllers/Admin/EmployeeController.php — find index/list method
Read: resources/views/admin-views/employee/list.blade.php — current table columns
Read: app/Models/Admin.php (or Employee model) — check role relationship
Read: app/Models/AdminRole.php (or EmployeeRole model) — check role model
Grep for: 'role' in app/Http/Controllers/Admin/EmployeeController.php
Grep for: 'belongsTo.*[Rr]ole' in app/Models/
Grep for: 'admin_role' or 'employee_role' in database/migrations/
```

### Root Cause (likely)
- EmployeeController `index()` method doesn't eager-load the role relationship
- Blade template doesn't include a role column in the table

### Acceptance Criteria (from Jira)
- **AC1**: Role column is visible in Employee List table
- **AC2**: Each user shows their role tag (Super Admin, Admin, Accountant, Support User)
- **AC3**: Admin can clearly distinguish users by role
- **AC4**: Existing users display their currently assigned roles correctly (no data migration needed)

---

## PHASE 3 — IMPLEMENTATION

### Skills to Load
```
/bmad-quick-dev
```

### Changes Required

**1. Controller — Eager Load Role** (`app/Http/Controllers/Admin/EmployeeController.php`):
- In the `index()` or `list()` method, add `->with('role')` to the query
- Example: `Admin::with('role')->paginate(25)` or `->with('adminRole')`
- Check the actual relationship name on the model

**2. Blade Template — Add Role Column** (`resources/views/admin-views/employee/list.blade.php`):
- Add `<th>Role</th>` in the table header after "Email" or before "Created At"
- Add role cell in the table body:
  ```blade
  <td>
      @if($employee->role)
          <span class="badge badge-soft-info">{{ $employee->role->name }}</span>
      @else
          <span class="badge badge-soft-secondary">No Role</span>
      @endif
  </td>
  ```
- Use appropriate badge styling consistent with existing admin views

**3. Verify Model Relationship** (`app/Models/Admin.php` or equivalent):
- Confirm `belongsTo(AdminRole::class)` or similar exists
- If missing, add the relationship method

### DO NOT
- Modify the admin_roles table structure
- Add filtering by role (separate ticket scope)
- Touch `app/CentralLogics/helpers.php`

---

## PHASE 4 — QUALITY

### 4.1 Write Tests
Create `tests/Feature/Admin/EmployeeListRoleTest.php`:
```php
// Test 1: Employee list page loads successfully (200 status)
// Test 2: Employee list includes role column in response HTML
// Test 3: Employee with assigned role shows role name
// Test 4: Employee without role shows "No Role" badge
```

### 4.2 Run Tests
```bash
php artisan test --filter=EmployeeListRole
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
git add app/Http/Controllers/Admin/EmployeeController.php
git add resources/views/admin-views/employee/list.blade.php
git add tests/Feature/Admin/EmployeeListRoleTest.php
# Add model if modified

git commit -m "fix(blade): display user role in admin employee list [CAD-207]

Added role column to employee list table with eager loading.
Shows role badge (Super Admin, Admin, Accountant, etc.) for each user.
Handles null role with 'No Role' fallback badge.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 5.2 Push & Create Draft PR
```bash
git push -u origin fix/CAD-207-employee-role-display

gh pr create --draft \
  --title "[CAD-207] fix: display user role column in admin employee list" \
  --body "$(cat <<'EOF'
## Summary
- Added `->with('role')` eager loading in EmployeeController index
- Added Role column to employee list table (between Email and Created At)
- Role displayed as badge: Super Admin, Admin, Accountant, Support User
- Null state: "No Role" badge for users without assigned role

## Jira
https://coralshades.atlassian.net/browse/CAD-207

## Test Plan
- [ ] Employee list page loads with Role column visible
- [ ] Users with roles show correct role tag
- [ ] Users without roles show "No Role" fallback
- [ ] No N+1 query issues (role is eager-loaded)
- [ ] Existing data displays correctly

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
2. Navigate to User Management > Employee List
3. Verify Role column is visible with correct role tags
4. Take screenshots
```

---

## PHASE 6 — JIRA UPDATES (MCP)

### 6.1 Transition to Code Review
```
Use mcp__claude_ai_Atlassian__getTransitionsForJiraIssue with issueIdOrKey: "CAD-207"
Use mcp__claude_ai_Atlassian__transitionJiraIssue to "Code Review"
```

### 6.2 Add Comment
```
Use mcp__claude_ai_Atlassian__addCommentToJiraIssue with:
  issueIdOrKey: "CAD-207"
  body: "Implementation complete.\n\nChanges:\n- EmployeeController: added ->with('role') eager loading\n- employee/list.blade.php: added Role column with badge styling\n- Feature tests added\n\nPR: [Draft PR link]\nBranch: fix/CAD-207-employee-role-display\n\nAwaiting review."
```

### 6.3 WAIT — Do NOT transition further until Demi approves the Draft PR
