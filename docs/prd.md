# CurryDash — Master Product Requirements Document

**Version:** 1.0
**Date:** February 2026
**Status:** Living Document — Active Development
**Supersedes:** Admin-Seller Portal PRD (docs/prd/) and User-Web-Mobile PRD (_bmad-output/planning-artifacts/prd/)

---

## 0. Document Meta

### 0.1 Purpose

This document is the **single source of truth** for the entire CurryDash platform. It consolidates requirements from two previously separate PRDs — the Admin-Seller Portal PRD (PRD A, covering the Laravel backend, Admin Dashboard, and Vendor Portal) and the User Web/Mobile PRD (PRD B, covering the Flutter customer application) — into one authoritative, conflict-resolved specification.

All four platform components are covered here: the Customer App (Flutter, iOS/Android/Web), the Admin Dashboard (Laravel 10.x Blade), the Vendor Portal (Laravel 10.x Filament 3.x), and the Backend APIs. Any requirement that conflicts between the two source PRDs has been resolved in this document. Where a conflict existed, the resolution is noted inline or in Section 6 (NFRs). This document supersedes both PRD A and PRD B for all purposes.

### 0.2 How AI Agents Should Use This PRD

Agents reading this document should observe the following rules without exception:

**FR numbers are canonical identifiers.** Always reference requirements by their FR number, not by title or description. Titles change; FR numbers do not. The FR numbering scheme allocates ranges by domain:

| FR Range | Domain |
|----------|--------|
| FR1–FR70 | Customer App (Flutter) |
| FR71–FR120 | Admin Dashboard (Laravel) |
| FR121–FR160 | Vendor Portal (Filament 3.x) |
| FR161–FR200 | Backend APIs |
| FR201–FR230 | Cross-cutting (Notifications, Configuration, UX Audit-driven) |

**WCAG AA is the platform-wide accessibility standard.** All interfaces — mobile app, admin dashboard, and vendor portal — must meet WCAG 2.1 Level AA. WCAG A compliance is the minimum floor; AA is the required target. Specific constraints enforced by implementation include: color contrast ratio 4.5:1 for text, 3:1 for UI components; status badges must use icon + text + color (never color alone, per WCAG 1.4.1); white text must never appear on Turmeric Gold (#E6B04B) as the contrast ratio of 1.98:1 fails AA; touch targets 44x44px minimum (48x48dp on mobile).

**The Filament Vendor Portal (FR121–FR160) is marked [IN-PROGRESS] but is now [COMPLETE].** As of February 2026, all 7 implementation epics (Epics 12–18) are done, 547 PHPUnit tests pass, and the branch `feature/vendor-portal` is pending merge to UAT. See Section 5.3 for detailed wave completion status.

**NFRs in Section 6 take precedence over any conflicting specs in individual codebases.** Where the existing codebase diverges from an NFR (for example, an old API endpoint returning in more than 200ms), the NFR is the target state and the codebase is non-compliant until remediated.

**Jira project mapping is in Section 10.** All issues, bugs, and stories must be routed to the correct Jira project. Creating a ticket in the wrong project is a workflow error. Consult Section 10 before filing any issue.

**Appendix A contains the old FR to new FR cross-reference.** If working from a legacy document, ticket, or code comment that references an old PRD A FR number (e.g., "FR9 — Menu Management"), use Appendix A to find the new canonical number (FR129 in that example).

### 0.3 How to Navigate This Document

| If you need... | Go to... |
|----------------|----------|
| All Customer App requirements | Section 5.1 |
| All Admin Dashboard requirements | Section 5.2 |
| All Vendor Portal requirements (including Filament) | Section 5.3 |
| All Backend API requirements | Section 5.4 |
| Cross-cutting requirements (notifications, configuration) | Section 5.5 |
| All NFRs (performance, security, accessibility, etc.) | Section 6 |
| Jira project routing | Section 10 |
| Old FR# to new FR# translation | Appendix A |
| Platform architecture and integration map | Section 3 |
| User personas and journeys | Section 4 |

### 0.4 Document Version and Status

| Field | Value |
|-------|-------|
| Version | 1.0 |
| Date | February 2026 |
| Status | Living Document |
| Authors | Technical Writer Agent (Claude Sonnet 4.6), synthesized from PRD A and PRD B research artifacts |
| Source PRD A | `/mnt/d/ailocal/currydash/Admin-Seller_Portal/docs/prd/` |
| Source PRD B | `/mnt/d/ailocal/currydash/User-Web-Mobile/_bmad-output/planning-artifacts/prd/` |

This is a living document. As epics are completed, new capabilities are added, or requirements evolve, this document should be updated rather than replaced. All substantive changes require a version note at the top of the affected section.

### 0.5 Related Repositories

| Repository | Purpose | Active Branch |
|------------|---------|---------------|
| `Admin-Seller_Portal` | Laravel 10.x backend, Admin Dashboard, Vendor Portal (Filament) | `feature/vendor-portal` |
| `User-Web-Mobile` | Flutter cross-platform customer app (iOS/Android/Web) | `main` (PACK stories) |

---

## 1. Executive Summary

### 1.1 Platform Vision

CurryDash is a **subscription-marketplace hybrid food delivery platform** purpose-built for the Sri Lankan diaspora community in Victoria, Australia. The platform combines two distinct service models that are normally found on separate platforms: a HelloFresh-style configurable meal kit subscription system (internally called CPFP — Curry Pack For People) and an UberEats-style on-demand food delivery marketplace. These models run simultaneously on a shared backend, giving customers the predictability of a subscription alongside the variety of a marketplace.

The platform serves three distinct constituencies: customers who want authentic Sri Lankan cuisine delivered on their schedule, restaurant operators and home kitchen vendors who need purpose-built tools to manage a delivery-focused food business, and the CurryDash operations team who oversee platform quality, vendor approval, and customer support. Each constituency has a dedicated interface: customers use a Flutter mobile and web app, vendors use a modernized web portal powered by Filament 3.x (with a legacy Blade portal maintained in parallel), and admins use a Laravel Blade dashboard.

### 1.2 Why CurryDash Exists

The Sri Lankan community in Victoria's south-eastern suburbs — particularly Casey, Monash, and Greater Dandenong — is substantial, established, and underserved by the Australian food delivery market. Platforms like UberEats, DoorDash, and Menulog aggregate Sri Lankan cuisine under broad "Indian" or "Asian" categories, flattening regional and cultural distinctions that matter deeply to diaspora consumers. A Jaffna Tamil curry is not the same as a Colombo kottu, and neither is the same as a Sinhalese rice and curry — but existing platforms treat all three identically. CurryDash exists to provide that specificity: a platform that categorizes cuisine by cultural authenticity, presents vendors with their actual heritage, and gives customers the ability to search for exactly the regional style they grew up eating.

For vendors, the gap is equally significant. Independent Sri Lankan restaurants and home-based food operators have historically had limited access to professional delivery infrastructure. Major platforms impose high commissions that are economically punishing for small-margin ethnic food businesses, offer no understanding of the specific operational patterns of South Asian cuisine (batch preparation, festival menus, family-pack configurations), and provide no tooling for the complexity of subscription-based meal planning. CurryDash is designed from the ground up to address these gaps. The vendor portal supports complex package configurations — proteins, spice levels, sides, add-ons — that are impossible to express on generic platforms. The subscription system gives vendors predictable demand, reducing food waste and enabling effective prep planning before a busy festival weekend.

The subscription model also creates structural economic advantages over pure marketplace competitors. Subscription customers have higher lifetime value, lower churn, and more predictable purchasing behavior, which benefits both the platform and the vendors whose revenue becomes more forecastable. The CPFP meal kit system enables HelloFresh-style recurring orders without the operational complexity of a centralised fulfilment centre — each vendor fulfils their own packs, enabling geographic diversity and culinary authenticity simultaneously.

From a technical perspective, CurryDash is a brownfield project: the initial codebase was purchased as a commercial foundation (StackFood Multivendor) and has been substantially extended and rebranded. The Customer App retains the Flutter cross-platform architecture and feature completeness of the commercial base while replacing all StackFood branding and adding CurryDash-specific capabilities. The Admin-Seller Portal Laravel backend has been extended with the CPFP package system, a full Filament 3.x vendor portal modernisation, and a comprehensive test suite. This PRD represents the requirements for the platform at production-readiness, covering both what exists and what is actively being built.

### 1.3 Platform Components

| Component | Technology | Audience | Status |
|-----------|------------|----------|--------|
| Customer App | Flutter 3.4.4+ (iOS/Android/Web) | End customers (diaspora community, general Victorian food market) | Production-ready (branding migration in progress) |
| Admin Dashboard | Laravel 10.x + Blade | Platform administrators, operations staff, support agents | Production-ready |
| Vendor Portal | Laravel 10.x + Filament 3.x (TALL stack) | Restaurant operators, home kitchen vendors, vendor employees, accountants | [IN-PROGRESS: Epics 12–18 complete, PR to UAT pending] |
| Backend APIs | Laravel 10.x REST APIs (`/api/v1/`) | Customer App (Flutter), Vendor App (mobile), third-party integrations | Production-ready |

The Vendor Portal deserves particular note. A legacy Blade-based vendor portal has been in production since launch and remains fully functional. A parallel Filament 3.x modernisation is now complete (branch `feature/vendor-portal`), accessible at `/vendor-portal` alongside the legacy portal at `/vendor`. Vendors opt in to the new portal via a feature flag, and can switch back to the legacy view at any time. This dual-portal coexistence is an explicit architectural decision, not a transitional state — see Section 5.3 for detail.

### 1.4 Business Model

CurryDash operates a **dual revenue model**. Both revenue streams run simultaneously and are not mutually exclusive for any given vendor.

**Commission-based revenue** applies to on-demand marketplace orders. A configurable commission percentage is deducted automatically from each order placed through the platform. Commission rates can be set globally or per vendor, and the admin dashboard provides full financial oversight of commission calculations, payouts, and reconciliation. The system automatically deducts the platform commission and maintains a wallet balance for each vendor, from which vendors can request withdrawals.

**Subscription-based vendor fees** apply to platform access. Vendors pay tiered subscription fees to access advanced portal features. The restaurants table contains 68 columns supporting this dual business model, including `commission_percentage` for marketplace mode and `subscription_plan_id` for subscription mode. Vendors can be on either model or a combination.

From the customer side, the subscription product (CPFP) provides a third revenue dimension: customers pay recurring subscription fees for scheduled curry pack deliveries. These are distinct from vendor platform subscriptions — they represent customer purchasing subscriptions managed through the platform's subscription scheduling system.

### 1.5 Target Market

**Primary market:** The Sri Lankan diaspora community in Victoria, Australia, with particular density in the Local Government Areas of Casey, Monash, and Greater Dandenong. This community includes both first-generation immigrants seeking familiar cuisine from home and second-generation members who grew up with Sri Lankan food as a cultural touchstone. The platform design, brand language, and product decisions are oriented around this community's specific needs: cultural authenticity, regional specificity, bilingual packaging, and the social dimension of food sharing within extended family networks.

**Secondary market:** The broader Victorian food market — customers without Sri Lankan heritage who are curious about authentic South Asian cuisine and find the subscription convenience model appealing. The platform architecture supports this market without compromising the primary diaspora focus.

**Vendor base:** Independent Sri Lankan restaurants (typically small to medium, family-operated), home-based food operators (enabled by CurryDash's vendor programme designed for non-shopfront kitchens), cloud kitchen operators, and catering-focused vendors. The platform explicitly welcomes vendor types that major platforms do not support well — home kitchen operators, festival-menu-only vendors, and traditional recipe custodians who are not interested in building a restaurant but do want to reach a wider community.

---

## 2. Product Scope

### 2.1 MVP Definition

The MVP encompasses the features required for a viable production launch. Both platform repositories contribute MVP requirements.

**Customer App (Flutter) — MVP:**
- CurryDash brand identity applied across all screens (name, icon, splash screen, colour scheme, removal of all StackFood references) — FR1–FR5
- Customer account creation via email, phone, or social login — FR6–FR7
- Customer profile management, saved addresses, and saved payment methods — FR8–FR10
- Restaurant and menu discovery by location — FR11–FR13
- Menu item and package browsing with full detail views — FR14–FR15
- Package customization (protein choice, spice level, sides) with min/max constraint enforcement and price calculation — FR16–FR19
- Cart operations: add, modify, remove items, apply promo codes — FR21–FR23
- Checkout: delivery address selection, time slot, payment completion — FR24–FR26
- Subscription creation with frequency and delivery day selection — FR27–FR28
- Subscription pause and skip functionality — FR29
- Subscription modification and cancellation — FR30–FR31
- Order tracking in real-time — FR33
- Order history with reorder capability — FR34–FR35
- Push notifications for order status changes and subscription reminders — FR36, FR67–FR68
- Customer support: issue reporting with photo upload — FR38–FR39
- Notification preferences management — FR70

**Admin Dashboard (Laravel Blade) — MVP:**
- Vendor application review queue with approve/reject workflow and notes — FR77–FR78
- Vendor profile management: view, edit, suspend, activate — FR79–FR80
- Vendor search and filter by status, zone, and cuisine type — FR81
- Vendor performance monitoring: metrics, ratings history, quality flagging — FR82–FR84
- Platform-wide order monitoring with search and filters — FR85
- Order intervention: cancel, refund, reassign — FR86
- Customer complaint queue with full order context — FR87–FR88
- Refund and credit processing — FR89
- Review response and escalation tools — FR90–FR92
- Super admin user and role management — FR94–FR96
- Zone-scoped admin access — FR97
- Vendor staff permission management — FR98
- Accountant role with financial-only access — FR99
- Admin action audit logging — FR100
- Platform-wide analytics dashboard — FR73
- Subscription plan template management — FR71–FR72
- Platform configuration: business settings, delivery zones, banners, commission rates, vendor categories, feature flags — FR207–FR212

**Vendor Portal (Legacy Blade, always available) — MVP:**
- Vendor self-service registration and onboarding — FR121–FR123
- Restaurant profile setup: name, description, cuisine type, branding — FR124
- Operating hours and off-day configuration — FR125
- Delivery zone definition — FR126
- Multi-location management — FR127
- Staff delegated access with permissions — FR128
- Food item CRUD with images, descriptions, pricing, and variations — FR129–FR131
- Category management — FR130
- Add-on groups and items management — FR132
- Curry pack package creation with 3-tier hierarchy (Package > Configuration > Option) — FR133–FR136
- Item and package availability toggling including seasonal availability — FR138–FR139
- Real-time incoming order dashboard — FR141
- Order accept/reject and status workflow — FR142–FR143
- Order detail view with customizations and special instructions — FR144
- Subscription vs. on-time order identification — FR145
- Order history with search and filters — FR148
- Basic analytics: orders, revenue, ratings — FR156
- Financial reports: earnings, commission, payout history — FR101–FR102
- Platform subscription status view — FR150
- Notification receipt for new orders and status changes — FR201–FR202

**Backend APIs — MVP:**
- All 70 customer app requirements supported via REST API — FR161
- JWT authentication for all customer, vendor, and admin guards — FR162
- Package listing and customization endpoints — FR163
- Cart and checkout endpoints — FR164–FR165
- Subscription management API — FR166
- Stripe payment processing integration — FR167
- Firebase FCM push notification integration — FR168
- Automatic commission deduction on order completion — FR108

### 2.2 Growth Features

**Vendor Portal Enhancements (Post-MVP):**
- Advanced analytics with trend analysis (daily/weekly/monthly) and platform benchmark comparison — FR157–FR158
- Subscription forecasting dashboard showing upcoming subscription order volumes — FR154
- Bulk menu operations: batch availability toggle, bulk edit for multiple items simultaneously
- Multi-location vendor chain support in Filament
- Promotional campaign creation tools
- Customer review response capability — FR159
- Shift handover summary report generation — FR149
- Withdrawal requests from vendor wallet — FR103
- GST-compliant monthly statement downloads — FR104
- Annual tax summary document generation — FR105

**Admin Dashboard Enhancements:**
- Advanced reporting with custom report builder
- Geographic analytics: order heat maps by suburb — FR74
- Subscription vs. on-demand ratio reporting — FR75
- Vendor payout management: view, manage, process — FR106–FR107
- Automated vendor performance alerts — FR204
- Quality audit workflows with scheduling — FR84
- Bulk operations for common admin tasks
- Knowledge base management for support agents — FR93
- Financial reconciliation and ledger audit tools

**Platform Capabilities:**
- Multi-language content management (English, Sinhala, Tamil)
- A/B testing infrastructure
- Google Maps integration for address detection and delivery zone visualisation
- Advanced search with faceted filters
- External analytics integration (Google Analytics, Mixpanel)
- SMS gateway for critical order updates — FR206
- Batch download for multi-vendor accountant access

**Customer App:**
- Full UI/UX component refresh with custom Flutter components
- Custom illustration library aligned to CurryDash brand
- App Store and Play Store listing optimization
- Full Playwright E2E test suite covering all user journeys
- Performance benchmarking and automated accessibility testing
- Customer analytics dashboard
- Smart upsell during subscription pause flow (offer family pack rather than skip entirely)

### 2.3 Vision Features

**Cultural Platform Excellence:**
- AI-powered cultural authenticity verification for vendor cuisine claims
- Community-driven ratings incorporating cultural authenticity signals
- Heritage storytelling features within vendor profiles (family history, regional provenance, recipe origin)
- Cultural event integration: festival menus, seasonal specials calendar, Deepavali/Vesak/Sinhala New Year demand planning
- Bilingual packaging integration (English + Sinhala) with QR codes for serving instruction videos

**Operational Excellence:**
- Fully automated vendor onboarding with document verification (no manual review required)
- Predictive demand forecasting for subscription optimization
- Real-time driver tracking integrated into vendor and customer interfaces
- Automated quality control with image recognition
- Kitchen display system (KDS) integration for order fulfilment

**Scale and Expansion:**
- Multi-region support beyond Victoria (other Australian cities)
- White-label vendor portal for enterprise/multi-location vendors
- API marketplace for third-party integrations
- Self-service analytics with natural language query capability
- Admin Dashboard (CAD) modernization to Filament 3.x (deferred from current Vendor Portal modernization scope)
- Full Blade-to-Filament migration for all vendors (currently gradual opt-in via feature flags)
- Dark mode theme for Customer App
- Server-side rendering (SSR) for Customer Web App to improve SEO
- Self-service vendor onboarding portal (eliminating operations team bottleneck)

### 2.4 Out of Scope

The following items are explicitly out of scope and should not be treated as implied requirements. Any work request touching these areas requires an explicit scope change and PRD amendment.

**Out of scope for current sprint / Phase 4a Filament MVP:**
- Admin Dashboard (CAD) modernization to Filament — explicitly deferred to Phase 4c (separate epic, separate timeline)
- Customer API endpoint changes as part of Filament work — Filament portal consumes existing API; no new endpoints
- Mobile app changes as part of Filament vendor portal work — mobile vendor app is a separate Flutter interface
- Modifications to existing `/vendor` Blade routes — the legacy portal remains fully functional and untouched in parallel
- Video assessment automation for vendor onboarding — manual video call process remains in place
- Kitchen display system (KDS) integration — deferred to Phase 2+
- Multi-location vendor support within Filament resources — deferred to Phase 3
- Per-vendor A/B testing between Blade and Filament portals — feature flag opt-in model is the current approach

**Out of scope for Customer App (PRD B) MVP:**
- Backend API development — that is Admin-Seller Portal scope (PRD A)
- New consumer features beyond what exists in the StackFood base codebase — this is a branding and infrastructure initiative, not a net-new feature development project
- Payment gateway implementation — existing integrations are used as-is
- Delivery management / driver app — this is a separate mobile application entirely
- Multi-region deployment infrastructure — Phase 3
- Dark mode — Phase 3
- Multi-language UI localisation — flagged as desirable but not in MVP scope

**Permanently out of scope (no planned phase):**
- White-label resale of the platform to third-party operators
- Grocery or non-food delivery
- Driver/courier self-signup (drivers are managed by vendors or admin as delivery staff, not self-served)

### 2.5 Phased Roadmap Summary

| Phase | Focus Areas | Key Deliverables | Timeline |
|-------|-------------|-----------------|----------|
| Phase 1: MVP | Production readiness for launch | Customer App branding complete; Admin Dashboard operational; Legacy Vendor Portal fully functional; 70 API endpoints serving Flutter app; Stripe + Firebase integrated | Complete / In Final QA |
| Phase 2: Growth | Post-launch enhancement | Advanced analytics; Filament Vendor Portal live for all vendors; Bulk operations; Financial reconciliation; Full Playwright E2E suite; Multi-language support | Post-launch (6–12 months) |
| Phase 3: Expansion | Market leadership | Multi-region support; AI authenticity verification; Heritage storytelling; Enterprise multi-location vendor; Dark mode; SSR web app | Year 2 |
| Phase 4: Vendor Portal Modernization | Filament 3.x migration | Phase 4a (foundation + core resources) — COMPLETE; Phase 4b (interactive tours + resource center) — COMPLETE; Phase 4c (full migration, Admin modernization) — Deferred | 4a+4b complete; 4c TBD |

---

## 3. Platform Architecture Overview

### 3.1 System Context Diagram

The following diagram shows how all platform components interact, including external service integrations.

```
┌─────────────────────────────────────────────────────────────────────┐
│  CUSTOMERS (Sri Lankan Diaspora, Victoria, Australia)               │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Flutter Customer App  │
                    │  iOS / Android / Web   │
                    │  (GetX, Feature-first) │
                    └───────────┬───────────┘
                                │ REST API (HTTPS/TLS 1.2+)
                                │ /api/v1/
                                ▼
┌───────────────────────────────────────────────────────────────────┐
│             LARAVEL 10.x BACKEND (Admin-Seller Portal)            │
│                     PHP 8.2.12 / MySQL                            │
│                                                                   │
│  ┌─────────────────┐    ┌─────────────────────────────────────┐  │
│  │  CentralLogics/ │    │  app/Http/Controllers/              │  │
│  │  helpers.php    │    │  ├── Admin/    (CAD controllers)     │  │
│  │  order.php      │◄───┤  ├── Api/V1/  (CUR API controllers) │  │
│  │  restaurant.php │    │  └── Vendor/  (CAR controllers)      │  │
│  └─────────────────┘    └─────────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  CPFP Package System                                        │ │
│  │  Package → PackageConfiguration (min/max) → PackageOption   │ │
│  │  (references Food items — 3-tier hierarchy)                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌──────────────────────┐    ┌───────────────────────────────┐  │
│  │  Admin Dashboard     │    │  Filament 3.x Vendor Portal   │  │
│  │  /admin/*            │    │  /vendor-portal/*             │  │
│  │  (Blade, CAD)        │    │  (TALL stack, Livewire v3)    │  │
│  │  auth:admin guard    │    │  auth:vendor guard            │  │
│  └──────────┬───────────┘    └──────────────┬────────────────┘  │
│             │                               │                    │
│             │            ┌──────────────────┘                   │
│             │            │  Legacy Vendor Portal                 │
│             │            │  /vendor/*                            │
│             │            │  (Blade, CAR — always available)      │
│             │            └──────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
         │                          │                   │
         │                          │                   │
    ┌────▼─────┐            ┌───────▼──────┐    ┌──────▼──────┐
    │  Stripe  │            │ Firebase FCM  │    │ Google Maps │
    │  Payments│            │ Push Notif.   │    │ Geolocation │
    │  PCI-DSS │            │ Auth          │    │ Delivery    │
    └──────────┘            └───────────────┘    └─────────────┘
         │                          │
    ┌────▼─────┐            ┌───────▼──────┐
    │ 12+ Payment│           │  AWS S3 /    │
    │ Gateways  │           │  DO Spaces   │
    │(Razorpay, │           │  (Image/File │
    │ PayPal,   │           │   Storage)   │
    │ bKash...  │           └──────────────┘
    └───────────┘

                    ┌───────────────────────┐
                    │  RESTAURANT OPERATORS  │
                    │  (Vendors, Employees,  │
                    │   Accountants)         │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼──────────┐
                    │  Filament Vendor Portal│
                    │  /vendor-portal        │
                    │  OR Legacy /vendor     │
                    └────────────────────────┘

                    ┌───────────────────────┐
                    │  PLATFORM ADMINS /     │
                    │  OPERATIONS TEAM       │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼──────────┐
                    │  Admin Dashboard       │
                    │  /admin                │
                    └────────────────────────┘
```

### 3.2 Authentication Architecture

CurryDash uses **multi-guard JWT authentication** on the backend, with each user type operating in a completely isolated authentication context. Guards do not share sessions or tokens.

**Customer (api guard):**
Customers authenticate via the Flutter app using JWT tokens. Token issuance follows OAuth 2.0 / industry-standard JWT patterns. Tokens expire after 24 hours with refresh token rotation. Social login (Google, Apple) is supported on both iOS and Android. Biometric authentication is available on supported devices as a UX convenience layer over the underlying JWT credential. Failed login attempts are rate-limited to 5 per 15 minutes. All customer API endpoints are protected by `auth:api` middleware.

**Admin (admin guard):**
Admin users authenticate via the Admin Dashboard login page. JWT tokens are issued and stored as session credentials in the browser. Admin sessions timeout after 30 minutes of inactivity. The admin guard supports role-based access control with granular module permissions (super admin, operations, support, marketing, accountant roles). Zone-scoped access restricts certain admins to vendor and order data within specific geographic zones.

**Vendor (vendor guard):**
Vendor owners and shop managers authenticate via both the legacy Blade portal (`/vendor`) and the Filament portal (`/vendor-portal`). The Filament panel extends the existing `vendor` guard via the `FilamentUser` interface implemented on the `Vendor` model. No new authentication guards were created for the Filament implementation. JWT tokens are used for vendor mobile API access; session-based auth is used for web portal access.

**Vendor Employee (vendor_employee guard):**
Vendor employees authenticate with credentials created by the vendor owner. The `vendor_employee` guard is a separate guard from `vendor` and enforces role-based resource visibility within the Filament portal. Employees see only the resources relevant to their assigned permissions — for example, a shift manager sees Orders and Menu (read-only) but not Financial Reports or Business Settings. The `VendorEmployee.vendor_id` column is the owner foreign key, linking every employee record to their vendor owner.

### 3.3 Key Integration Points

| Service | Purpose | Used By | Implementation Notes |
|---------|---------|---------|---------------------|
| Firebase FCM (Cloud Messaging) | Push notifications to customers and vendor browser notifications | Customer App, Vendor Portal (order alerts) | FCM tokens stored per device; vendor portal uses Laravel Echo + WebSocket broadcasting + service worker as primary, FCM as mobile fallback |
| Firebase Auth | Social login (Google, Apple Sign-In) | Customer App | Firebase Auth SDK in Flutter; backend validates Firebase ID tokens |
| Stripe | Primary payment processing | Customer App checkout, Admin refund tools | Stripe SDK only — no card data stored locally; PCI-DSS maintained |
| Razorpay | Payment processing (secondary) | Customer App | 12+ gateways supported; each has a dedicated controller |
| PayPal | Payment processing | Customer App | |
| Paystack | Payment processing | Customer App | |
| Flutterwave | Payment processing | Customer App | |
| SSLCommerz | Payment processing (Bangladesh market) | Customer App | |
| MercadoPago | Payment processing (Latin America) | Customer App | |
| bKash | Mobile payment (Bangladesh) | Customer App | |
| Paymob | Payment processing | Customer App | |
| LiqPay | Payment processing (Ukraine) | Customer App | |
| SenangPay | Payment processing (Malaysia) | Customer App | |
| Paytm | Payment processing (India) | Customer App | |
| Google Maps | Address autocomplete, delivery zone visualisation, geolocation | Customer App, Admin zone management | Maps API key configured per environment |
| AWS S3 / DigitalOcean Spaces | Image and file storage (food photos, vendor documents, packaging photos) | All platforms | URL signing for secure access; storage type awareness via `Helpers::get_full_url()` |
| SMTP (configurable) | Transactional email (registration, verification, order confirmations) | All platforms | Email queued via Laravel Queue for burst capacity |
| SMS Gateway | Critical order updates, OTP verification | Customer App, Admin | Primary + backup provider failover |
| Laravel Horizon | Background job processing and queue monitoring | Backend | Redis-backed queue; Horizon provides real-time queue monitoring dashboard |
| Laravel Echo + Pusher | Real-time WebSocket broadcasting for order notifications | Vendor Portal | Polling fallback implemented for environments without WebSocket support |
| ApexCharts / Filament Charts | Data visualisation in Vendor Portal dashboard | Filament Vendor Portal | Brand-palette colours; accessible data table alternatives provided alongside all charts |
| Driver.js (CDN) | Interactive guided tours in Vendor Portal | Filament Vendor Portal | 5KB gzipped; zero dependencies; CDN delivery |
| GitHub Actions | CI/CD pipeline: PHPUnit tests, Playwright E2E, Lighthouse CI, WCAG accessibility audit | All repositories | Automated on PR; performance budget enforced via Lighthouse CI |

### 3.4 Data Flow: Order Lifecycle

The order lifecycle spans all four platform components and five external services. The following describes the complete journey from customer intent to delivery completion.

**Step 1 — Discovery and Menu Browsing (Customer App → Backend API)**
The customer opens the Flutter app and browses restaurants using the `/api/v1/restaurants/` endpoints. Restaurant data is returned with delivery zone information, operating hours, and ratings. The customer selects a restaurant and browses its menu via `/api/v1/products/`. For package items, the full 3-tier CPFP configuration is returned: Package metadata, PackageConfiguration groups (each with min/max choice constraints), and PackageOption items (each referencing a Food item with its own pricing).

**Step 2 — Package Customization and Cart (Customer App → Backend API)**
The customer selects their configuration options (protein, spice level, sides, add-ons). The app enforces min/max constraints client-side (FR17) and calls the cart API to add the customized item. Price adjustments for premium options are calculated server-side and returned to the app (FR18). Cart operations are persisted server-side linked to the customer's authenticated session.

**Step 3 — Checkout and Payment (Customer App → Stripe → Backend API)**
The customer selects delivery address and time slot, applies any promotional codes, and initiates payment. The Flutter app invokes the Stripe SDK, which handles payment collection without any card data touching the backend. Stripe returns a payment intent or charge token, which the app sends to the backend (`/api/v1/` order placement endpoint). The backend validates the token with Stripe, creates the order record with all customization data, and returns an order confirmation number (FR26). Payment transactions are atomic — partial payment states are not possible.

**Step 4 — Order Notification (Backend → Firebase FCM → Vendor Portal)**
Immediately after order creation, the backend dispatches a `NewOrderReceived` event. The `SendVendorOrderNotification` listener processes this event, triggering two parallel notification paths: a Firebase FCM push to the vendor's mobile device (if using the mobile app) and a Laravel Echo WebSocket broadcast to the vendor's open Filament portal session. If WebSocket is unavailable, the portal falls back to 5-second polling. The vendor receives an audio + visual alert in the browser tab, even if the tab is backgrounded (FR228).

**Step 5 — Order Acceptance and Preparation (Vendor Portal → Backend API → Customer App)**
The vendor sees the order in their real-time order dashboard (FR141). They accept or reject the order (FR142). On acceptance, the backend updates order status and triggers an FCM push notification to the customer ("Your order has been accepted") (FR36, FR203). The vendor updates status to "Preparing" (FR143), triggering another customer notification. The vendor can view complete order details including customization choices and special instructions (FR144).

**Step 6 — Dispatch and Delivery (Vendor Portal → Backend → Customer App)**
When the order is ready for pickup, the vendor marks it "Ready" (FR143). A driver (delivery person) is assigned — either by the platform dispatch or by the vendor's own delivery staff managed through the DeliveryManResource. Driver assignment triggers customer notification. The customer can view driver ETA (FR146). The vendor can view driver location in the portal while awaiting pickup. On delivery, order is marked complete.

**Step 7 — Post-Order (Backend → Customer App → Admin Dashboard)**
The platform calculates and deducts the commission amount from the order total (FR108), crediting the net amount to the vendor's wallet. The customer is prompted to rate the order. Any support issues raised by the customer (FR38–FR39) enter the admin complaint queue (FR87) with full order context — timeline, vendor, driver GPS, photos — enabling support agents to investigate without needing to contact multiple parties (FR88).

**Subscription Orders (Automated Variant):**
For subscription-based orders, the backend subscription scheduler automatically generates orders on the scheduled delivery date (FR155). This bypasses steps 1–3, creating the order directly in the system using the customer's saved package selection, delivery address, and payment method. The rest of the lifecycle (steps 4–7) proceeds identically. The vendor portal distinguishes subscription orders from one-time orders with a visual indicator (FR145). Twenty-four hours before a scheduled subscription delivery, the customer receives a reminder notification (FR32, FR68).

### 3.5 CPFP Package System

CPFP (Curry Pack For People) is CurryDash's primary technical differentiator. It enables vendor-defined meal kit configurations without code changes, delivering HelloFresh-style customization through a structured three-tier data model.

**Tier 1 — Package**
The top-level entity representing a named meal kit product (for example, "Amma's Family Feast" or "Christmas Mutton Curry"). A Package has: a name, description, pricing (base price), images (multiple supported — FR140), availability settings (including seasonal date ranges — FR139), and a flag for subscription-eligibility. Packages are owned by a specific restaurant (vendor data isolation enforced throughout). The `packages` table is the anchor record; all tier 2 and tier 3 records reference it directly or indirectly.

**Tier 2 — PackageConfiguration**
Configuration groups within a package. Each group represents a choice dimension — for example, "Choose your protein," "Choose your spice level," "Choose your sides." Each PackageConfiguration record has: a group title, a minimum selection count (0 = optional, 1+ = required), a maximum selection count, a display order (supporting drag-and-drop reordering — FR137), and a reference to its parent Package. Vendors define as many configuration groups as needed for a given package.

**Tier 3 — PackageOption**
Individual selectable choices within a configuration group. Each PackageOption references a Food item (a record in the `foods` table — the same record used for standalone menu items). This design means that a food item and a package option are not separate product records; a package option simply points to an existing food item and adds a `price_difference` (the surcharge or discount for selecting that option — FR136). This keeps menu management unified and avoids data duplication.

The full hierarchy for a concrete example:

```
Package: "Amma's Family Feast"
│
├── PackageConfiguration: "Choose Your Protein" (min: 1, max: 1)
│   ├── PackageOption → Food: "Chicken Curry"         (price_difference: $0)
│   ├── PackageOption → Food: "Mutton Curry"           (price_difference: +$4)
│   └── PackageOption → Food: "Jackfruit Curry (V)"   (price_difference: $0)
│
├── PackageConfiguration: "Choose Your Spice Level" (min: 1, max: 1)
│   ├── PackageOption → Food: "Melbourne Mild"        (price_difference: $0)
│   ├── PackageOption → Food: "Medium"                (price_difference: $0)
│   └── PackageOption → Food: "Jaffna Fire"           (price_difference: $0)
│
└── PackageConfiguration: "Choose Your Sides" (min: 2, max: 3)
    ├── PackageOption → Food: "Coconut Sambol"        (price_difference: $0)
    ├── PackageOption → Food: "String Hoppers"        (price_difference: +$2)
    ├── PackageOption → Food: "Rice"                  (price_difference: $0)
    └── PackageOption → Food: "Roti"                  (price_difference: $0)
```

In the Filament Vendor Portal, this hierarchy is presented through the PackageResource, which renders the three tiers as nested form sections with live constraint validation. Vendors can reorder configuration groups and options using drag-and-drop controls. The Customer App presents the same hierarchy as a step-by-step customization flow, enforcing constraints at each step before allowing the customer to proceed (FR16–FR19).

The CPFP system is managed through six dedicated Jira project keys that map to the backend implementation: CUR (customer API), CAD (admin dashboard), CAR (vendor portal), CPFP (the package engine itself), PACK (Flutter app stories), and CCW (cross-cutting work). See Section 10 for the complete Jira project routing map.

---

*End of Sections 0–3. Sections 4–10 and Appendix A follow in the complete Master PRD document.*

---

## 4. Personas & User Journeys

CurryDash is a multi-sided platform serving nine distinct types of users. These personas span three broad categories: **Customer-facing** (1 persona), **Vendor-facing** (3 personas), **Admin/Operations** (4 personas), and **Developer** (1 persona). Each persona has been assembled from the research conducted across two source PRDs. Where a persona appears in both PRDs — Dilan Jayawardena (vendor) and Sarah Mitchell (admin) — this document presents the **unified canonical version**, resolving contradictions and merging complementary context rather than duplicating entries. All journeys reference real feature names, route paths, and system components that exist in the codebase or are required by the functional requirements defined elsewhere in this PRD.

---

### Persona Index

| # | Name | Role | Platform(s) |
|---|------|------|-------------|
| P1 | Priya Perera | Customer (diaspora) | Flutter App |
| P2 | Dilan Jayawardena | Established Vendor | Filament Portal + Mobile App |
| P3 | Amara Wickramasinghe | New Vendor (onboarding) | Filament Portal |
| P4 | Kasun Perera | Vendor Staff / Shift Manager | Filament Portal |
| P5 | Sarah Mitchell | Admin Operations Lead | Admin Dashboard |
| P6 | Raj Naidoo | Support Agent | Admin Dashboard |
| P7 | David Chen | Super Admin / Tech Co-founder | Admin Dashboard |
| P8 | Nisha Patel | Accountant | Admin Dashboard |
| P9 | Marcus Chen | Developer (onboarding) | Codebase |

---

### 4.1 Priya Perera — Customer (Diaspora Community Member)

**Background:** Priya is a second-generation Sri Lankan Australian in her early thirties, living in Melbourne's south-east suburbs. She grew up eating home-cooked Sri Lankan food from her grandmother — hoppers on Sunday mornings, Jaffna-style crab curry for birthdays, love cake at New Year. Her long days in professional work leave little time to recreate that food herself, and the generic food delivery platforms she used previously offered shallow, homogenised "curry" categories that bore no resemblance to the food she grew up eating. CurryDash reached her through a friend's Instagram post, and she became one of the platform's most engaged weekly subscribers.

**Goals:**
- Find authentic Sri Lankan food that evokes the specific regional and family cooking she grew up with — not generic "curry"
- Establish a reliable weekly food routine with a subscription that runs without effort
- Customise each order to her exact dietary preferences: protein type, specific spice level, choice of sides
- Share food discoveries with her extended family across Victoria via group chat, acting as an organic referral source
- Receive communication in both English and Sinhala where appropriate, reinforcing cultural connection

**Pain Points / Frustrations:**
- UberEats, DoorDash, and Menulog present "Sri Lankan" restaurants under the same generic "Asian" or "Indian" filter — cultural specificity is absent
- No subscription option exists on existing platforms for cuisines she orders repeatedly every week
- When things go wrong (leaked container, wrong order), existing platforms offer automated responses that feel dismissive rather than human
- App experiences on generic platforms feel built for Western tastes — colours, copy, and imagery carry no cultural resonance

**Technical Comfort:** Medium — comfortable with apps and social media; not a power user; expects intuitive flows without onboarding friction.

**Primary Platform:** Flutter mobile app (customer-facing, CUR API layer).

---

#### Journey 4.1a: First Order — Happy Path

**Trigger:** Friend shares CurryDash Instagram post on a Thursday evening after Priya has had a long day at work.

1. **Discovery.** Priya taps the Instagram link and lands on the app store page. The listing shows culturally resonant imagery — batik patterns, golden turmeric tones, warm photography of actual Sri Lankan dishes. She downloads. *Emotional state: curious and cautiously hopeful.*

2. **Onboarding.** The app opens to a welcome screen with warm Chili Red and Turmeric Gold branding. The onboarding flow does not ask for payment details upfront — it asks where she is and what she's craving. She selects "Casey" as her suburb. *Emotional state: pleasantly surprised by the cultural aesthetic.*

3. **Discovery and browsing.** The home screen surfaces nearby vendors. She sees "Amma's Kitchen — Dandenong — Jaffna Tamil Cuisine" with a photo of a proper string hopper platter. The restaurant has a "Cultural Authenticity Verified" badge. She taps through. *Emotional state: recognition — this looks like real food.*

4. **Package customisation.** She finds the "Weekend Curry Pack" and opens the configuration flow (FR16–FR19). She selects: chicken curry (protein), spice level 4 of 5 ("Colombo style, not tourist style"), coconut sambol, string hoppers. The configuration UI shows visual selectors, not dropdowns — each option has a photo and a short description in plain English with the Sinhala name beside it. *Emotional state: engaged and enjoying the detail.*

5. **Subscription prompt.** At checkout, the app surfaces a subscription option: "Get this every Thursday for $3 less per delivery." She selects weekly Thursday delivery (FR27–FR32). She completes payment via Stripe.

6. **Delivery and product experience.** The order arrives. The packaging has bilingual labels — English on one side, Sinhala on the other. A small QR code links to a short video of Dilan's mother demonstrating the traditional way to eat string hoppers with coconut sambol. *Emotional state: emotional. This is the food she grew up with.*

7. **Referral.** Within ten minutes of eating, she opens her family group chat and sends a photo. "You need to try this. They have proper Jaffna-style everything." Two of her cousins download the app that evening. *Emotional state: pride in sharing something authentically Sri Lankan.*

---

#### Journey 4.1b: Subscription Management and Complaint Handling — Edge Case

**Trigger:** Three months into weekly subscription, Priya's parents are visiting next week. She does not need the delivery.

1. **Pause flow.** She opens the app and navigates to her subscription settings (FR29). Two taps to pause next week's delivery. Before confirming, the app offers a smart alternative: "Your parents are visiting? Upgrade to a Family Pack this week for just $8 more — feeds four." *Emotional state: delighted by the thoughtfulness.*

2. **Upgrade decision.** She upgrades the single week to a Family Pack, choosing not to skip at all. She also adds love cake as an add-on for her father.

3. **Complaint submission.** Two days later, separately, she notices that the previous week's delivery had a container that had leaked in transit — the coconut sambol had spilled over the rice. She navigates to the Help section (FR38–FR39), selects her recent order, and submits a complaint with a photo of the damaged packaging. The form is simple: order auto-populated, issue category pre-set to "Packaging damage," photo upload prominent.

4. **Resolution.** Within a few hours she receives an in-app notification: "We're so sorry, Priya. A credit of $8 has been added to your account, and we've let Amma's Kitchen know so this doesn't happen again." The message is human in tone — not a template. *Emotional state: valued and heard.*

5. **Retention.** She does not cancel. The transparent, proactive communication is specifically what keeps her. She remains a subscriber and later posts a positive review referencing the customer service.

---

### 4.2 Dilan Jayawardena — Established Vendor (Dual Interface)

> **Source note:** Dilan appears in both PRD A (Filament web portal context) and PRD B (mobile vendor app context). This is the unified canonical persona. He uses both interfaces: the Filament portal at `/vendor-portal` for strategic management and configuration, and the Flutter vendor app for daily order fulfilment on the floor.

**Background:** Dilan runs "Amma's Kitchen," a family restaurant in Dandenong that has been serving traditional Jaffna Tamil cuisine for fifteen years. His mother started the restaurant when the family migrated from Sri Lanka in 2005; Dilan manages operations while she oversees the kitchen. He came to CurryDash after a dispiriting experience with UberEats — high commission fees, a platform that treated "grandmother's Christmas mutton curry" as just another "lamb curry," and no subscription capability for his loyal regulars. He was sceptical of CurryDash initially but is now one of the platform's most vocal vendor advocates.

**Goals:**
- Reach the Sri Lankan diaspora across all of Victoria, not just the customers who walk past the restaurant in Dandenong
- Protect the family business legacy by making it digitally sustainable for the next generation
- Reduce food waste through subscription forecasting — being able to tell his mother exactly how much to prepare for Deepavali
- Grow average order value through structured, multi-tier curry pack configurations
- Enable his nephew Kasun to help manage operations without granting inappropriate financial access

**Pain Points / Frustrations:**
- Generic platforms homogenised his menu — cultural specificity was lost in translation
- Commission fees on previous platforms were margin-destroying
- Festival preparation was pure guesswork before CurryDash subscription forecasting
- He is resistant to change when something is working — the Filament migration required careful, respectful handling
- Complex package configurations (protein × spice × sides) were impossible to represent accurately on prior platforms

**Technical Comfort:** Medium — comfortable with business software after learning, but not an early adopter. Trusts systems that respect his time.

**Primary Platform:** Filament vendor portal (`/vendor-portal`) for configuration and analytics; Flutter vendor mobile app for real-time order management.

---

#### Journey 4.2a: Daily Order Fulfilment — Mobile App

**Trigger:** A Thursday lunch service. Dilan is in the kitchen and monitoring orders on his phone.

1. **Order arrival.** Three CurryDash orders arrive simultaneously. The vendor app shows them grouped by delivery time slot (FR46) — all three are for the 12:30–1:00 PM window. He can batch the preparation rather than staggering it.

2. **Batch preparation view.** The orders panel shows: order A (mutton curry, Jaffna fire, string hoppers), order B (chicken curry, mild, rice, vegetarian add-on), order C (subscription order from a regular customer — flagged with a blue "Subscriber" badge). He passes the phone to his mother so she can see at a glance what proteins and sides are needed.

3. **Status updates.** He taps "Preparing" on all three simultaneously. The system automatically pushes notifications to all three customers: "Your order is being prepared by Amma's Kitchen" (FR47). He does not need to compose any message.

4. **Order ready.** Twenty minutes later, he taps "Ready for Pickup." The driver app receives the alert. CurryDash arranges pickup. Dilan does not manage logistics.

5. **Seasonal availability.** He notices Christmas is two months away. From the mobile app he accesses menu management and sets the "Christmas Mutton Curry Pack" to activate December 1 (FR45). He sets a cap of 30 orders per day given preparation limits.

---

#### Journey 4.2b: Filament Portal Migration and Strategic Management

**Trigger:** Sarah from CurryDash ops team demonstrates the new Filament portal at a vendor webinar. Dilan's nephew leans over and whispers: "That bulk edit thing would save you hours every week."

1. **Opt-in.** Dilan returns to the legacy portal and sees the non-intrusive in-app notification: "Your new vendor portal is ready — try it when you're ready." He clicks it reluctantly. A smooth transition animation plays: "Preparing your new experience... your data is coming with you." *Emotional state: nervous but curious.*

2. **First login to Filament.** The dashboard greets him: "Welcome back, Dilan! Your 47 menu items, 156 active orders, and 234 customers are right where you left them." Relief. He navigates to Food Resource — the menu grid shows green indicators (items selling well), yellow badges (photo update needed), and grey (inactive) at a glance. Previously this required drilling into each item individually. *Emotional state: cautious relief.*

3. **Package builder check.** He opens the Package Resource and finds "Amma's Family Feast" intact, now rendered as a visual flowchart showing the protein → spice → sides branching logic. The 3-tier hierarchy (Package → PackageConfiguration → PackageOption) is represented clearly. He checks every tier. Everything is there. *Emotional state: genuine relief.*

4. **Vesak festival update.** Vesak is approaching. He needs to update 12 menu items to mark them as "Festival Special." Old portal: 30 minutes of individual edits. New portal: checkbox-select 12 items, click "Bulk Edit," update the "Festival" flag across all 12 in 90 seconds. *Emotional state: converted.*

5. **Subscription forecasting.** He opens the subscription forecast calendar (FinancialReports page / analytics widgets). It shows 47 active subscribers, with delivery dates mapped across the next four weeks. For Deepavali week, 47 orders are pre-confirmed. He tells his mother exactly how much mutton to buy. No guesswork. Food waste drops by half compared to the previous year.

6. **Escape hatch use.** In week one he switches back to the classic Blade portal once to find the payout settings under "Business Settings" — the menu naming was different. The system remembers his place in the Filament portal when he returns. By week three he has not opened the classic portal in five days.

7. **Testimonial.** Dilan agrees to record a short testimonial for hesitant vendors. His quote: "I didn't want to change. I thought the old system was fine. But this... this makes me feel like a professional."

---

### 4.3 Amara Wickramasinghe — New Vendor / Home Kitchen Operator

**Background:** Amara is a 34-year-old accountant from Colombo who arrived in Melbourne three years ago. During the pandemic, her Sri Lankan comfort cooking — hoppers, kottu, coconut curries — became legendary in her apartment building. When CurryDash launched its home-based and cloud kitchen vendor programme (no shopfront required, no upfront fees, self-service onboarding), she saw her opportunity. She works her accounting day job and runs her food business evenings and weekends. English is her second language; her first is Sinhala. She is moderately comfortable with technology but hates relearning systems she has just got comfortable with.

**Goals:**
- Start a food business without the overwhelming commitment of a physical restaurant (no rent, no staff, no shopfront regulations)
- Serve the Sri Lankan diaspora community craving authentic home-style cooking, specifically the kind that is not available in restaurants
- Grow from zero to a sustainable weekly order volume from her home kitchen
- Eventually expand to a commercial kitchen space when volume justifies it

**Pain Points / Frustrations:**
- Traditional restaurant onboarding platforms assumed she had a shopfront — the requirements did not fit her business model
- Uncertain about what permits and certificates she actually needs as a home-based food operator
- Anxious about technology adoption — she needs systems that guide her rather than expecting her to figure things out
- Time-constrained: day job, two children, cooking evenings; any friction in the portal costs her sleep

**Technical Comfort:** Low-to-medium — comfortable with standard apps and web browsers; needs guided flows and contextual help; does not explore unfamiliar UI independently.

**Primary Platform:** Filament vendor portal (`/vendor-portal`).

---

#### Journey 4.3a: Vendor Registration and First Listing

**Trigger:** Amara sees a Facebook post in a Sri Lankan community group: "CurryDash is now accepting home-based vendors. No upfront fees."

1. **Registration start.** She begins the registration form at 9 PM after putting her children to bed. The form is step-by-step, not a single long page. She enters business name, ABN, contact details, and uploads kitchen photos for the food safety check. The system tells her which documents are required for a home-based operator specifically — different requirements than a restaurant (no shopfront photos, but additional kitchen safety certification required). *Emotional state: hopeful but anxious about getting requirements wrong.*

2. **Missing document detection.** The system identifies that her council permit is missing and provides a direct link to the Casey City Council food business registration page. She bookmarks it. Application submitted by 10:30 PM.

3. **Application tracking.** Two days later, she receives an email notification. Her vendor dashboard shows a progress tracker: "Document Verification" (green checkmark), "Kitchen Assessment" (scheduled Thursday 2 PM). Admin Sarah has left a personal welcoming note in the application comments: "Hi Amara — your paperwork looks great! Looking forward to speaking with you Thursday." *Emotional state: reassured.*

4. **Kitchen assessment.** The video call assessment is easier than expected. Sarah walks her through the CurryDash quality standards, explains what "authentic Sri Lankan food" means to the platform, and helps her plan her initial menu setup.

5. **First listing.** Amara creates her first product: "Amma's Hopper Kit" — a DIY pack with hopper batter, three curry accompaniments, pol sambol, and her grandmother's recipe card. The pricing calculator shows her what similar items sell for and what her net earnings will be after commission. She sets weekly availability (Saturday and Sunday mornings only). The product goes live within 24 hours of approval. *Emotional state: proud.*

6. **First order.** A family in Box Hill orders the weekly hopper kit subscription. They message: "My kids refuse to eat the store-bought ones. Thank you for bringing real hoppers to Melbourne." Amara cries while packing the order. Three months later she is processing 40 orders per week and looking at commercial spaces.

---

#### Journey 4.3b: Filament Portal — First-Time Experience with Guided Tours

**Trigger:** Six months into running her business, processing 40 orders per week, Amara receives an email invitation from Sarah with the subject: "Something special is waiting for you." It is an early access invite to the modernised Filament portal.

1. **First login.** The new portal loads with Turmeric Gold accents and a cleaner layout than the legacy Blade interface. A friendly modal appears: "Welcome to your new kitchen command centre, Amara!" She feels welcomed rather than confronted with new complexity. *Emotional state: cautiously open.*

2. **Onboarding tour begins.** A 6-step onboarding tour activates (powered by Driver.js, FR213). It is not pushy — each step has a "Skip" option visible throughout. Step 1: the dashboard at a glance. Step 2: the orders panel. Step 3: the simplified menu manager. Step 4: analytics. Step 5: quick actions sidebar. Step 6: the Resource Centre widget. By step 3, Amara notices her Hopper Kit is visible on the main screen with an "Edit" button directly accessible — no more three-level drilling. She smiles.

3. **First creation success.** The tour ends with: "Ready to create some magic? Your first task: create a new menu item!" She adds a Sinhala New Year special — "Kavum & Kokis Festival Box." Photo upload is drag-and-drop, the pricing calculator shows profit after commission, and the Seasonal Availability field is immediately visible in the form. She completes the listing in under two minutes. On saving, a brief confetti animation plays, followed by a contextual prompt: "Great job, Amara! Want to see how to make this item part of a package deal?" — triggering the menu management tour (FR214).

4. **Onboarding checklist progress.** The Resource Centre widget shows her onboarding progress: "Complete tour" (done), "Create a menu item" (done), "Customise first package" (next), "Set up holiday hours" (upcoming). It feels like a game. Each completed task triggers a short celebration and a contextual prompt for what comes next.

5. **Tour completion.** After completing all checklist tasks over the following week, the final modal reads: "You did it, Amara! You've mastered your new kitchen command centre." It shows her stats: 8 menu items, 2 packages, 156 orders, 4.9 rating. She shares feedback through the portal: "I was nervous about the change, but this is SO MUCH EASIER. I actually understand my analytics now!" Sarah personally replies three days later.

6. **Training her sister.** Within two weeks, Amara is training her sister to help with the portal — and realises she is not looking at any notes while doing it. "Just follow the tours. They'll take care of you."

---

### 4.4 Kasun Perera — Vendor Staff / Shift Manager

**Background:** Kasun is 22, Dilan Jayawardena's nephew, and the evening shift manager at Amma's Kitchen. He studies business at Monash University during the day and runs the restaurant floor from 4 PM to close. He is not the business owner — he has no need for financial reporting, subscription settings, or strategic analytics. He cares about exactly one thing during a dinner service: getting orders processed correctly, quickly, and without mistakes. He is comfortable with technology and learns operational systems rapidly.

**Goals:**
- Process the dinner rush efficiently with zero order errors
- Handle issues (wrong spice level, damaged delivery, customer call) quickly and calmly
- Provide Dilan with a clear, documented shift summary at end of night without manual effort
- Work within a system that acknowledges his specific role rather than overwhelming him with features he cannot access

**Pain Points / Frustrations:**
- The legacy Blade vendor portal showed him financial settings, analytics dashboards, and menu management tools he could not access — visual clutter created by features that were blocked without explanation
- When he hit a restriction, the system showed an error, not guidance — it felt like being locked out rather than appropriately scoped
- Every order status update required multiple manual steps — accepting, updating kitchen, notifying customer — each separately
- Shift handover previously required screenshotting the order summary and texting it to Dilan

**Technical Comfort:** High — digital native, comfortable with mobile apps and web platforms; needs efficiency, not hand-holding.

**Primary Platform:** Filament vendor portal (`/vendor-portal`) with vendor_employee authentication guard; tablet optimised for kitchen environment.

---

#### Journey 4.4a: Friday Dinner Rush — Order Management

**Trigger:** Friday 6:42 PM. Three CurryDash orders arrive in quick succession.

1. **Dashboard view.** Kasun glances at the order dashboard. Orders are colour-coded: one subscription order (blue — regular customer with delivery preferences already on file), one new customer order (orange "First Order" badge — handle carefully), one modified order with dietary tags (yellow — contains allergen modification notes). *Emotional state: calm, oriented.*

2. **Batch accept.** He taps "Accept All." All three orders queue to the kitchen display with preparation priority assigned based on delivery time slots. One action, not three.

3. **Driver alert.** A notification appears: driver for the subscription order arriving in 12 minutes. Kasun taps to mark that order "Preparing." The system automatically notifies the customer and driver. He does not type anything.

4. **Issue handling.** A customer calls: they received the wrong spice level — their "extra spicy" request was processed correctly in the system, but the wrong container was packed in the kitchen (a human packing error, not a system error). Kasun initiates a replacement order from the portal. The system automatically generates a partial refund and sends the customer a push notification: "We caught a packing error on your order — a replacement is being prepared now." Customer is not waiting on hold; they are already informed. *Emotional state: competent, in control.*

5. **End of rush.** By 9:30 PM: 23 orders processed, 22 on time, 1 issue resolved with customer satisfied. Kasun taps "Generate Shift Report." A formatted summary is created — order count, on-time rate, issues logged, customer calls handled. He adds a note: "Busy night, but new system is way faster." Submits. The report is timestamped and delivered to Dilan's dashboard.

6. **Next morning.** Dilan tells him: "Saw your shift report last night. That was really clear, and I liked the notes." The system has made Kasun's professional contribution visible.

---

#### Journey 4.4b: Role-Based Access — Working Within Permissions

**Trigger:** Dilan tells Kasun the restaurant has switched to the new Filament portal.

1. **Employee login.** Kasun logs in with his vendor_employee credentials. His portal is not the same as Dilan's. It loads three sections: Orders (full access), Menu (view-only), Shift Reports. Financial settings, business analytics, subscription management, and coupon tools are not shown — they are absent from the navigation, not blocked with errors. *Emotional state: relieved — this is actually simpler.*

2. **Permission welcome message.** A brief contextual note appears on the dashboard: "Welcome back, Kasun! You have order management access. Here's what you can do:" — followed by a three-item checklist of his permissions. First time the system has acknowledged who he actually is and what his job is.

3. **Contextual order tour.** On his first login, a tooltip appears: "First time using the new order system? Take a quick 2-minute tour." He accepts — he wants to know the right way to do things before a rush, not discover it by trial and error at 7 PM. The 4-step order management tour (FR216) covers: batch-accepting multiple orders, marking preparation status, handling special requests, contacting customers on issues. Step 4 reads: "You're doing great! Just one more thing..." — the tone acknowledges he is busy.

4. **Subscription escalation.** A customer calls during service about changing their subscription delivery day. Kasun navigates to the Subscription section — he sees a view-only summary with the customer's contact details. There is a "Request Owner Intervention" button. He taps it, types "Customer wants to change delivery day to Saturday," and submits. The system sends Dilan a notification. Kasun tells the customer: "The owner will call you tomorrow morning." The limited access now has a clear escalation path — it feels like a feature, not a restriction.

5. **Repeated pattern.** This same escalation pattern works for coupon requests, refund approvals, and menu change suggestions. Kasun handles the customer interaction; the system routes the decision upward. Three months in, he stops thinking of his limited permissions as a constraint at all.

---

### 4.5 Sarah Mitchell — Admin Operations Lead

> **Source note:** Sarah appears in both PRD A (admin ops lead with vendor approval and quality workflows) and PRD B (admin user doing morning triage). This is the unified canonical persona. The two PRDs are complementary: PRD B defines what Sarah needs to do; PRD A defines how the system supports her doing it.

**Background:** Sarah has been with CurryDash for eight months. Before this role she managed restaurant partnerships for a hotel chain, which gave her both operational rigour and genuine respect for the vendors she oversees. She is drawn to CurryDash's mission — connecting the Sri Lankan diaspora with authentic cuisine — and takes her role as gatekeeper of platform quality seriously. She is responsible for vendor applications, quality monitoring, complaint handling, and the vendor success programme. She works across the Admin Dashboard (CAD) daily.

**Goals:**
- Maintain platform quality standards across all vendors — consistency of experience protects the brand
- Process vendor applications quickly without creating bottlenecks that harm vendor trust
- Intervene early when a vendor is declining — suspension is a last resort, not a first response
- Protect cultural authenticity as CurryDash's primary differentiator
- Ensure customer complaints are resolved before they become churn events

**Pain Points / Frustrations:**
- Must triage three different types of simultaneous issues: new applications, quality decline flags, and active customer complaints
- Cultural authenticity claims require specialist knowledge she does not always have — she needs routing and advisory workflows
- Vendors who start declining need intervention, not just a flag on their profile — the system needs to support a "vendor success" workflow, not just a "suspension" workflow
- Missing documents from vendor applicants create slow back-and-forth loops that delay approvals unnecessarily

**Technical Comfort:** High — daily user of complex business software; values efficiency and information density; not intimidated by data-heavy dashboards.

**Primary Platform:** Admin Dashboard (CAD), Laravel Blade admin views.

---

#### Journey 4.5a: Monday Morning Triage

**Trigger:** Sarah opens the admin dashboard with her coffee on Monday morning.

1. **Overnight summary.** The dashboard shows an overnight digest: 3 new vendor applications pending, 2 vendors with declining ratings flagged by the automated alert system, 1 customer escalation marked high-priority (hygiene concern). She sorts by priority. *Emotional state: focused, familiar routine.*

2. **Hygiene complaint.** The escalation: a customer submitted a photo of damaged packaging from "Spice Route Kitchen" in Footscray. Sarah opens the vendor's profile in the admin dashboard. She checks: this is the first complaint in 3 months from this vendor; average rating is 4.4; the delivery was during last Friday's heavy rainfall. She looks at the driver notes (nothing unusual) and cross-references weather data for Footscray on Friday evening (confirmed heavy rain). She drafts a message to the vendor asking about their packaging process for wet-weather deliveries, schedules a quality check video call for Wednesday, and documents the hypothesis in the case file. System tracks all actions.

3. **Vendor applications.** Three applications in the queue:
   - Amara Wickramasinghe: documents complete, insurance verified, ABN valid, kitchen photos show a clean and organised home kitchen. Sarah schedules the video assessment for Thursday and adds a personal welcome note: "Hi Amara — your paperwork looks great! Looking forward to speaking with you Thursday."
   - Second applicant: food safety certificate missing. System sends an automated request with clear instructions and a template covering exactly what is needed, with a direct link to the relevant accreditation body.
   - Third applicant: menu descriptions appear copied from another platform's listing; photos look North Indian rather than Sri Lankan despite an "authentic Sri Lankan" claim. Sarah flags for cultural authenticity review and adds notes requesting a community advisor assessment before approval.

4. **Declining vendor intervention.** "Curry House Victoria" has received five 2-star ratings in the past seven days, dropping from 4.3 to 3.8. Sarah recognises the pattern: a vendor cutting costs in ways that directly affect food quality. She does not trigger suspension. She schedules a vendor success call, prepares talking points on the long-term cost of reputation damage, and sets a 2-week follow-up reminder.

5. **End of day.** Dashboard shows: 3 applications processed, 2 quality issues under management, 0 critical incidents active, 12 vendors in the pipeline. Platform rating average: 94% positive. *Emotional state: satisfied — nothing fell through.*

---

### 4.6 Raj Naidoo — Support Agent

**Background:** Raj works part-time as a customer support agent from his home in Cranbourne, covering the afternoon shift during the pre-dinner demand surge. He is a former restaurant manager — a background that gives him empathy for both sides of every complaint. He understands that a vendor being called out for "inauthentic" food is a reputational crisis, not just a support ticket. He is one of the platform's best performers: 96% customer satisfaction rating, 14 tickets closed per shift.

**Goals:**
- Resolve tickets with full context — no guessing, no incomplete pictures
- Identify systemic patterns in complaints and escalate them as product issues, not just close them as individual cases
- Protect both customer and vendor interests — a fair outcome for both is the right outcome
- Contribute to the knowledge base so repeat questions can be deflected or self-served
- Maintain his satisfaction metrics while doing the right thing, not just the fast thing

**Pain Points / Frustrations:**
- Complex tickets require cross-referencing order data, vendor data, driver data, and customer history — if the system doesn't surface them together, resolution slows down
- Cultural sensitivity issues (authenticity disputes) require community knowledge he does not have — he needs escalation paths and editorial resources
- Systemic bugs need to be documented and escalated, not just fixed case-by-case; the platform needs a mechanism for this
- Performance metrics create time pressure, but closing a ticket badly is worse than taking an extra ten minutes

**Technical Comfort:** High — comfortable with support tooling, databases, and multi-tab workflows; values keyboard efficiency.

**Primary Platform:** Admin Dashboard (CAD), customer support queue and vendor management views.

---

#### Journey 4.6a: Afternoon Support Shift

**Trigger:** 3:15 PM shift start. Queue shows 6 open tickets.

1. **Delivery dispute.** First ticket: customer claims they never received their order but was charged. Raj opens the case view — it surfaces the full picture simultaneously: order timeline, vendor confirmation with timestamp, driver GPS tracking log, delivery photo. The photo shows food left at "Unit 1"; the customer address notes say "Unit 4." He contacts the delivery partner for confirmation of the GPS record, processes a full refund, and sends the customer a polite note with a suggestion about updating their delivery instructions. Resolution: 6 minutes. *Emotional state: efficient and thorough.*

2. **Cultural authenticity dispute.** Second ticket: vendor "Lakshmi's Kitchen" is upset about a 1-star review claiming her food is "inauthentic." The vendor has 40 years of experience cooking Sri Lankan food. Raj reads the review carefully — the customer appears to be comparing Lakshmi's Sinhalese-style cooking to a different regional style (Tamil Nadu, not Sri Lanka). He responds to the public review with an explanation of regional variations in Sri Lankan cuisine. He flags the review for the community team to add educational context. He calls Lakshmi personally to explain the situation and reassure her. He adds a note to the vendor profile suggesting she specify "Sinhalese-style Colombo cuisine" in her menu descriptions for disambiguation. He adds a new knowledge base entry: "How to handle regional authenticity disputes." *Emotional state: engaged — this is the interesting work.*

3. **Billing bug.** 5:30 PM: a customer was charged twice for a weekly curry pack subscription — the subscription renewed at the same moment the customer placed a one-time manual order, creating a duplicate charge. Raj processes a full refund immediately and adds a 10% credit code as an apology. He documents the reproduction steps (subscription renewal + manual order same timestamp) and escalates to the tech team as a high-priority bug. He adds a note to his shift handover: "Subscription billing edge case — potential bug. Tech team notified. Monitor for recurrence."

4. **Shift close.** By 7 PM: 14 tickets closed, 96% satisfaction. Two systemic issues escalated with full documentation. Three knowledge base entries added. *Emotional state: accomplished.*

---

### 4.7 David Chen — Super Admin / Technical Co-founder

**Background:** David is the technical co-founder of CurryDash. He built the original platform — the codebase carries traces of the architectural decisions he made in the early days. He spends most of his time writing code and architecting new capabilities, but also holds the super admin role: he is responsible for user access control, system configuration, financial auditing, and investor reporting. He has full, unrestricted access to every part of the admin dashboard and the underlying database. He values auditability, operational flexibility, and configuration without code deploys.

**Goals:**
- Keep investor reporting efficient — monthly data exports should be one-click, not an engineering task
- Maintain precise role-based access control — wrong permissions create security exposure or support overhead
- Enable operational configuration changes (new vendor categories, commission rates, document requirements) without requiring engineering deploys
- Maintain a complete, tamper-evident financial audit trail for every vendor transaction
- Review platform security regularly — full access log exports, anomaly detection

**Pain Points / Frustrations:**
- Manual financial ledger investigations are time-consuming but sometimes unavoidable for resolving vendor payout disputes
- Role configuration requires precision — an overly broad role assignment creates either security exposure or unnecessary support tickets
- Platform configuration changes that currently require code changes (adding a vendor category, changing a document requirement) should be operable through the admin UI without touching the codebase

**Technical Comfort:** Expert — software engineer with full access to the codebase and production systems; values CLI-adjacent administrative tooling with complete visibility.

**Primary Platform:** Admin Dashboard (CAD), with direct database access via tooling when required.

---

#### Journey 4.7a: Platform Administration and Monthly Reporting

**Trigger:** First Monday of the month — investor report day.

1. **Investor report export.** David opens the platform metrics dashboard. He generates the monthly export: total GMV, active vendor count, customer retention cohorts, subscription growth. The system packages everything into a spreadsheet formatted to match the investor template. One click, five minutes. Previously this was a two-hour data extraction task. *Emotional state: satisfied.*

2. **New role provisioning.** He onboards a new marketing lead. He opens User Management, creates an account, and assigns the "Marketing" role template — read access to customer analytics and campaign data, write access to promotions, no access to vendor financials or personal data. The role template bundles all permissions; he does not configure each permission individually. He triggers the welcome email flow. The new team member can start immediately.

3. **System configuration update.** Sarah messages him on Slack: CurryDash wants to add a "Cloud Kitchen" vendor type separate from "Restaurant" — it carries different onboarding requirements (no shopfront photos required; additional kitchen safety certification required instead). David opens the System Configuration panel in the admin dashboard, creates the new vendor type with its conditional document requirements, sets it to "Draft," and shares the preview link with Sarah for review before it goes live. No code change required. No deployment needed.

4. **Vendor payout dispute.** A vendor escalates a payout discrepancy directly to David. He opens the vendor's financial ledger in the admin dashboard — a complete, timestamped audit trail of every order, commission deduction, and payout. He finds the issue: a manual adjustment applied incorrectly in the previous month's reconciliation run. He corrects it, triggers a catch-up payment, and documents the fix with before/after screenshots in the audit trail. The audit trail is immutable — the correction is recorded as a new entry, not an edit.

5. **Quarterly security review.** David exports the full admin access log for the past 90 days: every admin action, timestamp, user, and affected record. He reviews for anomalies (none found). Updates the audit documentation and marks the quarterly review as complete.

---

### 4.8 Nisha Patel — Accountant (Vendor Financial Delegate)

**Background:** Nisha runs a small accounting practice in Springvale specialising in hospitality clients. Five of her regular clients are CurryDash vendors — including Dilan Jayawardena. She is not a daily CurryDash user; she visits the platform at specific times: month-end for GST reconciliation, quarterly for BAS preparation, and annually for financial year-end summaries. She accesses the platform under a "Financial Delegate" role granted by each vendor client. Her visits are time-pressured — month-end has fixed deadlines that cannot be pushed.

**Goals:**
- Reconcile CurryDash earnings for each client vendor against their business bank accounts accurately and efficiently
- Prepare GST returns with platform data correctly structured — GST on order value, GST on commission (claimable input tax credit), and platform ABN clearly displayed
- Identify and resolve payout discrepancies before her clients notice them
- Prepare complete annual tax summaries with all supporting documentation for ATO compliance
- Reduce the time spent on data manipulation — platform exports should match her accounting software's import template

**Pain Points / Frustrations:**
- Currently must log into each vendor account separately, one at a time — five separate logins for five clients creates unnecessary repetition
- Financial data export formats sometimes require manual reformatting before they can be imported into her accounting software
- Payout status fields (pending, failed, held) are not always clearly explained — clients call confused about entries they cannot interpret
- Month-end time pressure means any inefficiency in the portal directly costs billable hours

**Technical Comfort:** Medium — comfortable with accounting software, spreadsheets, and standard web portals; not interested in learning system nuances beyond her narrow financial reporting use case.

**Primary Platform:** Admin Dashboard (CAD), financial delegate / accountant access scope.

---

#### Journey 4.8a: Month-End GST Reconciliation

**Trigger:** Third of the month. Nisha's GST return deadline is in four days.

1. **First vendor login.** She logs into Dilan Jayawardena's account using the Financial Delegate access Dilan has granted her. Her dashboard loads a scoped view: Financial Reports, Payout History, Tax Documentation. Menu management, order details (customer personal data), and system settings are not shown. The scope is appropriate.

2. **Monthly statement download.** She downloads the monthly financial statement. The export contains every order with: date, gross order value, GST on order value, CurryDash commission amount, GST on commission (separately itemised for input tax credit claim), and net payout. The platform's ABN is displayed clearly on the statement. The CSV column format matches the import template for her accounting software (MYOB), saving 30 minutes of manual reformatting.

3. **Payout discrepancy.** For one vendor, the downloaded figures do not match the client's bank statement. She opens the payout history table. One payout is marked "Pending — bank detail error" rather than "Completed." The status is clearly labelled with the reason. She advises her client to update their bank BSB in the Business Settings page.

4. **Annual tax summary.** At financial year-end she returns to each of the five vendor accounts and downloads the annual statement: total gross earnings, total commissions paid, GST breakdown by month, platform ABN for GST credits, and a summary formatted for BAS worksheet submission. All five downloads completed in under 20 minutes.

5. **Feature request.** After completing her work, she submits feedback through the portal: "Please add a batch download option — I have five clients and logging in separately each time is slow." Three weeks later she receives an email: the feature has been added to the roadmap. CurryDash's responsiveness to accountant users reinforces her recommendation of the platform to new hospitality clients.

---

### 4.9 Marcus Chen — Developer (New Team Member Onboarding)

> **Source note:** Marcus is a PRD B-exclusive persona. He represents the developer experience of onboarding onto the CurryDash codebase and contributing effectively. He is distinct from the PRD A team profiles (Ramesh/backend-dev, Ruchiran/mobile-dev, Kasun/qa-lead) — those describe team members operating within established workflows, while Marcus represents the first-day experience of a developer encountering the project cold.

**Background:** Marcus is a senior Flutter developer joining the CurryDash engineering team. It is his first day. He is experienced enough to work independently once oriented — he does not need hand-holding on the technology stack — but without good project orientation he will waste days on environment setup, inconsistent patterns, and wrong assumptions about where things live. The quality of his onboarding experience directly determines how quickly he becomes a productive contributor.

**Goals:**
- Set up a working development environment and see the app build successfully within the first two hours
- Understand the project structure, naming conventions, and architectural patterns before writing any code
- Implement features correctly on first attempt — following established patterns, not discovering them through code review feedback
- Have a PR approved and merged on his first day of implementation work
- Build confidence in the codebase so he can extend it without breaking things

**Pain Points / Frustrations:**
- Without well-maintained documentation, environment setup becomes trial-and-error archaeology
- Without pre-configured Jira stories with complete acceptance criteria, developers solve the wrong problem or miss key requirements
- Without pre-commit hooks enforcing code style and lint rules, style issues consume code review capacity that should be spent on logic
- Without a clear test suite structure, developers do not know what testing patterns are expected

**Technical Comfort:** Expert — senior Flutter developer; comfortable with CLI tooling, Git workflows, and CI/CD pipelines; self-sufficient once oriented.

**Primary Platform:** Local development environment, with interfaces across the full codebase: Flutter app, Laravel backend, and the PACK Jira project.

---

#### Journey 4.9a: Day One — Environment Setup and First Contribution

**Trigger:** Marcus's first day. He has been given access to the GitHub repository and the Jira workspace.

1. **Repository orientation.** He clones the repository and opens `CLAUDE.md` at the root. The file describes the full project structure: the `app/CentralLogics/` orchestration layer, the multi-guard authentication model, the Filament vendor portal at `/vendor-portal`, the nWidart Laravel Modules system, and the six Jira projects (CUR, CAD, CAR, CPFP, PACK, CCW). He understands within ten minutes where the major components live and how they relate. He opens `docs/architecture-solution.md` for deeper architectural context. *Emotional state: oriented.*

2. **Environment setup.** He follows the `CLAUDE.md` build commands. `composer install && npm install` resolves cleanly. `.env.example` is well-documented with every required key annotated. `php artisan key:generate && php artisan migrate && php artisan db:seed` runs without errors. The Laravel development server starts. `npm run dev` compiles assets. Total setup time: under one hour. *Emotional state: confident — this is a well-maintained codebase.*

3. **Jira story review.** He checks the PACK Jira project and finds his assigned story. The story has: a clear title, user story format, 5–7 acceptance criteria in testable form, relevant code file references, story points, and links to related FRs in the PRD. He does not need to ask anyone what he is supposed to build or what "done" looks like.

4. **Test suite review.** Before writing any code, he runs `php artisan test` to understand the existing test patterns. He sees the 547 PHPUnit tests passing. He opens `tests/Feature/` and reads two or three existing test files to understand the conventions: `DatabaseTransactions` (not `RefreshDatabase`), the `DOMAIN_POINTED_DIRECTORY` constant, the Docker test execution context (`docker exec currydash-app sh -c "./vendor/bin/phpunit ..."`). He notes the `phpunit.xml` sets `FEATURE_FILAMENT_VENDOR=true` for the Filament test suite.

5. **Implementation.** He implements the feature following the established controller pattern — business logic in `app/CentralLogics/` or a Trait, not in the controller directly. He uses `Helpers::error_processor()` for validation error formatting and `Helpers::get_full_url()` for image URL generation. He writes PHPUnit tests alongside the implementation.

6. **Pre-commit gate.** He runs `git commit`. The pre-commit hook triggers `./vendor/bin/pint` — Laravel Pint catches a trailing comma style issue. It auto-fixes and prompts him to re-stage. He re-stages and commits cleanly. The style issue never reaches code review. *Emotional state: appreciative — the tooling is protecting him.*

7. **PR merged same day.** He opens a pull request to the `UAT` branch. The CI pipeline runs tests (all passing). The reviewer approves with one minor comment about a variable name. Marcus addresses it and the PR is merged before end of day. *Emotional state: accomplished. He has shipped code on day one.*

---

### Summary: Persona to Feature Requirements Cross-Reference

| Persona | Key Features Driven | FR References |
|---------|---------------------|---------------|
| P1 Priya | Customisation, subscription, bilingual packaging, complaint photo upload | FR6–FR10, FR16–FR19, FR27–FR32, FR38–FR41, FR67–FR70 |
| P2 Dilan | Filament portal, package builder, subscription forecasting, bulk edit, escape hatch, mobile order management | FR121–FR160, FR213–FR217 |
| P3 Amara | Vendor onboarding wizard, guided tours, Resource Centre, home-based vendor type, celebration milestones | FR99, FR103, FR124–FR131, FR213–FR214 |
| P4 Kasun | Role-based access, vendor_employee guard, view-only scoping, escalation workflow, shift report | FR96–FR102, FR119, FR216 |
| P5 Sarah | Vendor approval workflow, cultural authenticity flagging, quality intervention, platform health dashboard | FR71–FR89 |
| P6 Raj | Support ticket with full context view, refund processing, cultural dispute escalation, knowledge base | FR83–FR89 |
| P7 David | Super admin, role templates, system configuration, financial audit trail, access log export | FR96–FR107, FR207–FR212 |
| P8 Nisha | Financial delegate access, GST-structured exports, payout status, annual tax summary, accountant batch view | FR103–FR107, FR148–FR155 |
| P9 Marcus | Developer documentation, CLAUDE.md, Jira story completeness, pre-commit hooks, test infrastructure | FR53–FR66, NFR-B-53 to NFR-B-60 |

---

*End of Section 4*

---

## 5. Functional Requirements

This section contains all functional requirements for the CurryDash platform. FR numbers are the canonical identifiers — all Jira tickets, test cases, and implementation stories reference these numbers. No other FR numbering scheme takes precedence. See Appendix A for the cross-reference from legacy FR numbers in the individual PRDs (PRD A and PRD B) to these canonical Master PRD numbers.

Requirements in this section cover four platform domains and a cross-cutting layer:

- **FR1–FR70:** Customer App (Flutter) — the consumer-facing mobile and web application
- **FR71–FR120:** Admin Dashboard (Laravel Blade) — the internal operations and platform management portal
- **FR121–FR160:** Vendor Portal (Filament 3.x) — the vendor-facing management interface, currently undergoing modernization
- **FR161–FR200:** Backend APIs — the REST API layer serving all client applications
- **FR201+:** Cross-Cutting Requirements — notifications, payments, system configuration, UX, and feature flags

### FR Status Key

```
✅ Implemented  — Fully built, tested, and in production or production-ready
🔄 In Progress  — Under active development or partially implemented
📋 Planned      — Defined and scheduled but not yet implemented
```

---

### 5.1 Customer App — Flutter (FR1–FR70)

These 70 requirements govern the Flutter-based consumer-facing application for iOS, Android, and Web. The app serves CurryDash customers — primarily Sri Lankan diaspora in Victoria, Australia — who discover, order, and receive food from CurryDash vendors. The application is built on a Flutter 3.4.4+ cross-platform codebase using GetX state management and a feature-first clean architecture.

The Customer App is the primary revenue-generating surface of the platform. It connects to 100+ backend API endpoints delivered by the Admin-Seller Portal (Laravel 10.x). Phase 1 of the Flutter initiative is a brand transformation from the commercial base codebase into a distinct, market-ready CurryDash product. New consumer features (beyond the existing codebase capabilities) are a Phase 2 and beyond effort.

---

#### 5.1.1 Brand Identity (FR1–FR5)

**FR1** — System displays CurryDash branding (name, logo, colors) across all screens. No legacy commercial branding shall be visible to end users.

*Platform: Flutter App | Jira: PACK | Status: 🔄*

**FR2** — System displays the CurryDash app icon on device home screens and app store listings on iOS and Android.

*Platform: Flutter App | Jira: PACK | Status: 📋*

**FR3** — System displays the CurryDash splash screen during app initialization, using the Turmeric Gold-led Sri Lankan spice-inspired color palette.

*Platform: Flutter App | Jira: PACK | Status: 📋*

**FR4** — System removes all legacy commercial codebase references from all user-visible interfaces, including text, images, and metadata.

*Platform: Flutter App | Jira: PACK | Status: 🔄*

**FR5** — System applies the consistent CurryDash color scheme throughout the application. Color constants are centralized in `lib/util/colors.dart`. The Turmeric Gold-led palette with Sri Lankan spice-inspired tones is applied across all theme files and UI components.

*Platform: Flutter App | Jira: PACK | Status: 🔄*

---

#### 5.1.2 Customer Account Management (FR6–FR10)

**FR6** — Customers can create an account using email, phone number, or social login (Google, Apple).

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR7** — Customers can authenticate using saved credentials or biometric authentication (fingerprint, Face ID) on supported devices.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR8** — Customers can manage their profile information including display name, profile photo, and dietary preferences.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR9** — Customers can save and manage multiple delivery addresses, with the ability to set a default address.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR10** — Customers can save and manage payment methods for faster checkout on future orders.

*Platform: Flutter App | Jira: CUR | Status: ✅*

---

#### 5.1.3 Restaurant Discovery and Browsing (FR11–FR15)

**FR11** — Customers can browse available restaurants filtered by their current location or a selected delivery address, showing only vendors that deliver to that area.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR12** — Customers can search for restaurants by name, cuisine type, or specific dish name. Search results return within 1 second of query submission.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR13** — Customers can view a restaurant detail page including average customer rating, operating hours, estimated delivery time, delivery fee, and minimum order value.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR14** — Customers can browse the full menu of a selected restaurant, including all food items and curry pack packages, organized into categories.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR15** — Customers can view the full detail page for a curry pack package, including configuration options, included items, pricing, and available customizations.

*Platform: Flutter App | Jira: CUR | Status: ✅*

---

#### 5.1.4 Package Customization — CPFP (FR16–FR20)

**FR16** — Customers can select configuration options for curry packages, including but not limited to: protein choice, spice level (1–5 scale), sides selection, and dietary restriction accommodations.

*Platform: Flutter App | Jira: CUR / CPFP | Status: ✅*

**FR17** — The system enforces minimum and maximum selection constraints per configuration group as defined by the vendor. Customers cannot proceed past a configuration group without satisfying the required selection count.

*Platform: Flutter App | Jira: CUR / CPFP | Status: ✅*

**FR18** — The system calculates and displays real-time price adjustments as customers select package options. Price changes from option-level modifiers are visible before the customer adds the item to their cart.

*Platform: Flutter App | Jira: CUR / CPFP | Status: ✅*

**FR19** — Customers can view a complete customization summary — all selected options and the final price — before adding the customized package to their cart.

*Platform: Flutter App | Jira: CUR / CPFP | Status: ✅*

**FR20** — Vendors can define package configurations (option groups, choices, constraints, and pricing modifiers) via the vendor portal without requiring code changes. The customer app renders vendor-defined configurations dynamically.

*Platform: Flutter App + Backend | Jira: CUR / CPFP | Status: ✅*

---

#### 5.1.5 Cart and Checkout (FR21–FR26)

**FR21** — Customers can add customized packages and individual food items to a cart. Cart operations (add, update, remove) complete within 500ms.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR22** — Customers can modify cart contents including changing item quantity, editing customization options on an existing cart item, or removing items entirely.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR23** — Customers can apply promotional codes or discount vouchers to their cart. The system validates the code and displays the adjusted total before checkout confirmation.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR24** — Customers can select a delivery address from their saved addresses or enter a new one, and select a preferred delivery time slot where the vendor offers time-slot delivery.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR25** — Customers can complete payment using a saved payment method or a new payment method entered at checkout. The system supports all configured payment gateways.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR26** — The system confirms a successfully placed order and provides the customer with an order confirmation number, estimated delivery time, and a summary of the order placed.

*Platform: Flutter App | Jira: CUR | Status: ✅*

---

#### 5.1.6 Subscription Management (FR27–FR32)

**FR27** — Customers can subscribe to recurring curry pack deliveries from a vendor, establishing an ongoing relationship with automatic order generation on a defined schedule.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR28** — Customers can select their subscription frequency (weekly, bi-weekly, monthly) and preferred delivery day when setting up a subscription.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR29** — Customers can pause or skip one or more upcoming subscription deliveries. The pause flow requires no more than two taps to complete. The system may offer an alternative (e.g., upgrade to family pack) before confirming a skip.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR30** — Customers can modify their active subscription's package selection, customization options, and delivery preferences without cancelling and restarting the subscription.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR31** — Customers can cancel a subscription. The system requires a confirmation step and communicates the cancellation effective date clearly.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR32** — The system sends reminder notifications to subscribers in advance of a scheduled delivery, providing the customer an opportunity to modify, skip, or pause before the delivery is generated.

*Platform: Flutter App | Jira: CUR | Status: ✅*

---

#### 5.1.7 Order Tracking and Delivery (FR33–FR37)

**FR33** — Customers can view the real-time status of an active order, progressing through the workflow: confirmed, preparing, ready for pickup, driver assigned, in transit, delivered.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR34** — Customers can view their complete order history with full order details, including items ordered, customizations selected, total paid, and delivery date.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR35** — Customers can reorder from a previous order, pre-populating the cart with the same items and customizations from that order for convenience.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR36** — The system sends push notifications for order status changes including: order confirmed, order being prepared, order ready for pickup, driver assigned, and order delivered.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR37** — Customers can contact CurryDash support regarding an active order directly from the order tracking screen, providing the support agent with the full order context automatically.

*Platform: Flutter App | Jira: CUR | Status: ✅*

---

#### 5.1.8 Customer Support (FR38–FR41)

**FR38** — Customers can report issues with a delivered or in-progress order, including uploading photographic evidence (e.g., damaged packaging, incorrect items). Photo upload is available via device camera or photo library.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR39** — Customers can view the status and history of their submitted support tickets, including any responses from the support team.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR40** — The system routes customer issue reports to the appropriate support queue based on issue type (e.g., refund requests, quality complaints, delivery issues).

*Platform: Flutter App + Backend | Jira: CUR | Status: ✅*

**FR41** — Support staff can view complete customer issue reports with attached photos and respond directly to the customer through the admin dashboard.

*Platform: Backend / Admin | Jira: CAD | Status: ✅*

---

#### 5.1.9 Customer Profile and History (FR42–FR47)

*Note: FR42–FR47 in PRD B cover vendor management capabilities as viewed by a vendor operating through the customer-facing app or a mobile vendor interface. These requirements overlap with the Vendor Portal (Section 5.3) but are documented here as they originate in the PRD B Flutter codebase context.*

**FR42** — Vendors can manage their restaurant profile and operating hours through the platform interface.

*Platform: Flutter App (vendor view) | Jira: CUR | Status: ✅*

**FR43** — Vendors can create and edit menu items and curry pack packages through the platform interface.

*Platform: Flutter App (vendor view) | Jira: CUR | Status: ✅*

**FR44** — Vendors can define package configurations and pricing including option groups, choices, and price modifiers.

*Platform: Flutter App (vendor view) | Jira: CUR / CPFP | Status: ✅*

**FR45** — Vendors can set item availability and configure seasonal offerings with start and end date constraints.

*Platform: Flutter App (vendor view) | Jira: CUR | Status: ✅*

**FR46** — Vendors can view incoming orders grouped by delivery time slot to facilitate efficient batch preparation.

*Platform: Flutter App (vendor view) | Jira: CUR | Status: ✅*

**FR47** — Vendors can update order status (preparing, ready for pickup). Status updates automatically trigger customer and driver notifications.

*Platform: Flutter App (vendor view) | Jira: CUR | Status: ✅*

---

#### 5.1.10 Admin Operations — Mobile Context (FR48–FR52)

*Note: FR48–FR52 in PRD B describe admin-facing capabilities. The canonical implementations are in Section 5.2 (Admin Dashboard). These requirements are carried here to preserve the original PRD B numbering.*

**FR48** — Admins can view the platform dashboard with key operational metrics including active orders, vendor count, customer count, and revenue summary.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR49** — Admins can view and manage the customer complaint queue, with access to full order context and vendor history for each complaint.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR50** — Admins can view vendor performance metrics including average rating, order fulfillment rate, and complaint frequency.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR51** — Admins can manage vendor status including activating, pausing, and suspending vendor accounts.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR52** — Admins can create and manage promotional campaigns including discount codes, banner promotions, and targeted offers.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

---

#### 5.1.11 Developer and Project Management Infrastructure (FR53–FR66)

*Note: FR53–FR66 are PRD B requirements for the development workflow initiative itself — the tools, documentation, and processes that enable the Flutter engineering team to build and maintain the CurryDash app.*

**FR53** — Developers can access comprehensive setup documentation enabling a new team member to be productive within their first day. Setup time target: under 1 hour to a working development environment.

*Platform: Flutter App (dev tooling) | Jira: PACK | Status: ✅*

**FR54** — Developers can find their assigned Jira stories in the PACK project with complete acceptance criteria, story points, priority, and code references.

*Platform: Project Management | Jira: PACK | Status: ✅*

**FR55** — Developers can run automated tests to validate code changes before submission. Test suite covers critical paths including order flow, package customization, and subscription management.

*Platform: Flutter App | Jira: PACK | Status: 🔄*

**FR56** — Developers can validate changes locally via mobile emulator (iOS Simulator, Android Emulator) or browser (Flutter Web).

*Platform: Flutter App | Jira: PACK | Status: ✅*

**FR57** — The system provides pre-commit quality gates (linting, formatting, analyzer checks) that catch style issues before they reach code review.

*Platform: Flutter App (CI/CD) | Jira: PACK | Status: 📋*

**FR58** — The team can view all work items in Jira with proper categorization by epic, type, and component.

*Platform: Project Management | Jira: PACK | Status: ✅*

**FR59** — Stories contain all required fields: story points, priority, due dates, and acceptance criteria with measurable completion criteria.

*Platform: Project Management | Jira: PACK | Status: ✅*

**FR60** — The team can track story status through the development lifecycle: Backlog, In Progress, In Review, Done.

*Platform: Project Management | Jira: PACK | Status: ✅*

**FR61** — The team can access story templates for consistent, complete story creation following established patterns.

*Platform: Project Management | Jira: PACK | Status: ✅*

**FR62** — QA can execute Playwright automated tests for the Flutter web application covering critical user journeys.

*Platform: Flutter Web | Jira: PACK | Status: 📋*

**FR63** — QA can execute tests on mobile emulators for iOS and Android platforms to validate mobile-specific behavior.

*Platform: Flutter App | Jira: PACK | Status: 📋*

**FR64** — QA can follow documented manual testing checklists for scenarios not covered by automation.

*Platform: Flutter App | Jira: PACK | Status: 📋*

**FR65** — The system runs automated tests as part of the build process, blocking merges when tests fail.

*Platform: Flutter App (CI/CD) | Jira: PACK | Status: 📋*

**FR66** — Test results are visible and actionable for the development team via a CI dashboard.

*Platform: Flutter App (CI/CD) | Jira: PACK | Status: 📋*

---

#### 5.1.12 Notifications (FR67–FR70)

**FR67** — The system sends push notifications for order lifecycle updates including: order confirmed, order being prepared, order delivered. Notifications are delivered within 30 seconds of the triggering event via Firebase Cloud Messaging (FCM).

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR68** — The system sends push notifications for upcoming subscription reminders, notifying the customer at least 24 hours before a scheduled recurring delivery is generated.

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR69** — The system sends push notifications for promotional offers and campaign announcements. Promotional notifications are delivered to opted-in customers via the Marketing notification channel (Android 8.0+).

*Platform: Flutter App | Jira: CUR | Status: ✅*

**FR70** — Customers can manage their notification preferences per category (order updates, subscription reminders, promotions) with granular opt-in and opt-out controls.

*Platform: Flutter App | Jira: CUR | Status: ✅*

---

### 5.2 Admin Dashboard — Laravel (FR71–FR120)

These requirements govern the Laravel Blade-based admin dashboard used by CurryDash platform administrators, operations team members, support agents, and accountants. The Admin Dashboard is an existing production system serving internal operators; the majority of these requirements are fully implemented. The dashboard provides the operational backbone for vendor onboarding, quality control, financial management, and platform configuration.

The admin portal is accessible at `/admin` and is protected by the `auth:admin` guard with role-based access control. It is NOT in scope for Filament modernization in the current initiative (Phase 4c, deferred).

---

#### 5.2.1 Vendor Management and Approval (FR71–FR84)

**FR71** — Admin can create subscription plan templates with defined features, pricing tiers, and associated entitlements for vendor access to the platform.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR72** — Admin can manage trial period configurations for subscription plans, including trial duration and automatic conversion behavior.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR73** — Admin can view the platform-wide metrics dashboard including total GMV, active vendor count, customer acquisition rates, and subscription growth.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR74** — Admin can view geographic distribution of orders by suburb and delivery zone, enabling analysis of demand concentration and market expansion opportunities.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR75** — Admin can view subscription versus on-demand order ratios to monitor the business model composition and subscription growth trajectory.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR76** — Admin can generate and export platform-wide financial reports including gross revenue, net revenue after commission, payout totals, and refund summaries.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR77** — Admin can view the queue of pending vendor applications sorted by submission date, application completeness, and flagged risk indicators.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR78** — Admin can approve or reject vendor applications with the ability to add approval or rejection notes that are communicated to the applicant.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR79** — Admin can view and edit vendor profiles including business details, document status, operating hours, delivery zones, and cuisine categories.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR80** — Admin can suspend or reactivate vendor accounts, with suspension immediately halting the vendor's visibility in the customer app and disabling order acceptance.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR81** — Admin can search and filter vendors by status (active, pending, suspended), delivery zone, cuisine type, and performance rating.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR82** — Admin can view vendor performance metrics and ratings history including average rating trend, order fulfillment rate, complaint frequency, and response time.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR83** — Admin can flag vendors for quality review, attaching case notes and evidence (e.g., customer complaint photos, rating trend data) to a vendor quality review case.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR84** — Admin can schedule quality check assessments including video assessment appointments, with status tracking visible in the vendor's application record.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

---

#### 5.2.2 Order Administration (FR85–FR86)

**FR85** — Admin can monitor all platform orders with search and filter capabilities by vendor, status, date range, delivery zone, and order type (subscription vs on-demand).

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR86** — Admin can intervene in order issues including: cancelling orders, issuing full or partial refunds, reassigning delivery staff, and adding order notes for the vendor or driver.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

---

#### 5.2.3 Customer Support and Complaint Management (FR87–FR93)

**FR87** — Support agents can view the customer complaint queue with filtering by issue type, priority, vendor, and complaint age. The queue displays unresolved complaints requiring action.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR88** — Support agents can view the complete context for any complaint, including: full order timeline, vendor details, delivery staff GPS tracking history, delivery photo (if taken), and all previous communications related to the order.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR89** — Support agents can process refunds and account credits for customers directly from the complaint management interface, with the option to apply a discount code for customer retention.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR90** — Support agents can respond to public customer reviews on behalf of vendors to provide platform-level context, correct misinformation, or communicate cultural nuance (e.g., regional Sri Lankan cuisine variations).

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR91** — Support agents can escalate issues to the appropriate internal team (product, operations, finance) with documented escalation reasons and tracked escalation status.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR92** — Support agents can document resolution in case notes that are permanently attached to the complaint record for audit trail and knowledge management purposes.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR93** — Support agents can view and update knowledge base articles to document resolutions for recurring issue patterns, reducing repeat resolution time.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

---

#### 5.2.4 User and Role Management (FR94–FR100)

**FR94** — Super admin can create and manage admin user accounts, including setting account status (active, suspended) and triggering password reset workflows.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR95** — Super admin can define admin roles with specific module-level permissions (read, write, no access) for each area of the admin dashboard.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR96** — Super admin can assign roles to admin users. Role assignment immediately takes effect for the user's active session.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR97** — Admin accounts can be scoped to specific delivery zones, providing zone-filtered access to vendor and order data relevant to their assigned geography.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR98** — Vendor owners can grant delegated staff access to the vendor portal with permission levels limited to a defined subset of the vendor owner's own capabilities.

*Platform: Admin Dashboard + Vendor Portal | Jira: CAD / CAR | Status: ✅*

**FR99** — An accountant role can access financial reports and payout data without access to operational features (order management, menu management, vendor settings).

*Platform: Admin Dashboard + Vendor Portal | Jira: CAD / CAR | Status: ✅*

**FR100** — The system logs all admin actions including user identity, timestamp, action type, and affected record. Audit logs are immutable and exportable for security review.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

---

#### 5.2.5 Financial Management — Admin-Facing (FR101–FR108)

**FR101** — Vendors can view their earnings and commission breakdowns in the vendor portal, showing gross order value, platform commission deducted, and net earnings per period.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR102** — Vendors can view their complete payout history including payout status (completed, pending, failed), payout date, and bank account details used for the transfer.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR103** — Vendors can request withdrawals from their wallet balance to their registered bank account, subject to minimum withdrawal thresholds and payout schedule.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR104** — Vendors can download monthly statements in accounting-software-compatible format (CSV, XLSX) with GST breakdowns showing the GST component on both order value and platform commission.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR105** — Vendors can generate annual tax summary documents including the platform's ABN (for vendor GST credit claims), total annual earnings, total commissions, and a month-by-month breakdown.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR106** — Admin can view and manage vendor payout requests, with the ability to approve, hold, or reject withdrawal requests and record a reason for any hold or rejection.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR107** — Admin can process manual adjustments to vendor account balances with mandatory documentation of the adjustment reason for audit trail purposes.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR108** — The system automatically calculates and deducts the applicable platform commission rate from each order at time of fulfillment, crediting the net amount to the vendor's wallet balance.

*Platform: Backend | Jira: CAD | Status: ✅*

---

#### 5.2.6 Platform Configuration (FR109–FR112)

*Note: FR109–FR112 are reserved in the FR71–FR120 Admin Dashboard range for additional admin-facing platform configuration requirements that may be defined in future PRD iterations. The canonical configuration FRs are captured in Section 5.5.3 (FR207–FR212) as cross-cutting requirements.*

**FR109** — *Reserved for future use.*

**FR110** — *Reserved for future use.*

**FR111** — *Reserved for future use.*

**FR112** — *Reserved for future use.*

---

#### 5.2.7 Access Control Summary (FR113–FR120)

*Note: FR113–FR120 are reserved in the Admin Dashboard range. Additional access control and platform administration requirements may be allocated here in future revisions as the platform scales.*

**FR113** — *Reserved for future use.*

**FR114** — *Reserved for future use.*

**FR115** — *Reserved for future use.*

**FR116** — *Reserved for future use.*

**FR117** — *Reserved for future use.*

**FR118** — *Reserved for future use.*

**FR119** — *Reserved for future use.*

**FR120** — *Reserved for future use.*

---

### 5.3 Vendor Portal — Filament 3.x \[IN-PROGRESS\] (FR121–FR160)

> **IMPLEMENTATION STATUS — IN PROGRESS**
>
> The Filament Vendor Portal is a modernization of the legacy Blade vendor portal.
> Wave 0–4 Complete: 547 PHPUnit tests passing, 315 E2E tests passing (116 baseline + 199 new Sprint 18 tests).
> Wave 5 Remaining: Story 18.4 (Documentation) + PR to UAT branch — marked done as of commit 6927e1b.
>
> Legacy Blade portal (`/vendor`) remains available as fallback at all times.
> Filament portal is at `/vendor-portal` — gated by `FEATURE_FILAMENT_VENDOR` environment flag.
> Per-vendor opt-in is controlled by the `filament_portal_enabled` column on the vendors table.

These requirements govern both the legacy Blade vendor portal (the original implementation) and the modernized Filament 3.x vendor portal. All FR121–FR160 requirements are functional in the legacy system. The Filament-suffixed variants (e.g., FR121-F1) describe the Filament-specific implementations that layer on top of or replace the Blade equivalents for vendors who have opted into the new portal.

The Vendor Portal serves restaurant owners, home kitchen operators, shift managers, and accountants. It is protected by the `auth:vendor` and `auth:vendor_employee` session guards.

---

#### 5.3.1 Restaurant Profile and Settings (FR121–FR128)

**FR121** — Vendor can register for an account with full business details and contact information. The registration flow supports both established restaurant operators and home-based/cloud kitchen operators.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

> **FR121-F1** — Vendor can access the modernized dashboard at `/vendor-portal` using their existing login credentials without re-registration. *Jira: CAR | Status: ✅*
>
> **FR121-F2** — The Filament vendor panel displays the CurryDash brand theme consuming 130+ design tokens from `docs/brand-strategy/design-tokens/` via `tailwind.config.vendor-portal.js`. The 60-30-10 color rule is enforced: Coconut Cream (#FFF8DC) on 60% of surfaces, Turmeric Gold (#E6B04B) on 30% of accents and CTAs, Chili Red (#C5351F) and Curry Leaf Green (#4A7C59) on 10% for alerts and success states. Default background: Coconut Cream. Default text: Cinnamon Brown (#5D4037). Typography: Poppins for headings, Roboto for body. Focus-visible ring: 3px solid Turmeric Gold on all interactive elements. WCAG constraint: white text must never appear on Turmeric Gold backgrounds (contrast ratio 1.98:1 fails WCAG AA). *Jira: CAR | Status: ✅*
>
> **FR121-F3** — Vendor employees can access the Filament panel with role-based permissions matching the existing `vendor_employee` guard. The accessible resources and pages are restricted based on the employee's assigned role. *Jira: CAR | Status: ✅*
>
> **FR121-F4** — The system enforces vendor data isolation in all Filament resources. Vendor A cannot access, view, or modify vendor B's data through any Filament interface. Isolation is enforced via `BaseScopedResource` with `restaurant_id` scoping on all queries. *Jira: CAR | Status: ✅*
>
> **FR121-F5** — The existing `/vendor` Blade portal remains fully functional when the Filament portal is active. Vendors can toggle between portals at any time. Both portals read and write from the same underlying data. *Jira: CAR | Status: ✅*

**FR122** — Vendor can upload required registration documents including ABN certificate, food safety certification, and public liability insurance. The system tracks upload status per document type.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR123** — Vendor can view the real-time status of their application through the onboarding process, with a clear stage-by-stage progress indicator (e.g., Document Verification — green, Kitchen Assessment — Scheduled).

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR124** — Vendor can complete and maintain their restaurant profile including restaurant name, description, cuisine type, brand logo, cover image, and cultural heritage story.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

> **FR124-F1** — Vendor can view and edit their restaurant profile as a single-record Filament Infolist resource at `/vendor-portal/restaurant-profile`. Profile is read-only by default with an Edit action available to vendor owners. *Jira: CAR | Status: ✅*

**FR125** — Vendor can set restaurant operating hours per day of week and configure off-days (public holidays, temporary closures) with date-range support.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR126** — Vendor can define delivery zones and delivery radius for their restaurant, with zone-based minimum order values and delivery fees.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR127** — Vendor can add and manage multiple restaurant locations under a single vendor account for multi-site operators.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR128** — Vendor staff can be granted delegated access with specific permissions appropriate to their operational role (shift manager, kitchen staff, accountant delegate).

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

> **FR128-F1** — Vendor can manage delivery staff through a dedicated Filament resource (`DeliveryManResource`) with status tracking (online, offline, on-delivery). *Jira: CAR | Status: ✅*
>
> **FR128-F2** — Vendor can manage discount coupons through Filament with date-range pickers, usage limit configuration, and per-customer redemption tracking. *Jira: CAR | Status: ✅*
>
> **FR128-F3** — Vendor can manage employee accounts and assign custom roles with granular permission sets through Filament's `VendorEmployeeResource`. *Jira: CAR | Status: ✅*

---

#### 5.3.2 Menu Management — Foods, Categories, Add-ons (FR129–FR132)

**FR129** — Vendor can create, edit, and delete food items with descriptions, images (multiple images supported), pricing, and nutritional or allergen information.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

> **FR129-F1** — Vendor can view all their food items in a searchable, sortable Filament table with thumbnail images. The table supports filtering by category, availability status, and creation date. *Jira: CAR | Status: ✅*
>
> **FR129-F2** — Vendor can create, edit, and delete food items through Filament forms with image upload. Food images use lazy loading via `IntersectionObserver`, a neutral background (Coconut Cream #FFF8DC or white) with padding to prevent yellow-on-yellow collision with brand gold, and a fallback placeholder SVG for items without images. *Jira: CAR | Status: ✅*

**FR130** — Vendor can organize food items into named categories, with the ability to create, rename, reorder, and delete categories.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

> **FR130-F1** — Vendor can manage categories through a Filament resource (`CategoryResource`) with drag-and-drop reordering to control category display order in the customer app. *Jira: CAR | Status: ✅*

**FR131** — Vendor can add variations to food items (e.g., size: small/large, spice level: mild/hot) with per-variation price differences.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR132** — Vendor can create add-on groups (e.g., "Extra sides") and individual add-on items within each group, with optional pricing per add-on.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

> **FR132-F1** — Vendor can manage add-on groups and individual add-on items through Filament forms (`AddOnResource`) with group-level configuration and per-item pricing. *Jira: CAR | Status: ✅*

---

#### 5.3.3 Package System (Curry Pack) Management (FR133–FR140)

**FR133** — Vendor can create curry pack packages with a name, description, pricing, and images. A package represents a configurable meal selection (e.g., "Amma's Family Feast").

*Platform: Vendor Portal | Jira: CAR / CPFP | Status: ✅*

**FR134** — Vendor can define configuration groups within packages with minimum and maximum choice constraints. Each group represents a dimension of customization (e.g., protein choice, spice level, sides).

*Platform: Vendor Portal | Jira: CAR / CPFP | Status: ✅*

> **FR134-F1** — Vendor can manage the full 3-tier package hierarchy (Package > PackageConfiguration > PackageOption) in Filament (`PackageResource`). The 3-tier structure is preserved and fully editable through Filament forms with nested repeater fields. *Jira: CAR | Status: ✅*

**FR135** — Vendor can assign existing food items as selectable options within a configuration group, enabling vendors to build packages from their existing menu items.

*Platform: Vendor Portal | Jira: CAR / CPFP | Status: ✅*

**FR136** — Vendor can set additional price charges for specific package options, so customers see real-time price adjustments as they make selections.

*Platform: Vendor Portal | Jira: CAR / CPFP | Status: ✅*

**FR137** — Vendor can reorder configuration groups and options within a package via drag-and-drop to control the presentation order in the customer app.

*Platform: Vendor Portal | Jira: CAR / CPFP | Status: ✅*

**FR138** — Vendor can toggle the availability status (available / out of stock) for individual food items and packages. Status changes take effect immediately in the customer app.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

> **FR138-F1** — Vendor can bulk-update food item availability (in-stock / out-of-stock) for multiple items simultaneously via Filament bulk actions, including partial failure handling with an audit log. *Jira: CAR | Status: ✅*

**FR139** — Vendor can set seasonal availability for menu items and packages with start and end dates, automatically making items unavailable outside the defined period.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR140** — Vendor can upload multiple images per package to support multiple angles, serving suggestions, and cultural presentation context.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

---

#### 5.3.4 Order Management and Fulfillment (FR141–FR149)

**FR141** — Vendor can view incoming orders in real-time on the order dashboard. New orders appear immediately without requiring a page refresh.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

> **FR141-F1** — Vendor can view orders in a Filament table (`OrderResource`) with real-time status badges. All status badges display icon + text label + color (not color alone) to comply with WCAG 1.4.1. Each status has a unique icon and text label alongside its color indicator. *Jira: CAR | Status: ✅*
>
> **FR141-F2** — Vendor can update order status (accept, preparing, ready for pickup, picked up) through Filament actions on the Order resource. Each action triggers the appropriate customer and driver notifications. *Jira: CAR | Status: ✅*

**FR142** — Vendor can accept or reject incoming orders with a mandatory reason when rejecting. Rejection triggers a customer notification and initiates the automatic refund process.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR143** — Vendor can update order status through the full fulfillment workflow: accept, preparing, ready for pickup. Each status change triggers an automated customer push notification.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR144** — Vendor can view the complete detail for any order including all items ordered, customization selections for each item, special instructions from the customer, and delivery address.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR145** — Vendor can distinguish subscription orders from one-time orders in the order dashboard and order detail view, enabling different handling and batch planning for subscription orders.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR146** — Vendor can view the assigned driver's location and estimated time of arrival for pickup, enabling the vendor to time order preparation to minimize wait times.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR147** — Vendor can initiate partial or full refunds for orders, with the refund amount credited back to the customer's original payment method. Refund reason is required and recorded.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR148** — Vendor can view order history with search and filter capabilities by date range, order status, item type, and customer name.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR149** — Vendor can generate a shift handover summary of all orders processed during a defined time window, exportable for internal handover communication.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

---

#### 5.3.5 Financial Reports and Payouts (FR150–FR155)

**FR150** — Vendor can view their current platform subscription status, active plan features, and billing history.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

> **FR150-F1** — Vendor can manage their platform subscription settings through the Filament Subscription page, including plan change, cancellation, and reactivation flows with confirmation modals. *Jira: CAR | Status: ✅*
>
> **FR150-F2** — Vendor can participate in conversations and chat with the CurryDash admin team through the Filament Conversations page, with polymorphic chat and 5-second polling for near-real-time messaging. *Jira: CAR | Status: ✅*
>
> **FR150-F3** — Vendor can access POS (point-of-sale) functionality through the Filament POS page, including a product grid, cart, order creation, and receipt printing for walk-in and telephone orders. *Jira: CAR | Status: ✅*

**FR151** — Vendor can renew or cancel their platform subscription. Cancellation is effective at the end of the current billing period, and the vendor retains access until that date.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR152** — Customer subscriptions can be scheduled for recurring delivery on a defined frequency (daily, weekly, monthly). The scheduling system accounts for the customer's preferred delivery day and the vendor's available delivery days.

*Platform: Backend | Jira: CUR | Status: ✅*

**FR153** — Customers can pause subscriptions for a specified date range. Paused periods do not generate delivery orders and do not charge the customer for the skipped deliveries.

*Platform: Flutter App + Backend | Jira: CUR | Status: ✅*

**FR154** — Vendor can view a subscription order forecast calendar showing when recurring subscriber orders are due to be generated in the upcoming period, enabling advance preparation planning and food waste reduction.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR155** — The system automatically generates subscription orders on their scheduled dates without requiring any vendor or customer action. Generated orders appear in the vendor's order dashboard as standard incoming orders.

*Platform: Backend | Jira: CUR | Status: ✅*

---

#### 5.3.6 Analytics (FR156–FR160)

**FR156** — Vendor can view a dashboard with key performance metrics including total orders, revenue (gross and net after commission), average order value, and average customer rating.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

> **FR156-F1** — The Filament vendor dashboard includes an Order Summary widget showing today's orders, this week's orders, and this month's orders with trend indicators comparing to the previous equivalent period. *Jira: CAR | Status: ✅*
>
> **FR156-F2** — The Filament vendor dashboard includes a Revenue widget showing revenue for the selected period with a comparison to the prior period. *Jira: CAR | Status: ✅*
>
> **FR156-F3** — The Filament vendor dashboard includes a Ratings widget showing the current average rating and a summary of recent customer reviews. *Jira: CAR | Status: ✅*
>
> **FR156-F4** — The Filament vendor dashboard includes a Quick Actions widget showing the count of pending orders requiring action and items with low availability flagged for attention. *Jira: CAR | Status: ✅*

**FR157** — Vendor can view sales trends over time with daily, weekly, and monthly granularity, displayed as visual charts with brand-palette colors. Data table alternatives are available for accessibility.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR158** — Vendor can compare their performance metrics against anonymized platform averages to benchmark their operation and identify improvement areas.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR159** — Vendor can view customer ratings and individual feedback, with the ability to filter by rating value and date range.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR160** — Vendor can export sales and order reports in CSV format for a selected date range.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

> **FR160-F1** — Vendor can view financial reports (revenue, commissions, payouts) in Filament tables on the FinancialReports page with date-range filtering and CSV export. The export format is compatible with common accounting software import templates. *Jira: CAR | Status: ✅*

---

### 5.4 Backend APIs — Laravel REST (FR161–FR200)

These requirements govern the REST API layer (`/api/v1/`) that serves all client applications — the Flutter customer app, the Flutter vendor mobile view, the Filament vendor portal, and any third-party integrations. The API is protected by JWT guards (`auth:api` for customers, `auth:admin` for admins, `auth:vendor` for vendors).

The API layer is a production system serving active traffic. All FR161–FR168 requirements are implemented. FR169–FR200 are reserved for future API expansion as the platform scales.

---

#### 5.4.1 Customer API (`/api/v1/`) (FR161–FR166)

**FR161** — The API supports all customer mobile and web application requirements defined in FR1–FR70. All 100+ endpoints required by the Flutter app are implemented and documented, covering restaurants, menus, packages, orders, subscriptions, customer profile, and notifications.

*Platform: Backend API | Jira: CUR | Status: ✅*

**FR162** — The API authenticates customers via JWT tokens issued on successful login. Token-protected endpoints return `401 Unauthorized` for missing or expired tokens. Customer JWT tokens expire after 30 days of inactivity.

*Platform: Backend API | Jira: CUR | Status: ✅*

**FR163** — The API provides package listing and customization endpoints that return the full 3-tier package hierarchy (Package > Configuration Groups > Options) with constraint data (min/max selections) and price modifiers, enabling the Flutter app to render the customization UI dynamically.

*Platform: Backend API | Jira: CUR / CPFP | Status: ✅*

**FR164** — The API supports cart operations with package selections, storing the full customization state per cart item including all selected option choices. Cart state persists across sessions for authenticated customers.

*Platform: Backend API | Jira: CUR | Status: ✅*

**FR165** — The API supports order placement with integrated payment processing. The order placement endpoint is atomic: it validates the cart, charges the payment method, creates the order record, notifies the vendor, and returns the confirmed order in a single response. Partial failures result in full rollback and no charge to the customer.

*Platform: Backend API | Jira: CUR | Status: ✅*

**FR166** — The API supports all subscription management operations including: create subscription, update frequency, pause for date range, skip next delivery, modify package selections, cancel subscription, and view subscription history.

*Platform: Backend API | Jira: CUR | Status: ✅*

---

#### 5.4.2 Payment Gateway Integration (FR167–FR168)

**FR167** — The system integrates with Stripe for primary payment processing. The integration uses Stripe SDK only — no card data is stored locally in any CurryDash system. Stripe Elements handles card capture on the client side. The integration supports one-time payments and recurring subscription billing.

*Platform: Backend API | Jira: CUR | Status: ✅*

**FR168** — The system integrates with Firebase Cloud Messaging (FCM) for push notification delivery to Flutter app customers. The backend sends FCM notifications on all order status transitions, subscription events, and promotional triggers. Notification delivery latency target is under 30 seconds from the triggering event.

*Platform: Backend API | Jira: CUR | Status: ✅*

---

#### 5.4.3 Vendor API (`/api/v1/vendor/`) (FR169–FR180)

**FR169** — *Reserved for future use — Vendor REST API expansion.*

**FR170** — *Reserved for future use — Vendor REST API expansion.*

**FR171** — *Reserved for future use — Vendor REST API expansion.*

**FR172** — *Reserved for future use — Vendor REST API expansion.*

**FR173** — *Reserved for future use — Vendor REST API expansion.*

**FR174** — *Reserved for future use — Vendor REST API expansion.*

**FR175** — *Reserved for future use — Vendor REST API expansion.*

---

#### 5.4.4 Delivery API (`/api/v1/delivery-man/`) (FR176–FR185)

**FR176** — *Reserved for future use — Delivery Man REST API expansion.*

**FR177** — *Reserved for future use — Delivery Man REST API expansion.*

**FR178** — *Reserved for future use — Delivery Man REST API expansion.*

**FR179** — *Reserved for future use — Delivery Man REST API expansion.*

**FR180** — *Reserved for future use — Delivery Man REST API expansion.*

---

#### 5.4.5 Authentication and Product Discovery APIs (FR181–FR200)

**FR181** — *Reserved for future use — Authentication endpoint expansion.*

**FR182** — *Reserved for future use — Authentication endpoint expansion.*

**FR183** — *Reserved for future use — Product and restaurant discovery API expansion.*

**FR184** — *Reserved for future use — Product and restaurant discovery API expansion.*

**FR185** — *Reserved for future use — Product and restaurant discovery API expansion.*

**FR186** — *Reserved for future use.*

**FR187** — *Reserved for future use.*

**FR188** — *Reserved for future use.*

**FR189** — *Reserved for future use.*

**FR190** — *Reserved for future use.*

**FR191** — *Reserved for future use.*

**FR192** — *Reserved for future use.*

**FR193** — *Reserved for future use.*

**FR194** — *Reserved for future use.*

**FR195** — *Reserved for future use.*

**FR196** — *Reserved for future use.*

**FR197** — *Reserved for future use.*

**FR198** — *Reserved for future use.*

**FR199** — *Reserved for future use.*

**FR200** — *Reserved for future use.*

---

### 5.5 Cross-Cutting Requirements (FR201+)

These requirements apply across multiple platform components. They are not owned by a single portal or application layer; their implementation spans backend, vendor portal, admin dashboard, and customer app. They are grouped under five sub-domains: notifications, payment gateway integration, system configuration, feature flags, and interactive UX (the Filament guided tour and resource center system).

---

#### 5.5.1 Notification System (FR201–FR206)

**FR201** — Vendors receive real-time notification when a new order is placed at their restaurant. Notifications are delivered via browser notification with sound (Filament portal), the legacy vendor portal, and email. Notification delivery occurs within 3 seconds of order placement (real-time target per NFR-A-5).

*Platform: Backend + Vendor Portal | Jira: CAR | Status: ✅*

**FR202** — Vendors receive notification when an order status changes due to an external action (e.g., driver pickup confirmed, admin intervention). Status change notifications appear in the vendor notification center.

*Platform: Backend + Vendor Portal | Jira: CAR | Status: ✅*

**FR203** — Customers receive push notifications for all order status updates: confirmed, preparing, driver assigned, in transit, delivered. Push notifications are delivered via FCM within 30 seconds of the triggering status change.

*Platform: Backend + Flutter App | Jira: CUR | Status: ✅*

**FR204** — Admin receives automated alerts when a vendor's performance metrics breach defined thresholds (e.g., average rating drops below 4.0, complaint rate exceeds 5% of orders). Alerts appear in the admin dashboard notification queue.

*Platform: Backend + Admin Dashboard | Jira: CAD | Status: ✅*

**FR205** — The system sends transactional email notifications for account lifecycle events including: vendor registration received, vendor application approved or rejected, password reset, and customer account verification.

*Platform: Backend | Jira: CUR / CAD / CAR | Status: ✅*

**FR206** — The system sends SMS notifications for critical order updates (driver arriving, delivery confirmation) when configured. SMS delivery is configurable per vendor and per market, with primary and backup SMS gateway failover.

*Platform: Backend | Jira: CUR | Status: ✅*

---

#### 5.5.2 Payment Gateway Integration (FR207 — see also FR167)

*Note: The primary payment gateway FRs are defined at FR167 (Stripe) and FR168 (Firebase FCM) in the Backend APIs section. The FR207 range documents the broader multi-gateway architecture.*

**FR207** — The platform supports 12+ payment gateway integrations to serve diverse customer payment preferences across Australian and international markets. Gateways include: Stripe, PayPal, Razorpay, SSLCommerz, Paystack, Flutterwave, MercadoPago, bKash, Paymob, LiqPay, SenangPay, and Paytm. All gateways are implemented as individual controllers following the hexagonal architecture pattern.

*Platform: Backend | Jira: CUR | Status: ✅*

**FR208** — All payment transactions are atomic. A payment that cannot be fully completed (e.g., gateway timeout, card decline) results in no order being created and no charge to the customer. The customer is shown a clear error message with an option to retry or use a different payment method.

*Platform: Backend | Jira: CUR | Status: ✅*

**FR209** — Payment card data is never stored in any CurryDash system. All card capture is handled by the respective payment gateway's client-side SDK (Stripe Elements, etc.), with only tokenized references stored for recurring billing.

*Platform: Backend + Flutter App | Jira: CUR | Status: ✅*

---

#### 5.5.3 System Configuration (FR210–FR215)

**FR210** — Admin can configure platform-wide business settings including minimum order values, default delivery fee structures, order cutoff times, and GST treatment rules.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR211** — Admin can manage delivery zones with geographic boundaries (polygon-based zone definition), associating zones with delivery fee tiers and vendor eligibility.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR212** — Admin can create and manage promotional banners displayed in the customer app, with scheduling (start/end dates), targeting rules, and linked promotional codes.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR213** — Admin can configure commission rates and platform fee structures per vendor category (restaurant, home kitchen, cloud kitchen), with the ability to set custom rates for individual vendors.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR214** — Admin can define and manage vendor categories and cuisine type taxonomies, controlling how vendors are classified and displayed in the customer app discovery interface.

*Platform: Admin Dashboard | Jira: CAD | Status: ✅*

**FR215** — Admin can toggle platform-wide feature flags for capabilities including the Filament vendor portal, payment gateways, subscription system, and experimental features, without requiring code deployment.

*Platform: Admin Dashboard + Backend | Jira: CAD | Status: ✅*

---

#### 5.5.4 Feature Flag System (FR216–FR222)

**FR216** — The system provides a two-tier feature flag architecture: a global environment-level flag (`.env` / `config/features.php`) that serves as a master toggle, and a per-vendor database-level flag (`filament_portal_enabled` column on the vendors table) for granular opt-in control. A feature is active for a vendor only when both the global flag and the vendor-level flag are enabled.

*Platform: Backend | Jira: CAR | Status: ✅*

**FR217** — The following per-feature flags are individually controllable: `FEATURE_FILAMENT_VENDOR` (master toggle for the Filament portal), `FEATURE_FILAMENT_FOOD` (FoodResource), `FEATURE_FILAMENT_ORDERS` (OrderResource), `FEATURE_FILAMENT_PACKAGES` (PackageResource), and `FEATURE_INTERACTIVE_TOURS` (Driver.js tour system).

*Platform: Backend | Jira: CAR | Status: ✅*

**FR218** — Admin can toggle the `filament_portal_enabled` flag per vendor from the Admin Dashboard, enabling phased rollout to a subset of vendors without any code change.

*Platform: Admin Dashboard + Backend | Jira: CAD | Status: ✅*

**FR219** — The `FilamentFeatureMiddleware` enforces feature flags at the route level in the Filament vendor portal. Accessing a feature-flagged route when the feature is disabled results in a redirect to the legacy Blade portal equivalents.

*Platform: Backend | Jira: CAR | Status: ✅*

---

#### 5.5.5 Interactive Onboarding — Filament Guided Tours (FR220–FR227)

**FR220** — New vendors see a 6-step onboarding tour on their first login to the Filament vendor portal. The tour is auto-started, resumable if interrupted, and skippable at any step. Tour completion state is persisted per vendor so the tour does not repeat unless explicitly restarted.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR221** — Vendors see a 5-step menu management tour when they create their first food item in the Filament portal. The tour is triggered contextually (just-in-time) by the food item creation action.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR222** — Vendors see a 10-step package builder tour when they create their first curry pack package in Filament. The tour is comprehensive, covering the full 3-tier hierarchy configuration workflow. It is triggered by the package creation action.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR223** — Vendors see a 4-step order management tour when they receive their first real (non-test) order in the Filament portal. The tour uses Chili Red styling to signal urgency. The skip option is not available for this tour, as the order management workflow is operationally critical.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR224** — Vendors see a 5-step analytics dashboard tour after 7 days of accumulated order data have been collected. The tour is exploratory in tone and shows vendors the value of their accumulated data for business planning.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR225** — The system tracks tour completion progress per vendor with timestamps for each tour and each step completed. Progress is stored in the `vendor_tour_progress` table. Completion data is used to determine which tours have been seen and whether contextual tour triggers should fire.

*Platform: Backend | Jira: CAR | Status: ✅*

**FR226** — All five tours are powered by Driver.js (loaded from CDN, 5KB gzipped, zero runtime dependencies). Tours display a progress indicator, support "Skip tour" options (except Order Management), respect `prefers-reduced-motion` for animations, and never repeat after completion unless the vendor explicitly requests a replay from the Resource Center.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

---

#### 5.5.6 Resource Center and Contextual Help (FR227–FR233)

**FR227** — Vendors can access a global resource center widget from any page in the Filament vendor portal via a persistent slide-out panel. The resource center contains: an onboarding progress checklist, help articles, a list of available tours, and a tour restart option.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR228** — Complex form fields in Filament resources (Food and Package forms) display contextual help icons (hintIcon) that reveal explanatory tooltip text on hover or focus. Tooltips explain field purpose, acceptable values, and impact on the customer-facing experience.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR229** — Empty states on the Food, Package, and Order resources display illustrated guidance content with contextual "Get Started" call-to-action buttons rather than blank tables. Data tables, dashboard widgets, and image grids use skeleton loading screens (not spinners) while content loads. Skeleton screens match the dimensions of the actual content they represent. Shimmer animations in skeleton screens are disabled when `prefers-reduced-motion` is active.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR230** — Vendors can restart any previously completed tour from the Resource Center. Restarting a tour resets its completion state for the current session and relaunches the Driver.js tour from step 1.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

---

#### 5.5.7 Accessibility and UX Compliance (FR231–FR238)

**FR231** — All Filament status badges in the vendor portal display icon + text label + color (never color alone) to comply with WCAG 1.4.1 (Use of Color). Each order status, item availability status, and subscription status has a unique descriptive icon paired with a text label. This requirement was derived from an audit that identified 365 color-only badges in the legacy system.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR232** — All images in Filament resources include descriptive `alt` text attributes for screen reader accessibility. This applies to food item images, restaurant logos, user avatars, and any decorative images (which receive `alt=""`). This requirement was derived from an audit that identified 763 images missing alt text in the legacy system.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR233** — The Filament vendor portal theme consumes design tokens from JSON configuration files (`docs/brand-strategy/design-tokens/`) via `tailwind.config.vendor-portal.js`. No hardcoded color values are permitted in theme files. This requirement was derived from an audit showing 0% design token adoption and 188 uncontrolled color values in the legacy theme.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR234** — Data tables, dashboard widgets, and image grids in the Filament portal use skeleton loading screens while data is being fetched. Skeleton screens match the actual component dimensions and use shimmer animation. Shimmer is disabled under `prefers-reduced-motion`. This requirement was derived from an audit showing 1 skeleton screen versus 328 spinner instances in the legacy system.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR235** — The Filament vendor portal renders correctly on mobile viewports from 375px width and above. All CRUD operations are fully usable on mobile devices. Touch targets meet the WCAG 2.1 minimum of 44x44px. Responsive columns, toggleable tables, and bottom navigation are implemented. Camera capture in file upload fields uses `extraInputAttributes(['capture' => 'environment'])`.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR236** — Vendors receive a browser notification with auditory alert and visual badge when a new order arrives in the Filament portal. Notifications are delivered via Laravel Echo + WebSocket broadcasting with a polling fallback. Notifications function when the browser tab is in the background. A Service Worker is registered to support background notification delivery. This requirement was identified as the number one competitive gap with DoorDash Merchant Portal and UberEats Restaurant Dashboard.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR237** — The Filament vendor portal dashboard includes visual charts for: revenue trends (line chart), order volume over time (bar chart), most popular menu items (horizontal bar chart), and order peak hours heatmap. Charts are implemented via ApexCharts / Filament Charts plugin using brand-palette colors. Accessible data table alternatives are available for each chart for screen reader users.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

**FR238** — Food item images in the Filament portal use a neutral background (Coconut Cream #FFF8DC or white) with padding to prevent visual collision between food photography and the Turmeric Gold brand color. Images implement lazy loading via `IntersectionObserver`. A fallback placeholder SVG is displayed when no image has been uploaded. This requirement addresses both brand fidelity (0.3% lazy loading adoption in the audit baseline) and the yellow-on-yellow color collision risk identified in the color palette validation report.

*Platform: Vendor Portal | Jira: CAR | Status: ✅*

---

## FR Allocation Summary

| FR Range | Count | Domain | Platform | Status |
|----------|-------|--------|----------|--------|
| FR1–FR70 | 70 | Customer App | Flutter (iOS, Android, Web) | 🔄 Partial (brand migration in progress) |
| FR71–FR108 | 38 | Admin Dashboard + Financial | Laravel Blade | ✅ Implemented |
| FR109–FR120 | 12 | Admin Dashboard (reserved) | Laravel Blade | Reserved |
| FR121–FR160 | 40 | Vendor Portal | Blade (legacy) + Filament 3.x | ✅ Implemented |
| FR161–FR168 | 8 | Backend APIs (core) | Laravel REST | ✅ Implemented |
| FR169–FR200 | 32 | Backend APIs (reserved) | Laravel REST | Reserved |
| FR201–FR215 | 15 | Cross-Cutting (Notifications, Config) | Full Stack | ✅ Implemented |
| FR216–FR219 | 4 | Feature Flag System | Backend + Admin | ✅ Implemented |
| FR220–FR238 | 19 | Interactive Tours + Accessibility | Vendor Portal | ✅ Implemented |
| **Total Defined** | **206** | All domains | All platforms | — |

---

*Section 5 word count: approximately 10,200 words.*
*All FR numbers in this section are canonical. Cross-reference to legacy PRD A and PRD B numbers is provided in Appendix A.*
*Last updated: 2026-02-19*

---

## 6. Non-Functional Requirements

These NFRs are the conflict-resolved, authoritative targets for the entire CurryDash platform. Where PRD A (Admin-Seller Portal) and PRD B (User Web/Mobile) specified different values for the same dimension, the stricter standard has been adopted. Where the PRDs address different layers of the stack (e.g., backend processing time vs client-perceived time), both values are preserved with explicit scope labels. See Appendix B for the full conflict resolution log with rationale for every decision.

The combined source pool is 53 NFRs from PRD A (namespaced NFR-A-1 through NFR-A-53) and 60 NFRs from PRD B (namespaced NFR-B-1 through NFR-B-60). The Master PRD produces a unified, de-duplicated, conflict-resolved NFR set below.

---

### 6.1 Performance

> **NFR-P1**: Backend API responses complete within 200ms at the 95th percentile for all read operations.
>
> *Applies to: Laravel API layer (all `/api/v1/` routes) | Source: PRD A (NFR-A-1) — stricter than PRD B's <2s client-perceived target*

> **NFR-P2**: Client-perceived API response time does not exceed 2 seconds under normal network conditions.
>
> *Applies to: Flutter app (iOS, Android, Web) — end-to-end including network transit | Source: PRD B (NFR-B-3)*

> **NFR-P3**: Mobile app cold start completes within 3 seconds on supported devices (iOS 12+, Android API 21+).
>
> *Applies to: Flutter iOS and Android apps | Source: PRD B (NFR-B-1)*

> **NFR-P4**: Web application First Contentful Paint (FCP) completes within 2 seconds on a standard broadband connection.
>
> *Applies to: Flutter Web and Filament vendor portal | Source: PRD B (NFR-B-1)*

> **NFR-P5**: Screen transitions within the Flutter app complete within 300ms.
>
> *Applies to: Flutter app (all platforms) | Source: PRD B (NFR-B-2)*

> **NFR-P6**: Admin and vendor dashboard pages reach Time to Interactive (TTI) within 2 seconds.
>
> *Applies to: Filament vendor portal (`/vendor-portal`) and Admin dashboard | Source: PRD A (NFR-A-2)*

> **NFR-P7**: AJAX operations (status updates, filters, bulk actions) within the Filament portal complete within 500ms.
>
> *Applies to: Filament vendor portal Livewire components | Source: PRD A (NFR-A-3)*

> **NFR-P8**: Database queries complete within 100ms for standard operations (single-table reads with indexed lookups).
>
> *Applies to: MySQL (all tables) | Source: Both PRDs — PRD A (NFR-A-4), PRD B (NFR-B-9)*

> **NFR-P9**: Search results return within 1 second for vendor, food, and order queries.
>
> *Applies to: Filament tables, admin search, customer restaurant/menu search | Source: Both PRDs — PRD A (NFR-A-8), PRD B (NFR-B-5)*

> **NFR-P10**: Image assets load within 1 second under normal network conditions; lazy loading applied via IntersectionObserver where applicable.
>
> *Applies to: Flutter app (menu images), Filament portal (FoodImage component with lazy loading) | Source: PRD B (NFR-B-4)*

> **NFR-P11**: Cart operations (add item, update quantity, remove item) complete within 500ms.
>
> *Applies to: Flutter app cart module | Source: PRD B (NFR-B-6)*

> **NFR-P12**: System supports 1,000 concurrent users without performance degradation across all metrics in NFR-P1 through NFR-P11.
>
> *Applies to: Full stack (Laravel backend + Flutter clients) | Source: PRD B (NFR-B-7) — sets the backend sizing floor*

> **NFR-P13**: System processes up to 100 orders per minute during peak periods. Laravel Horizon queue workers must sustain this throughput without queue depth growing unboundedly.
>
> *Applies to: Laravel backend + Horizon queue | Source: PRD B (NFR-B-8)*

> **NFR-P14**: Real-time order notifications are delivered to the vendor portal within 3 seconds of order placement.
>
> *Applies to: Laravel Echo + Pusher/WebSocket broadcast path, Service Worker fallback, polling fallback | Source: PRD A (NFR-A-5)*

> **NFR-P15**: Image uploads complete within 5 seconds for files up to 5MB.
>
> *Applies to: Filament FoodResource and PackageResource image upload; Flutter customer profile photo upload | Source: PRD A (NFR-A-6)*

> **NFR-P16**: Standard report generation (financial exports, CSV downloads) completes within 30 seconds.
>
> *Applies to: FinancialReports page CSV export, Admin financial reports | Source: PRD A (NFR-A-7)*

> **NFR-P17**: Mobile app package size remains under 50MB (iOS IPA / Android APK compressed).
>
> *Applies to: Flutter iOS and Android builds | Source: PRD B (NFR-B-10)*

> **NFR-P18**: Web bundle size (gzipped) remains under 2MB for the Flutter Web app.
>
> *Applies to: Flutter Web build artifacts | Source: PRD B (NFR-B-11)*

> **NFR-P19**: Static assets (CSS, JS, images) are served through a CDN to reduce origin server load and improve global response times.
>
> *Applies to: Laravel backend static assets | Source: PRD A (NFR-A-25)*

---

### 6.2 Security

> **NFR-S1**: All API communication is encrypted via TLS 1.2 minimum; TLS 1.3 is preferred. HTTP connections are rejected or redirected to HTTPS automatically.
>
> *Applies to: All `/api/v1/` routes, Filament portal, Admin dashboard | Source: Both PRDs — PRD A (NFR-A-9), PRD B (NFR-B-16)*

> **NFR-S2**: All user passwords are hashed using bcrypt with a cost factor of 12 or higher. Plain-text passwords are never stored, logged, or transmitted.
>
> *Applies to: Vendor, Admin, Customer model password fields | Source: PRD A (NFR-A-10)*

> **NFR-S3**: All API endpoints use industry-standard authentication protocols: JWT (customer `auth:api` guard, admin `auth:admin` guard, vendor `auth:vendor` guard) and OAuth 2.0 for social login. Biometric authentication is supported as an optional second factor on mobile devices.
>
> *Applies to: Full stack — Laravel guards (backend) + Flutter Auth module (frontend) | Source: Both PRDs — PRD A (NFR-A-11), PRD B (NFR-B-12, NFR-B-15)*

> **NFR-S4**: Customer JWT tokens expire after 24 hours with refresh token rotation. Admin and vendor session timeouts are applied after 30 minutes of inactivity, enforced at the Laravel session and Filament auth layer.
>
> *Applies to: Customer API guard; Admin and Vendor guards | Source: Platform-specific — PRD A (NFR-A-11, NFR-A-12) for admin/vendor, PRD B (NFR-B-13) provides 30-day customer inactivity baseline — tightened to 24h JWT with refresh*

> **NFR-S5**: Failed login attempts are rate-limited to 5 attempts per 15-minute window per IP address and per user identifier. Subsequent attempts within the window receive a 429 Too Many Requests response.
>
> *Applies to: All authentication endpoints (`/api/v1/auth/login`, `/vendor/auth/login`, `/admin/auth/login`) | Source: PRD B (NFR-B-14) — sets the explicit rate; PRD A (NFR-A-19) implements at the Laravel layer*

> **NFR-S6**: Payment card data is never stored locally on any client device or in the CurryDash database. All payment processing is handled exclusively via the Stripe SDK. PCI-DSS compliance is maintained through this integration.
>
> *Applies to: Flutter app (no local card storage), Laravel Stripe integration (token-only server-side) | Source: Both PRDs — PRD A (NFR-A-13, NFR-A-14), PRD B (NFR-B-17)*

> **NFR-S7**: All sensitive data (personal identifiable information, tokens, secrets) is encrypted at rest in the database using database-level or application-level encryption. Encryption keys are stored separately from data.
>
> *Applies to: MySQL database (production) | Source: PRD B (NFR-B-18)*

> **NFR-S8**: Personal data handling complies in full with the Australian Privacy Principles (APP) under the Privacy Act 1988. This includes data minimization, purpose limitation, and the right to data access and deletion.
>
> *Applies to: Full stack — data collection in Flutter app, storage in Laravel backend | Source: Both PRDs — PRD A (NFR-A-15), PRD B (NFR-B-19)*

> **NFR-S9**: Role-based access control (RBAC) is enforced at both the API layer (middleware guards) and the view layer (Filament and Blade policy checks). No privilege escalation is possible through URL manipulation.
>
> *Applies to: All Laravel controllers, Filament resources (BaseScopedResource), Admin dashboard | Source: Both PRDs — PRD A (NFR-A-16), PRD B (NFR-B-20)*

> **NFR-S10**: All authenticated API endpoints require a valid, non-expired authentication token. Requests without a valid token receive a 401 Unauthorized response.
>
> *Applies to: All protected `/api/v1/` routes | Source: PRD B (NFR-B-21)*

> **NFR-S11**: All admin actions are logged with the authenticated user ID, timestamp (UTC), action type, affected resource ID, and the before/after state where applicable. Audit logs are immutable and retained for a minimum of 12 months.
>
> *Applies to: Admin dashboard all write operations; Vendor employee actions | Source: Both PRDs — PRD A (NFR-A-17), PRD B (NFR-B-22)*

> **NFR-S12**: SQL injection and XSS vulnerabilities are prevented through Laravel's Eloquent parameterized queries (never raw user-interpolated SQL), Blade's automatic escaping, and Filament's sanitized form inputs. OWASP Top 10 compliance is verified annually.
>
> *Applies to: All Laravel controllers and Filament resources | Source: PRD A (NFR-A-18)*

> **NFR-S13**: Rate limiting is enforced per endpoint category: authentication endpoints at 5 requests/minute, customer API endpoints at 60 requests/minute, admin/vendor API endpoints at 120 requests/minute.
>
> *Applies to: All API routes via Laravel throttle middleware | Source: PRD A (NFR-A-19)*

> **NFR-S14**: File uploads are restricted to explicitly allowed MIME types (JPEG, PNG, WebP for images; PDF for documents) and enforced size limits (5MB maximum per file). Server-side validation is applied regardless of client-side validation.
>
> *Applies to: All upload endpoints — Filament FoodResource, PackageResource, vendor document upload | Source: PRD A (NFR-A-20)*

---

### 6.3 Scalability

> **NFR-SC1**: The platform architecture supports 10x user growth from launch baseline without requiring re-architecture of core components. Horizontal scaling is achievable by adding application servers behind a load balancer without code changes.
>
> *Applies to: Laravel backend + Flutter client (stateless API design) | Source: Both PRDs — PRD A (NFR-A-21), PRD B (NFR-B-23, NFR-B-25)*

> **NFR-SC2**: The database design supports horizontal scaling strategies (read replicas, eventual sharding by restaurant_id) without application layer changes. The orders table (99 columns) and restaurants table (68 columns) must sustain 100,000+ order records without query degradation on indexed access patterns.
>
> *Applies to: MySQL database schema | Source: Both PRDs — PRD A (NFR-A-22), PRD B (NFR-B-24)*

> **NFR-SC3**: The system handles 3x normal traffic during promotional events (e.g., Deepavali, Sinhala New Year) without service degradation or increased error rates.
>
> *Applies to: Full stack — Laravel backend + CDN + queue workers | Source: Both PRDs — PRD A (NFR-A-23), PRD B (NFR-B-26)*

> **NFR-SC4**: Database connection pooling supports a minimum of 100 concurrent database connections. Connection pool configuration is externalized via environment variables.
>
> *Applies to: MySQL connection pool (Laravel database.php config) | Source: PRD A (NFR-A-26)*

> **NFR-SC5**: Non-critical operations (email sending, SMS delivery, PDF report generation, push notification dispatch) are processed asynchronously via Laravel Horizon queues. Queue workers scale horizontally.
>
> *Applies to: Laravel Horizon / Redis queue | Source: Both PRDs — PRD A (queue design), PRD B (NFR-B-28)*

> **NFR-SC6**: The system implements graceful degradation when approaching capacity limits. Specifically: queue depth monitoring triggers auto-scaling alerts; external service failures (Stripe, Firebase, Google Maps) do not cascade to full system unavailability.
>
> *Applies to: Full stack | Source: PRD B (NFR-B-27)*

---

### 6.4 Reliability

> **NFR-R1**: Platform availability target is 99.5% during business hours, defined as 6:00 AM to 11:00 PM AEST (Australian Eastern Standard Time). This equates to a maximum of approximately 9 hours of unplanned downtime per quarter during business hours.
>
> *Applies to: Full platform (Laravel backend + Filament portal + Admin dashboard) | Source: Both PRDs — PRD A (NFR-A-27), PRD B (NFR-B-29)*

> **NFR-R2**: Planned maintenance windows must be scheduled outside peak ordering hours. Peak ordering hours are defined as 11:00 AM–2:00 PM and 5:00 PM–9:00 PM local time. All maintenance that could cause service interruption must occur outside these windows.
>
> *Applies to: Infrastructure and deployment planning | Source: PRD B (NFR-B-30)*

> **NFR-R3**: Recovery Time Objective (RTO) for unplanned outages is less than 15 minutes. Maximum duration for any single unplanned downtime incident is 4 hours before escalation to crisis management.
>
> *Applies to: Full platform | Source: Both PRDs — PRD B (NFR-B-35) for RTO, PRD A (NFR-A-34) for maximum incident duration*

> **NFR-R4**: Recovery Point Objective (RPO) is zero data loss for confirmed orders. No order that has received a confirmation response to the customer may be lost under any failure condition, including database crashes, server failures, or network partitions.
>
> *Applies to: Order persistence layer (MySQL + queue durability) | Source: Both PRDs — PRD A (NFR-A-28), PRD B (NFR-B-36)*

> **NFR-R5**: Database backups are completed daily with a minimum 7-day retention period. Point-in-time recovery is available for any point within the last 24 hours.
>
> *Applies to: MySQL production database | Source: PRD A (NFR-A-30, NFR-A-31)*

> **NFR-R6**: Payment transactions are atomic — no partial payment states are possible. Either a transaction succeeds fully or it is rolled back in full. ACID compliance is enforced at the database transaction level for all order-payment operations.
>
> *Applies to: Laravel payment processing (Stripe integration) + MySQL transactions | Source: Both PRDs — PRD A (NFR-A-29), PRD B (NFR-B-33)*

> **NFR-R7**: Order data is durable once a submission confirmation is returned to the client. Durability is enforced by committing the order record before returning the confirmation response; the queue job for notifications may be dispatched asynchronously after the commit.
>
> *Applies to: Laravel order placement logic (`app/Traits/PlaceNewOrder.php`) | Source: PRD B (NFR-B-32)*

> **NFR-R8**: Order submission succeeds within 3 retry attempts on transient failures (network, queue, database connection). Permanent failures surface a user-friendly error to the customer with instructions to contact support.
>
> *Applies to: Flutter app order submission; Laravel order processing | Source: PRD B (NFR-B-31)*

> **NFR-R9**: Subscription schedules are maintained accurately across Australian time zones (AEST/AEDT) with daylight saving transitions handled without missed or duplicate deliveries.
>
> *Applies to: Laravel subscription scheduling logic | Source: PRD B (NFR-B-34)*

> **NFR-R10**: The platform implements graceful degradation when external services (Stripe, Firebase FCM, Google Maps, SMS gateway) become unavailable. Specifically: Stripe unavailability blocks payment but does not affect order history views; Firebase unavailability falls back to polling; Google Maps unavailability falls back to manual address entry.
>
> *Applies to: All external service integrations | Source: PRD A (NFR-A-32)*

> **NFR-R11**: Automated health checks run at 60-second intervals for all critical services (database, Redis, queue workers, external API endpoints). Alerts are triggered when health checks fail for two consecutive intervals.
>
> *Applies to: Production monitoring | Source: PRD A (NFR-A-33)*

> **NFR-R12**: Offline-queued actions (orders placed without connectivity) are synced fully when connectivity is restored. Conflict resolution rule: server state wins for order status; local state wins for user preferences.
>
> *Applies to: Flutter app (Drift local DB + offline queue) | Source: PRD B (NFR-B-37)*

---

### 6.5 Accessibility

**All requirements in this section target WCAG 2.1 Level AA.** Level AA is the stricter standard adopted from PRD B, and applies to all user-facing surfaces: the Flutter customer app, the Filament vendor portal, and the Admin dashboard. See Appendix B for the conflict resolution record on this decision.

> **NFR-A1**: All platform surfaces comply with WCAG 2.1 Level AA. This is a non-negotiable launch requirement for all components delivering user-facing interfaces.
>
> *Applies to: Flutter app (iOS, Android, Web), Filament vendor portal, Admin dashboard (Blade) | Source: PRD B (NFR-B-38 through NFR-B-45) — AA level adopted as stricter standard over PRD A's initial Level A target*

> **NFR-A2**: Color contrast ratio meets 4.5:1 minimum for normal text (below 18pt regular or 14pt bold) and 3:1 minimum for large text and UI component boundaries. The CurryDash design system critical constraint: white text on Turmeric Gold (#E6B04B) produces a 1.98:1 contrast ratio and must never be used. All status badges must use icon + text label + color (not color alone) to satisfy WCAG 1.4.1.
>
> *Applies to: All user-facing surfaces; specifically Filament status badges (365 color-only badges remediated in Epic 13/14) | Source: Both PRDs — PRD A (NFR-A-37), PRD B (NFR-B-39, NFR-B-44)*

> **NFR-A3**: Touch target minimum size is 48x48dp on all mobile platforms (Android and iOS). This is stricter than Apple's Human Interface Guideline recommendation of 44x44px and applies to all interactive elements.
>
> *Applies to: Flutter app (iOS, Android), Filament vendor portal mobile-responsive mode (375px+ viewports) | Source: PRD B (NFR-B-40) — 48x48dp adopted as stricter standard over the 44x44px reference in PRD A UX audit*

> **NFR-A4**: All interactive elements have accessible labels readable by assistive technologies. Screen reader compatibility is required for iOS VoiceOver and Android TalkBack on mobile; NVDA, JAWS, and VoiceOver in Safari are supported on web.
>
> *Applies to: Flutter app (all interactive widgets), Filament portal (all form fields, buttons, table actions) | Source: Both PRDs — PRD A (NFR-A-36), PRD B (NFR-B-38, NFR-B-41)*

> **NFR-A5**: Full keyboard navigation is supported for all critical workflows in the Filament vendor portal and the Admin dashboard web interface. Tab order is logical and consistent with visual layout. Focus indicators are visible (3px solid Turmeric Gold ring on all interactive elements in the Filament vendor portal).
>
> *Applies to: Filament vendor portal, Admin dashboard | Source: Both PRDs — PRD A (NFR-A-38, NFR-A-39), PRD B (NFR-B-42)*

> **NFR-A6**: Error messages are announced to assistive technologies via ARIA live regions. Errors are identified with text descriptions, not color alone. Form error states follow WCAG 3.3.1 (Error Identification) and 3.3.2 (Labels or Instructions).
>
> *Applies to: All form surfaces — Filament portal forms, Flutter app forms, Admin dashboard forms | Source: Both PRDs — PRD A (NFR-A-40), PRD B (NFR-B-45)*

> **NFR-A7**: Text resizing is supported up to 200% without loss of content or functionality. Layouts reflow rather than truncate. Horizontal scrolling is not required at any text scale up to 200%.
>
> *Applies to: Flutter app (dynamic text), Filament portal | Source: PRD B (NFR-B-43)*

> **NFR-A8**: Animation and motion effects respect the `prefers-reduced-motion` media query. Skeleton loading shimmer animations, page transitions, and celebration effects must be disabled or replaced with instant transitions when this preference is active.
>
> *Applies to: Filament portal skeleton loading (Epic 13), Flutter app transitions | Source: PRD A (Epic 12.6, FR221)*

> **NFR-A9**: All images in Filament resources include descriptive alt text attributes. Food images, restaurant logos, and user avatars must not use empty alt attributes unless they are purely decorative (in which case `alt=""` is required).
>
> *Applies to: Filament FoodResource, FoodImage component (763 images remediated in Epic 13) | Source: PRD A (NFR-A-36, FR224)*

---

### 6.6 Integration

> **NFR-I1**: Firebase Cloud Messaging (FCM) integration sends push notifications to customers and vendors. End-to-end notification delivery completes within 30 seconds of the triggering event. The Laravel backend's `SendVendorOrderNotification` listener must dispatch FCM within this window.
>
> *Applies to: Laravel backend (FCM dispatch), Flutter app (FCM receive), Filament portal (browser notification via Echo) | Source: Both PRDs — PRD A (NFR-A-42), PRD B (NFR-B-48, NFR-B-49)*

> **NFR-I2**: Stripe payment processing integration maintains 99.9% availability (matching Stripe's SLA). The integration uses the Stripe SDK exclusively; no card data passes through CurryDash servers. Automatic retry on transient Stripe API failures with exponential backoff (maximum 3 retries).
>
> *Applies to: Laravel Stripe integration (12+ gateway controllers), Flutter payment UI | Source: Both PRDs — PRD A (NFR-A-41), PRD B (NFR-B-46)*

> **NFR-I3**: Google Maps / Geocoding API integration provides delivery address validation, restaurant distance calculations, and driver location display. Google Maps unavailability activates fallback to manual address entry without breaking the order flow.
>
> *Applies to: Flutter app (customer delivery address), Admin dashboard (zone management) | Source: PRD B (NFR-B-47)*

> **NFR-I4**: Cloud storage integration (AWS S3 or DigitalOcean Spaces) provides image and document storage with signed URL access for secure, time-limited downloads. Storage type is configurable via environment variable (`AWS_*` or `DO_SPACES_*`).
>
> *Applies to: Laravel file storage (all image uploads across all portals) | Source: PRD A (NFR-A-44)*

> **NFR-I5**: Email delivery uses SMTP with queue-based sending for burst capacity. SMS gateway supports failover between primary and backup providers. Webhook delivery retries 3 times with exponential backoff before failing permanently.
>
> *Applies to: Laravel notification channels | Source: PRD A (NFR-A-43, NFR-A-45, NFR-A-47)*

> **NFR-I6**: API versioning maintains backward compatibility for at least one major version. The current version (`/api/v1/`) must remain functional when `v2` is introduced. Breaking changes require a deprecation notice of at least 90 days.
>
> *Applies to: Laravel API routes | Source: PRD A (NFR-A-46)*

> **NFR-I7**: Circuit breaker pattern is implemented for all external service calls. When an external service (Stripe, Firebase, Google Maps, SMS gateway) reaches 50% failure rate over 60 seconds, the circuit opens and requests are short-circuited with a user-friendly fallback for a minimum of 30 seconds before a test request is attempted.
>
> *Applies to: Laravel external service clients | Source: PRD B (NFR-B-51)*

> **NFR-I8**: All other payment gateways (PayPal, Razorpay, SSLCommerz, Paystack, Flutterwave, MercadoPago, bKash, Paymob, LiqPay, SenangPay, Paytm) are integrated in the same pattern as Stripe: SDK-only, no card data storage, exponential backoff retry. Each gateway has its own controller in `app/Http/Controllers/`.
>
> *Applies to: Laravel payment gateway controllers (12+ gateways) | Source: PRD A (codebase architecture)*

---

### 6.7 Maintainability

> **NFR-M1**: Test coverage exceeds 80% for all critical code paths across both stacks. The current baseline is 547 PHPUnit tests (Laravel backend) and 315 E2E Playwright tests. Coverage is measured and enforced in CI/CD pipelines.
>
> *Applies to: Laravel PHPUnit test suite, Flutter widget/integration tests, Playwright E2E | Source: Both PRDs — PRD B (NFR-B-54) — >80% adopted for both stacks*

> **NFR-M2**: Laravel code follows PSR-12 PHP coding standards enforced via Laravel Pint. Flutter code passes the Flutter analyzer with zero errors. Both are enforced as pre-commit hooks and CI gates.
>
> *Applies to: Laravel backend, Flutter app | Source: Both PRDs — PRD A (NFR-A-48), PRD B (NFR-B-53)*

> **NFR-M3**: All database migrations are reversible (every `up()` has a corresponding `down()`) and non-destructive (no column drops or type changes in the same migration as column additions). This is critical in the brownfield context — the production database has pre-existing data that cannot be reconstructed.
>
> *Applies to: All Laravel migrations in `database/migrations/` | Source: PRD A (NFR-A-50) — flagged as critical for brownfield*

> **NFR-M4**: All environment-specific configuration is externalized via `.env` files. No credentials, API keys, or environment-specific values appear in committed code. Laravel's `config/` directory reads exclusively from environment variables.
>
> *Applies to: Laravel configuration layer | Source: PRD A (NFR-A-51)*

> **NFR-M5**: The feature flag system (`config/features.php`, `FeatureHelper` class) enables any feature to be disabled at the environment level without code changes. All new Filament features must be gated behind a feature flag at launch. The two-tier system (global .env flag + per-vendor DB column) must be maintained.
>
> *Applies to: Filament vendor portal; applicable to all future features | Source: PRD A (Epic 18.1, FR212)*

> **NFR-M6**: Developer environment setup completes within 1 hour following the documented process in `CLAUDE.md` and `docs/`. API documentation covers 100% of endpoints. Architecture decision records (ADRs) are documented in `docs/architecture/`.
>
> *Applies to: Project documentation | Source: PRD B (NFR-B-56, NFR-B-57, NFR-B-58)*

> **NFR-M7**: Production logging provides sufficient detail for debugging any issue reported. Logs include request context (user ID, session ID, route, input payload hash), error stack trace, and external API response codes. Log retention minimum is 30 days in production.
>
> *Applies to: Laravel logging (Monolog), Flutter error reporting | Source: PRD A (NFR-A-52)*

> **NFR-M8**: Dependency versions are locked (PHP via `composer.lock`, Dart/Flutter via `pubspec.lock`). Security updates to dependencies are applied on a monthly schedule. Critical security vulnerabilities are patched within 5 business days of disclosure.
>
> *Applies to: Both stacks | Source: PRD A (NFR-A-53)*

> **NFR-M9**: CI pipeline build success rate exceeds 95% on first attempt (not counting failures due to test environment issues). Flaky tests are tracked and remediated within 2 sprints of first detection.
>
> *Applies to: GitHub Actions CI (both stacks) | Source: PRD B (NFR-B-55)*

---

### 6.8 Monitoring and Observability

> **NFR-O1**: Application errors are captured, categorized by severity, and accessible for debugging within 5 minutes of occurrence. Error tracking covers all unhandled exceptions in Laravel (log channel), all uncaught Flutter exceptions, and all Playwright E2E test failures.
>
> *Applies to: Full stack | Source: PRD B (NFR-B-59)*

> **NFR-O2**: Performance monitoring is active in production, measuring p50, p95, and p99 response times for all API endpoints. Alerting triggers when p95 response time exceeds 400ms (2x the NFR-P1 target) for two consecutive minutes.
>
> *Applies to: Laravel API layer | Source: PRD A (NFR-A-1) — derived alerting threshold*

> **NFR-O3**: The following alerting thresholds trigger on-call notification within 5 minutes: (a) API error rate exceeds 1% over 60 seconds, (b) Queue depth exceeds 1,000 pending jobs, (c) Database connection pool at 80% utilization, (d) Health check fails for two consecutive intervals, (e) Disk usage exceeds 80%.
>
> *Applies to: Production infrastructure | Source: PRD A (NFR-A-33) — derived thresholds*

> **NFR-O4**: CI/CD build and test results are visible to the full development team in real time via the GitHub Actions dashboard. Test result summaries are posted to the team communication channel on completion.
>
> *Applies to: GitHub Actions CI | Source: PRD B (NFR-B-60)*

> **NFR-O5**: Lighthouse CI is configured in GitHub Actions and runs on every pull request targeting the `UAT` or `main` branches. Performance budget thresholds: Filament portal Performance score ≥ 80, Accessibility score ≥ 90, Best Practices ≥ 90.
>
> *Applies to: Filament vendor portal (Epic 18.7) | Source: PRD A (sprint-status.yaml, Epic 18.7)*

---

### 6.9 Mobile-Specific Requirements

> **NFR-MOB1**: The Flutter app targets iOS 12.0+ (minimum supported version) and Android API level 21 (Lollipop, minimum) with target SDK API 34. All features must degrade gracefully on minimum supported OS versions.
>
> *Applies to: Flutter iOS and Android builds | Source: PRD B (Section 6 platform requirements)*

> **NFR-MOB2**: Mobile app package size remains under 50MB compressed (iOS IPA / Android APK). Web bundle size (gzipped) remains under 2MB. Asset optimization (image compression, font subsetting, code splitting) is applied during the production build.
>
> *Applies to: Flutter build pipeline | Source: PRD B (NFR-B-10, NFR-B-11)*

> **NFR-MOB3**: The app supports offline capability via Drift local database (Flutter SQLite wrapper) and an offline action queue. Offline-supported operations: browse cached restaurants and menus, view order history, access saved addresses, queue order submissions. Queued orders sync automatically when connectivity is restored.
>
> *Applies to: Flutter app (all platforms) | Source: PRD B (NFR-B-37, Section 6 offline requirements)*

> **NFR-MOB4**: Push notification permission is requested at first order placement, not at app launch. This deliberate timing maximizes opt-in rate by establishing value before requesting permission. Firebase Cloud Messaging (FCM) is the delivery channel. Android 8.0+ apps use separate notification channels for Orders and Marketing categories.
>
> *Applies to: Flutter iOS and Android | Source: PRD B (Section 6 push notification strategy)*

> **NFR-MOB5**: The app complies with App Store and Google Play Store requirements: Apple Sign-In when social login is offered (iOS), privacy nutrition labels (iOS), App Tracking Transparency (iOS), Google Play Billing library for subscription billing (Android), Data Safety section configured in Play Console (Android), age rating 4+ (both stores).
>
> *Applies to: Flutter app store submissions | Source: PRD B (Section 6 app store compliance)*

> **NFR-MOB6**: Device permissions (Location, Camera, Push Notifications, Storage, Biometrics) use contextual request timing. Location permission is requested on first address entry. Camera permission is requested on first photo upload. No permissions are requested in bulk at app launch.
>
> *Applies to: Flutter iOS and Android | Source: PRD B (Section 6 device permissions)*

> **NFR-MOB7**: Responsive design breakpoints: Mobile (<600px) uses single-column layout with bottom navigation; Tablet (600px–1024px) uses two-column layout with side navigation; Desktop (>1024px) uses multi-column layout with top navigation. This applies to both the Flutter Web app and the Filament vendor portal.
>
> *Applies to: Flutter Web app, Filament vendor portal (Epic 18.5) | Source: PRD B (Section 6 responsive design)*

---

## 7. Success Criteria & Measurable Outcomes

### 7.1 Launch Criteria (Pre-Launch Gate)

The following conditions must be met before the CurryDash platform launches to the public. These are binary pass/fail gates, not metrics to optimize post-launch.

| Criterion | Measure | Gate |
|-----------|---------|------|
| Vendor pre-registrations | Active, verified vendor signups | 50+ |
| MVP functional requirements | FR1–FR70 (customer app), FR71–FR168 (admin/vendor/backend) | 100% implemented and tested |
| Critical bug count | Severity 1 or Severity 2 open bugs | Zero |
| Performance NFRs | NFR-P1 through NFR-P19 measured under load test | All met at 1.5x target load |
| Security audit | Penetration test and OWASP Top 10 review | No critical or high findings unresolved |
| Accessibility audit | WCAG 2.1 AA automated + manual review | Zero AA violations on critical user flows |
| PHPUnit test suite | Tests passing with zero regressions | 547+ tests passing |
| E2E test suite | Playwright tests covering critical paths | 315+ tests passing |
| Documentation | CLAUDE.md, rollback runbook, feature flags guide, API docs | All complete |
| Rollback procedure | `docs/runbooks/filament-rollback-procedure.md` | Tested and validated |

### 7.2 3-Month Targets

| KPI | Target | Measurement Method |
|-----|--------|--------------------|
| Active vendors (accepting orders) | 25+ | Restaurants table, `status = active` |
| Vendor portal activation rate | >60% of registered vendors using Filament portal | `filament_portal_enabled` column proportion |
| Customer order success rate | >95% | Orders table, completed vs abandoned |
| Vendor portal WCAG AA score | Lighthouse Accessibility ≥90 | Automated Lighthouse CI |
| API p95 response time | <200ms | Production monitoring |
| Mobile app cold start | <3s on median device | Firebase Performance SDK |
| Onboarding tour completion rate | >70% of new vendor first logins | `vendor_tour_progress` table |
| Support ticket volume | Trending down week-on-week | Support queue analytics |
| Zero critical security incidents | No breaches, no data leaks | Security monitoring |

### 7.3 6-Month Targets

| KPI | Target |
|-----|--------|
| Active paying vendors | 50+ |
| Weekly active customers | 500+ |
| Gross Merchandise Volume (GMV) | Confidential internal target — measurable via orders table totals |
| Subscription uptake rate | >30% of customers who place a first order create a subscription |
| Platform NPS (customer) | >40 |
| Vendor NPS (vendor portal experience) | >50 |
| Average vendor rating | >4.0 across all active vendors |
| Customer complaint resolution time | <4 hours average |
| Test coverage (PHPUnit + E2E combined) | >80% of critical code paths |

### 7.4 12-Month Targets

| KPI | Target |
|-----|--------|
| Active vendors | 100+ |
| Monthly active customers | 2,000+ |
| Subscription volume | >30% of total order volume processed as subscription orders |
| Geographic coverage | Casey, Monash, Greater Dandenong fully covered; 2 additional Melbourne regions active |
| Vendor retention (12-month cohort) | >80% of vendors active at 3 months still active at 12 months |
| Platform NPS (customer) | >50 (improving from 3-month baseline) |
| App store rating | iOS App Store 4.5+, Google Play Store 4.4+ |
| Cultural NPS (Sri Lankan diaspora segment) | >60 |

### 7.5 Technical Success Criteria

The following technical milestones are measurable from the repository and test infrastructure:

| Criterion | Current State | Target |
|-----------|--------------|--------|
| PHPUnit tests passing | 547 | Maintain with zero new regressions per sprint |
| E2E Playwright tests passing | 315 | 330+ (Sprint 18 target) covering 560 routes |
| Pre-existing test failures | 6 (3 original + 3 admin auth) | Investigate and resolve in Q2 |
| Breaking changes to `/api/v1/` | Zero since feature/vendor-portal branch | Zero maintained through all releases |
| Filament portal waves complete | Wave 5 complete (as of 2026-02-17) | PR merged to UAT |
| Feature flag coverage | All Filament features behind flags | Maintained for all Phase 3 features |
| WCAG AA compliance | Implemented in Epic 18.6 | Lighthouse Accessibility ≥90 per CI run |
| Lighthouse Performance | Implemented in Epic 18.7 | Score ≥80 per CI run |

---

## 8. Innovation & Market Differentiation

### 8.1 Subscription-Marketplace Hybrid Model

CurryDash pioneers a dual-model approach that combines two previously separate business paradigms in a single platform:

**Subscription layer (HelloFresh model):** Customers subscribe to recurring curry pack deliveries on a chosen frequency (weekly, bi-weekly, or monthly). The subscription model provides vendor demand predictability — vendors know in advance how many of each package to prepare, eliminating the food waste that plagues on-demand-only operations. Subscription customers generate higher lifetime value and lower customer acquisition costs compared to one-time orderers.

**Marketplace layer (UberEats model):** On-demand ordering from multiple Sri Lankan vendors without subscription commitment. This layer provides customer acquisition (lower barrier to first order) and incremental vendor revenue beyond their guaranteed subscription base.

**Hybrid unit economics:** The platform captures superior economics by combining both: subscription revenue provides LTV certainty; marketplace commission provides scale. Vendors benefit from the guaranteed demand planning that subscriptions provide — a unique value proposition over generic delivery platforms that cannot offer this.

**Technical complexity addressed:** The Laravel backend simultaneously manages subscription scheduling (recurring order generation on configured dates), pause/skip/modify logic (FR153, FR29), and on-demand marketplace order placement — creating orchestration challenges handled in `app/Traits/PlaceNewOrder.php` and `app/CentralLogics/order.php`.

**Validation metric:** >30% subscription uptake rate measured via A/B testing of subscription vs on-demand conversion at checkout.

### 8.2 Diaspora-First Cultural Design

CurryDash is purpose-built as a cultural connection platform for the Australian Sri Lankan diaspora community — not a generic food delivery app with an ethnic food category appended.

**The market gap:** UberEats, DoorDash, and Menulog categorize Sri Lankan cuisine under "Indian" or "Asian" — erasing cultural specificity and reducing discoverability for diaspora customers seeking specific dishes (Jaffna Tamil cuisine, Sinhalese home cooking, kottu roti, hoppers, string hoppers). This misclassification is not a minor UX issue; for diaspora customers, it signals that the platform does not understand or respect their cultural identity.

**Diaspora-first design principles:**

- **Authentic cuisine curation:** Vendor vetting for cultural authenticity, not just food safety compliance. The admin qualification workflow (FR77–FR84) includes cultural authenticity review by a community advisory board.
- **Multi-language support:** English, Sinhala, and Tamil across packaging and (Phase 3) in-app UI — all three languages of the Sri Lankan diaspora community in Australia.
- **Heritage storytelling:** Vendor profiles include cultural narrative (e.g., "grandmother's recipe from 1970s Jaffna"), not just business information. This drives emotional connection and differentiates CurryDash from anonymous marketplace listings.
- **Bilingual packaging integration:** Physical delivery packaging includes QR codes linking to traditional serving videos in Sinhala — connecting digital delivery to physical cultural experience.
- **Community features:** The platform positions itself as a community connector, not merely a transaction facilitator. Vendor stories and customer reviews carry cultural context.

**Expansion path:** The diaspora-platform model is architecture-agnostic. The configurable vendor/menu system supports replication for other underserved cuisine communities (Ethiopian, Filipino, Vietnamese) without backend changes.

**Validation metric:** NPS >50 among Sri Lankan diaspora customers (higher than the general customer NPS target of >40).

### 8.3 CPFP Configurable Package System

The Curry Pack Fulfillment Platform (CPFP) is the primary technical differentiator that cannot be replicated on generic food delivery platforms without significant engineering investment.

**The innovation:** Generic food delivery platforms offer item selection with flat add-ons. CPFP enables a hierarchical, constraint-based configuration system that mirrors how authentic Sri Lankan meals are actually constructed — not as individual dishes, but as composed meals with interdependent choices.

**Architecture — 3-tier hierarchy:**

```
Package (e.g., "Amma's Family Feast")
  └── PackageConfiguration (e.g., "Protein Choice")
        ├── min_choices: 1, max_choices: 1
        └── PackageOption (e.g., "Chicken Curry", "Mutton Curry", "Vegetarian")
              └── additional_charge: $3.00 for mutton (price modifier)
  └── PackageConfiguration (e.g., "Spice Level")
        ├── min_choices: 1, max_choices: 1
        └── PackageOption ("Melbourne Mild", "Medium", "Hot", "Jaffna Fire")
  └── PackageConfiguration (e.g., "Sides")
        ├── min_choices: 2, max_choices: 3
        └── PackageOption ("Coconut Sambol", "String Hoppers", "Papadams", "Dal")
```

**Key properties:**

- **Vendor-controlled without code changes:** Vendors configure packages via the Filament PackageResource UI (FR134-F1). No engineering involvement required to add a new configuration group, adjust min/max constraints, or change option pricing.
- **Constraint enforcement:** The system enforces min/max selection rules at both the Flutter client (real-time UI feedback) and the Laravel API level (server-side validation before order acceptance).
- **Dynamic pricing:** Option-level price modifiers are calculated and displayed in real-time as the customer selects options. The customer sees the total price impact of every choice before adding to cart.
- **Subscription compatibility:** The CPFP model is fully compatible with the subscription system — customers can configure a recurring package and have the same customization delivered on every cycle, or modify it before each scheduled delivery.

**Validation metric:** >80% customization completion rate (customers who begin the package configuration flow and complete it).

### 8.4 Competitive Positioning

| Feature | CurryDash | UberEats | DoorDash | HelloFresh | Menulog |
|---------|-----------|----------|----------|-----------|---------|
| Sri Lankan cuisine focus | Dedicated platform | Subcategory only | Subcategory only | None | Subcategory only |
| Subscription delivery model | Yes (core feature) | No | No | Yes (core feature) | No |
| On-demand marketplace | Yes | Yes | Yes | No | Yes |
| Hybrid subscription + on-demand | Yes (unique) | No | No | No | No |
| Cultural authenticity vetting | Yes (vendor review process) | No | No | No | No |
| Multi-language (Sinhala, Tamil) | Yes (Phase 3) | No | No | No | No |
| Configurable meal customization | Yes (CPFP 3-tier system) | Basic add-ons | Basic add-ons | Curated only | Basic add-ons |
| Vendor demand forecasting | Yes (subscription calendar) | No | No | Yes (internal) | No |
| Heritage storytelling in vendor profiles | Yes | No | No | No | No |
| Australian market focus | Yes | Yes | Yes | Yes | Yes |
| Home kitchen / cloud kitchen vendors | Yes (supported) | Limited | Limited | No | Limited |

**First-mover advantage:** No dedicated platform for Sri Lankan food delivery with subscription options exists in Australia at the time of this PRD. CurryDash has a structural window to establish cultural authority in this niche before any major player invests in replication.

---

## 9. Technical Architecture

### 9.1 Laravel Backend (Admin-Seller Portal)

**Tech stack:**
- Laravel 10.x, PHP 8.2.12
- MySQL (primary database — orders table 99 columns, restaurants table 68 columns)
- Redis (cache and queue backend for Laravel Horizon)
- Filament 3.x (v3.3.48) with Livewire v3.7.10 (vendor portal modernization)
- Laravel Echo + Pusher/WebSocket (real-time broadcasting)
- Laravel Horizon (queue management)
- Docker (development and CI/CD environment)

**Directory structure overview:**

```
app/
├── CentralLogics/          # Cross-project orchestration (shared utilities)
│   ├── helpers.php         # Static utilities: error formatting, image URLs, settings
│   ├── order.php           # Order lifecycle orchestration
│   ├── restaurant.php      # Vendor business logic
│   └── FeatureHelper.php   # Two-tier feature flag evaluation
├── Http/Controllers/
│   ├── Admin/              # CAD — Admin dashboard controllers
│   ├── Api/V1/             # CUR — Customer API controllers
│   └── Vendor/             # CAR — Vendor dashboard controllers (legacy Blade)
├── Filament/VendorPanel/
│   ├── Resources/          # 9 Filament resources (Food, Package, Order, Category, AddOn,
│   │                       #   Coupon, DeliveryMan, VendorEmployee, Customer)
│   ├── Pages/              # 6 custom pages (RestaurantProfile, FinancialReports,
│   │                       #   Subscription, POS, Conversations, NotificationCenter)
│   ├── Widgets/            # 11 dashboard widgets
│   └── Components/         # StatusBadge, FoodImage (WCAG-compliant reusable components)
├── Models/                 # Eloquent models
├── Traits/
│   ├── PlaceNewOrder.php   # Order placement logic (~900 lines)
│   ├── PaymentGatewayTrait.php
│   └── NotificationDataSetUpTrait.php
├── Observers/              # Model event handlers
├── Events/                 # NewOrderReceived and other domain events
├── Listeners/              # SendVendorOrderNotification and other listeners
└── Scopes/                 # ZoneScope, RestaurantScope (query scoping)

Modules/
└── TaxModule/              # Tax calculation (nWidart Laravel Modules)

routes/
├── admin.php               # Admin dashboard routes
├── vendor.php              # Vendor Blade portal + Filament tour API routes
├── api/v1/api.php          # Customer API routes
└── web.php                 # Login, payment callbacks
```

**Multi-guard authentication architecture:**

| Guard | Users | Session Type | Timeout |
|-------|-------|-------------|---------|
| `auth:api` | Customers (Flutter app) | JWT stateless | 24h with refresh |
| `auth:admin` | Admin staff, super admin | JWT + session | 30 min inactivity |
| `auth:vendor` | Vendor owners | Session + Filament | 30 min inactivity |
| `auth:vendor_employee` | Shift managers, staff | Session + Filament | 30 min inactivity |

**Key architectural patterns:**

- **CentralLogics layer:** Shared utilities autoloaded via `composer.json`. `Helpers::error_processor($validator)` formats validation errors; `Helpers::get_full_url('package', $filename, 'public')` generates storage-aware image URLs. All controllers use this layer rather than duplicating utility logic.
- **BaseScopedResource:** All Filament vendor portal resources extend `BaseScopedResource`, which injects a `restaurant_id` scope on every Eloquent query. This enforces vendor data isolation at the query level — vendor A cannot see vendor B's data regardless of URL manipulation.
- **Dual rendering pipeline:** The legacy Blade portal at `/vendor` and the Filament portal at `/vendor-portal` coexist without interference. Separate Tailwind configurations (`tailwind.config.vendor-portal.js`) prevent CSS leakage between the two portals.
- **Feature flag system:** `config/features.php` stores global flags; `FeatureHelper::isEnabled()` applies two-tier evaluation (global `.env` flag + per-vendor `filament_portal_enabled` DB column). `FilamentFeatureMiddleware` enforces flags at the Filament route level.

**Filament 3.x vendor portal specifics:**
- Panel ID: `vendor`, URL path: `/vendor-portal`
- CSS isolation via dedicated Tailwind config consuming 130+ design tokens from 5 JSON files in `docs/brand-strategy/design-tokens/`
- Custom `vendor_portal_notifications` table (separate from the legacy `notifications` table to avoid schema conflicts)
- Additive-only migrations: new tables only (`vendor_tour_progress`, `tour_feedback`, `vendor_portal_notifications`) — no schema changes to existing tables
- Real-time order alerts: Laravel Echo + Pusher primary, Service Worker secondary, 30-second polling fallback

### 9.2 Flutter Cross-Platform App

**Tech stack:**
- Flutter 3.4.4+ (single codebase: iOS, Android, Web)
- Dart (language)
- GetX (state management + named route navigation)
- Drift (SQLite wrapper for offline local database)
- Firebase Auth + FCM (authentication + push notifications)
- Feature-first clean architecture (34 feature modules under `lib/features/`)

**Architecture pattern:**

```
lib/
├── features/               # 34 feature modules (one per domain area)
│   ├── auth/               # Authentication (email, social, biometric)
│   ├── restaurant/         # Restaurant discovery and browsing
│   ├── menu/               # Menu and package browsing
│   ├── cart/               # Cart with full customization state
│   ├── checkout/           # Order placement and payment
│   ├── subscription/       # Subscription lifecycle management
│   ├── order_tracking/     # Real-time order tracking
│   └── ...                 # Additional modules
├── helper/
│   ├── responsive_helper.dart  # Platform breakpoint logic
│   └── ...
├── util/
│   └── colors.dart         # Centralized CurryDash color constants
└── common/
    └── widgets/
        └── hover_widgets/  # Web-specific hover state widgets
```

**State management:** GetX reactive controllers with named route navigation (50+ routes). Each feature has its own Controller, Repository, and (where needed) Service layer. The architecture follows feature-first clean architecture, separating UI from business logic from data access.

**Offline capability:**
- Local persistence: Drift database (Flutter SQLite wrapper) stores cached restaurant/menu data, order history, saved addresses, and payment method tokens (not card numbers).
- Offline queue: Actions taken without connectivity (order submissions, preference changes) are queued locally and processed on reconnect.
- Conflict resolution: Server wins for order state; local state wins for user preferences.

**Key dependencies:**
- `get` — GetX state management
- `drift` — Local database (SQLite)
- `firebase_core`, `firebase_messaging` — Firebase integration
- `flutter_stripe` — Payment processing
- `google_maps_flutter` — Maps and geocoding
- `image_picker` — Camera and gallery access

### 9.3 Package System, Authentication, and Integrations

**CPFP Package System across both stacks:**

The Package system spans three Jira projects — CPFP (package data model), CUR (customer-facing API endpoints and Flutter UI), and CAR (vendor management Filament UI):

- **Backend (Laravel):** `Package`, `PackageConfiguration`, `PackageOption` Eloquent models. Relationships: `Package hasMany PackageConfiguration`, `PackageConfiguration hasMany PackageOption` (which references `Food` items). CRUD exposed via both the legacy Vendor Blade controllers and the Filament `PackageResource` (FR134-F1).
- **API layer:** `/api/v1/` endpoints serve package listings, configuration constraints, and option pricing to the Flutter app (FR163, FR164).
- **Flutter client:** Package detail screen enforces min/max selection constraints in real time. Price modifiers update the displayed total as options are selected. Full customization state is serialized into the cart item for order submission.

**Payment gateway abstraction:**

12+ payment gateways are integrated via individual controllers in `app/Http/Controllers/`. The Stripe SDK is the primary gateway for Australian operations. The architecture supports enabling additional gateways via configuration without code changes to the order flow. All gateways follow the same pattern: SDK-only processing, token-based server communication, no card data storage.

**Firebase integration:**

- **Customer push notifications:** Firebase FCM receives order status events triggered by Laravel event listeners (`SendVendorOrderNotification`). The listener dispatches an FCM message to the customer's registered device token within the 30-second NFR-I1 window.
- **Vendor browser notifications:** Real-time order alerts reach the Filament vendor portal via Laravel Echo + Pusher WebSocket broadcasting. A Service Worker provides background tab notifications. A 30-second polling fallback activates when WebSocket connectivity is lost.
- **Authentication:** Firebase Auth handles social login (Google Sign-In, Apple Sign-In) on the Flutter client. Tokens are validated at the Laravel backend `auth:api` guard.

---

## 10. Jira Project Mapping

### Jira Projects Reference

| Key | Project Name | Focus | Primary Team |
|-----|-------------|-------|-------------|
| CUR | Customer (CurryDash User) | Customer-facing APIs and Flutter app features | Mobile team (Ruchiran) |
| CAD | CurryDash Admin | Admin dashboard features and operations | Backend team (Ramesh) |
| CAR | CurryDash Admin/Restaurant | Vendor portal features (Blade + Filament) | Backend team (Ramesh) |
| CPFP | Curry Pack For People | Package system (CPFP data model and APIs) | Backend team (Ramesh) |
| CCW | CurryDash Web | Web frontend (Flutter Web, PWA) | Mobile team (Ruchiran) |
| PACK | Package/Infrastructure | DevOps, tooling, CI/CD, PRD B initiative | QA lead (Kasun) + PM |

### FR Range to Jira Project Mapping

| FR Range | Domain | Jira Project | Project Key | Primary Owner |
|----------|--------|-------------|-------------|--------------|
| FR1–FR5 | Brand Identity (Flutter app) | Customer | CUR | Mobile team |
| FR6–FR10 | Customer Account Management | Customer | CUR | Mobile team |
| FR11–FR15 | Restaurant and Menu Discovery | Customer | CUR | Mobile team |
| FR16–FR20 | Package Customization (Flutter) | Customer + Package | CUR + CPFP | Mobile team + Backend |
| FR21–FR26 | Cart and Checkout | Customer | CUR | Mobile team |
| FR27–FR32 | Subscription Management (Customer) | Customer | CUR | Mobile team |
| FR33–FR37 | Order Tracking | Customer | CUR | Mobile team |
| FR38–FR41 | Customer Support (app-side) | Customer | CUR | Mobile team |
| FR42–FR47 | Vendor Management (mobile view) | Customer | CUR | Mobile team |
| FR48–FR52 | Admin Operations (Flutter view) | Customer | CUR | Mobile team |
| FR53–FR57 | Developer Workflow | Infrastructure | PACK | QA lead |
| FR58–FR61 | Project Management | Infrastructure | PACK | PM |
| FR62–FR66 | Testing Infrastructure | Infrastructure | PACK | QA lead |
| FR67–FR70 | Notifications (customer push) | Customer | CUR | Mobile team |
| FR71–FR72 | Subscription Plan Management (Admin) | CurryDash Admin | CAD | Backend team |
| FR73–FR76 | Admin Analytics | CurryDash Admin | CAD | Backend team |
| FR77–FR86 | Admin Operations | CurryDash Admin | CAD | Backend team |
| FR87–FR93 | Customer Support (Admin tools) | CurryDash Admin | CAD | Backend team |
| FR94–FR100 | User and Role Management | CurryDash Admin | CAD | Backend team |
| FR101–FR105 | Financial Management (Vendor-facing) | Admin/Restaurant | CAR | Backend team |
| FR106–FR108 | Financial Management (Admin-facing) | CurryDash Admin | CAD | Backend team |
| FR121–FR160 | Vendor Portal (core + Filament) | Admin/Restaurant | CAR | Backend team |
| FR161–FR168 | Backend APIs | Customer + Admin | CUR/CAD | Backend team |
| FR201–FR212 | Cross-cutting (Notifications, Config) | Admin + Customer | CAD/CUR | Backend team |
| FR213–FR230 | Cross-cutting UX (Tours, Resource Center) | Admin/Restaurant | CAR | Backend team |

### FR-Level Jira Mapping (Representative Examples)

| FR# | FR Summary | Jira Project | Notes |
|-----|-----------|-------------|-------|
| FR1 | System displays CurryDash branding across all screens | CUR | Brand identity epic, PACK project initiative |
| FR6 | Customer account creation (email, phone, social) | CUR | Auth module |
| FR16 | Package customization — select config options | CUR + CPFP | Flutter UI + backend constraint validation |
| FR20 | Vendor-defined package configurations without code changes | CPFP | Package data model and admin API |
| FR27 | Customer subscribes to recurring curry pack deliveries | CUR | Subscription management module |
| FR29 | Customer pauses or skips subscription deliveries | CUR | Subscription lifecycle management |
| FR36 | Push notifications for order status changes | CUR | Firebase FCM integration |
| FR48 | Admin views platform dashboard with key metrics | CAD | Admin metrics dashboard |
| FR51 | Admin manages vendor status (active, paused, suspended) | CAD | Vendor management |
| FR71 | Admin creates subscription plan templates | CAD | Subscription plan administration |
| FR73 | Admin views platform-wide metrics dashboard | CAD | Analytics and reporting |
| FR77 | Admin views queue of pending vendor applications | CAD | Vendor onboarding workflow |
| FR87 | Support agent views customer complaint queue | CAD | Customer support tools |
| FR94 | Super admin creates and manages admin accounts | CAD | User and role management |
| FR101 | Vendor views earnings and commission breakdowns | CAR | FinancialReports Filament page |
| FR121 | Vendor registers for an account | CAR | Vendor onboarding |
| FR129 | Vendor creates, edits, and deletes food items | CAR | FoodResource (Filament) |
| FR133 | Vendor creates curry pack packages with configurable options | CAR + CPFP | PackageResource (Filament) |
| FR141 | Vendor views incoming orders in real-time | CAR | OrderResource (Filament + Echo) |
| FR152 | Customer subscriptions scheduled for recurring delivery | CUR + CAR | Subscription system (cross-cutting) |
| FR161 | API supports all 70 customer frontend FRs | CUR | Backend API completeness |
| FR167 | System integrates with Stripe for payment processing | CUR + CAD | Payment gateway integration |
| FR201 | Vendor receives notification for new orders | CAR | Real-time notification (Echo + FCM) |
| FR207 | Admin configures platform-wide business settings | CAD | System configuration panel |
| FR213 | New vendor sees onboarding tour on first Filament login | CAR | Epic 16, Story 16.4 (Driver.js) |
| FR219 | Vendor accesses resource center widget from any page | CAR | Epic 17, Story 17.1 |
| FR223 | All Filament status badges use icon + text + color | CAR | Epic 13, Story 13.8 (WCAG 1.4.1) |

---

## 11. Phased Roadmap

### 11.1 Phase Overview

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 1 — Foundation | Core platform, basic vendor/admin portals, customer APIs | Complete (legacy Blade) |
| Phase 2 — Modernization | Filament vendor portal (Waves 0–5), WCAG AA, E2E tests | Complete — PR to UAT created |
| Phase 3 — Growth | Subscription analytics, CPFP advanced features, multi-location, admin dashboard modernization | Planned |
| Phase 4 — Vision | Loyalty system, AI-powered recommendations, geographic expansion, diaspora expansion model | Planned |

### 11.2 Current Sprint Status (as of February 2026)

**Active sprint:** Sprint 18 E2E Test Initiative (2026-02-16 through 2026-03-02)
**Primary branch:** `feature/vendor-portal`
**Target branch for merge:** `UAT`

#### Filament Vendor Portal — Wave Completion Record

| Wave | Epics / Stories | Tests | Status |
|------|----------------|-------|--------|
| Wave 0 | Epic 14 (Food/Package/Order CRUD, bulk toggle, delivery staff, coupons, employees, real-time notifications), Epic 18.1 (feature flags), Epic 18.2 (vendor opt-in migration) | 40 | Complete |
| Wave 1 | Epic 15 stories 15.1 (FinancialReports), 15.2 (Subscription page), 15.5 (chart widgets) | 54 | Complete |
| Wave 2 | Epic 15 stories 15.3 (Conversations), 15.4 (POS), 15.6 (NotificationCenter); Epic 16 stories 16.1–16.3 (tour DB, TourManager JS, TourController); CustomerResource; QA pass | 86 | Complete |
| Wave 3 | Epic 16 stories 16.4–16.8 (all 5 Driver.js tours); Epic 17 stories 17.1–17.4 (Resource Center, hintIcons, emptyStates, tour restart) | 54 | Complete |
| Wave 4 | Epic 18 stories 18.5 (mobile responsive), 18.6 (WCAG audit + GitHub Actions), 18.7 (Lighthouse CI perf benchmarking) | 46 | Complete |
| Wave 5 | Epic 18 story 18.4 (CLAUDE.md update, rollback runbook, feature flags guide, tours guide, PR to UAT) | — | Complete (commit 6927e1b) |

**Total PHPUnit tests:** 547 passing, 6 pre-existing failures (3 original + 3 admin auth — not caused by Filament work)
**E2E Playwright tests:** 315 passing across 12 spec files; target 330+ by end of Sprint 18

#### Epic-by-Epic Summary

**Epic 12 — Filament Foundation:** Filament installation, VendorPanelProvider, vendor auth integration, CurryDash brand theme, BaseScopedResource data isolation, design token integration, accessibility foundation (skip link, reduced motion, touch targets).

**Epic 13 — Core Resources Read-Only:** FoodResource, OrderResource with status badges, CategoryResource, AddOnResource, RestaurantProfile Infolist, 5 dashboard widgets (OrderSummary, Revenue, Ratings, QuickActions), 4 skeleton loading components, StatusBadge (WCAG 1.4.1), FoodImage (lazy loading + placeholder SVG).

**Epic 14 — Write Operations:** Full CRUD for Food, Package (3-tier hierarchy), Order status workflow, Bulk availability toggle, Delivery staff management, Coupon management, Employee role management, Real-time order notifications (Echo + Service Worker + polling).

**Epic 15 — Advanced Features:** FinancialReports page (CSV export), Subscription page (plan change/cancel/reactivate), Conversations page (polymorphic chat, 5s polling), POS page (product grid + cart + receipt), Chart widgets (4 charts via ApexCharts), NotificationCenter page.

**Epic 16 — Interactive Tours:** `vendor_tour_progress` and `tour_feedback` tables, TourManager JS class, TourController (6 endpoints), 5 Driver.js tours (Onboarding 6-step, Menu Management 5-step, Package Builder 10-step, Order Management 4-step urgent, Analytics Dashboard 5-step).

**Epic 17 — Resource Center:** Global resource center widget (slide-out panel, onboarding checklist, help articles, tour list), hintIcon tooltips on Food/Package forms, empty states with illustrated CTAs, tour restart capability.

**Epic 18 — Rollout and Testing:** Feature flags system, Vendor opt-in migration, Mobile responsive layout (375px+), WCAG compliance audit + GitHub Actions CI, Lighthouse CI performance benchmarking, Documentation complete, PR to UAT.

### 11.3 Phase 3 — Growth (Planned)

Phase 3 work is defined but not yet scheduled into sprints. Key initiatives:

- **Admin Dashboard modernization:** Filament 3.x for the CAD Admin Dashboard (explicitly out of scope for Phase 2). Separate epic, estimated effort equivalent to Phase 2.
- **Advanced subscription analytics:** Subscription forecasting calendar, demand prediction, churn analysis, pause/skip pattern reporting.
- **Multi-location vendor support:** Vendors with multiple locations managing separate menus and order queues under one account. Requires schema changes to the restaurant/vendor relationship.
- **Cultural content management:** Multi-language content (Sinhala, Tamil) for vendor profiles, heritage storytelling features, cultural authenticity verification workflow integration with community advisory board.
- **CPFP advanced features:** Package templates, seasonal configuration inheritance, bulk package operations.
- **Kitchen Display System (KDS) integration:** Direct order display at vendor kitchen stations without portal interaction.

### 11.4 Phase 4 — Vision (Planned)

- AI-powered cultural authenticity verification for vendor applications
- Personalized recommendation engine leveraging order history and preference data
- Loyalty and rewards system (points, exclusive vendor offers)
- Geographic expansion to additional Australian cities (Sydney, Brisbane as primary targets)
- White-label platform capability for other diaspora cuisine communities (Ethiopian, Filipino, Vietnamese)
- API marketplace for third-party integrations

---

## Appendix A: FR Cross-Reference

This table maps every functional requirement from the original PRDs to its canonical Master PRD FR number. Use this when updating Jira tickets, referencing legacy documentation, or auditing requirement coverage.

### PRD B Cross-Reference (FR1–FR70, no renumbering)

PRD B functional requirements carry over directly as FR1–FR70 in the Master PRD. The original PRD B FR number and the Master PRD FR number are identical.

| Old FR# | Old Title | New FR# | Category | Notes |
|---------|-----------|---------|----------|-------|
| PRD-B FR1 | System displays CurryDash branding across all screens | FR1 | Brand Identity | Direct carry-over |
| PRD-B FR2 | System displays CurryDash app icon | FR2 | Brand Identity | Direct carry-over |
| PRD-B FR3 | System displays CurryDash splash screen | FR3 | Brand Identity | Direct carry-over |
| PRD-B FR4 | System removes all StackFood references | FR4 | Brand Identity | Direct carry-over |
| PRD-B FR5 | System applies consistent CurryDash color scheme | FR5 | Brand Identity | Direct carry-over |
| PRD-B FR6 | Customer account creation (email, phone, social login) | FR6 | Customer Account | Direct carry-over |
| PRD-B FR7 | Customer authentication (saved credentials, biometrics) | FR7 | Customer Account | Direct carry-over |
| PRD-B FR8 | Customer manages profile (name, photo, preferences) | FR8 | Customer Account | Direct carry-over |
| PRD-B FR9 | Customer saves and manages delivery addresses | FR9 | Customer Account | Direct carry-over |
| PRD-B FR10 | Customer saves and manages payment methods | FR10 | Customer Account | Direct carry-over |
| PRD-B FR11 | Customer browses restaurants filtered by location | FR11 | Discovery | Direct carry-over |
| PRD-B FR12 | Customer searches restaurants by name, cuisine, dish | FR12 | Discovery | Direct carry-over |
| PRD-B FR13 | Customer views restaurant details (ratings, hours, delivery) | FR13 | Discovery | Direct carry-over |
| PRD-B FR14 | Customer browses menu items and packages | FR14 | Discovery | Direct carry-over |
| PRD-B FR15 | Customer views package details including options and pricing | FR15 | Discovery | Direct carry-over |
| PRD-B FR16 | Customer selects configuration options for curry packages | FR16 | Package Customization | Direct carry-over |
| PRD-B FR17 | System enforces min/max selection constraints | FR17 | Package Customization | Direct carry-over |
| PRD-B FR18 | System calculates price adjustments in real-time | FR18 | Package Customization | Direct carry-over |
| PRD-B FR19 | Customer views customization summary before adding to cart | FR19 | Package Customization | Direct carry-over |
| PRD-B FR20 | Vendors define package configurations without code changes | FR20 | Package Customization | Direct carry-over; cross-cutting with CPFP |
| PRD-B FR21 | Customer adds customized packages to cart | FR21 | Cart and Checkout | Direct carry-over |
| PRD-B FR22 | Customer modifies cart contents (quantity, options, remove) | FR22 | Cart and Checkout | Direct carry-over |
| PRD-B FR23 | Customer applies promotional codes or discounts | FR23 | Cart and Checkout | Direct carry-over |
| PRD-B FR24 | Customer selects delivery address and time slot | FR24 | Cart and Checkout | Direct carry-over |
| PRD-B FR25 | Customer completes payment (saved or new method) | FR25 | Cart and Checkout | Direct carry-over |
| PRD-B FR26 | System confirms order and provides order number | FR26 | Cart and Checkout | Direct carry-over |
| PRD-B FR27 | Customer subscribes to recurring curry pack deliveries | FR27 | Subscription | Direct carry-over |
| PRD-B FR28 | Customer selects subscription frequency and delivery day | FR28 | Subscription | Direct carry-over |
| PRD-B FR29 | Customer pauses or skips subscription deliveries | FR29 | Subscription | Direct carry-over |
| PRD-B FR30 | Customer modifies subscription package selections | FR30 | Subscription | Direct carry-over |
| PRD-B FR31 | Customer cancels subscriptions with confirmation | FR31 | Subscription | Direct carry-over |
| PRD-B FR32 | System sends subscription reminders before deliveries | FR32 | Subscription | Direct carry-over |
| PRD-B FR33 | Customer views order status in real-time | FR33 | Order Tracking | Direct carry-over |
| PRD-B FR34 | Customer views order history with details | FR34 | Order Tracking | Direct carry-over |
| PRD-B FR35 | Customer reorders from previous orders | FR35 | Order Tracking | Direct carry-over |
| PRD-B FR36 | System sends push notifications for order status changes | FR36 | Order Tracking | Direct carry-over |
| PRD-B FR37 | Customer contacts support regarding active orders | FR37 | Order Tracking | Direct carry-over |
| PRD-B FR38 | Customer reports issues with orders including photo upload | FR38 | Customer Support | Direct carry-over |
| PRD-B FR39 | Customer views support ticket status and history | FR39 | Customer Support | Direct carry-over |
| PRD-B FR40 | System routes issues to appropriate support queues | FR40 | Customer Support | Direct carry-over |
| PRD-B FR41 | Support staff views and responds to customer issues | FR41 | Customer Support | Direct carry-over |
| PRD-B FR42 | Vendors manage restaurant profile and operating hours | FR42 | Vendor Management | Direct carry-over |
| PRD-B FR43 | Vendors create and edit menu items and packages | FR43 | Vendor Management | Direct carry-over |
| PRD-B FR44 | Vendors define package configurations and pricing | FR44 | Vendor Management | Direct carry-over |
| PRD-B FR45 | Vendors set item availability and seasonal offerings | FR45 | Vendor Management | Direct carry-over |
| PRD-B FR46 | Vendors view incoming orders grouped by time slot | FR46 | Vendor Management | Direct carry-over |
| PRD-B FR47 | Vendors update order status (preparing, ready) | FR47 | Vendor Management | Direct carry-over |
| PRD-B FR48 | Admins view platform dashboard with key metrics | FR48 | Admin Operations | Direct carry-over |
| PRD-B FR49 | Admins view and manage customer complaints | FR49 | Admin Operations | Direct carry-over |
| PRD-B FR50 | Admins view vendor performance metrics | FR50 | Admin Operations | Direct carry-over |
| PRD-B FR51 | Admins manage vendor status (active, paused, suspended) | FR51 | Admin Operations | Direct carry-over |
| PRD-B FR52 | Admins create and manage promotional campaigns | FR52 | Admin Operations | Direct carry-over |
| PRD-B FR53 | Developers access comprehensive setup documentation | FR53 | Developer Workflow | Direct carry-over |
| PRD-B FR54 | Developers find assigned Jira stories with acceptance criteria | FR54 | Developer Workflow | Direct carry-over |
| PRD-B FR55 | Developers run automated tests to validate code changes | FR55 | Developer Workflow | Direct carry-over |
| PRD-B FR56 | Developers validate changes locally via emulator or browser | FR56 | Developer Workflow | Direct carry-over |
| PRD-B FR57 | System provides pre-commit quality gates | FR57 | Developer Workflow | Direct carry-over |
| PRD-B FR58 | Team views all work items in Jira with categorization | FR58 | Project Management | Direct carry-over |
| PRD-B FR59 | Stories contain required fields (points, priority, AC) | FR59 | Project Management | Direct carry-over |
| PRD-B FR60 | Team tracks story status through development lifecycle | FR60 | Project Management | Direct carry-over |
| PRD-B FR61 | Team accesses story templates for consistent creation | FR61 | Project Management | Direct carry-over |
| PRD-B FR62 | QA executes Playwright tests for web application | FR62 | Testing Infrastructure | Direct carry-over |
| PRD-B FR63 | QA executes tests on mobile emulators | FR63 | Testing Infrastructure | Direct carry-over |
| PRD-B FR64 | QA follows documented manual testing checklists | FR64 | Testing Infrastructure | Direct carry-over |
| PRD-B FR65 | System runs automated tests as part of build process | FR65 | Testing Infrastructure | Direct carry-over |
| PRD-B FR66 | Test results visible and actionable for development team | FR66 | Testing Infrastructure | Direct carry-over |
| PRD-B FR67 | System sends push notifications for order updates | FR67 | Notifications | Direct carry-over |
| PRD-B FR68 | System sends notifications for subscription reminders | FR68 | Notifications | Direct carry-over |
| PRD-B FR69 | System sends notifications for promotional offers | FR69 | Notifications | Direct carry-over |
| PRD-B FR70 | Customers manage notification preferences | FR70 | Notifications | Direct carry-over |

### PRD A Cross-Reference — Core Platform FRs (FR71–FR168)

| Old FR# | Old Title / Description | New FR# | Domain | Notes |
|---------|------------------------|---------|--------|-------|
| PRD-A FR30 | Admin creates subscription plan templates | FR71 | Admin Dashboard | Reassigned from vendor to admin domain |
| PRD-A FR31 | Admin manages trial periods for subscription plans | FR72 | Admin Dashboard | Reassigned from vendor to admin domain |
| PRD-A FR43 | Admin views platform-wide metrics dashboard | FR73 | Admin Dashboard | Direct mapping |
| PRD-A FR44 | Admin views geographic distribution of orders by suburb | FR74 | Admin Dashboard | Direct mapping |
| PRD-A FR45 | Admin views subscription vs on-demand order ratios | FR75 | Admin Dashboard | Direct mapping |
| PRD-A FR46 | Admin generates and exports financial reports | FR76 | Admin Dashboard | Direct mapping |
| PRD-A FR47 | Admin views queue of pending vendor applications | FR77 | Admin Dashboard | Direct mapping |
| PRD-A FR48 | Admin approves or rejects vendor applications with notes | FR78 | Admin Dashboard | Direct mapping |
| PRD-A FR49 | Admin views and edits vendor profiles | FR79 | Admin Dashboard | Direct mapping |
| PRD-A FR50 | Admin suspends or reactivates vendor accounts | FR80 | Admin Dashboard | Direct mapping |
| PRD-A FR51 | Admin searches and filters vendors by status, zone, cuisine | FR81 | Admin Dashboard | Direct mapping |
| PRD-A FR52 | Admin views vendor performance metrics and ratings history | FR82 | Admin Dashboard | Direct mapping |
| PRD-A FR53 | Admin flags vendors for quality review | FR83 | Admin Dashboard | Direct mapping |
| PRD-A FR54 | Admin schedules quality check assessments | FR84 | Admin Dashboard | Direct mapping |
| PRD-A FR55 | Admin monitors all platform orders with search and filters | FR85 | Admin Dashboard | Direct mapping |
| PRD-A FR56 | Admin intervenes in order issues (cancel, refund, reassign) | FR86 | Admin Dashboard | Direct mapping |
| PRD-A FR57 | Support agent views customer complaint queue | FR87 | Admin Dashboard | Direct mapping |
| PRD-A FR58 | Support agent views complete order context | FR88 | Admin Dashboard | Direct mapping |
| PRD-A FR59 | Support agent processes refunds and credits | FR89 | Admin Dashboard | Direct mapping |
| PRD-A FR60 | Support agent responds to public reviews on behalf of vendors | FR90 | Admin Dashboard | Direct mapping |
| PRD-A FR61 | Support agent escalates issues to appropriate teams | FR91 | Admin Dashboard | Direct mapping |
| PRD-A FR62 | Support agent documents resolution in case notes | FR92 | Admin Dashboard | Direct mapping |
| PRD-A FR63 | Support agent views and updates knowledge base articles | FR93 | Admin Dashboard | Direct mapping |
| PRD-A FR64 | Super admin creates and manages admin accounts | FR94 | Admin Dashboard | Direct mapping |
| PRD-A FR65 | Super admin defines roles with specific module permissions | FR95 | Admin Dashboard | Direct mapping |
| PRD-A FR66 | Super admin assigns roles to admin users | FR96 | Admin Dashboard | Direct mapping |
| PRD-A FR67 | Admin scoped to specific zones for filtered access | FR97 | Admin Dashboard | Direct mapping |
| PRD-A FR68 | Vendor owner grants staff access with limited permissions | FR98 | Admin Dashboard | Direct mapping |
| PRD-A FR69 | Accountant role accesses financial reports without operational access | FR99 | Admin Dashboard | Direct mapping |
| PRD-A FR70 | System logs all admin actions for audit trail | FR100 | Admin Dashboard | Direct mapping |
| PRD-A FR71 | Vendor views earnings and commission breakdowns | FR101 | Vendor Portal | Direct mapping |
| PRD-A FR72 | Vendor views payout history with status | FR102 | Vendor Portal | Direct mapping |
| PRD-A FR73 | Vendor requests withdrawals from wallet balance | FR103 | Vendor Portal | Direct mapping |
| PRD-A FR74 | Vendor downloads monthly statements with GST details | FR104 | Vendor Portal | Direct mapping |
| PRD-A FR75 | Vendor generates annual tax summary documents | FR105 | Vendor Portal | Direct mapping |
| PRD-A FR76 | Admin views and manages vendor payout requests | FR106 | Admin Dashboard | Direct mapping |
| PRD-A FR77 | Admin processes manual adjustments to vendor accounts | FR107 | Admin Dashboard | Direct mapping |
| PRD-A FR78 | System calculates and deducts platform commission | FR108 | Backend APIs | System behavior |
| PRD-A FR91 | API supports all customer mobile/web requirements (70 FRs) | FR161 | Backend APIs | Direct mapping |
| PRD-A FR92 | API authenticates customers via JWT tokens | FR162 | Backend APIs | Direct mapping |
| PRD-A FR93 | API supports package listing and customization endpoints | FR163 | Backend APIs | Direct mapping |
| PRD-A FR94 | API supports cart operations with package selections | FR164 | Backend APIs | Direct mapping |
| PRD-A FR95 | API supports order placement with payment processing | FR165 | Backend APIs | Direct mapping |
| PRD-A FR96 | API supports subscription management operations | FR166 | Backend APIs | Direct mapping |
| PRD-A FR97 | System integrates with Stripe for payment processing | FR167 | Backend APIs | Direct mapping |
| PRD-A FR98 | System integrates with Firebase for push notifications | FR168 | Backend APIs | Direct mapping |

### PRD A Cross-Reference — Vendor Portal FRs (FR121–FR160)

| Old FR# | Old Title / Description | New FR# | Domain | Notes |
|---------|------------------------|---------|--------|-------|
| PRD-A FR1 | Vendor registers for an account with business details | FR121 | Vendor Portal | Direct mapping |
| PRD-A FR2 | Vendor uploads required documents (ABN, food safety, insurance) | FR122 | Vendor Portal | Direct mapping |
| PRD-A FR3 | Vendor views application status through onboarding | FR123 | Vendor Portal | Direct mapping |
| PRD-A FR4 | Vendor completes restaurant profile (name, description, cuisine, branding) | FR124 | Vendor Portal | Direct mapping |
| PRD-A FR5 | Vendor sets operating hours and off-days | FR125 | Vendor Portal | Direct mapping |
| PRD-A FR6 | Vendor defines delivery zones and radius | FR126 | Vendor Portal | Direct mapping |
| PRD-A FR7 | Vendor manages multiple restaurant locations | FR127 | Vendor Portal | Direct mapping |
| PRD-A FR8 | Vendor staff granted delegated access with permissions | FR128 | Vendor Portal | Direct mapping |
| PRD-A FR9 | Vendor creates, edits, deletes food items with images and pricing | FR129 | Vendor Portal | Direct mapping |
| PRD-A FR10 | Vendor organizes food items into categories | FR130 | Vendor Portal | Direct mapping |
| PRD-A FR11 | Vendor adds variations (size, spice level) to food items | FR131 | Vendor Portal | Direct mapping |
| PRD-A FR12 | Vendor creates add-on groups and individual add-on items | FR132 | Vendor Portal | Direct mapping |
| PRD-A FR13 | Vendor creates curry pack packages with configurable options | FR133 | Vendor Portal | Direct mapping |
| PRD-A FR14 | Vendor defines configuration groups with min/max constraints | FR134 | Vendor Portal | Direct mapping |
| PRD-A FR15 | Vendor assigns food items as options within configuration groups | FR135 | Vendor Portal | Direct mapping |
| PRD-A FR16 | Vendor sets additional charges for specific package options | FR136 | Vendor Portal | Direct mapping |
| PRD-A FR17 | Vendor reorders configuration groups and options via drag-drop | FR137 | Vendor Portal | Direct mapping |
| PRD-A FR18 | Vendor toggles availability status for food items and packages | FR138 | Vendor Portal | Direct mapping |
| PRD-A FR19 | Vendor sets seasonal availability for menu items | FR139 | Vendor Portal | Direct mapping |
| PRD-A FR20 | Vendor uploads multiple images per package | FR140 | Vendor Portal | Direct mapping |
| PRD-A FR21 | Vendor views incoming orders in real-time on a dashboard | FR141 | Vendor Portal | Direct mapping |
| PRD-A FR22 | Vendor accepts or rejects incoming orders | FR142 | Vendor Portal | Direct mapping |
| PRD-A FR23 | Vendor updates order status (accept → preparing → ready) | FR143 | Vendor Portal | Direct mapping |
| PRD-A FR24 | Vendor views order details including items and special instructions | FR144 | Vendor Portal | Direct mapping |
| PRD-A FR25 | Vendor identifies subscription vs one-time orders | FR145 | Vendor Portal | Direct mapping |
| PRD-A FR26 | Vendor views driver location and ETA for pickup | FR146 | Vendor Portal | Direct mapping |
| PRD-A FR27 | Vendor initiates partial or full refunds for orders | FR147 | Vendor Portal | Direct mapping |
| PRD-A FR28 | Vendor views order history with search and filters | FR148 | Vendor Portal | Direct mapping |
| PRD-A FR29 | Vendor generates shift handover summary | FR149 | Vendor Portal | Direct mapping |
| PRD-A FR32 | Vendor views current subscription status and features | FR150 | Vendor Portal | Admin FRs 30/31 mapped to FR71/FR72 |
| PRD-A FR33 | Vendor renews or cancels their platform subscription | FR151 | Vendor Portal | Direct mapping |
| PRD-A FR34 | Customer subscriptions scheduled for recurring delivery | FR152 | Vendor Portal | Behavioral/system FR |
| PRD-A FR35 | Customers pause subscriptions for specified date ranges | FR153 | Vendor Portal | Cross-cutting behavior |
| PRD-A FR36 | Vendor views subscription order forecasts | FR154 | Vendor Portal | Direct mapping |
| PRD-A FR37 | System generates subscription orders automatically | FR155 | Backend APIs | System behavior |
| PRD-A FR38 | Vendor views dashboard with key metrics | FR156 | Vendor Portal | Direct mapping |
| PRD-A FR39 | Vendor views sales trends over time | FR157 | Vendor Portal | Direct mapping |
| PRD-A FR40 | Vendor compares performance against platform averages | FR158 | Vendor Portal | Direct mapping |
| PRD-A FR41 | Vendor views customer ratings and feedback | FR159 | Vendor Portal | Direct mapping |
| PRD-A FR42 | Vendor exports sales and order reports | FR160 | Vendor Portal | Direct mapping |

### PRD A Cross-Reference — Cross-Cutting FRs (FR201–FR212)

| Old FR# | Old Title / Description | New FR# | Domain | Notes |
|---------|------------------------|---------|--------|-------|
| PRD-A FR79 | Vendor receives notification for new orders | FR201 | Cross-cutting | Notifications domain |
| PRD-A FR80 | Vendor receives notification for order status changes | FR202 | Cross-cutting | Notifications domain |
| PRD-A FR81 | Customer receives push notifications for order updates | FR203 | Cross-cutting | Notifications domain |
| PRD-A FR82 | Admin receives alerts for vendor performance issues | FR204 | Cross-cutting | Notifications domain |
| PRD-A FR83 | System sends email notifications for registration/verification | FR205 | Cross-cutting | Notifications domain |
| PRD-A FR84 | System sends SMS for critical order updates | FR206 | Cross-cutting | Notifications domain |
| PRD-A FR85 | Admin configures platform-wide business settings | FR207 | Cross-cutting | System Configuration |
| PRD-A FR86 | Admin manages delivery zones with geographic boundaries | FR208 | Cross-cutting | System Configuration |
| PRD-A FR87 | Admin creates and manages promotional banners | FR209 | Cross-cutting | System Configuration |
| PRD-A FR88 | Admin configures commission rates and fee structures | FR210 | Cross-cutting | System Configuration |
| PRD-A FR89 | Admin defines vendor categories and cuisine types | FR211 | Cross-cutting | System Configuration |
| PRD-A FR90 | Admin toggles feature flags for platform capabilities | FR212 | Cross-cutting | System Configuration |

### PRD A Cross-Reference — Filament Modernization FRs (FR121-F1 through FR230)

| Old FR# | Old Title / Description | New FR# | Epic | Notes |
|---------|------------------------|---------|------|-------|
| PRD-A FR99 | Vendor accesses modernized dashboard at /vendor-portal | FR121-F1 | Epic 12 | Filament foundation |
| PRD-A FR100 | Vendor panel displays CurryDash brand theme (130+ design tokens) | FR121-F2 | Epic 12 | Brand theme |
| PRD-A FR101 | Vendor employee accesses Filament panel with role-based permissions | FR121-F3 | Epic 12 | Auth integration |
| PRD-A FR102 | System enforces vendor data isolation in Filament | FR121-F4 | Epic 12 | BaseScopedResource |
| PRD-A FR103 | Existing /vendor Blade portal remains functional | FR121-F5 | Epic 12 | Dual rendering pipeline |
| PRD-A FR104 | Vendor views food items in searchable Filament table with thumbnails | FR129-F1 | Epic 13 | FoodResource read |
| PRD-A FR105 | Vendor creates/edits/deletes food items through Filament forms | FR129-F2 | Epic 14 | FoodResource CRUD |
| PRD-A FR106 | Vendor views orders in Filament with real-time status badges | FR141-F1 | Epic 13 | OrderResource |
| PRD-A FR107 | Vendor manages categories with drag-and-drop reordering | FR130-F1 | Epic 13 | CategoryResource |
| PRD-A FR108 | Vendor manages add-on groups and items through Filament | FR132-F1 | Epic 13 | AddOnResource |
| PRD-A FR109 | Vendor views and edits restaurant profile (single-record Infolist) | FR124-F1 | Epic 13 | RestaurantProfile page |
| PRD-A FR110 | Vendor manages packages with 3-tier hierarchy in Filament | FR134-F1 | Epic 14 | PackageResource |
| PRD-A FR111 | Vendor dashboard shows order summary widget | FR156-F1 | Epic 13 | OrderSummaryWidget |
| PRD-A FR112 | Vendor dashboard shows revenue widget with period comparison | FR156-F2 | Epic 13 | RevenueWidget |
| PRD-A FR113 | Vendor dashboard shows ratings overview widget | FR156-F3 | Epic 13 | RatingsWidget |
| PRD-A FR114 | Vendor dashboard shows quick action cards | FR156-F4 | Epic 13 | QuickActionsWidget |
| PRD-A FR115 | Vendor updates order status through Filament actions | FR141-F2 | Epic 14 | OrderResource actions |
| PRD-A FR116 | Vendor bulk-updates food item availability | FR138-F1 | Epic 14 | Bulk availability toggle |
| PRD-A FR117 | Vendor manages delivery staff through Filament | FR128-F1 | Epic 14 | DeliveryManResource |
| PRD-A FR118 | Vendor manages coupons through Filament | FR128-F2 | Epic 14 | CouponResource |
| PRD-A FR119 | Vendor manages employees and custom roles through Filament | FR128-F3 | Epic 14 | VendorEmployeeResource |
| PRD-A FR120 | Vendor views financial reports in Filament with export | FR160-F1 | Epic 15 | FinancialReports page |
| PRD-A FR121 | Vendor manages subscription settings through Filament | FR150-F1 | Epic 15 | Subscription page |
| PRD-A FR122 | Vendor participates in conversations/chat through Filament | FR150-F2 | Epic 15 | Conversations page |
| PRD-A FR123 | Vendor accesses POS functionality through Filament | FR150-F3 | Epic 15 | POS page |
| PRD-A FR124 | New vendor sees onboarding tour (6 steps) on first login | FR213 | Epic 16 | Driver.js Onboarding Tour |
| PRD-A FR125 | Vendor sees menu management tour on first food item creation | FR214 | Epic 16 | Driver.js Menu Tour |
| PRD-A FR126 | Vendor sees package builder tour (10 steps) on first package | FR215 | Epic 16 | Driver.js Package Tour |
| PRD-A FR127 | Vendor sees order management tour on first real order | FR216 | Epic 16 | Driver.js Order Tour |
| PRD-A FR128 | Vendor sees analytics dashboard tour after 7 days of data | FR217 | Epic 16 | Driver.js Analytics Tour |
| PRD-A FR129 | System tracks tour completion progress per vendor | FR218 | Epic 16 | vendor_tour_progress table |
| PRD-A FR130 | Vendor accesses resource center widget from any page | FR219 | Epic 17 | Resource Center |
| PRD-A FR131 | Complex form fields display contextual help icons | FR220 | Epic 17 | hintIcon tooltips |
| PRD-A FR132 | Empty states show illustrated guidance with skeleton loading | FR221 | Epic 17 | Empty states + skeletons |
| PRD-A FR133 | Vendor restarts any completed tour from resource center | FR222 | Epic 17 | Tour restart capability |
| PRD-A FR134 | All Filament status badges: icon + text + color (WCAG 1.4.1) | FR223 | Epic 13 | StatusBadge component |
| PRD-A FR135 | All images in Filament include descriptive alt text | FR224 | Epic 13 | 763 images remediated |
| PRD-A FR136 | Filament theme consumes design tokens from JSON via Tailwind | FR225 | Epic 12 | Brand token system |
| PRD-A FR137 | Data tables and widgets use skeleton loading (not spinners) | FR226 | Epic 13 | Skeleton loading components |
| PRD-A FR138 | Vendor portal renders on mobile viewports (375px+) | FR227 | Epic 18 | Story 18.5 |
| PRD-A FR139 | Vendor receives browser notification on new order via Echo + WebSocket | FR228 | Epic 14 | Story 14.7 real-time |
| PRD-A FR140 | Dashboard includes visual charts with accessible data tables | FR229 | Epic 15 | Story 15.5 ApexCharts |
| PRD-A FR141 | Food images use neutral backgrounds with padding and lazy loading | FR230 | Epic 13 | FoodImage component |

---

## Appendix B: NFR Conflict Resolution Log

This log documents every case where PRD A (Admin-Seller Portal, 53 NFRs) and PRD B (User Web/Mobile, 60 NFRs) specified different values for the same non-functional requirement dimension. In all cases, the stricter standard was adopted. Where the two PRDs address different layers of the same stack (e.g., backend processing time vs client-perceived time), both values are preserved with explicit scope labels. The decisions recorded here are authoritative and must not be overridden without a formal PRD amendment.

| NFR Dimension | PRD A Value | PRD B Value | Master PRD Decision | Rationale |
|---------------|-------------|-------------|---------------------|-----------|
| WCAG Level | Level A (NFR-A-35: "WCAG 2.1 Level A compliance for admin and vendor dashboards") | Level AA (NFR-B-38 through NFR-B-45: "All interactive elements comply with WCAG 2.1 AA") | **AA — PRD B wins (stricter)** | WCAG AA provides substantially better accessibility coverage, particularly for users with low vision (contrast) and motor disabilities (touch targets). AA is the industry standard for commercial platforms. PRD A's Level A was a conservative initial target; the Filament implementation (Epic 12.6, Epic 18.6) already implements AA. |
| API response time | <200ms p95 (NFR-A-1: "API responses complete within 200ms for 95th percentile requests") | <2s (NFR-B-3: "API responses return within 2 seconds under normal load") | **Both preserved at different layers: <200ms backend SLA (PRD A governs server processing); <2s client-perceived end-to-end (PRD B governs Flutter UX)** | The two PRDs measure the same dimension from different perspectives. PRD A measures server response time (time from request received to response sent by Laravel). PRD B measures client-perceived time (including network transit). Both are valid and non-conflicting. Setting only the client-side target would mask backend regressions. |
| Mobile app cold start | Not specified (PRD A is server-side only) | <3s mobile, <2s web FCP (NFR-B-1) | **PRD B values adopted** | PRD A governs a server-side application; cold start is not applicable. PRD B specifies the only relevant target. |
| Platform availability SLA | 99.5% during business hours (6am–11pm AEST) (NFR-A-27) | 99.5% during business hours with peak ordering hours defined (11am–2pm, 5pm–9pm) (NFR-B-29, NFR-B-30) | **99.5% adopted — PRD B adds maintenance window specificity** | Both PRDs agree on 99.5%. PRD B adds value by specifying peak ordering hours (maintenance-excluded windows). Master PRD combines both: 99.5% availability, no planned maintenance during 11am–2pm or 5pm–9pm. |
| Data durability (confirmed orders) | 100% — no orders lost under any failure (NFR-A-28) | Zero data loss for confirmed orders (NFR-B-36) | **100% RPO for confirmed orders — both PRDs agree** | Identical requirement. Master PRD adopts the explicit zero-RPO framing. |
| Test coverage | Not explicitly quantified in PRD A (NFR-A-49: "Critical business logic has automated test coverage") | >80% for critical paths (NFR-B-54) | **>80% adopted for both stacks** | PRD B provides the explicit numeric target that PRD A lacked. The current Laravel implementation (547 PHPUnit tests) and Playwright E2E suite (315 tests) are consistent with this target. |
| Touch target size | 44x44px (PRD A UX audit source: FR227 references "44x44px minimum" for Filament mobile) | 48x48dp (NFR-B-40) | **48x48dp — PRD B wins (stricter)** | 48x48dp is Android Material Design's recommendation and is stricter than Apple's 44x44pt guideline. Because CurryDash targets both platforms, the more conservative value ensures compliance on both. All Filament portal mobile-responsive elements and Flutter app interactive elements must meet 48x48dp. |
| Admin/vendor session timeout | 30 minutes inactivity (NFR-A-12: "Admin session timeout after 30 minutes of inactivity") | 30 days inactivity for customer (NFR-B-13: "Sessions expire after 30 days of inactivity") | **Platform-specific — both preserved** | The PRDs address different user roles. PRD A's 30-minute admin/vendor timeout is the security-appropriate value for operators with privileged access. PRD B's 30-day timeout is appropriate for consumer customer sessions where re-authentication friction reduces app retention. Master PRD applies each to its appropriate role. |
| JWT token expiry | 24 hours with refresh token rotation (NFR-A-11) | 30 days (NFR-B-13 — applied to session expiry broadly) | **24h JWT with refresh for all API tokens; 30-day inactivity window for customer sessions before hard re-authentication required** | JWT short expiry (24h) with rotation is a security best practice that PRD A specifies correctly. The 30-day PRD B value governs inactivity-based session termination (a separate dimension). Both can coexist: short-lived JWTs that silently refresh as long as the customer is active within 30 days. |
| Transport encryption | HTTPS/TLS (NFR-A-9: "All API communication encrypted via TLS 1.2+") | TLS 1.2+ (NFR-B-16) | **TLS 1.2 minimum, TLS 1.3 preferred** | Both PRDs agree on TLS 1.2 as the floor. Master PRD adds TLS 1.3 preference as a forward-looking security improvement without mandating it at launch. |
| PCI-DSS compliance | PCI-DSS via Stripe SDK only, no card data stored (NFR-A-13, NFR-A-14) | PCI-DSS compliance, payment card data never stored locally (NFR-B-17) | **Full-stack PCI-DSS compliance — both PRDs agree** | Identical requirement approached from different layers (server vs client). Master PRD applies to both: no card data stored in MySQL or on Flutter client device. |
| Australian Privacy Principles | APP compliance (NFR-A-15) | APP compliance (NFR-B-19) | **APP compliance — both PRDs agree** | Identical legal requirement. Master PRD applies to both stacks under the same jurisdiction. |
| Concurrent user capacity | Not explicitly quantified in PRD A | 1,000 concurrent users (NFR-B-7) | **1,000 concurrent users — PRD B sets the sizing target for PRD A backend** | PRD B specifies the load the Flutter app will generate against the Laravel backend. PRD A must be sized to handle this. The 1,000 concurrent user target is a backend infrastructure requirement derived from PRD B's specification. |
| Peak throughput (orders/minute) | Not explicitly quantified in PRD A | 100 orders/minute peak (NFR-B-8) | **100 orders/minute — PRD B sets the processing target for Laravel Horizon** | Same reasoning as concurrent users. PRD B's throughput target defines the processing rate Laravel Horizon queue workers must sustain. |
| Peak traffic multiplier | 3x normal traffic during promotions (NFR-A-23) | 3x normal traffic during promotional events (NFR-B-26) | **3x — both PRDs agree** | Identical requirement. |
| Offline capability | Not applicable (server-side application) | Required — Drift DB + offline queue (NFR-B-37) | **Flutter-only requirement — no conflict** | PRD A is a server-side application. Offline capability is meaningful only for the Flutter client. No conflict; PRD B governs exclusively. |
| App size | Not applicable (server-side application) | <50MB mobile, <2MB web bundle (NFR-B-10, NFR-B-11) | **Flutter-only requirement — PRD B values adopted** | No conflict with PRD A. |
| Recovery Time Objective (RTO) | 4 hours maximum unplanned downtime per incident (NFR-A-34) | <15 minutes RTO (NFR-B-35) | **<15 minutes RTO — PRD B wins (stricter)** | PRD B's <15-minute RTO is the recovery time target. PRD A's 4-hour maximum is the escalation threshold before a major incident declaration — a different dimension. Master PRD adopts the <15 minute RTO and retains the 4-hour escalation trigger as a separate operational rule. |
| Recovery Point Objective (RPO) | No orders lost under any failure (NFR-A-28) | Zero data loss for confirmed orders (NFR-B-36) | **Zero RPO for confirmed orders — both PRDs agree** | Equivalent statements. Master PRD uses the more precise "confirmed orders" scope. |
| Database query performance | <100ms standard operations (NFR-A-4) | <100ms standard operations (NFR-B-9) | **<100ms — both PRDs agree** | Identical requirement. |
| Push notification delivery | Within 3 seconds for vendor portal (NFR-A-5) | Within 30 seconds end-to-end (NFR-B-49) | **Both preserved: <3s vendor browser notification (PRD A); <30s end-to-end FCM delivery to customer device (PRD B)** | Both are valid targets for different delivery channels. PRD A's 3-second target is for WebSocket/browser delivery to the Filament portal. PRD B's 30-second target is for Firebase FCM delivery to mobile devices, which has additional latency from FCM infrastructure. |
| Rate limiting (auth endpoints) | 5 requests/minute per endpoint category (NFR-A-19) | 5 attempts per 15 minutes (NFR-B-14) | **5 attempts per 15 minutes — PRD B is more specific; PRD A governs implementation** | PRD B provides the user-facing rate limit specification. PRD A implements it at the Laravel throttle middleware layer. The values are compatible: 5/15min is more permissive than 5/min, but the intent of both is brute-force prevention. Master PRD adopts PRD B's explicit value as the minimum bar. |
| Build success rate | Not explicitly specified in PRD A | >95% first attempt (NFR-B-55) | **>95% — PRD B value adopted for both CI pipelines** | PRD B provides the explicit numeric target. It applies equally to the Laravel (PRD A) and Flutter (PRD B) CI pipelines. |
| Scalability growth | 10x without architecture changes (NFR-A-21) | 10x without re-architecture (NFR-B-23) | **10x — both PRDs agree** | Identical requirement. |

---

*End of CurryDash Master PRD — Sections 6–11 and Appendices A & B*

**Document Stats:**
- Total words (approximate): ~10,200
- NFRs defined: 56 (consolidated from 113 source NFRs across both PRDs — de-duplicated and conflict-resolved)
- NFR conflict decisions logged: 22 dimensions in Appendix B
- FR cross-reference rows: 186 total (70 PRD B + 116 PRD A, including Filament modernization FRs)
- Sections produced: Section 6 (9 subsections), Section 7 (5 subsections), Section 8 (4 subsections), Section 9 (3 subsections), Section 10, Section 11 (4 subsections), Appendix A (3 tables), Appendix B (1 authoritative table)
