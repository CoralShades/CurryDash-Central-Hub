# Role-Based Access Control (RBAC)

## Three-Layer Enforcement
All three layers must agree. Zustand `activeRole` is display preference only — JWT is authoritative.

1. **Edge Middleware** — route-level gating from JWT role claims
2. **Server Components** — `auth()` helper checks role before rendering/querying
3. **Supabase RLS** — row-level policies on every table using JWT role

## Four Roles
- **Admin** (Chili #C5351F) — system administration, user management
- **Developer** (Coriander #4A7C59) — code development, technical tasks
- **QA** (Turmeric #E6B04B) — quality assurance, testing
- **Stakeholder** (Cinnamon #5D4037) — project oversight, business metrics

## Supabase Rules
- 4 client variants — use the correct one:
  - `src/lib/supabase/client.ts` — Browser (Client Components)
  - `src/lib/supabase/server.ts` — Server Component (read-only)
  - `src/lib/supabase/middleware.ts` — Middleware (cookie refresh)
  - `src/lib/supabase/admin.ts` — Service role (webhooks, cron — bypasses RLS)
- RLS policies use `auth.jwt()->>'role'` — never bypass from client code
- Realtime subscriptions in Client Components only — channels named `dashboard:{role}`
- DB naming: tables plural `snake_case`, FKs as `{table_singular}_id`, enums `snake_case`
