# PACK → Backend API Dependency Map

> **Date**: 2026-03-12 | **Scope**: Every PACK ticket mapped to its backend API dependency
> **Backend codebase**: `D:\ailocal\currydash\Admin-Seller_Portal` (Laravel 10)
> **API base**: `https://currydash.au/api/v1/`

---

## Legend

| Status | Meaning |
|--------|---------|
| EXISTS | Backend API exists and works |
| PARTIAL | API exists but incomplete/buggy |
| MISSING | API does not exist — must be built |
| BLOCKED | Backend ticket exists but is blocked/parked |
| N/A | No backend dependency (Flutter-only) |

---

## Bug Dependencies (14 bugs)

| PACK Key | Summary | Backend API | API Status | Backend Ticket | Notes |
|----------|---------|-------------|-----------|----------------|-------|
| PACK-177 | Deleted address persists | `GET /api/v1/customer/address/list` | EXISTS | N/A | Flutter cache issue — clear SharedPreferences on logout |
| PACK-178 | Network failure infinite loading | All endpoints | EXISTS | N/A | Flutter error handling — add `finally` blocks |
| PACK-184 | Address/time not retained at checkout | `POST /api/v1/customer/order/place` | EXISTS | N/A | Flutter GetX state issue in CheckoutController |
| PACK-193 | UI overflow Android | None | N/A | N/A | Flutter layout fix |
| PACK-209 | Dietary notes icons wrong | `GET /api/v1/products/details/{id}` | EXISTS | N/A | Flutter icon mapping logic |
| PACK-212 | Restaurants not sorted by distance | `GET /api/v1/restaurants/get-restaurants/{offset}` | PARTIAL | None | Backend may need `eloquent-spatial` for distance sort |
| PACK-221 | Bottom nav hidden | None | N/A | N/A | Flutter Stack layout |
| PACK-224 | Can't back-nav from payment | Payment WebView callback | EXISTS | N/A | Flutter InAppWebView navigation handler |
| PACK-222 | ISE on cart item deletion | `DELETE /api/v1/customer/cart/remove` | PARTIAL | CAD-149 (In Progress) | Backend returns 500 when food item deleted from menu |
| PACK-226 | Duplicate cart on config edit | `PUT /api/v1/customer/cart/update` | PARTIAL | CAD-149 (In Progress) | Cart update creates new entry instead of updating |
| PACK-216 | Cart + suspended restaurant | `GET /api/v1/restaurants/details/{id}` | PARTIAL | CAD-177 (Parked) | No cart-clear trigger on restaurant suspend |
| PACK-205 | Signup "Failed to send mail" | `POST /api/v1/auth/registration` | PARTIAL | CAD-222 (To Do) | Dual email trigger (OTP + registration) |
| PACK-200 | No delivery availability filter | `GET /api/v1/restaurants/get-restaurants/{offset}` | MISSING | CAR-96 (To Do) | Filter param doesn't exist in API |
| PACK-199 | Incorrect notification text | `GET /api/v1/customer/notifications` | PARTIAL | CAR-207 (In Progress) | Backend sends wrong status before order placed |
| PACK-210 | Track order + delivery time | `GET /api/v1/customer/order/track/{id}` | PARTIAL | CUR-149 (To Do) | Missing delivery ETA calculation |

---

## Feature Task Dependencies (32 tasks)

### Fully Backend-Dependent (need API built first)

| PACK Key | Summary | Required API Endpoint | API Status | Backend Ticket |
|----------|---------|----------------------|-----------|----------------|
| PACK-146 | Package Config Backend | `GET/POST /api/v1/customer/packages/configure` | MISSING | CAR-28/29 |
| PACK-190 | Replace Cuisines with Packages | `GET /api/v1/packages/categories` | MISSING | CAR-28/29/30 |
| PACK-86 | Subscribe to recurring packs | `POST /api/v1/customer/subscription/create` | MISSING | None |
| PACK-87 | Select subscription frequency | `POST /api/v1/customer/subscription/configure` | MISSING | None |
| PACK-88 | Pause/skip subscription | `PUT /api/v1/customer/subscription/{id}/pause` | MISSING | None |
| PACK-89 | Modify subscription selections | `PUT /api/v1/customer/subscription/{id}/modify` | MISSING | None |
| PACK-90 | Cancel subscription | `DELETE /api/v1/customer/subscription/{id}` | MISSING | None |
| PACK-105 | Stripe SDK integration | `POST /api/v1/customer/payment/intent` | MISSING | CUR-151 |
| PACK-107 | Subscription billing w/ Stripe | `POST /api/v1/customer/subscription/billing` | MISSING | None |
| PACK-72 | Multiple payment methods | `GET/POST /api/v1/customer/payment/methods` | MISSING | None |
| PACK-78 | Smart delivery date selection | `GET /api/v1/restaurants/{id}/delivery-dates` | MISSING | CAR-96 |
| PACK-97 | Contact support for active orders | `POST /api/v1/customer/support/ticket` | MISSING | None |
| PACK-164 | Report order issue w/ photo | `POST /api/v1/customer/support/report` | MISSING | None |
| PACK-165 | View support ticket status | `GET /api/v1/customer/support/tickets` | MISSING | None |
| PACK-168 | Subscription reminders | FCM push trigger | MISSING | None |
| PACK-169 | Promotional notifications | FCM push trigger | MISSING | None |
| PACK-170 | Notification preferences | `GET/PUT /api/v1/customer/notification/preferences` | MISSING | None |
| PACK-98 | Reorder from previous | `POST /api/v1/customer/order/reorder/{id}` | MISSING | None |

### Partially Backend-Dependent (API exists, needs extension)

| PACK Key | Summary | Required API | API Status | What's Missing |
|----------|---------|-------------|-----------|---------------|
| PACK-194 | Full name in registration | `POST /api/v1/auth/registration` | EXISTS | Accept `full_name` param |
| PACK-151 | Complete payment | `POST /api/v1/customer/order/place` | EXISTS | Stripe payment method integration |

### No Backend Dependency (Flutter-only)

| PACK Key | Summary | Type |
|----------|---------|------|
| PACK-118 | Refactor to centralized AppColors | Theme refactor |
| PACK-117 | Migrate theme to brand colors v2.0 | Theme refactor |
| PACK-197 | Homepage improvements | UI redesign |
| PACK-196 | Order details page visual sync | UI redesign |
| PACK-195 | Cart card redesign | UI redesign |
| PACK-130 | StackFood reference removal | Branding cleanup |
| PACK-127 | App icon & splash screen | Asset swap |
| PACK-131 | Brand style guide documentation | Docs |
| PACK-25-34 | Brand identity tasks (10 tickets) | Design tokens |
| PACK-121-126 | Developer foundation (6 tickets) | Process |
| PACK-171-175 | Testing infrastructure (5 tickets) | Process |
| PACK-193 | UI overflow fix | Layout fix |
| PACK-221 | Bottom nav fix | Layout fix |
| PACK-177 | Address cache fix | Cache logic |
| PACK-178 | Network error handling | Error handling |
| PACK-184 | Checkout state retention | State management |
| PACK-224 | Payment back-nav fix | WebView nav |
| PACK-209 | Dietary icons fix | Icon mapping |

---

## API Coverage Summary

| Category | Total APIs Needed | EXISTS | PARTIAL | MISSING |
|----------|------------------|--------|---------|---------|
| Auth/Registration | 2 | 1 | 1 | 0 |
| Restaurant Discovery | 2 | 1 | 1 | 0 |
| Cart/Checkout | 3 | 1 | 2 | 0 |
| Order Management | 3 | 1 | 1 | 1 |
| Packages | 3 | 0 | 0 | **3** |
| Subscriptions | 6 | 0 | 0 | **6** |
| Payments/Stripe | 2 | 0 | 0 | **2** |
| Support | 3 | 0 | 0 | **3** |
| Notifications | 3 | 0 | 0 | **3** |
| Delivery | 1 | 0 | 0 | **1** |
| **Total** | **28** | **4** | **5** | **19** |

### 68% of required APIs do not exist yet. PACK is severely backend-blocked.

---

## Dependency Chains (execution order)

### Chain 1: Package System
```
CAR-28 (DB Schema) → CAR-29 (Backend Logic) → CAR-30 (Vendor UI)
                                                       ↓
                                              PACK-146 (Flutter backend support)
                                              PACK-190 (Replace Cuisines)
                                              PACK-111 (Package config UI)
```
**Earliest PACK work**: After CAR-29 completes (provides API)

### Chain 2: Cart Validation
```
CAD-149 (In Progress) → PACK-222 (ISE fix)
                       → PACK-226 (Duplicate fix)
                       → PACK-216 (if CAD-177 unparked)
```
**PACK unblocked when**: CAD-149 ships to production

### Chain 3: Subscription
```
[No backend tickets exist] → Need API spec → Need implementation
                                                     ↓
                                            PACK-86 → PACK-87 → PACK-88/89/90
                                            PACK-107 (Stripe billing)
                                            PACK-108 (QA)
```
**Blocker**: Zero backend work started. Need new CAD/CAR tickets.

### Chain 4: Stripe Payment
```
CUR-122 (Santhuka: Admin Stripe) ─┐
CUR-151 (Ramesh: Payment API)  ───┤──→ PACK-105 (Stripe SDK)
                                   │         ↓
                                   └──→ PACK-151 (Complete Payment)
                                              ↓
                                        PACK-72 (Multiple methods)
```
**Blocker**: Needs Stripe API keys + coordinated implementation

### Chain 5: Notifications
```
CAD-195 (Umbrella) → CAR-207 (Fix notification timing)
                           ↓
                     PACK-199 (Fix notification text)
                     PACK-168/169/170 (New notification features)
```
**PACK-199 unblocked when**: CAR-207 ships

### Chain 6: Delivery
```
CAR-96 (Global delivery date setting) → PACK-200 (Delivery filter)
                                       → PACK-78 (Smart delivery date)
                                       → PACK-210 (Track order)
```
**PACK unblocked when**: CAR-96 ships
