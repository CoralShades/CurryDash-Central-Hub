# CAR-201 — ABN Field Not Mandatory in Vendor Registration

> **Sprint A Quick Win #1** | Confidence: 98% | Est: 30 min
> **Type**: Bug | **Status**: In Progress | **Assignee**: Demi
> **Priority**: Medium | **Fix Version**: v1.0-Beta (2026-03-28)
> **Jira**: https://coralshades.atlassian.net/browse/CAR-201

---

## PHASE 1 — SETUP

### 1.1 Jira Transition → In Progress
```
Use mcp__claude_ai_Atlassian__getTransitionsForJiraIssue with issueIdOrKey: "CAR-201"
Then use mcp__claude_ai_Atlassian__transitionJiraIssue to transition to "In Progress" (if not already)
```

### 1.2 Create Branch
```bash
git checkout main && git pull origin main
git checkout -b fix/CAR-201-abn-field-mandatory
```

---

## PHASE 2 — INVESTIGATION

### Skills to Load
```
/find-bugs
```

### What to Investigate
The ABN field is currently optional in vendor registration. Users can register without entering an ABN. It must be mandatory.

**Search for all ABN validation points:**
```
Grep for: 'abn' in app/Http/Controllers/Vendor/RestaurantController.php
Grep for: 'abn' in app/Http/Controllers/Admin/VendorController.php
Grep for: 'abn' in app/Http/Requests/ (if FormRequest classes exist)
Grep for: 'abn' in routes/vendor.php and routes/admin.php
Check migration: database/migrations/*add_abn_to_restaurants_table*
Check model: app/Models/Restaurant.php — verify 'abn' in $fillable
```

### Known Context
- ABN column exists: `2026_01_09_114420_add_abn_to_restaurants_table.php`
- Restaurant model has ABN field
- Current validation likely uses `nullable` — change to `required`
- ABN is Australian Business Number (11 digits)

---

## PHASE 3 — IMPLEMENTATION

### Skills to Load
```
/bmad-quick-dev
```
Reference skills: `laravel-controllers`, `laravel-validation-patterns`, `laravel-eloquent`

### Changes Required

**1. Vendor Registration Controller** (`app/Http/Controllers/Vendor/RestaurantController.php`):
- Find the `store()` or `register()` method
- Change ABN validation from `'abn' => 'nullable'` to `'abn' => 'required|string|size:11'`
- If no explicit validation exists, add it to the validation rules array

**2. Vendor Update Controller** (same file or `update()` method):
- Change ABN validation for update from `'abn' => 'nullable'` to `'abn' => 'required|string|size:11'`

**3. Admin Vendor Controller** (`app/Http/Controllers/Admin/VendorController.php`):
- Apply same validation changes for admin-side vendor creation/update

**4. FormRequest (if exists)** (`app/Http/Requests/`):
- If a VendorStoreRequest or RestaurantRequest exists, update there instead

### Validation Rule Pattern
```php
'abn' => 'required|string|size:11|regex:/^\d{11}$/',
```

### DO NOT
- Change the database schema (ABN column already exists)
- Modify existing vendor data (only affects new registrations/updates)
- Add ABN format validation beyond basic check (CAR-148 handles advanced validation later)
- Touch `app/CentralLogics/helpers.php`

---

## PHASE 4 — QUALITY

### 4.1 Write Tests
Create `tests/Feature/VendorRegistrationAbnTest.php`:
```php
// Test 1: Registration fails without ABN (happy path for validation)
// Test 2: Registration succeeds with valid 11-digit ABN
// Test 3: Registration fails with invalid ABN format (letters, wrong length)
```

### 4.2 Run Tests
```bash
php artisan test --filter=VendorRegistrationAbn
php artisan test  # Full suite to check for regressions
```

### 4.3 Code Review
```
/bmad-code-review
```

---

## PHASE 5 — DELIVERY

### 5.1 Commit
```bash
git add app/Http/Controllers/Vendor/RestaurantController.php
git add app/Http/Controllers/Admin/VendorController.php
git add tests/Feature/VendorRegistrationAbnTest.php
# Add any other modified files

git commit -m "fix(api): make ABN field mandatory in vendor registration [CAR-201]

ABN was optional allowing vendors to register without a business number.
Changed validation from nullable to required with 11-digit format check.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 5.2 Push & Create Draft PR
```bash
git push -u origin fix/CAR-201-abn-field-mandatory

gh pr create --draft \
  --title "[CAR-201] fix: make ABN field mandatory in vendor registration" \
  --body "$(cat <<'EOF'
## Summary
- Changed ABN validation from `nullable` to `required|string|size:11` in vendor registration and update flows
- Applied to both vendor-side (RestaurantController) and admin-side (VendorController)
- Added feature tests for ABN validation

## Jira
https://coralshades.atlassian.net/browse/CAR-201

## Test Plan
- [ ] Register vendor without ABN → should fail with validation error
- [ ] Register vendor with valid 11-digit ABN → should succeed
- [ ] Register vendor with invalid ABN (letters, wrong length) → should fail
- [ ] Update existing vendor, clear ABN → should fail
- [ ] Existing vendors without ABN are not affected (data unchanged)

## Screenshots
<!-- Add browser test screenshots here -->

🤖 Generated with Claude Code
EOF
)"
```

### 5.3 Browser Test
```
Use chrome-devtools or playwright MCP to:
1. Navigate to vendor registration page
2. Fill all fields EXCEPT ABN → submit → verify validation error appears
3. Fill ABN with valid 11-digit number → submit → verify success
4. Take screenshots of both scenarios
```

---

## PHASE 6 — JIRA UPDATES (MCP)

### 6.1 Transition to Code Review
```
Use mcp__claude_ai_Atlassian__getTransitionsForJiraIssue with issueIdOrKey: "CAR-201"
Use mcp__claude_ai_Atlassian__transitionJiraIssue to transition to "Code Review"
```

### 6.2 Add Comment with PR Link
```
Use mcp__claude_ai_Atlassian__addCommentToJiraIssue with:
  issueIdOrKey: "CAR-201"
  body: "Implementation complete. ABN validation changed from nullable to required (11-digit format).\n\nPR: [Draft PR link]\nBranch: fix/CAR-201-abn-field-mandatory\n\nChanges:\n- Vendor RestaurantController: ABN now required in store/update\n- Admin VendorController: ABN now required in store/update\n- Feature tests added for ABN validation\n\nAwaiting review and approval."
```

### 6.3 WAIT — Do NOT transition further until Demi approves the Draft PR
- After Demi approves → transition to "Dev Tested"
- After PR moved from Draft to Active → transition to "SIT"
