# Findings: Create Epics & Stories — CurryDash Central Hub

## Document Analysis Summary

### PRD (56 FRs + 46 NFRs)
- **FR Distribution:** Identity (9), Dashboard (10), Jira (6), GitHub (4), AI Assistant (8), AI Reports/Widgets (7), Data Pipeline (6), System Admin (6)
- **NFR Distribution:** Performance (10), Security (10), Integration (8), Reliability (7), Scalability (5)
- **MVP Timeline:** 4 weeks — W1-2 Auth+Dashboard, W3 Integrations, W4 AI
- **Cut Line:** Week 4 AI features can slip without blocking core value
- **4 MVP Roles:** Admin, Developer, QA, Stakeholder

### Architecture (18 Additional Requirements)
- **ARCH-1 (CRITICAL):** Starter template = Vercel Supabase Starter → must be Epic 1 Story 1
- **ARCH-2:** Pre-existing codebase migration needed (Prisma → Supabase, custom CSS → shadcn/ui + Tailwind)
- **ARCH-3:** 12 Supabase migration files defined in architecture
- **ARCH-6:** Config-driven widget grid shapes all dashboard work
- **ARCH-12:** AI stack = CopilotKit frontend + Mastra backend + MCP servers
- **ARCH-14:** Webhook pipeline pattern shared by Jira and GitHub
- **ARCH-16:** Token budget enforcement at 3 levels (request, session, monthly)

### UX Design (16 Additional Requirements)
- **UX-3/4:** 12-column dashboard grid with prescribed section layout (4 rows)
- **UX-5:** Full spice palette design token system to implement
- **UX-6/7:** AI sidebar 400px width + widget generation 4-step UX flow
- **UX-9:** Desktop-first responsive (1280px+), tablet secondary (768px+), no mobile MVP
- **UX-13:** WCAG 2.1 AA accessibility target
- **UX-14:** Stakeholder variant = same layout minus admin controls + hidden dev metrics

## Epic Design Considerations
1. **Build order from Architecture:** Scaffold → Auth/RBAC → Dashboard shell → Integrations → AI
2. **Architecture prescribes 11-step implementation sequence** (must align epics)
3. **Cross-cutting concerns** span multiple epics: RBAC, error boundaries, staleness, logging
4. **Should-have stretch goals:** AI widget gen, Mastra, stakeholder view, webhook health, API cost telemetry
5. **Dependency chain:** Auth → Dashboard → Jira/GitHub clients → Webhook handlers → Realtime → AI → Reports

## Key Decisions for Epic Organization
- Epic 1 should cover project scaffold + Supabase setup + design system foundation
- Auth/RBAC is a natural epic boundary (FR1-FR9, 3-layer enforcement)
- Dashboard could be one epic or split by shell vs widgets
- Jira and GitHub could be separate epics or combined as "Integrations"
- AI features naturally split into: chat assistant vs report/widget generation
- System admin could be its own epic or distributed across relevant epics
- Data pipeline (webhooks, Realtime) is cross-cutting but has its own FR set

---
*Updated 2026-02-17 — Step 01 requirements extraction complete*
