# CAR-202 — Verification Email Shows Incorrect Link and Username Placeholder

> **Sprint A Quick Win #7** | Confidence: 95% | Est: 1 hr
> **Type**: Bug | **Status**: To Do | **Assignee**: Unassigned
> **Priority**: Medium | **Fix Version**: v1.0-Beta (2026-03-28)
> **Jira**: https://coralshades.atlassian.net/browse/CAR-202

---

## PHASE 1 — SETUP

### 1.1 Jira Transition → In Progress
```
mcp__claude_ai_Atlassian__getTransitionsForJiraIssue: "CAR-202"
mcp__claude_ai_Atlassian__transitionJiraIssue: "CAR-202" → "In Progress"
```

### 1.2 Create Branch
```bash
git checkout main && git pull origin main
git checkout -b fix/CAR-202-verification-email-link-username
```

---

## PHASE 2 — INVESTIGATION

### Skills to Load
```
/find-bugs
```

### What to Investigate
Two issues in vendor registration verification email:
1. Username placeholder not resolved: shows "Dear {userName}" literally
2. Verification link points to wrong domain: `stackfood-admin.6amtech.com` instead of `merchants.currydash.au`

```
Grep for: 'userName\|{userName}' in app/Mail/ and resources/views/email-templates/
Grep for: 'stackfood\|6amtech' in resources/views/email-templates/
Grep for: 'stackfood\|6amtech' in app/Mail/
Grep for: 'verification' or 'EmailVerification' in app/Mail/
Read: app/Mail/EmailVerification.php (or similar verification mail class)
Read: resources/views/email-templates/ — find the verification template
Grep for: 'APP_URL\|config.*app.*url' in .env and config/app.php
Grep for: 'stackfood\|6amtech' in .env
```

### Root Cause (likely)
1. **Username**: Mail class passes data but Blade template uses `{userName}` (literal Blade syntax error) instead of `{{ $userName }}` — OR the variable isn't passed in the `build()` method
2. **Link**: Hardcoded URL from forked stackfood codebase, or `.env` `APP_URL` still points to stackfood domain

---

## PHASE 3 — IMPLEMENTATION

### Skills to Load
```
/bmad-quick-dev
```

### Changes Required

**1. Fix Username Placeholder** (`app/Mail/EmailVerification.php`):
- In the `build()` method, ensure the user's name is passed to the view:
  ```php
  return $this->view('email-templates.verification')
      ->with([
          'userName' => $this->vendor->f_name ?? $this->vendor->name,
          'verificationUrl' => $this->verificationUrl,
      ]);
  ```
- Check what variable name the template expects and match it

**2. Fix Blade Template** (`resources/views/email-templates/verification.blade.php`):
- Replace literal `{userName}` with `{{ $userName }}`
- Replace any hardcoded `stackfood-admin.6amtech.com` URLs with:
  ```blade
  {{ config('app.url') }}/restaurant-panel/business-settings/restaurant-setup
  ```
  OR with the actual CurryDash merchant URL:
  ```blade
  {{ env('MERCHANT_URL', 'https://merchants.currydash.au') }}/restaurant-panel
  ```

**3. Check .env** (DO NOT modify, just verify):
- Verify `APP_URL` is set correctly for the environment
- If `APP_URL` still references stackfood, note this in PR but don't change .env (deployment concern)

**4. Grep for Other Hardcoded stackfood URLs**:
- Search entire codebase for remaining `stackfood` or `6amtech` references
- List them in PR description as technical debt for future cleanup

### DO NOT
- Modify `.env` file (deployment-specific)
- Refactor the entire email system
- Change other mail templates (scope to verification email only)
- Touch `app/CentralLogics/helpers.php`

---

## PHASE 4 — QUALITY

### 4.1 Write Tests
Create `tests/Feature/VendorVerificationEmailTest.php`:
```php
// Test 1: Verification email contains vendor's actual name (not placeholder)
// Test 2: Verification email link does NOT contain 'stackfood' or '6amtech'
// Test 3: Verification email link uses APP_URL config value
```

### 4.2 Run Tests
```bash
php artisan test --filter=VendorVerificationEmail
```

### 4.3 Code Review
```
/bmad-code-review
```

---

## PHASE 5 — DELIVERY

### 5.1 Commit
```bash
git add app/Mail/
git add resources/views/email-templates/
git add tests/Feature/VendorVerificationEmailTest.php

git commit -m "fix(blade): fix verification email username placeholder and link [CAR-202]

1. Username placeholder {userName} now resolves to actual vendor name
2. Verification link changed from hardcoded stackfood URL to config-based
   APP_URL for correct CurryDash merchant portal domain

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 5.2 Push & Create Draft PR
```bash
git push -u origin fix/CAR-202-verification-email-link-username

gh pr create --draft \
  --title "[CAR-202] fix: resolve username placeholder and URL in verification email" \
  --body "$(cat <<'EOF'
## Summary
- Fixed username placeholder: "Dear {userName}" → "Dear [Actual Name]"
- Fixed verification link: removed hardcoded stackfood-admin.6amtech.com URL
- Link now uses `config('app.url')` for environment-appropriate URL

## Jira
https://coralshades.atlassian.net/browse/CAR-202

## Note: Remaining stackfood URLs
<!-- List any other hardcoded stackfood/6amtech URLs found during investigation -->

## Test Plan
- [ ] Register new vendor → check verification email
- [ ] Email shows actual vendor name (not placeholder)
- [ ] Verification link points to correct domain
- [ ] Link is functional and leads to correct page

## Screenshots
<!-- Email screenshot showing correct name and link -->

🤖 Generated with Claude Code
EOF
)"
```

### 5.3 Browser Test
```
1. Trigger vendor registration (or use mail preview)
2. Check email content — verify name resolved
3. Click verification link — verify correct domain
4. Take screenshots
```

---

## PHASE 6 — JIRA UPDATES (MCP)

### 6.1 Transition to Code Review
```
mcp__claude_ai_Atlassian__transitionJiraIssue: "CAR-202" → "Code Review"
```

### 6.2 Add Comment
```
mcp__claude_ai_Atlassian__addCommentToJiraIssue:
  issueIdOrKey: "CAR-202"
  body: "Fixed both issues:\n1. Username placeholder now resolves correctly\n2. Verification link uses APP_URL instead of hardcoded stackfood domain\n\nPR: [link]\nBranch: fix/CAR-202-verification-email-link-username\n\nAwaiting review."
```

### 6.3 WAIT — Do NOT transition further until Demi approves the Draft PR
