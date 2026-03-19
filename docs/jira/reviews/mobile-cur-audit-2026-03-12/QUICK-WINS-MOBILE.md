# Quick Wins — PACK + CUR Tickets for Immediate Implementation

> **Date**: 2026-03-12 | **Scope**: Top tickets Claude Code can implement TODAY
> **Criteria**: No backend blockers, clear patterns, low risk, isolated changes
> **Combined with**: Prior audit quick wins (Laravel) from `AI-ACHIEVABILITY-AUDIT.md`

---

## Top 10 Flutter Quick Wins (PACK)

Execute in a single Claude Code session at `D:\ailocal\currydash\User-Web-Mobile`

| # | Key | Summary | Effort | Confidence | Area |
|---|-----|---------|--------|------------|------|
| 1 | PACK-193 | UI overflow fix (Android) | 1 hr | 90% | Layout |
| 2 | PACK-221 | Bottom nav hidden by order bar | 1-2 hrs | 90% | Dashboard |
| 3 | PACK-177 | Deleted address persists after logout | 1-2 hrs | 92% | Auth/Cache |
| 4 | PACK-209 | Dietary notes icons wrong | 1-2 hrs | 85% | Product UI |
| 5 | PACK-130 | Remove all StackFood references | 2-3 hrs | 95% | Branding |
| 6 | PACK-178 | Network failure infinite loading | 2-3 hrs | 85% | API/Error |
| 7 | PACK-118 | Centralize AppColors constants | 3-4 hrs | 88% | Theme |
| 8 | PACK-194 | Full name field in registration | 2 hrs | 90% | Auth |
| 9 | PACK-224 | Payment page back navigation | 2-3 hrs | 82% | Payment |
| 10 | PACK-212 | Restaurant distance sorting | 2-3 hrs | 80% | Discovery |

**Total: ~18-24 hours | Resolves 10 bugs/improvements | Unblocks 4 downstream tickets**

---

## Top 5 Next.js Quick Wins (CUR)

Execute in a single Claude Code session at `D:\ailocal\CurryDash-Central-Hub`

| # | Key | Summary | Effort | Confidence | Area |
|---|-----|---------|--------|------------|------|
| 1 | CUR-144 | Category Management CRUD | 4-5 hrs | 85% | Admin |
| 2 | CUR-145 | Feature Flags toggle UI | 4-5 hrs | 85% | Admin |
| 3 | CUR-142 | Promotional Banners CRUD | 5-6 hrs | 80% | Admin |
| 4 | CUR-140 | Platform Settings config | 6-8 hrs | 80% | Admin |
| 5 | CUR-143 | Commission Structure config | 5-7 hrs | 80% | Admin |

**Total: ~25-31 hours | Builds 5 admin features | Establishes Central Hub patterns**

---

## Combined Priority Matrix

### Tier 1: Do First (< 2 hrs each, highest ROI)

| Key | Project | Summary | Why First |
|-----|---------|---------|-----------|
| PACK-193 | Flutter | UI overflow fix | Smallest fix, immediate UX improvement |
| PACK-221 | Flutter | Bottom nav fix | User-facing, annoying bug |
| PACK-177 | Flutter | Address cache fix | Data hygiene, privacy concern |
| PACK-209 | Flutter | Dietary icons | Misleading information |

### Tier 2: Same Session (2-3 hrs each)

| Key | Project | Summary | Why Next |
|-----|---------|---------|----------|
| PACK-130 | Flutter | StackFood removal | Brand alignment |
| PACK-178 | Flutter | Network error handling | **Unblocks 4 tickets** |
| PACK-194 | Flutter+Laravel | Full name registration | Cross-project, simple |
| PACK-224 | Flutter | Payment back-nav | Payment UX critical |

### Tier 3: Dedicated Session (4-6 hrs each)

| Key | Project | Summary | Why Separate |
|-----|---------|---------|-------------|
| CUR-144 | Next.js | Category Management | Establishes CRUD pattern |
| CUR-145 | Next.js | Feature Flags | Establishes config pattern |
| CUR-142 | Next.js | Promotional Banners | Image upload + scheduling |
| PACK-118 | Flutter | AppColors centralization | Touches many files |
| PACK-212 | Flutter | Distance sorting | May need backend change |

---

## Execution Plan

### Session 1: Flutter Bug Blitz (~6 hours)
```
cd D:\ailocal\currydash\User-Web-Mobile

1. PACK-193 (overflow) → /find-bugs → fix → commit
2. PACK-221 (nav bar) → /find-bugs → fix → commit
3. PACK-177 (address cache) → /find-bugs → fix → commit
4. PACK-209 (dietary icons) → /find-bugs → fix → commit
```

### Session 2: Flutter Improvements (~6 hours)
```
cd D:\ailocal\currydash\User-Web-Mobile

1. PACK-130 (StackFood removal) → search → replace → commit
2. PACK-178 (network errors) → /systematic-debugging → fix all controllers → commit
3. PACK-224 (payment nav) → /find-bugs → fix WebView handler → commit
```

### Session 3: Cross-Project Registration (~3 hours)
```
# Laravel first:
cd D:\ailocal\currydash\Admin-Seller_Portal
PACK-194 → add name param to registration API → commit

# Then Flutter:
cd D:\ailocal\currydash\User-Web-Mobile
PACK-194 → add name field to signup screen → commit
```

### Session 4: Central Hub Foundation (~10 hours)
```
cd D:\ailocal\CurryDash-Central-Hub

1. CUR-144 (Categories) → /bmad-bmm-dev-story → commit
2. CUR-145 (Feature Flags) → /bmad-bmm-dev-story → commit
```

### Session 5: Central Hub Admin (~12 hours)
```
cd D:\ailocal\CurryDash-Central-Hub

1. CUR-142 (Banners) → /bmad-bmm-dev-story → commit
2. CUR-140 (Settings) → /bmad-bmm-dev-story → commit
3. CUR-143 (Commission) → /bmad-bmm-dev-story → commit
```

---

## Cross-Reference: Laravel Quick Wins (from prior audit)

These can be done in parallel in a separate Claude Code session:

| Key | Summary | Effort | Impact on PACK/CUR |
|-----|---------|--------|-------------------|
| CAR-201 | ABN mandatory | 30 min | None |
| CAR-144 | Display ABN | 30 min | None |
| CAD-207 | Role display fix | 1 hr | None |
| CAD-203 | Customer name search | 1 hr | None |
| CAR-179 | Date range filter | 1-2 hrs | None |
| CAR-195 | Config group error | 1 hr | None |
| CAR-202 | Email verification fix | 1 hr | Fixes CUR-138 info source |
| CAD-222 | Dual email fix | 3-4 hrs | **Unblocks PACK-205** |
| CAR-207 | Notification timing | 3-4 hrs | **Unblocks PACK-199** |

---

## Unblock Chain

Completing these quick wins creates a cascade:

```
PACK-178 (network errors) ──→ Unblocks: PACK-133, 134, 135, 148
CAD-222 (dual email fix)  ──→ Unblocks: PACK-205 (signup mail fail)
CAR-207 (notification fix) ──→ Unblocks: PACK-199 (wrong notification)
CAD-149 (cart validation)  ──→ Unblocks: PACK-222, PACK-226
CUR-144 (categories)      ──→ Establishes CRUD pattern for all CUR features
```

**Net effect**: Implementing 15 quick wins unlocks 9 additional tickets.
