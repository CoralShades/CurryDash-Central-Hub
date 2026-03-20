# CAR-195 — Misleading Error Message When Reordering Configuration Groups

> **Sprint A Quick Win #6** | Confidence: 95% | Est: 30 min
> **Type**: Bug | **Status**: To Do | **Assignee**: Unassigned
> **Priority**: Medium | **Fix Version**: v1.0-Beta (2026-03-28)
> **Jira**: https://coralshades.atlassian.net/browse/CAR-195
> **Parallelizable**: Yes — independent of all other Sprint A tickets
> **Severity**: Low — no functional impact, UX confusion only

---

## PHASE 1 — SETUP

### 1.1 Jira Transition → In Progress
```
mcp__claude_ai_Atlassian__getTransitionsForJiraIssue: "CAR-195"
mcp__claude_ai_Atlassian__transitionJiraIssue: "CAR-195" → "In Progress"
```

### 1.2 Create Branch
```bash
git checkout main && git pull origin main
git checkout -b fix/CAR-195-config-group-reorder-error
```

---

## PHASE 2 — INVESTIGATION

### Skills to Load
```
/find-bugs
```

### What to Investigate
Drag-and-drop reorder of configuration groups shows "Failed to update group order" even though reorder succeeds and persists correctly.

```
Grep for: 'Failed to update group order' in resources/ and app/
Grep for: 'group.*order\|reorder\|sort_order\|position' in app/Http/Controllers/Vendor/PackageController.php
Grep for: 'group.*order\|reorder\|sort_order' in app/Http/Controllers/Admin/PackageController.php
Grep for: 'sortable\|draggable\|reorder' in resources/views/vendor-views/package/
Grep for: 'ajax.*reorder\|sort' in public/assets/
```

### Root Cause (likely)
- AJAX reorder endpoint returns a response that the frontend JS interprets as failure
- Possible: controller returns wrong status code, wrong JSON structure, or no response
- Possible: JS callback checks for specific success field that's missing
- The actual reorder WORKS (data persists) — it's the response/error handling that's wrong

---

## PHASE 3 — IMPLEMENTATION

### Skills to Load
```
/bmad-quick-dev
```

### Changes Required

**1. Find the Reorder Endpoint** (search in controllers):
- Likely in `PackageController` or `ConfigurationController`
- Find the method that handles the sort/reorder AJAX request
- Check what it returns

**2. Fix the Response**:
- Ensure the controller returns proper success response:
  ```php
  return response()->json(['success' => true, 'message' => 'Group order updated successfully']);
  ```
- OR fix the status code (return 200, not 500 or other error code)

**3. Fix Frontend Handler** (if issue is JS-side):
- Find the AJAX success/error callback
- Ensure it correctly interprets the response
- Replace misleading error toast with success toast:
  ```javascript
  // If using toastr or similar:
  toastr.success('Group order updated successfully');
  ```

**4. If Error String is Hardcoded in Blade**:
- Find and fix the error message text
- Ensure the success path shows the correct message

### DO NOT
- Change the reorder logic itself (it works correctly)
- Modify database schema
- Refactor the drag-and-drop library

---

## PHASE 4 — QUALITY

### 4.1 Write Tests
Create `tests/Feature/Vendor/PackageGroupReorderTest.php`:
```php
// Test 1: Reorder endpoint returns 200 with success JSON
// Test 2: Reorder actually persists the new order
```

### 4.2 Run Tests
```bash
php artisan test --filter=PackageGroupReorder
```

### 4.3 Code Review
```
/bmad-code-review
```

---

## PHASE 5 — DELIVERY

### 5.1 Commit
```bash
git add -A  # Small change, safe to add all
git commit -m "fix(api): correct misleading error on config group reorder [CAR-195]

Configuration group reorder was succeeding but showing 'Failed to update
group order' error. Fixed response handling to show success message.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 5.2 Push & Create Draft PR
```bash
git push -u origin fix/CAR-195-config-group-reorder-error

gh pr create --draft \
  --title "[CAR-195] fix: correct misleading error on configuration group reorder" \
  --body "$(cat <<'EOF'
## Summary
- Fixed misleading error message "Failed to update group order" shown when reorder succeeds
- Reorder functionality was working correctly — only the response/toast was wrong

## Jira
https://coralshades.atlassian.net/browse/CAR-195

## Test Plan
- [ ] Drag-and-drop reorder configuration groups
- [ ] Verify success message appears (not error)
- [ ] Verify order persists after page refresh

## Screenshots
<!-- Show successful reorder with correct message -->

🤖 Generated with Claude Code
EOF
)"
```

### 5.3 Browser Test
```
1. Login as vendor
2. Navigate to package configuration
3. Drag-and-drop to reorder configuration groups
4. Verify success message (not error)
5. Refresh page — verify order persisted
6. Take screenshots
```

---

## PHASE 6 — JIRA UPDATES (MCP)

### 6.1 Transition to Code Review
```
mcp__claude_ai_Atlassian__transitionJiraIssue: "CAR-195" → "Code Review"
```

### 6.2 Add Comment
```
mcp__claude_ai_Atlassian__addCommentToJiraIssue:
  issueIdOrKey: "CAR-195"
  body: "Fixed. Misleading error toast replaced with success message.\n\nPR: [link]\nBranch: fix/CAR-195-config-group-reorder-error\n\nAwaiting review."
```

### 6.3 WAIT — Do NOT transition further until Demi approves the Draft PR
