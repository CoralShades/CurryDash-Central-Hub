# Cross-Project Dependencies — Full Dependency Map

> **Date**: 2026-03-11 | **Scope**: CAD ↔ CAR ↔ PACK ↔ CUR

---

## PACK (Mobile) → Backend Dependencies

| PACK Ticket | Summary | Depends On | Backend Status | Notes |
|-------------|---------|-----------|----------------|-------|
| PACK-223 | Inactive package orderable | CAD-149 | In Progress | Architecture decided (Hybrid) |
| PACK-222 | ISE when cart item deleted | CAD-149 | In Progress | Backend must validate first |
| PACK-226 | Duplicate cart item on edit | CAD-149 investigation | To Do | Orphaned — no links |
| PACK-216 | Cart + suspended restaurant | CAD-177 | Parked | Blocked until unparked |
| PACK-205 | Signup "Failed to send mail" | CAD-222 (OTP bug) | To Do | Same registration flow |
| PACK-199 | Wrong notification text | CAR-207 + CAR-194 | In Progress | Order status alignment |
| PACK-200 | Filter by delivery availability | CAR-96 + CAD-68 (done) | To Do + DevTested | Seller + admin delivery config |
| PACK-190 | Replace Cuisines with Packages | CAR-28/29/30 | To Do | Package backend needed first |
| PACK-146 | Package Config Backend Support | CAR-28/29 | To Do | Schema + logic needed first |
| PACK-105 | Stripe SDK integration | CUR-151 coordination | To Do | 3 Stripe tickets across projects |
| PACK-210 | Track Order + delivery time | CUR-149, CAR-179 | To Do / In Progress | Order API + date filter |
| PACK-184 | Checkout address/time lost | Flutter-side | To Do | Related to PACK-224 |
| PACK-178 | Network failure infinite load | Flutter-side | To Do | Independent |
| PACK-177 | Deleted address persists | Flutter-side | To Do | Independent |
| PACK-194 | Full Name in registration | Registration flow | To Do | May conflict with CAD-222 fix |
| PACK-224 | Cannot back-nav from payment | Checkout flow | To Do | Related to PACK-184 |

---

## CUR (New Platform) → Current Platform Dependencies

| CUR Ticket | Summary | Current Platform Ticket | Notes |
|------------|---------|----------------------|-------|
| CUR-156 | Auto-cancel stale orders | CAR-206 | **DUPLICATE** — merge into CUR-156 |
| CUR-148 | Cart & Checkout API | CAD-149 | Current cart fix informs API design |
| CUR-149 | Order Management API | CAR-207, CAR-198 | Order status bugs inform API |
| CUR-151 | Stripe Payment | PACK-105, CUR-122 | 3 Stripe tickets need coordination |
| CUR-138 | Email Notifications | CAR-202, CAD-222 | Current email bugs inform design |
| CUR-152 | Firebase Push | PACK-199, CAR-207 | Notification bugs inform design |
| CUR-134..139 | 6 notification stories | CAD-195 (umbrella) | New notification system |
| CUR-140..153 | 14 Epic 11 stories | CAD/CAR equivalents | New versions of existing features |

---

## CAD ↔ CAR Cross-Board Dependencies

| Admin (CAD) | Seller (CAR) | Relationship |
|-------------|-------------|-------------|
| CAD-180 (Draft Packages, DevTested) | CAR-169 (Draft Packages, To Do) | CAR-169 depends on CAD-180 |
| CAD-181 (Draft Food Items, To Do) | CAR-170 (Draft Food Items, In Progress) | CAD-181 depends on CAR-170 |
| CAD-182 (TIN→TFN, DevTested) | CAR-172 (TIN→TFN, DevTested) | Test together |
| CAD-173 (CAPTCHA, DevTested) | CAR-149 (CAPTCHA, DevTested) | Test together |
| CAD-68 (Delivery Days, DevTested) | CAR-96 (Global Delivery, To Do) | CAR-96 reuses CAD-68 |
| CAD-67 (Package Delete, DevTested) | CAR-204 (Disable Delete, To Do) | **CONTRADICTION** |
| CAD-149 (Cart Validation, In Progress) | CAR-205 (Inactive Items, To Do) | CAR-205 is duplicate of CAR-146 |
| CAD-212 (Audit Backend, To Do) | CAR-147 (Vendor Audit, To Do) | CAR-147 depends on CAD-212 |
| CAD-202 (Package Permission, In Progress) | — | Also affects CAD-200, CAD-179 |
| CAD-195 (Notification System) | CAR-207 (Notification bug) | Umbrella covers seller bugs too |

---

## Missing Jira Links (9 to create)

| # | From | To | Type | Reason |
|---|------|-----|------|--------|
| 1 | CUR-156 | CAR-206 | Duplicate | Confirmed dup, no link exists |
| 2 | CAD-200 | CAD-202 | Relates | Same root cause (Package perms) |
| 3 | CAD-179 | CAD-202 | Duplicate | Both add Package to permissions |
| 4 | PACK-226 | PACK-198 | Relates | Investigation should cover this bug |
| 5 | CAR-198 | CAR-207 | Relates | Both premature status triggers |
| 6 | PACK-190 | CAR-28 | Depends | Cuisines→Packages needs schema |
| 7 | PACK-200 | CAR-96 | Depends | Filter needs delivery date setting |
| 8 | PACK-105 | CUR-151 | Relates | Both Stripe SDK integration |
| 9 | CAR-205 | CAR-146 | Duplicate | Same scope (inactive food items) |

---

## Dependency Chains (ordered execution)

### Chain A: Cart Validation
```
CAD-149 (In Progress) → PACK-222 → PACK-226 → PACK-216 (if CAD-177 unparked)
```

### Chain B: Draft Workflow
```
CAR-170 (In Progress) → CAD-181
CAD-180 (DevTested) → CAR-169
```

### Chain C: ABN
```
CAR-201 (quick fix) → CAR-148 → CAD-215 → CAR-144
```

### Chain D: Audit Log
```
CAD-212 (trait) → CAD-213 + CAR-147 + CAD-119 (consumers)
```

### Chain E: Package Backend
```
CAR-28 (schema) → CAR-29 (logic) → CAR-30 (UI) → PACK-146 + PACK-190
```

### Chain F: Holiday Hours
```
CAR-208 (DB) → CAR-209 (Admin) → CAR-210 (Vendor) → CAR-211 (API) → CAR-212 (Flutter)
```

### Chain G: Stripe
```
Coordinate: PACK-105 (Flutter) + CUR-151 (API) + CUR-122 (Admin dashboard)
```
