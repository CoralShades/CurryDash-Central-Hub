# CurryDash Central Hub — Gemini Instructions

## Project Overview
CurryDash Central Hub is a role-based project management portal built with Next.js 15 (App Router), TypeScript (strict mode), Supabase (PostgreSQL + Auth + Realtime), and a spice-themed design system.

## Tech Stack
| Package | Version | Notes |
|---|---|---|
| Next.js | 15.x | App Router, Turbopack dev, ISR tag-based revalidation |
| TypeScript | strict | `@/*` path alias, Node.js 20+ |
| Supabase | current | Auth, PostgreSQL, Realtime, RLS — 4 client variants |
| Auth.js | v5 | `next-auth@beta` + `@auth/supabase-adapter` |
| Tailwind CSS | v4 | CSS variable theming, shadcn stone base + spice palette |
| shadcn/ui | latest | Radix primitives, stone base overridden |
| Vercel AI SDK | 5.0 | Streaming, tool calling, `@ai-sdk/anthropic` |
| CopilotKit | v1.51.3 | AI UI components |
| Mastra | v1.2.0 | AI agent backend |

## Role-Based Architecture
- **Admin** (Chili #C5351F) — system administration
- **Developer** (Coriander #4A7C59) — code development
- **QA** (Turmeric #E6B04B) — quality assurance
- **Stakeholder** (Cinnamon #5D4037) — project oversight
- **Background** (Cream #FFF8DC)

Three-layer RBAC: Edge Middleware → Server Components → Supabase RLS

## Key Rules
- `"use client"` at leaf nodes only — never on pages or layouts
- Server Actions return `{ data, error }` — never throw
- Zod validation at all data boundaries
- Files: `kebab-case`, Components: `PascalCase`, Functions: `camelCase`
- Never store server data in Zustand — UI state only
- Never hardcode hex colors — use CSS custom properties

## BMAD Workflow
This project uses BMAD v6 framework. Available Gemini commands are in `.gemini/commands/` directory (67 TOML command definitions covering agents and workflows).

## Project Structure
```
src/app/              # Thin route wrappers
src/modules/          # Feature modules (auth, dashboard, jira, github, ai, reports, webhooks, admin)
src/mastra/           # AI agent backend
src/lib/              # Shared utilities
_bmad/                # BMAD v6 framework
_bmad-output/         # Planning artifacts
```
