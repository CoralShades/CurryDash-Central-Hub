# Task Plan: BMAD Technical Research — CurryDash Central Hub MVP Architecture

## Goal
Conduct comprehensive technical research (6-step BMAD workflow) to validate architecture choices, find proven implementation patterns, and assess technical risks for the CurryDash Central Hub MVP.

## Reference
- **Research Template:** `_bmad/bmm/workflows/1-analysis/research/research.template.md`
- **Step Files:** `_bmad/bmm/workflows/1-analysis/research/technical-steps/step-01-init.md` through `step-06`
- **Output:** `_bmad-output/planning-artifacts/research/technical-currydash-mvp-architecture-research-2026-02-17.md`
- **Workflow Status:** `_bmad-output/planning-artifacts/bmm-workflow-status.yaml`

## Current Phase
COMPLETE — All 6 phases done, post-research actions done

## Phases

### Phase 1: Scope Confirmation (Step 01)
- [x] Present 5 technical research areas
- [x] User confirmed scope + expanded with AI agent ecosystem research
- [x] Created output directory and starter file
- [x] Appended scope confirmation to document
- [x] Updated frontmatter: stepsCompleted: [1]
- **Status:** complete

### Phase 2: Technology Stack Analysis (Step 02)
- [x] Parallel web searches: Next.js 15, Supabase, shadcn/ui, Vercel
- [x] Parallel web searches: AG-UI, A2A, CopilotKit, MCP, Claude Agent SDK
- [x] Additional searches: Vercel AI SDK 5, Mastra, RLS, starter templates
- [x] Write Technology Stack Analysis section to document
- [x] Present findings and [C] continue option
- [x] User confirms [C]
- [x] Update frontmatter: stepsCompleted: [1, 2]
- **Status:** complete

### Phase 3: Integration Patterns Analysis (Step 03)
- [x] Jira REST API v3 patterns, pagination, webhooks
- [x] GitHub API + Octokit + server actions
- [x] Anthropic Claude streaming in Next.js
- [x] MCP servers (Atlassian official, GitHub community)
- [x] CopilotKit + Mastra integration patterns
- [x] Integration security patterns
- [x] Write to document
- [x] User confirms [C]
- [x] Update frontmatter: stepsCompleted: [1, 2, 3]
- **Status:** complete

### Phase 4: Architectural Patterns (Step 04)
- [x] Next.js App Router RBAC architecture (3-layer defense)
- [x] Supabase RLS vs app-level auth (complementary, both needed)
- [x] Server vs client component boundaries (decision guide)
- [x] AI dashboard generation architecture (widget config pattern)
- [x] Folder structure (feature-based colocation)
- [x] CopilotKit + Mastra agent architecture (3-tier)
- [x] Data fetching & caching patterns (ISR + webhook revalidation)
- [x] Deployment architecture (Vercel + Supabase same region)
- [x] Write to document
- [x] User confirms [C]
- [x] Update frontmatter: stepsCompleted: [1, 2, 3, 4]
- **Status:** complete

### Phase 5: Implementation Research (Step 05)
- [x] Project setup fastest path (free template bootstrap)
- [x] Testing strategies (Vitest unit + Playwright E2E)
- [x] Deployment checklist (10-step Vercel+Supabase)
- [x] AI chat production patterns (partial response preservation)
- [x] Development workflow & DX (Turbopack, TypeScript strict, ESLint)
- [x] Cost analysis (Free→$55-95/mo production)
- [x] AI-assisted development strategy
- [x] Risk assessment (6 risks identified with mitigations)
- [x] Implementation roadmap (6-week breakdown)
- [x] Write to document
- [x] User confirms [C]
- [x] Update frontmatter: stepsCompleted: [1, 2, 3, 4, 5]
- **Status:** complete

### Phase 6: Synthesis (Step 06)
- [x] Executive summary
- [x] Table of contents
- [x] Strategic recommendations (6 items with priority ratings)
- [x] Research methodology section
- [x] Conclusion with critical success factors
- [x] Update frontmatter: all steps complete
- **Status:** complete

## Post-Research
- [x] Update bmm-workflow-status.yaml (research → file path)
- [x] Update progress.md
- [x] Update task_plan.md
- [ ] Next: Product Brief (`/bmad:bmm:workflows:create-product-brief`)

## Key Questions
1. Is Next.js 15 App Router stable enough for aggressive MVP? → YES (confirmed)
2. Supabase + NextAuth.js integration path? → Auth.js v5 with SupabaseAdapter (confirmed)
3. Which AI framework for dashboard gen? → Vercel AI SDK 5 + CopilotKit + Mastra (confirmed)
4. MCP vs AG-UI vs A2A relevance for MVP? → MCP most relevant, AG-UI for UI, A2A post-MVP (confirmed)

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Expanded scope to include AI agent ecosystem | User requested AG-UI, A2A, CopilotKit, MCP, agent teams research |
| Vercel AI SDK 5.0 as AI communication layer | Replace custom ai-chat-engine.ts. SSE streaming, agentic loop control |
| Auth.js v5 + SupabaseAdapter recommended | Maximum provider flexibility (email, Google, GitHub OAuth) |
| shadcn/ui dashboard starters as reference | Multiple RBAC templates exist, colocation architecture matches needs |
| CopilotKit + Mastra as AI architecture | CopilotKit (frontend UI) + Mastra (agent backend) + MCP (tool access) |
| Widget config JSON for AI Dashboard Gen | Safer than raw code gen, maps to pre-built shadcn/ui components |
| 3-layer RBAC defense | Edge Middleware → Server Components → Supabase RLS (defense in depth) |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| step-06 filename mismatch | 1 | Globbed directory, found correct name: step-06-research-synthesis.md |
