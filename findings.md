# Findings & Decisions — CurryDash Central Hub Technical Research

## Session Context
- **Phase:** BMAD Analysis > Technical Research (Step 2 of 6)
- **Prior Session:** Workflow-init complete, scaffolds removed, greenfield confirmed
- **Output File:** `_bmad-output/planning-artifacts/research/technical-currydash-mvp-architecture-research-2026-02-17.md`

## Technology Stack Findings (Step 2)

### Next.js 15 App Router — VALIDATED
- Production-stable, recommended for new projects
- Server Components reduce bundle, enable secure server-side data fetching
- Server Actions eliminate ~90% API boilerplate
- Turbopack default: 10x faster cold starts, 700x faster HMR
- Prefetching reduces page loads by 38%
- **Risk:** LOW — mature, well-documented, Vercel-backed

### shadcn/ui + Tailwind CSS — VALIDATED
- Dominant component library for Next.js dashboards
- RBAC templates exist (next-auth-roles-template, next-shadcn-dashboard-starter)
- Colocation architecture: features keep own pages/components/logic in route folders
- WAI-ARIA accessible via Radix UI primitives
- **Risk:** LOW — large ecosystem, production-proven

### Supabase (PostgreSQL) — VALIDATED
- RLS for database-level RBAC (critical for 7 roles)
- Custom Claims in JWT for role-based policies
- Multi-tenant pattern: org_id + JWT claims + RLS policies
- Performance: always index RLS policy columns
- Postgres 15+ security_invoker on views
- **Risk:** LOW — free tier viable for MVP, mature platform

### Auth.js (NextAuth.js v5) + Supabase — VALIDATED
- Two paths: Auth.js with SupabaseAdapter OR direct Supabase Auth
- Recommended: Auth.js v5 + SupabaseAdapter for max flexibility
- Session callback signs JWTs with Supabase secret for RLS
- HTTP-only cookies > localStorage for security
- **Risk:** LOW — well-documented integration path

### Vercel Deployment — VALIDATED
- Purpose-built for Next.js, preview deploys per PR
- Node.js runtime (Serverless) or Edge runtime per page
- Deploy DB in same region as functions (latency)
- ISR preferred, serverless only when necessary
- **Risk:** LOW — optimal deployment target

### Vercel AI SDK 5.0 — KEY FINDING
- Released July 2025, TypeScript standard for AI apps
- SSE streaming (native browser support)
- Agentic loop control: stopWhen, prepareStep
- UIMessage (app state) + ModelMessage (LLM state) separation
- Multi-provider: Anthropic, OpenAI, Gemini unified API
- Tool calling with streamText
- **Recommendation:** Replace current ai-chat-engine.ts with AI SDK 5

### AG-UI Protocol — KEY FINDING
- Agent-User Interaction Protocol (bidirectional)
- Born from CopilotKit, now industry standard
- Shared state sync between agent and application
- Adopted by: LangGraph, CrewAI, Mastra, Google ADK, Microsoft Agent Framework
- **CurryDash relevance:** Powers rich AI-user interaction in dashboards

### A2A Protocol (Google) — AWARENESS
- Agent-to-Agent communication, v0.3 released
- Linux Foundation governance, 50+ partners
- Agent Cards for capability discovery
- **CurryDash relevance:** Forward-looking, likely post-MVP

### MCP (Model Context Protocol) — CRITICAL
- 10,000+ active servers, 97M+ monthly SDK downloads
- Adopted by ChatGPT, Cursor, Gemini, VS Code, Copilot
- Linux Foundation (AAIF) governance
- Standardized tool definitions, resource exposure
- **CurryDash relevance:** MOST RELEVANT for AI Assistant accessing Jira/GitHub/docs

### CopilotKit v1.50 — HIGH POTENTIAL
- 28K+ GitHub stars, MIT licensed, self-hostable
- React components: chat UI, sidebars, floating buttons
- AG-UI + MCP + A2A protocol support
- CoAgents: shared state streaming with LangGraph
- **CurryDash relevance:** AI Assistant UI + AI Dashboard Generator

### Mastra — HIGH POTENTIAL
- TypeScript-native, YC-backed, 150K weekly downloads
- Next.js native integration (two approaches)
- Agent workflows, memory, tool-calling, RAG, evals
- AG-UI compatible
- **CurryDash relevance:** Agent backend for Next.js, natural fit

### Claude Agent SDK — DEVELOPMENT TOOL
- Sub-agents: isolated tasks, lightweight
- Agent Teams: collaborative, shared task boards
- Swarms: experimental team lead + specialist agents
- Gartner: 1,445% surge in multi-agent inquiries
- **CurryDash relevance:** Development acceleration, not runtime MVP feature

### Starter Templates Identified
| Template | Stack | Best For |
|----------|-------|----------|
| next-shadcn-dashboard-starter | Next.js + shadcn + Tailwind + TS | Dashboard architecture |
| next-auth-roles-template | Next.js + NextAuth + shadcn | RBAC patterns |
| Razikus Supabase Next.js | Next.js 15 + Supabase + Tailwind | Full SaaS with RLS |
| Vercel Supabase Starter | App Router + Supabase | Auth baseline |

## Integration Patterns Findings (Step 3)

### Jira API — MEDIUM RISK
- REST API v3, points-based rate limiting (March 2, 2026 enforcement)
- New `/search/jql` endpoint has issues — slower, no totalIssues
- Webhooks expire after 30 days — need refresh mechanism
- Official Atlassian MCP server exists (Jira + Confluence)
- jira.js TypeScript client available

### GitHub API — LOW RISK
- Octokit.js mature, typed SDK. @octokit-next experimental lighter version
- Webhook integration with App Router route handlers
- Auth.js GitHub OAuth provides user-scoped access tokens

### Claude AI Streaming — LOW RISK
- Vercel AI SDK 5.0 recommended (unified provider, SSE, tool calling)
- Direct @anthropic-ai/sdk available for edge cases
- Edge runtime compatible for low-latency

### MCP Servers — KEY FINDING
- Official Atlassian MCP server (Jira + Confluence) — best option
- Multiple community Jira MCP servers (production-ready)
- GitHub MCP servers available via awesome-mcp-servers lists
- Need custom MCP server for CurryDash internal data (Supabase)

### CopilotKit — OPTIMAL CHOICE for AI UI
- react-core + react-ui packages
- CopilotSidebar, CopilotPopup, CopilotChat components
- useCopilotAction for AI-triggered actions
- Works directly with Mastra agents (AG-UI)
- Self-hostable, MIT licensed

### Mastra Agent Backend — STRONG FIT
- MCP client AND server support
- Two Next.js integration approaches
- AG-UI compatible → CopilotKit frontend
- Agent architecture: Mastra → MCP servers → Jira/GitHub/Supabase

### Supabase Realtime — LOW RISK
- Enable replication on tables, subscribe in client components
- Webhook → Supabase INSERT → Realtime broadcast → Dashboard update
- No polling needed

### Integration Security
- 3 auth layers: Edge middleware, Server Components, API route
- JWT signed with Supabase secret for RLS
- API keys server-side only, env var separation
- MCP server isolates third-party credentials

## Open Questions
1. ~~Which AI framework?~~ → Vercel AI SDK 5 + CopilotKit + Mastra stack
2. ~~MCP servers exist?~~ → YES, official Atlassian + community GitHub
3. ~~AG-UI timeline?~~ → MVP via CopilotKit (AG-UI built-in)
4. Custom MCP server for Supabase — build during MVP or post-MVP?

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| (none yet) | |

---
*Update this file after every 2 view/browser/search operations*
