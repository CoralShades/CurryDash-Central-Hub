# CAR-144 — Display ABN (Australian Business Number) in Vendor Portal

> **Sprint A Quick Win #2** | Confidence: 98% | Est: 45 min
> **Type**: Story | **Status**: In Progress | **Assignee**: Demi
> **Priority**: Medium | **Fix Version**: v1.0-GA (2026-06-30)
> **Labels**: backend, prd-epic-1
> **Jira**: https://coralshades.atlassian.net/browse/CAR-144
> **Depends on**: CAR-201 (ABN made mandatory — complete this first)

---

## PHASE 1 — SETUP

### 1.1 Jira Transition → In Progress
```
Use mcp__claude_ai_Atlassian__getTransitionsForJiraIssue with issueIdOrKey: "CAR-144"
Then use mcp__claude_ai_Atlassian__transitionJiraIssue to transition to "In Progress" (if not already)
```

### 1.2 Create Branch
```bash
git checkout main && git pull origin main
git checkout -b feature/CAR-144-display-abn-vendor-portal
```

---

## PHASE 2 — INVESTIGATION

### Skills to Load
```
/find-bugs
```
Reference skills: `laravel-blade`, `laravel-eloquent`, `laravel-controllers`

### What to Investigate
ABN must be displayed in 3 locations in the vendor portal. Search for existing ABN rendering:
```
Grep for: 'abn' in resources/views/vendor-views/
Grep for: 'restaurant->abn' or '$restaurant' in vendor views
Grep for: 'abn' in app/Http/Controllers/Vendor/
Find the vendor dashboard layout: resources/views/layouts/vendor/
Find the restaurant profile page: resources/views/vendor-views/profile/
Find invoice/financial templates: resources/views/vendor-views/ (search for invoice, payout, commission)
```

### Acceptance Criteria (from Jira)
1. **Dashboard Header (persistent)**: ABN visible next to restaurant name in top nav on every page
2. **My Restaurant Page**: ABN in Business Details section, editable, with Copy button
   - If vendor clears ABN → restaurant status → 'Suspended' (reason: 'Null ABN number field')
   - If vendor modifies ABN → notification sent to admin (linked to CAD-143)
3. **Invoices/Financial Statements**: ABN in "Billed To" / "Seller Details" section
4. **Null State**: Legacy vendors without ABN see "Missing ABN - Update Required" alert

---

## PHASE 3 — IMPLEMENTATION

### Skills to Load
```
/bmad-quick-dev
```

### Changes Required

**Location 1 — Dashboard Header** (persistent top nav):
- File: `resources/views/layouts/vendor/partials/header.blade.php` (or similar layout partial)
- Add below restaurant name: `<small class="text-muted">ABN: {{ $restaurant->abn ?? 'Missing ABN' }}</small>`
- Use `@if($restaurant->abn)` / `@else` for null state display
- Null state: Show `<a href="{{ route('vendor.profile') }}" class="text-danger">Missing ABN - Update Required</a>`

**Location 2 — My Restaurant Page** (profile/business details):
- File: `resources/views/vendor-views/profile/index.blade.php` (or business-settings view)
- Add ABN field in Business Details section:
  ```blade
  <div class="form-group">
      <label>Registered ABN</label>
      <div class="input-group">
          <input type="text" name="abn" class="form-control"
                 value="{{ $restaurant->abn }}"
                 id="abn-field" required pattern="\d{11}">
          <div class="input-group-append">
              <button type="button" class="btn btn-outline-secondary"
                      onclick="copyToClipboard('abn-field')" title="Copy ABN">
                  <i class="tio-copy"></i>
              </button>
          </div>
      </div>
  </div>
  ```
- Add JavaScript copy function if not already present

**Location 3 — Invoices** (if templates exist):
- Find invoice/payout Blade templates
- Add `ABN: {{ $restaurant->abn }}` in seller details section
- If no invoice templates exist yet, skip and note in PR description

**Null State Logic** (controller side):
- In the profile update method: if ABN is cleared (empty), handle the suspension logic
- NOTE: Full suspension logic (CAD-99) and admin notification (CAD-143) are separate tickets
- For now: add a simple validation `'abn' => 'required|string|size:11'` to prevent clearing
- Add a comment: `// TODO: CAD-99 suspension logic, CAD-143 admin notification on ABN change`

### DO NOT
- Implement full suspension workflow (that's CAD-99)
- Implement admin notification on ABN change (that's CAD-143)
- Modify database schema
- Touch `app/CentralLogics/helpers.php`

---

## PHASE 4 — QUALITY

### 4.1 Write Tests
Create `tests/Feature/VendorAbnDisplayTest.php`:
```php
// Test 1: Vendor dashboard header shows ABN when present
// Test 2: Vendor dashboard header shows "Missing ABN" alert when ABN is null
// Test 3: My Restaurant page shows ABN in editable field
// Test 4: Profile update rejects empty ABN (validation)
```

### 4.2 Run Tests
```bash
php artisan test --filter=VendorAbnDisplay
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
git add resources/views/vendor-views/
git add resources/views/layouts/vendor/
git add tests/Feature/VendorAbnDisplayTest.php
# Add any other modified files

git commit -m "feat(blade): display ABN in vendor portal header, profile, and invoices [CAR-144]

Show registered ABN in three locations per acceptance criteria:
1. Dashboard header (persistent, with null state alert)
2. My Restaurant profile page (editable + copy button)
3. Invoice templates (seller details section)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 5.2 Push & Create Draft PR
```bash
git push -u origin feature/CAR-144-display-abn-vendor-portal

gh pr create --draft \
  --title "[CAR-144] feat: display ABN in vendor portal dashboard, profile, and invoices" \
  --body "$(cat <<'EOF'
## Summary
- ABN displayed in dashboard header (persistent on every page)
- ABN shown in My Restaurant page with editable field + copy button
- Null state handling: "Missing ABN - Update Required" alert for legacy vendors
- ABN in invoice/financial templates (if templates exist)

## Jira
https://coralshades.atlassian.net/browse/CAR-144

## Related Tickets
- CAR-201: ABN mandatory (prerequisite, completed)
- CAD-99: Suspension on null ABN (future — placeholder comment added)
- CAD-143: Admin notification on ABN change (future — placeholder comment added)

## Test Plan
- [ ] Dashboard header shows ABN next to restaurant name
- [ ] Vendor without ABN sees "Missing ABN - Update Required" alert in header
- [ ] My Restaurant page shows ABN in Business Details
- [ ] Copy button copies ABN to clipboard
- [ ] Profile update rejects empty ABN

## Screenshots
<!-- Add browser test screenshots here -->

🤖 Generated with Claude Code
EOF
)"
```

### 5.3 Browser Test
```
Use chrome-devtools or playwright MCP to:
1. Login as vendor with ABN → verify ABN in top nav header
2. Navigate to My Restaurant → verify ABN field in Business Details
3. Click copy button → verify clipboard content
4. Login as vendor WITHOUT ABN → verify "Missing ABN" alert in header
5. Take screenshots of all states
```

---

## PHASE 6 — JIRA UPDATES (MCP)

### 6.1 Transition to Code Review
```
Use mcp__claude_ai_Atlassian__getTransitionsForJiraIssue with issueIdOrKey: "CAR-144"
Use mcp__claude_ai_Atlassian__transitionJiraIssue to transition to "Code Review"
```

### 6.2 Add Comment with PR Link
```
Use mcp__claude_ai_Atlassian__addCommentToJiraIssue with:
  issueIdOrKey: "CAR-144"
  body: "Implementation complete. ABN displayed in 3 locations:\n\n1. Dashboard header — persistent, with null state alert\n2. My Restaurant profile — editable field with copy button\n3. Invoice templates — seller details section\n\nPR: [Draft PR link]\nBranch: feature/CAR-144-display-abn-vendor-portal\n\nNote: Suspension logic (CAD-99) and admin notification (CAD-143) are separate tickets — placeholder comments added.\n\nAwaiting review and approval."
```

### 6.3 WAIT — Do NOT transition further until Demi approves the Draft PR
