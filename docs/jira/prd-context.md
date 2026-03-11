# CurryDash Master PRD -- Structured Summary

> Source: `docs/prd.md` (3304 lines, ~10,200 words)
> PRD Version: 1.0, February 2026, Living Document
> Summary generated: 2026-03-06

---

## 1. Executive Summary

**CurryDash** is a **subscription-marketplace hybrid food delivery platform** purpose-built for the Sri Lankan diaspora community in Victoria, Australia (primarily Casey, Monash, and Greater Dandenong LGAs). It combines two service models on a shared backend:

- **HelloFresh-style subscription model** -- Configurable curry pack meal kits (CPFP -- Curry Pack For People) with recurring delivery schedules (weekly, bi-weekly, monthly).
- **UberEats-style on-demand marketplace** -- Individual food item ordering from multiple Sri Lankan vendors without subscription commitment.

The platform serves three constituencies:
1. **Customers** -- Sri Lankan diaspora and broader Victorian food market
2. **Vendors** -- Restaurant operators, home kitchen vendors, cloud kitchen operators
3. **Operations team** -- CurryDash admins, support agents, accountants

**Business model:** Dual revenue -- commission-based marketplace fees + tiered vendor subscription fees + customer subscription revenue (CPFP).

**Technical foundation:** Brownfield project built on StackFood Multivendor commercial base. Customer App is Flutter; Admin/Vendor backend is Laravel 10.x.

### Major Modules

| Module | Description |
|--------|-------------|
| CPFP (Curry Pack For People) | 3-tier configurable meal kit system (Package > Configuration > Option) |
| Customer App | Flutter cross-platform app (iOS/Android/Web) for ordering, subscriptions |
| Admin Dashboard | Laravel Blade portal for platform operations, vendor management, support |
| Vendor Portal (Legacy) | Laravel Blade vendor management at `/vendor` |
| Vendor Portal (Filament) | Modernized Filament 3.x vendor portal at `/vendor-portal` |
| Backend APIs | REST API layer (`/api/v1/`) serving 100+ endpoints |
| Notification System | FCM push, WebSocket, email, SMS across all platforms |
| Payment System | 12+ gateway integrations (Stripe primary for Australia) |

---

## 2. Project Structure -- Apps/Portals

### 2.1 Customer App (Flutter)
- **Tech:** Flutter 3.4.4+, Dart, GetX state management, feature-first clean architecture (34 feature modules)
- **Platforms:** iOS 12+, Android API 21+, Web
- **Offline:** Drift (SQLite) local DB + offline queue
- **Auth:** Firebase Auth (Google, Apple sign-in) + JWT (`auth:api` guard)
- **Repos:** `User-Web-Mobile` repository, `main` branch
- **Jira projects:** CUR (customer API), PACK (infrastructure/dev workflow), CCW (web frontend)
- **Status:** Production-ready (branding migration in progress from StackFood)

### 2.2 Admin Dashboard (Laravel Blade)
- **Tech:** Laravel 10.x, PHP 8.2.12, Blade templates, MySQL
- **URL:** `/admin`
- **Auth guard:** `auth:admin` with role-based access control
- **Roles:** Super admin, operations, support, marketing, accountant
- **Jira project:** CAD
- **Status:** Production-ready
- **Note:** NOT in scope for Filament modernization (deferred to Phase 4c)

### 2.3 Vendor Portal -- Legacy Blade
- **Tech:** Laravel 10.x Blade
- **URL:** `/vendor`
- **Auth guard:** `auth:vendor`, `auth:vendor_employee`
- **Jira project:** CAR
- **Status:** Production-ready, always available as fallback

### 2.4 Vendor Portal -- Filament 3.x (Modernized)
- **Tech:** Laravel 10.x + Filament 3.x (TALL stack: Tailwind, Alpine, Livewire v3, Laravel)
- **URL:** `/vendor-portal`
- **Auth:** Same `auth:vendor` guard, extended with `FilamentUser` interface
- **Feature flag:** Gated by `FEATURE_FILAMENT_VENDOR` env flag + per-vendor `filament_portal_enabled` DB column
- **Resources:** 9 Filament resources (Food, Package, Order, Category, AddOn, Coupon, DeliveryMan, VendorEmployee, Customer)
- **Custom pages:** 6 (RestaurantProfile, FinancialReports, Subscription, POS, Conversations, NotificationCenter)
- **Widgets:** 11 dashboard widgets
- **Jira project:** CAR
- **Status:** Epics 12-18 complete, 547 PHPUnit + 315 E2E tests passing, PR to UAT pending

### 2.5 Driver/Delivery Staff
- **Managed by:** Vendors or admin as delivery staff (not self-served)
- **Driver self-signup:** Permanently out of scope
- **Driver app:** Separate Flutter mobile application (out of PRD scope)

### 2.6 Backend APIs
- **URL:** `/api/v1/`
- **Endpoints:** 100+ REST endpoints
- **Auth guards:** `auth:api` (customer), `auth:admin`, `auth:vendor`
- **Jira project:** CUR (customer-facing), CAD (admin)

---

## 3. Functional Requirements (FR) Index

### FR Numbering Scheme

| FR Range | Domain | Platform | Status |
|----------|--------|----------|--------|
| FR1-FR70 | Customer App | Flutter | Partial (brand migration in progress) |
| FR71-FR108 | Admin Dashboard + Financial | Laravel Blade | Implemented |
| FR109-FR120 | Admin Dashboard (reserved) | Laravel Blade | Reserved |
| FR121-FR160 | Vendor Portal | Blade + Filament 3.x | Implemented |
| FR161-FR168 | Backend APIs (core) | Laravel REST | Implemented |
| FR169-FR200 | Backend APIs (reserved) | Laravel REST | Reserved |
| FR201-FR215 | Cross-Cutting (Notifications, Config) | Full Stack | Implemented |
| FR216-FR219 | Feature Flag System | Backend + Admin | Implemented |
| FR220-FR238 | Interactive Tours + Accessibility | Vendor Portal | Implemented |
| **Total** | **206 defined** | | |

---

### 3.1 Customer App (FR1-FR70)

#### Brand Identity (FR1-FR5)
- **FR1** -- CurryDash branding (name, logo, colors) across all screens [In Progress]
- **FR2** -- CurryDash app icon on home screens and app stores [Planned]
- **FR3** -- CurryDash splash screen with Turmeric Gold palette [Planned]
- **FR4** -- Remove all legacy StackFood references [In Progress]
- **FR5** -- Consistent CurryDash color scheme via `lib/util/colors.dart` [In Progress]

#### Customer Account Management (FR6-FR10)
- **FR6** -- Account creation (email, phone, social login) [Done]
- **FR7** -- Auth with saved credentials or biometrics [Done]
- **FR8** -- Profile management (name, photo, dietary prefs) [Done]
- **FR9** -- Multiple delivery addresses with default [Done]
- **FR10** -- Saved payment methods [Done]

#### Restaurant Discovery and Browsing (FR11-FR15)
- **FR11** -- Browse restaurants filtered by location [Done]
- **FR12** -- Search by name, cuisine, dish (<1s) [Done]
- **FR13** -- Restaurant detail (ratings, hours, delivery time, fees, min order) [Done]
- **FR14** -- Full menu browsing (food items + packages by category) [Done]
- **FR15** -- Package detail view with config options and pricing [Done]

#### Package Customization -- CPFP (FR16-FR20)
- **FR16** -- Select config options (protein, spice 1-5, sides, dietary) [Done]
- **FR17** -- Enforce min/max selection constraints per config group [Done]
- **FR18** -- Real-time price adjustment display during selection [Done]
- **FR19** -- Customization summary before add-to-cart [Done]
- **FR20** -- Vendor-defined configs without code changes; app renders dynamically [Done]

#### Cart and Checkout (FR21-FR26)
- **FR21** -- Add packages and food items to cart (<500ms) [Done]
- **FR22** -- Modify cart (quantity, options, remove) [Done]
- **FR23** -- Apply promo codes/discounts with validation [Done]
- **FR24** -- Delivery address selection + time slot [Done]
- **FR25** -- Payment via saved or new method (all configured gateways) [Done]
- **FR26** -- Order confirmation with number, ETA, summary [Done]

#### Subscription Management (FR27-FR32)
- **FR27** -- Subscribe to recurring curry pack deliveries [Done]
- **FR28** -- Select frequency (weekly/bi-weekly/monthly) and delivery day [Done]
- **FR29** -- Pause/skip deliveries (2 taps max, may offer alternative) [Done]
- **FR30** -- Modify subscription (package, customization, delivery prefs) [Done]
- **FR31** -- Cancel subscription with confirmation step [Done]
- **FR32** -- Reminder notifications before scheduled delivery [Done]

#### Order Tracking and Delivery (FR33-FR37)
- **FR33** -- Real-time order status (confirmed > preparing > ready > assigned > transit > delivered) [Done]
- **FR34** -- Complete order history with details [Done]
- **FR35** -- Reorder from previous orders [Done]
- **FR36** -- Push notifications for all order status changes [Done]
- **FR37** -- Contact support from order tracking screen [Done]

#### Customer Support (FR38-FR41)
- **FR38** -- Report issues with photo upload (camera or library) [Done]
- **FR39** -- View support ticket status and history [Done]
- **FR40** -- Auto-route issues to appropriate queue by type [Done]
- **FR41** -- Support staff view/respond via admin dashboard [Done]

#### Customer Profile / Vendor Mobile View (FR42-FR47)
- **FR42** -- Vendors manage restaurant profile and hours [Done]
- **FR43** -- Vendors create/edit menu items and packages [Done]
- **FR44** -- Vendors define package configs and pricing [Done]
- **FR45** -- Vendors set item availability and seasonal offerings [Done]
- **FR46** -- Vendors view orders grouped by time slot [Done]
- **FR47** -- Vendors update order status (preparing, ready) [Done]

#### Admin Operations -- Mobile Context (FR48-FR52)
- **FR48** -- Admin views platform dashboard (orders, vendors, customers, revenue) [Done]
- **FR49** -- Admin manages complaint queue with order context [Done]
- **FR50** -- Admin views vendor performance metrics [Done]
- **FR51** -- Admin manages vendor status (activate/pause/suspend) [Done]
- **FR52** -- Admin creates/manages promotional campaigns [Done]

#### Developer & Project Management Infrastructure (FR53-FR66)
- **FR53** -- Developer setup docs (<1 hour to working env) [Done]
- **FR54** -- Jira stories with acceptance criteria in PACK project [Done]
- **FR55** -- Automated tests for critical paths [In Progress]
- **FR56** -- Local validation via emulator/browser [Done]
- **FR57** -- Pre-commit quality gates (lint, format, analyzer) [Planned]
- **FR58** -- Jira work items with categorization [Done]
- **FR59** -- Stories with all fields (points, priority, AC) [Done]
- **FR60** -- Story status lifecycle (Backlog > In Progress > In Review > Done) [Done]
- **FR61** -- Story templates for consistent creation [Done]
- **FR62** -- Playwright E2E tests for Flutter web [Planned]
- **FR63** -- Tests on mobile emulators [Planned]
- **FR64** -- Manual testing checklists [Planned]
- **FR65** -- Automated tests in build process, blocking merges [Planned]
- **FR66** -- Test results visible in CI dashboard [Planned]

#### Notifications (FR67-FR70)
- **FR67** -- Push notifications for order lifecycle updates (<30s via FCM) [Done]
- **FR68** -- Subscription reminder notifications (24h before delivery) [Done]
- **FR69** -- Promotional offer notifications (opted-in customers only) [Done]
- **FR70** -- Notification preference management per category [Done]

---

### 3.2 Admin Dashboard (FR71-FR120)

#### Vendor Management and Approval (FR71-FR84)
- **FR71** -- Create subscription plan templates [Done]
- **FR72** -- Manage trial period configs [Done]
- **FR73** -- Platform-wide metrics dashboard (GMV, vendors, acquisition, subscriptions) [Done]
- **FR74** -- Geographic order distribution by suburb/zone [Done]
- **FR75** -- Subscription vs on-demand order ratios [Done]
- **FR76** -- Financial reports (gross/net revenue, payouts, refunds) [Done]
- **FR77** -- Vendor application queue (sorted by date, completeness, risk) [Done]
- **FR78** -- Approve/reject vendor apps with notes [Done]
- **FR79** -- View/edit vendor profiles [Done]
- **FR80** -- Suspend/reactivate vendor accounts [Done]
- **FR81** -- Search/filter vendors (status, zone, cuisine, rating) [Done]
- **FR82** -- Vendor performance metrics and ratings history [Done]
- **FR83** -- Flag vendors for quality review [Done]
- **FR84** -- Schedule quality check assessments [Done]

#### Order Administration (FR85-FR86)
- **FR85** -- Monitor all platform orders with search/filter [Done]
- **FR86** -- Order intervention (cancel, refund, reassign delivery, add notes) [Done]

#### Customer Support and Complaint Management (FR87-FR93)
- **FR87** -- Complaint queue with filter (type, priority, vendor, age) [Done]
- **FR88** -- Complete complaint context (timeline, vendor, GPS, photos, comms) [Done]
- **FR89** -- Process refunds and credits from complaint interface [Done]
- **FR90** -- Respond to public reviews on behalf of vendors [Done]
- **FR91** -- Escalate issues to internal teams [Done]
- **FR92** -- Case notes for audit trail [Done]
- **FR93** -- Knowledge base management [Done]

#### User and Role Management (FR94-FR100)
- **FR94** -- Create/manage admin accounts [Done]
- **FR95** -- Define admin roles with module-level permissions [Done]
- **FR96** -- Assign roles (immediate effect) [Done]
- **FR97** -- Zone-scoped admin access [Done]
- **FR98** -- Vendor staff delegated access with permissions [Done]
- **FR99** -- Accountant role (financial only) [Done]
- **FR100** -- Admin action audit logging (immutable, exportable) [Done]

#### Financial Management (FR101-FR108)
- **FR101** -- Vendor views earnings/commission breakdowns [Done]
- **FR102** -- Vendor views payout history (status, date, bank details) [Done]
- **FR103** -- Vendor requests wallet withdrawals [Done]
- **FR104** -- Monthly statements with GST (CSV/XLSX) [Done]
- **FR105** -- Annual tax summary documents [Done]
- **FR106** -- Admin manages payout requests (approve/hold/reject) [Done]
- **FR107** -- Admin manual balance adjustments with audit trail [Done]
- **FR108** -- Auto commission deduction on order fulfillment [Done]

#### FR109-FR120 -- Reserved for future use

---

### 3.3 Vendor Portal (FR121-FR160)

#### Restaurant Profile and Settings (FR121-FR128)
- **FR121** -- Vendor registration (restaurants + home kitchens) [Done]
  - FR121-F1: Access Filament portal with existing credentials [Done]
  - FR121-F2: CurryDash brand theme (130+ design tokens, 60-30-10 color rule) [Done]
  - FR121-F3: Employee role-based access in Filament [Done]
  - FR121-F4: Vendor data isolation via `BaseScopedResource` + `restaurant_id` scoping [Done]
  - FR121-F5: Legacy Blade portal remains functional alongside Filament [Done]
- **FR122** -- Upload registration documents (ABN, food safety, insurance) [Done]
- **FR123** -- Application status tracking with stage-by-stage progress [Done]
- **FR124** -- Restaurant profile (name, description, cuisine, branding, heritage story) [Done]
  - FR124-F1: Single-record Filament Infolist at `/vendor-portal/restaurant-profile` [Done]
- **FR125** -- Operating hours per day + off-days with date ranges [Done]
- **FR126** -- Delivery zones/radius with zone-based min order + fees [Done]
- **FR127** -- Multi-location management [Done]
- **FR128** -- Staff delegated access (shift manager, kitchen staff, accountant) [Done]
  - FR128-F1: DeliveryManResource in Filament [Done]
  - FR128-F2: Coupon management with date-range pickers [Done]
  - FR128-F3: VendorEmployeeResource with granular permissions [Done]

#### Menu Management -- Foods, Categories, Add-ons (FR129-FR132)
- **FR129** -- Food item CRUD (descriptions, multiple images, pricing, allergens) [Done]
  - FR129-F1: Searchable/sortable Filament table with thumbnails [Done]
  - FR129-F2: Filament forms with image upload (lazy loading, placeholder SVG) [Done]
- **FR130** -- Category management (create, rename, reorder, delete) [Done]
  - FR130-F1: Filament CategoryResource with drag-and-drop reordering [Done]
- **FR131** -- Food item variations (size, spice) with per-variation pricing [Done]
- **FR132** -- Add-on groups and items with optional pricing [Done]
  - FR132-F1: Filament AddOnResource [Done]

#### Package System (Curry Pack) Management (FR133-FR140)
- **FR133** -- Create packages (name, description, pricing, images) [Done]
- **FR134** -- Define config groups with min/max constraints [Done]
  - FR134-F1: Full 3-tier hierarchy management in Filament PackageResource [Done]
- **FR135** -- Assign food items as options in config groups [Done]
- **FR136** -- Set price modifiers per package option [Done]
- **FR137** -- Reorder config groups and options via drag-and-drop [Done]
- **FR138** -- Toggle availability (available/out of stock, immediate effect) [Done]
  - FR138-F1: Bulk availability toggle in Filament with audit log [Done]
- **FR139** -- Seasonal availability with start/end dates [Done]
- **FR140** -- Multiple images per package [Done]

#### Order Management and Fulfillment (FR141-FR149)
- **FR141** -- Real-time incoming order dashboard [Done]
  - FR141-F1: Filament OrderResource with WCAG status badges (icon + text + color) [Done]
  - FR141-F2: Order status actions in Filament (accept, preparing, ready, picked up) [Done]
- **FR142** -- Accept/reject orders (mandatory reject reason, triggers refund) [Done]
- **FR143** -- Order status workflow (accept > preparing > ready) with auto-notifications [Done]
- **FR144** -- Order detail (items, customizations, special instructions, address) [Done]
- **FR145** -- Subscription vs one-time order distinction [Done]
- **FR146** -- Driver location and ETA for pickup [Done]
- **FR147** -- Initiate partial/full refunds (reason required) [Done]
- **FR148** -- Order history with search/filter [Done]
- **FR149** -- Shift handover summary generation [Done]

#### Financial Reports and Payouts (FR150-FR155)
- **FR150** -- Subscription status, plan features, billing history [Done]
  - FR150-F1: Filament Subscription page [Done]
  - FR150-F2: Conversations/chat page (5s polling) [Done]
  - FR150-F3: POS page (product grid, cart, receipt printing) [Done]
- **FR151** -- Renew/cancel subscription (effective end of billing period) [Done]
- **FR152** -- Subscription scheduling (daily/weekly/monthly, customer + vendor day matching) [Done]
- **FR153** -- Pause subscriptions for date range (no charge during pause) [Done]
- **FR154** -- Subscription forecast calendar [Done]
- **FR155** -- Auto-generate subscription orders on schedule [Done]

#### Analytics (FR156-FR160)
- **FR156** -- Dashboard with KPIs (orders, revenue, AOV, rating) [Done]
  - FR156-F1 through FR156-F4: Filament widgets (OrderSummary, Revenue, Ratings, QuickActions) [Done]
- **FR157** -- Sales trends (daily/weekly/monthly) with accessible charts [Done]
- **FR158** -- Benchmark against anonymized platform averages [Done]
- **FR159** -- Customer ratings/feedback with filter [Done]
- **FR160** -- CSV export of sales/order reports [Done]
  - FR160-F1: Filament FinancialReports page with date-range filter and CSV export [Done]

---

### 3.4 Backend APIs (FR161-FR200)

- **FR161** -- All 70 customer app FRs supported via REST API (100+ endpoints) [Done]
- **FR162** -- JWT auth for all customer endpoints (30-day inactivity timeout) [Done]
- **FR163** -- Package listing/customization endpoints (full 3-tier hierarchy) [Done]
- **FR164** -- Cart operations with full customization state [Done]
- **FR165** -- Atomic order placement with payment processing [Done]
- **FR166** -- Subscription management API (create, update, pause, skip, modify, cancel, history) [Done]
- **FR167** -- Stripe payment integration (SDK-only, PCI-DSS) [Done]
- **FR168** -- Firebase FCM push notifications (<30s delivery) [Done]
- **FR169-FR200** -- Reserved for future expansion

---

### 3.5 Cross-Cutting Requirements (FR201-FR238)

#### Notification System (FR201-FR206)
- **FR201** -- Vendor new order notifications (browser + sound + email, <3s) [Done]
- **FR202** -- Vendor notifications for external order status changes [Done]
- **FR203** -- Customer push notifications for all order status updates (<30s FCM) [Done]
- **FR204** -- Admin alerts for vendor performance threshold breaches [Done]
- **FR205** -- Transactional email (registration, approval, password reset, verification) [Done]
- **FR206** -- SMS for critical order updates (configurable, failover) [Done]

#### Payment Gateway Integration (FR207-FR209)
- **FR207** -- 12+ payment gateway integrations (Stripe, PayPal, Razorpay, etc.) [Done]
- **FR208** -- Atomic payment transactions (no partial states) [Done]
- **FR209** -- No card data stored locally (PCI-DSS via SDK tokens) [Done]

#### System Configuration (FR210-FR215)
- **FR210** -- Business settings (min order, delivery fees, cutoff times, GST) [Done]
- **FR211** -- Delivery zone management (polygon boundaries, fee tiers) [Done]
- **FR212** -- Promotional banners (scheduling, targeting, linked promo codes) [Done]
- **FR213** -- Commission rates per vendor category or individual vendor [Done]
- **FR214** -- Vendor categories and cuisine type taxonomies [Done]
- **FR215** -- Platform-wide feature flags without code deployment [Done]

#### Feature Flag System (FR216-FR219)
- **FR216** -- Two-tier flags: global `.env` + per-vendor DB column [Done]
- **FR217** -- Per-feature flags: FILAMENT_VENDOR, FILAMENT_FOOD, FILAMENT_ORDERS, FILAMENT_PACKAGES, INTERACTIVE_TOURS [Done]
- **FR218** -- Admin toggles `filament_portal_enabled` per vendor from admin dashboard [Done]
- **FR219** -- FilamentFeatureMiddleware enforces flags at route level [Done]

#### Interactive Onboarding Tours (FR220-FR226)
- **FR220** -- 6-step onboarding tour on first Filament login (auto-start, resumable, skippable) [Done]
- **FR221** -- 5-step menu management tour (triggered on first food item creation) [Done]
- **FR222** -- 10-step package builder tour (triggered on first package creation) [Done]
- **FR223** -- 4-step order management tour (triggered on first real order, no skip) [Done]
- **FR224** -- 5-step analytics tour (triggered after 7 days of data) [Done]
- **FR225** -- Tour completion tracking per vendor (`vendor_tour_progress` table) [Done]
- **FR226** -- All tours via Driver.js (5KB CDN), respect `prefers-reduced-motion` [Done]

#### Resource Center and Contextual Help (FR227-FR230)
- **FR227** -- Global resource center widget (slide-out panel, checklist, articles, tours) [Done]
- **FR228** -- Contextual help tooltips (hintIcon) on complex form fields [Done]
- **FR229** -- Empty states with illustrated guidance + skeleton loading [Done]
- **FR230** -- Tour restart from Resource Center [Done]

#### Accessibility and UX Compliance (FR231-FR238)
- **FR231** -- Status badges: icon + text + color (WCAG 1.4.1) [Done]
- **FR232** -- All images have descriptive alt text [Done]
- **FR233** -- Theme via design tokens from JSON (no hardcoded colors) [Done]
- **FR234** -- Skeleton loading (not spinners), shimmer respects `prefers-reduced-motion` [Done]
- **FR235** -- Mobile responsive from 375px, 44x44px touch targets, camera capture [Done]
- **FR236** -- Browser notifications with audio alert + Service Worker for background [Done]
- **FR237** -- Dashboard charts (ApexCharts) with accessible data table alternatives [Done]
- **FR238** -- Food images: neutral background, lazy loading, fallback SVG [Done]

---

## 4. Non-Functional Requirements (NFR) Summary

56 consolidated NFRs from 113 source NFRs across both PRDs. Organized into 9 categories:

### 4.1 Performance (NFR-P1 to NFR-P19)
- Backend API: <200ms at p95 (NFR-P1)
- Client-perceived: <2s end-to-end (NFR-P2)
- Mobile cold start: <3s (NFR-P3)
- Web FCP: <2s (NFR-P4)
- Screen transitions: <300ms (NFR-P5)
- Dashboard TTI: <2s (NFR-P6)
- AJAX operations: <500ms (NFR-P7)
- DB queries: <100ms standard (NFR-P8)
- Search: <1s (NFR-P9)
- Image loading: <1s with lazy loading (NFR-P10)
- Cart operations: <500ms (NFR-P11)
- Concurrency: 1,000 concurrent users (NFR-P12)
- Peak throughput: 100 orders/minute (NFR-P13)
- Real-time notifications: <3s vendor, <30s customer FCM (NFR-P14)
- Image upload: <5s for up to 5MB (NFR-P15)
- Report generation: <30s (NFR-P16)
- App size: <50MB mobile, <2MB web gzipped (NFR-P17/P18)
- CDN for static assets (NFR-P19)

### 4.2 Security (NFR-S1 to NFR-S14)
- TLS 1.2+ (1.3 preferred) for all communication
- bcrypt password hashing (cost 12+)
- Multi-guard JWT + OAuth 2.0 authentication
- 24h JWT expiry with refresh rotation; 30min admin/vendor session timeout
- Rate limiting: 5/15min for auth, 60/min customer API, 120/min admin/vendor API
- PCI-DSS via Stripe SDK only (no card data stored)
- Encryption at rest for sensitive data
- Australian Privacy Principles (APP) compliance
- RBAC at API layer + view layer
- Immutable audit logs (12-month retention)
- SQL injection/XSS prevention via Eloquent + Blade escaping
- File upload: JPEG/PNG/WebP/PDF only, 5MB max, server-side validation

### 4.3 Scalability (NFR-SC1 to NFR-SC6)
- 10x growth without re-architecture
- DB supports read replicas and sharding by `restaurant_id`
- 3x traffic handling during promotional events
- 100+ concurrent DB connections
- Async processing via Laravel Horizon (email, SMS, PDF, push)
- Graceful degradation on capacity limits

### 4.4 Reliability (NFR-R1 to NFR-R12)
- 99.5% availability during business hours (6am-11pm AEST)
- No maintenance during peak (11am-2pm, 5pm-9pm)
- RTO: <15 minutes; escalation at 4 hours
- RPO: Zero data loss for confirmed orders
- Daily DB backups (7-day retention), 24h point-in-time recovery
- Atomic payment transactions (ACID)
- Order durability before confirmation response
- 3 retries on transient failures
- Timezone-safe subscription scheduling (AEST/AEDT)
- Graceful degradation for external services
- 60-second health check intervals
- Offline sync with conflict resolution (server wins for orders, local wins for preferences)

### 4.5 Accessibility (NFR-A1 to NFR-A9)
- WCAG 2.1 Level AA for all interfaces (non-negotiable)
- Color contrast: 4.5:1 text, 3:1 UI components
- **Critical constraint:** White text on Turmeric Gold (#E6B04B) fails WCAG (1.98:1 ratio)
- Touch targets: 48x48dp minimum
- Screen reader compatibility (VoiceOver, TalkBack, NVDA, JAWS)
- Full keyboard navigation with visible focus indicators
- ARIA live regions for error messages
- Text resizing to 200% without loss
- `prefers-reduced-motion` respected

### 4.6 Integration (NFR-I1 to NFR-I8)
- FCM: <30s end-to-end notification delivery
- Stripe: 99.9% availability, exponential backoff (3 retries)
- Google Maps: fallback to manual address entry
- Cloud storage: AWS S3 or DigitalOcean Spaces (signed URLs)
- Email: SMTP with queue; SMS: primary + backup failover
- API versioning: backward compatibility for 1 major version (90-day deprecation)
- Circuit breaker: opens at 50% failure rate over 60s

### 4.7 Maintainability (NFR-M1 to NFR-M9)
- Test coverage >80% critical paths (547 PHPUnit, 315 Playwright)
- PSR-12 (Laravel Pint), Flutter analyzer zero errors
- Reversible, non-destructive DB migrations
- All config externalized via `.env`
- Feature flags for all new capabilities
- 1-hour developer setup; 100% API docs coverage
- Production logging with request context, stack traces (30-day retention)
- Monthly dependency security updates (5-day patch for critical)
- CI build success >95%

### 4.8 Monitoring (NFR-O1 to NFR-O5)
- Error capture within 5 minutes
- p50/p95/p99 response time monitoring
- Alerting thresholds: >1% error rate, >1000 queue depth, >80% DB pool, health check failure, >80% disk
- CI/CD results visible in real-time
- Lighthouse CI: Performance >=80, Accessibility >=90, Best Practices >=90

### 4.9 Mobile-Specific (NFR-MOB1 to NFR-MOB7)
- iOS 12+, Android API 21 (target SDK 34)
- App size <50MB, web bundle <2MB
- Offline via Drift + queue
- Push permission at first order (not app launch)
- App store compliance (Apple Sign-In, privacy labels, ATT, Play Billing)
- Contextual permission requests (not bulk at launch)
- Responsive breakpoints: <600px single-col, 600-1024px two-col, >1024px multi-col

---

## 5. Key Entities / Data Model

| Entity | Description | Key Details |
|--------|-------------|-------------|
| **Restaurant** (restaurants table) | Vendor/restaurant record | 68 columns; includes `commission_percentage`, `subscription_plan_id`, `filament_portal_enabled` |
| **Order** (orders table) | Customer order record | 99 columns; statuses: pending, accepted/confirmed, preparing, ready, driver_assigned, in_transit, delivered, cancelled |
| **Food** (foods table) | Individual food item | Images, pricing, variations, allergens; used both standalone and as PackageOption references |
| **Package** (packages table) | Top-level meal kit product | Name, description, base pricing, images, availability, subscription-eligibility flag |
| **PackageConfiguration** | Config group within package | Group title, min/max selection constraints, display order; belongs to Package |
| **PackageOption** | Selectable option within config | References a Food item; has `price_difference` (surcharge/discount); belongs to PackageConfiguration |
| **Category** | Food item grouping | Name, display order (drag-and-drop reorderable) |
| **AddOn** / **AddOnGroup** | Extra items/sides | Group-level config, per-item pricing |
| **Customer** | End user | Profile, addresses, payment methods, notification preferences |
| **Vendor** | Vendor owner | Business details, auth credentials; FK to Restaurant |
| **VendorEmployee** | Staff member | `vendor_id` FK to owner; role-based permissions |
| **DeliveryMan** | Delivery staff | Status (online/offline/on-delivery); managed by vendor or admin |
| **Subscription** | Customer subscription record | Frequency (daily/weekly/monthly), preferred delivery day, pause/skip state |
| **Wallet** | Vendor wallet balance | Net earnings after commission; withdrawal requests |
| **Notification** | Push/browser/email/SMS | Multiple channels; `vendor_portal_notifications` separate table for Filament |
| **AuditLog** | Admin action log | User ID, timestamp, action type, affected record, before/after state |
| **vendor_tour_progress** | Tour completion tracking | Per-vendor, per-tour, per-step timestamps |
| **tour_feedback** | Tour feedback | User feedback on interactive tours |
| **Coupon** | Discount codes | Date ranges, usage limits, per-customer redemption tracking |
| **Zone** | Delivery zone | Geographic polygon boundaries, fee tiers, vendor eligibility |

### CPFP 3-Tier Hierarchy

```
Package ("Amma's Family Feast")
  |
  +-- PackageConfiguration ("Choose Your Protein", min:1, max:1)
  |     +-- PackageOption -> Food("Chicken Curry", price_difference: $0)
  |     +-- PackageOption -> Food("Mutton Curry", price_difference: +$4)
  |     +-- PackageOption -> Food("Jackfruit Curry", price_difference: $0)
  |
  +-- PackageConfiguration ("Choose Your Spice Level", min:1, max:1)
  |     +-- PackageOption -> Food("Melbourne Mild", $0)
  |     +-- PackageOption -> Food("Jaffna Fire", $0)
  |
  +-- PackageConfiguration ("Choose Your Sides", min:2, max:3)
        +-- PackageOption -> Food("Coconut Sambol", $0)
        +-- PackageOption -> Food("String Hoppers", +$2)
        +-- PackageOption -> Food("Rice", $0)
```

### Order Lifecycle States

```
placed/pending -> accepted/confirmed -> preparing -> ready_for_pickup ->
driver_assigned -> in_transit -> delivered

              -> rejected (triggers refund)
              -> cancelled (by admin, customer, or auto-cancellation)
```

---

## 6. Relevant FRs for Current Tickets

### CAR-203: Disable 'Delete' Action for Food Items
**Relevant FRs:**
- **FR129** -- Vendor can create, edit, and **delete** food items (PRD currently allows delete)
- **FR129-F1** -- Filament table with searchable/sortable food items
- **FR129-F2** -- Filament CRUD forms for food items
- **FR138** -- Toggle availability status (available/out of stock)
- **FR138-F1** -- Bulk availability toggle in Filament
- **FR229** -- Empty states with illustrated guidance (relevant for inactive items tab)

### CAR-204: Disable 'Delete' Action for Packages
**Relevant FRs:**
- **FR133** -- Vendor creates packages with name, description, pricing, images (PRD allows create but references full CRUD)
- **FR134-F1** -- Full 3-tier package hierarchy management in Filament PackageResource
- **FR138** -- Toggle availability for packages
- **FR229** -- Empty states with illustrated guidance

### CAR-205: Handling Inactive Food Items (Backend)
**Relevant FRs:**
- **FR129** -- Food item lifecycle (the PRD says "create, edit, and delete")
- **FR135** -- Food items assigned as PackageOptions
- **FR138** -- Toggle availability (immediate effect in customer app)
- **FR138-F1** -- Bulk availability toggle with partial failure handling and audit log
- **FR164** -- Cart operations with package selections (cart validation affected)
- **FR165** -- Atomic order placement (checkout validation affected)
- **FR208** -- Atomic payment transactions (must not charge for invalid items)

### CAD-147: Remove Deleted/Inactive Food Items Associated with Packages
**Relevant FRs:**
- **FR129** -- Food item CRUD (delete triggers cascade effects)
- **FR133-FR136** -- Package system (Package > Config > Option referencing Food)
- **FR138** -- Availability toggling
- **FR164** -- Cart API with customization state
- **FR165** -- Atomic order placement with validation
- **FR208** -- Atomic payment transactions
- **FR34** -- Order history (historical integrity of past orders with deleted items)

### CAR-206: Auto-Cancellation Logic for Unaccepted Scheduled Orders (24-Hour Rule)
**Relevant FRs:**
- **FR142** -- Vendor accepts/rejects orders (rejection triggers refund)
- **FR143** -- Order status workflow
- **FR147** -- Partial/full refunds
- **FR155** -- Auto-generate subscription orders
- **FR167** -- Stripe payment integration (refund processing)
- **FR203** -- Customer push notifications for order status updates
- **FR205** -- Transactional email (cancellation notification)
- **NFR-R6** -- Atomic payment transactions
- **NFR-R8** -- Retry on transient failures
- **NFR-SC5** -- Async processing via Laravel Horizon queues (cron job worker)

---

## 7. Gaps and Potential Contradictions

### 7.1 PRD says "delete" but tickets say "disable delete"

The PRD explicitly states in **FR129**: *"Vendor can create, edit, and **delete** food items."* However, tickets CAR-203 and CAR-204 are removing the delete action in favor of a toggle (enable/disable) system. This is a PRD gap -- the PRD does not address soft-delete or the data integrity implications of hard-deleting food items that are referenced by packages, carts, or historical orders.

**Recommendation:** Update FR129 to say "Vendor can create, edit, and deactivate food items. Permanent deletion is not available to vendors to preserve historical data integrity." Similarly update FR133 for packages.

### 7.2 No explicit FR for inactive item cascade to packages

The PRD does not define what should happen when a food item that is a PackageOption is deactivated. Tickets CAR-205 and CAD-147 introduce "package unassign" behavior (automatic delinking + marking package as Incomplete/Inactive) which has no corresponding FR. The closest FR is FR138 (availability toggling) but it does not address cross-entity cascade effects.

**Recommendation:** Add an FR covering cascade behavior: when a food item referenced by a PackageOption is deactivated, the system should warn the vendor, delink the food item from affected packages, and mark affected packages as Incomplete/Inactive.

### 7.3 No explicit FR for cart validation against inactive items

The PRD's FR164 (cart operations) and FR165 (order placement) do not explicitly address the scenario where a food item or package becomes inactive while items are in a customer's cart. Tickets CAR-205 and CAD-147 specify cart cleanup behavior that is not covered by any existing FR.

**Recommendation:** Add an FR covering cart validation: the system must validate all cart items against current item/package availability at checkout time, removing or flagging unavailable items before payment processing.

### 7.4 No explicit FR for auto-cancellation of unaccepted orders

Ticket CAR-206 introduces a 24-hour auto-cancellation rule for unaccepted scheduled orders, including automatic refund processing. The PRD does not have an FR for this -- the closest is FR142 (vendor accepts/rejects) but it describes vendor-initiated rejection, not system-initiated timeout cancellation. The PRD also does not mention the "Pre-paid Scheduled Only" model that CAR-206 references.

**Recommendation:** Add an FR: "The system automatically cancels orders that have not been accepted by the vendor within 24 hours of placement, triggers a full refund, and notifies both customer and vendor."

### 7.5 Order status model incomplete

The PRD's order lifecycle (Section 3.4) describes: confirmed > preparing > ready for pickup > driver assigned > in transit > delivered. It does not explicitly define a "Pending" (pre-acceptance) status, though FR142 implies it (vendor "accepts" orders). Ticket CAR-206 references `Status = 'Pending'` which is not in the PRD's documented order lifecycle.

### 7.6 No explicit FR for vendor responsiveness metrics

Ticket CAR-206 introduces a Vendor Responsiveness Report tracking acceptance rates and response times. While FR82 covers "vendor performance metrics," it does not specifically mention acceptance rate or response time as metrics. This is a minor gap.

### 7.7 Subscription model change not reflected

Ticket CAR-206 references "Pre-paid Scheduled Only model" which represents a business model shift from the PRD's description of both on-demand and subscription models operating simultaneously. The PRD describes on-demand marketplace orders (with real-time ordering) alongside subscriptions. If the platform is moving to prepaid-scheduled-only, this is a significant PRD change that is not reflected.

---

## 8. Jira Project Routing Reference

| Key | Project Name | FR Ranges | Primary Team |
|-----|-------------|-----------|-------------|
| CUR | Customer (CurryDash User) | FR1-FR70, FR161-FR168 | Mobile team |
| CAD | CurryDash Admin | FR71-FR108, FR207-FR212 | Backend team |
| CAR | CurryDash Admin/Restaurant | FR121-FR160, FR213-FR238 | Backend team |
| CPFP | Curry Pack For People | Package system cross-cuts CUR + CAR | Backend team |
| CCW | CurryDash Web | Web frontend | Mobile team |
| PACK | Package/Infrastructure | FR53-FR66, DevOps, CI/CD | QA lead + PM |

---

## 9. Personas

| Persona | Platform | Key Characteristics |
|---------|----------|---------------------|
| Priya (Customer) | Flutter App | 35, Tamil heritage, Berwick resident, seeks authentic Jaffna Tamil cuisine |
| Dinesh (Vendor) | Vendor Portal | Independent restaurant operator, manages kitchen + delivery |
| Chathu (Vendor) | Vendor Portal | Home-based food operator, new to delivery platforms |
| Thilini (Admin) | Admin Dashboard | Operations manager, handles vendor approvals and customer escalations |
| Kasun (Support) | Admin Dashboard | Customer support agent, resolves complaints and processes refunds |

---

## 10. Current Development State

- **Active sprint:** Sprint 18 E2E Test Initiative (2026-02-16 through 2026-03-02)
- **Primary branch:** `feature/vendor-portal`
- **Merge target:** UAT
- **Filament Vendor Portal:** All 5 waves complete (Epics 12-18)
- **PHPUnit:** 547 passing, 6 pre-existing failures
- **E2E Playwright:** 315 passing, target 330+
- **Phase:** Phase 2 (Modernization) complete; Phase 3 (Growth) planned
