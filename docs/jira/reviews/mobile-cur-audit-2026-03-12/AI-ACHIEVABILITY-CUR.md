# AI-Achievability Assessment — CUR (New Platform / Central Hub)

> **Date**: 2026-03-12 | **Total CUR tickets**: 100 active
> **Codebase**: `D:\ailocal\CurryDash-Central-Hub` (Next.js 15, Supabase, shadcn/ui)
> **Assessment criteria**: Can Claude Code implement this ticket in the Central Hub codebase?

---

## Dashboard

| Category | Count | Description |
|----------|-------|-------------|
| **HIGH** (80%+) | **8** | Claude Code can implement — UI prototyping + CRUD |
| **MEDIUM** (50-80%) | **10** | Needs guidance, complex integrations |
| **LOW** (20-50%) | **6** | Blocked, needs credentials, complex |
| **NOT AI-ACHIEVABLE** | **76** | Prototyping done by humans, epics, duplicates |

### Key Insight
CUR is a new platform. The codebase is well-documented (CLAUDE.md, design system rules) but has minimal established code. Most HIGH tickets are UI prototyping that Claude Code excels at with shadcn/ui.

---

## HIGH AI-ACHIEVABLE (8 tickets)

### H1: CUR-144 — Category Management
- **Confidence**: 85% | **Effort**: 4-6 hrs | **Size**: M
- **What**: CRUD for food/restaurant categories in admin dashboard
- **Files to create/modify**:
  - `src/app/(dashboard)/admin/categories/page.tsx` — route wrapper
  - `src/modules/categories/components/` — CategoryList, CategoryForm, CategoryCard
  - `src/modules/categories/actions/` — Server Actions (createCategory, updateCategory, deleteCategory)
  - `src/lib/supabase/` — server client queries
  - Supabase migration — `categories` table (id, name, slug, image_url, position, is_active)
- **Pattern**: Standard CRUD with shadcn/ui DataTable + Dialog forms. Follow `src/modules/` structure.
- **Skills**: `/bmad-bmm-dev-story`, `/test-driven-development`
- **Risk**: LOW — isolated CRUD

### H2: CUR-145 — Feature Flags
- **Confidence**: 85% | **Effort**: 4-5 hrs | **Size**: M
- **What**: Key-value config table for toggling platform features
- **Files to create/modify**:
  - `src/app/(dashboard)/admin/settings/feature-flags/page.tsx`
  - `src/modules/settings/components/FeatureFlagList.tsx`
  - `src/modules/settings/actions/` — toggleFeatureFlag, getFeatureFlags
  - Supabase migration — `feature_flags` table (key, value, description, is_enabled)
- **Pattern**: Admin settings pattern. Toggle switches with shadcn/ui Switch component.
- **Skills**: `/bmad-bmm-dev-story`
- **Risk**: LOW

### H3: CUR-142 — Promotional Banners
- **Confidence**: 80% | **Effort**: 5-6 hrs | **Size**: M
- **What**: Banner CRUD with image upload + scheduling
- **Files to create/modify**:
  - `src/modules/promotions/components/` — BannerList, BannerForm, BannerPreview
  - `src/modules/promotions/actions/` — CRUD Server Actions
  - Supabase migration — `promotional_banners` table + Supabase Storage bucket
- **Pattern**: CRUD + Supabase Storage for images. DatePicker for scheduling.
- **Skills**: `/bmad-bmm-dev-story`
- **Risk**: MEDIUM — image upload needs Supabase Storage config

### H4: CUR-140 — Platform-Wide Settings Configuration
- **Confidence**: 80% | **Effort**: 6-8 hrs | **Size**: L
- **What**: Admin settings page for platform configuration
- **Files to create/modify**:
  - `src/app/(dashboard)/admin/settings/page.tsx`
  - `src/modules/settings/components/` — SettingsForm, SettingsSection
  - `src/modules/settings/actions/` — getSettings, updateSettings
  - Supabase migration — `platform_settings` table (key, value, category, type)
- **Pattern**: Form-heavy page with sections. shadcn/ui Form + Zod validation.
- **Skills**: `/bmad-bmm-dev-story`
- **Risk**: MEDIUM — broad scope, needs clear requirements

### H5: CUR-143 — Commission Structure Configuration
- **Confidence**: 80% | **Effort**: 5-7 hrs | **Size**: L
- **What**: Configure commission rates for vendors
- **Files to create/modify**:
  - `src/modules/settings/components/CommissionConfig.tsx`
  - `src/modules/settings/actions/` — commission CRUD
  - Supabase migration — `commission_structures` table
- **Pattern**: Form with percentage inputs, validation, vendor overrides
- **Skills**: `/bmad-bmm-dev-story`
- **Risk**: MEDIUM — financial config needs careful validation

### H6-H8: Prototyping Tickets in UAT (validate/iterate)

These are already in UAT and may need iterations:

| Key | Summary | Confidence | Effort | What Claude Can Do |
|-----|---------|------------|--------|-------------------|
| CUR-10 | Home Screen prototype | 80% | 2-3 hrs | Iterate based on feedback |
| CUR-11 | Search Results prototype | 80% | 2-3 hrs | Iterate based on feedback |
| CUR-12 | Restaurant Details prototype | 80% | 2-3 hrs | Iterate based on feedback |

---

## MEDIUM AI-ACHIEVABLE (10 tickets)

| Key | Summary | Confidence | Effort | Why Medium | Skills |
|-----|---------|------------|--------|------------|--------|
| CUR-153 | API Auth & Security | 70% | 6-8 hrs | Auth.js v5 + Supabase RLS. Critical security path. | `/bmad-bmm-dev-story` |
| CUR-141 | Zone Management | 65% | 8-10 hrs | Maps integration + geospatial queries. Complex UI. | `/bmad-bmm-dev-story` |
| CUR-152 | Firebase Push Notifications | 65% | 6-8 hrs | Firebase Admin SDK + Next.js server integration | `/bmad-bmm-dev-story` |
| CUR-138 | Email Notifications | 70% | 5-6 hrs | Email templates + send logic. Resend or Supabase. | `/bmad-bmm-dev-story` |
| CUR-134 | Vendor New Order Notifications | 65% | 4-5 hrs | Depends on CUR-152 (Firebase) + event system | `/bmad-bmm-dev-story` |
| CUR-135 | Order Status Change Notifications | 65% | 4-5 hrs | Event-driven. Needs order lifecycle defined. | `/bmad-bmm-dev-story` |
| CUR-136 | Customer Order Update Notifications | 65% | 4-5 hrs | Same pattern as CUR-135 | `/bmad-bmm-dev-story` |
| CUR-14 | Cart Screen (In Progress) | 75% | 4-6 hrs | Complex state. Currently in progress by Ruchiran. | — |
| CUR-155 | Restaurant Portal Activation | 70% | 3-4 hrs | Needs to check real portal. Currently in UAT. | — |
| CUR-154 | Admin Portal Activation | 70% | 3-4 hrs | Same as CUR-155 | — |

---

## LOW AI-ACHIEVABLE (6 tickets)

| Key | Summary | Confidence | Why Low | Notes |
|-----|---------|------------|---------|-------|
| CUR-146 | Customer Auth API | 45% | Auth is critical path. JWT + social login + token refresh. High risk. | Needs Auth.js v5 deep integration |
| CUR-147 | Package & Food Browsing API | 40% | Needs decision: proxy to Laravel or new Supabase schema? | Architecture unclear |
| CUR-148 | Cart & Checkout API | 35% | Must mirror complex Laravel order logic. Financial critical. | Domain knowledge gap |
| CUR-149 | Order Management API | 35% | Complex lifecycle, status machine, notifications | Domain knowledge gap |
| CUR-150 | Subscription Management API | 30% | Complex billing, renewals, Stripe integration | Needs full spec |
| CUR-151 | Stripe Payment Integration | 35% | Needs Stripe keys, webhook config, testing | Credential-dependent |

---

## NOT AI-ACHIEVABLE (76 tickets)

### Reason Breakdown

| Reason | Count | Tickets |
|--------|-------|---------|
| Prototyping (needs human design) | 37 | CUR-20-28, 32-38, 42, 44, 47-53, 54-78 |
| Epics (containers) | 14 | All epics |
| Needs Stripe credentials | 6 | CUR-122, 128-132 |
| Notification stories (need Firebase) | 4 | CUR-137, 139, notification subtasks |
| Branding (SIT) | 2 | CUR-3, 8 |
| Duplicate | 1 | CUR-156 (= CAR-206) |
| Archived | 1 | CUR-46 |
| Currently in UAT | 5 | CUR-7, 10, 11, 12, 13 |
| Currently in SIT | 2 | CUR-3, 8 |
| Decision D6 (deprioritize) | 37 | CUR prototyping — per prior audit recommendation |

### Special Note: CUR Prototyping (37 tickets)

These 37 prototyping tickets are assigned to Ramesh (parent stories) and Ruchiran (admin subtasks). They are **technically HIGH for AI** — UI prototyping with shadcn/ui is ideal for Claude Code. However:

1. **Decision D6** from prior audit recommends deprioritizing to free Ramesh
2. Ruchiran already has CUR-10-14 in progress/UAT
3. No production value until Epic 11 (API foundation) is built

**If Demi approves keeping prototyping**: These 37 tickets move to HIGH AI-achievable. Claude Code can rapidly prototype admin screens using shadcn/ui + Supabase.

---

## Quick Wins — CUR Tickets Implementable TODAY

| Rank | Key | Summary | Effort | Confidence | Approach |
|------|-----|---------|--------|------------|----------|
| 1 | CUR-144 | Category Management | 4-5 hrs | 85% | CRUD with shadcn/ui DataTable |
| 2 | CUR-145 | Feature Flags | 4-5 hrs | 85% | Key-value config + Toggle UI |
| 3 | CUR-142 | Promotional Banners | 5-6 hrs | 80% | CRUD + Supabase Storage |
| 4 | CUR-140 | Platform Settings | 6-8 hrs | 80% | Form sections + validation |
| 5 | CUR-143 | Commission Config | 5-7 hrs | 80% | Financial form + validation |

**Total estimated: ~25-31 hours for 5 tickets**

### How to Execute

```bash
# Open Claude Code in Central Hub
cd D:\ailocal\CurryDash-Central-Hub

# For each feature:
# 1. /bmad-bmm-create-story — Generate story from Jira
# 2. Create Supabase migration
# 3. /bmad-bmm-dev-story — Implement
# 4. /verification-before-completion — Verify
# 5. /commit — Commit

# Follow CLAUDE.md rules strictly:
# - Server Components for data fetching
# - "use client" at leaf nodes only
# - shadcn/ui with spice palette
# - Zod validation at boundaries
# - RoleGate for admin-only access
```

---

## Cross-Project Impact

### CUR tickets that unblock PACK

| CUR Ticket | PACK Ticket Unblocked | Impact |
|------------|----------------------|--------|
| CUR-149 (Order API) | PACK-210 (Track order) | Order tracking in mobile |
| CUR-151 (Stripe) | PACK-105 (Stripe SDK) | Payment in mobile |
| CUR-152 (Firebase) | PACK-169/170 (Notifications) | Push notifications |

### CUR tickets informed by current platform bugs

| CUR Ticket | Current Bug | Lesson |
|------------|------------|--------|
| CUR-148 (Cart API) | CAD-149 (Cart validation) | Don't allow inactive items in cart |
| CUR-149 (Order API) | CAR-207 (Premature notification) | Validate order state before notification |
| CUR-138 (Email) | CAD-222 (Dual emails) | Don't fire OTP + registration simultaneously |
| CUR-146 (Auth) | PACK-205 (Signup mail fail) | Handle mail failure gracefully |
