# Sprint Roadmap — Backend Priority Plan

> **Date**: 2026-03-11 | **Focus**: Ramesh (Laravel/PHP) + Ruchiran (Flutter/GCP)
> **Prerequisite**: Resolve 8 decisions in `DECISIONS-NEEDED.md` first

---

## Sprint N (Current — Finish In-Progress + Critical Bugs)

### Ramesh (7 tickets — all In Progress)
| Priority | Ticket | Summary | Why |
|----------|--------|---------|-----|
| 1 | **CAR-178** | Employee login blocker | Vendors locked out |
| 2 | **CAD-149** | Cart validation (inactive items) | Unblocks 4 PACK bugs |
| 3 | **CAR-207** | Notification before order placed | Quick fix |
| 4 | **CAR-179** | Date range filter | Quick fix |
| 5 | **CAR-170** | Draft for food items (seller) | Unblocks CAD-181 |
| 6 | **CAD-202** | Package Module Permission | Unblocks CAD-114, fixes CAD-200 |
| 7 | **CAD-98** | Vendor Profile Management | 4 subtasks ready |

### Ruchiran
- Continue CAD-206 (email notification bug)
- Support CAD-149 testing (Flutter side of hybrid architecture)

---

## Sprint N+1 (Cart + Draft + ABN + Notification Bugs)

### Ramesh
| Priority | Ticket | Summary | Dependency |
|----------|--------|---------|------------|
| 1 | **CAD-181** | Draft food items (admin UI) | Unblocked by CAR-170 |
| 2 | **CAR-169** | Draft packages (seller UI) | Unblocked by CAD-180 |
| 3 | **CAR-201** | ABN not mandatory (bug fix) | Quick win |
| 4 | **CAR-148** | ABN validation logic | After CAR-201 |
| 5 | **CAD-221** | Vendor cancel notification bug | Notification cluster |
| 6 | **CAD-222** | OTP + registration emails | Related to PACK-205 |
| 7 | **CAR-208** | Holiday DB & Models | Start vendor mgmt |
| 8 | **CAR-209** | Admin Holiday Management | After CAR-208 |

### Ruchiran
- PACK-205 (signup mail failure — if root cause found in CAD-222)
- PACK-184 (checkout address/time retention)
- PACK-178 (network failure infinite load)

---

## Sprint N+2 (Vendor Management + Audit)

### Ramesh
| Priority | Ticket | Summary | Dependency |
|----------|--------|---------|------------|
| 1 | **CAR-210** | Vendor Schedule Exceptions | After CAR-209 |
| 2 | **CAR-211** | Schedule API Endpoint | After CAR-210 |
| 3 | **CAD-208** | Request More Info — Backend | CAD-97 subtask |
| 4 | **CAD-209** | Request More Info — UI | After CAD-208 |
| 5 | **CAD-212** | Audit Log Backend (HasAuditLog trait) | Shared infrastructure |
| 6 | **CAD-213** | Audit Log Admin UI | After CAD-212 |
| 7 | **CAR-147** | Vendor panel audit logs | After CAD-212 |
| 8 | **CAD-210** | Email Templates Setup | CAD-97 subtask |
| 9 | **CAD-211** | Privacy Policy CMS Page | CAD-97 subtask |

### Ruchiran
- CAR-212 (Flutter App: Holiday Awareness — after CAR-211 API ready)
- PACK-177 (deleted address persists)

---

## Sprint N+3 (Performance + Packages + Remaining)

### Ramesh
| Priority | Ticket | Summary |
|----------|--------|---------|
| 1 | **CAD-214** | Multi-Location Management |
| 2 | **CAD-215** | ABN Approval Queue + Name Sync |
| 3 | **CAR-144** | Display ABN (vendor portal) |
| 4 | **CAD-216** | Performance Service |
| 5 | **CAD-217** | Performance Controller & Routes |
| 6 | **CAD-218** | Performance Tab UI |
| 7 | **CAD-219** | Platform Benchmarks & Warnings |
| 8 | **CAR-28** | PKG-001: Database Schema |
| 9 | **CAR-29** | PKG-002: Backend Logic |

### Ruchiran
- CAR-30 (PKG-003a: Vendor Package UI — after CAR-29)
- PACK-224 (checkout back-nav)

---

## Sprint N+4 (Packages + Notification Infrastructure)

### Ramesh
| Priority | Ticket | Summary |
|----------|--------|---------|
| 1 | **CAR-146** | Removing food items from packages |
| 2 | **CAD-186** | Image Compression for Media |
| 3 | **CAD-183** | Admin Global Notification Panel |
| 4 | **CAD-195** | Comprehensive Notification System |
| 5 | **CAR-96** | Global Delivery Date Setting |

---

## Future Sprints

### CUR New Platform (after current bugs resolved)
- CUR-140..153 (14 Epic 11 stories — Ramesh)
- CUR-134..139 (6 Epic 10 stories — Ramesh)
- CUR-149 (Order Management API — Ruchiran)

### Stripe Coordination Sprint
- PACK-105 (Flutter — assign)
- CUR-151 (API — Ramesh)
- CUR-122 + subtasks (Dashboard — Santhuka)

### CUR Prototyping (deprioritized pending decision D6)
- CUR-47..53 + subtasks (37+ tickets)

---

## Ramesh's In-Progress Priority Order

```
1. CAR-178 (login blocker)        — CRITICAL, fix today
2. CAD-149 (cart validation)      — CRITICAL, unblocks 4 PACK bugs
3. CAR-207 (notification timing)  — High, quick fix
4. CAR-179 (date filter)          — High, quick fix
5. CAR-170 (draft food items)     — Medium, unblocks CAD-181
6. CAD-202 (package permission)   — Medium, unblocks CAD-114 + CAD-200
7. CAD-98  (vendor profiles)      — Medium, 4 subtasks attached
```
