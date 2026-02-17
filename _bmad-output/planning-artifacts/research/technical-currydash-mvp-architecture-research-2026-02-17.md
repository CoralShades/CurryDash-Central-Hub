---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: []
workflowType: 'research'
lastStep: 6
research_type: 'technical'
research_topic: 'CurryDash Central Hub MVP Architecture'
research_goals: 'Validate architecture choices, find proven implementation patterns, and assess technical risks for CurryDash Central Hub — a role-based project management portal built with Next.js 15, Supabase, shadcn/ui, and AI integrations'
user_name: 'Demi'
date: '2026-02-17'
web_research_enabled: true
source_verification: true
---

# CurryDash Central Hub: Comprehensive MVP Architecture Technical Research

**Date:** 2026-02-17
**Author:** Demi
**Research Type:** Technical
**Status:** Complete

---

## Executive Summary

This technical research validates the architecture choices for CurryDash Central Hub — a role-based project management portal that will serve as the single source of truth for the CurryDash ecosystem. After conducting 38+ targeted web searches across 6 research steps, the conclusion is clear: **the proposed tech stack is validated, the AI agent ecosystem is mature enough for MVP integration, and a 4-6 week timeline is achievable with disciplined execution.**

**Key Findings:**

1. **Core stack fully validated:** Next.js 15 App Router + Supabase + shadcn/ui + Auth.js + Vercel is a production-proven combination with extensive community support, starter templates, and documentation.
2. **AI ecosystem convergence:** Three standardized protocols (MCP, AG-UI, A2A) under Linux Foundation governance are transforming how AI integrates with applications. MCP is the most critical for CurryDash's MVP.
3. **Optimal AI architecture identified:** CopilotKit (frontend) + Mastra (agent backend) + MCP servers (Jira/GitHub/Supabase) provides a full-stack TypeScript agent architecture with proven integration patterns.
4. **AI Dashboard Generation is feasible:** Widget config generation (JSON) via Claude tool calls, rendered by pre-built shadcn/ui components, is safer and faster than raw code generation.
5. **Three-layer RBAC architecture:** Edge Middleware + Server Component authorization + Supabase RLS provides defense-in-depth for 7 user roles.
6. **Costs are minimal:** $0/mo during development (free tiers), ~$55-95/mo in production.

**Strategic Recommendations:**

1. Bootstrap from free Vercel Supabase Starter + shadcn dashboard templates
2. Use Vercel AI SDK 5.0 as the AI communication layer (replaces custom ai-chat-engine.ts)
3. Adopt CopilotKit + Mastra for the AI Assistant and Dashboard Generator features
4. Connect to official Atlassian MCP server for Jira/Confluence integration
5. Build auth + dashboards first (Weeks 1-2), integrations second (Week 3), AI features last (Weeks 4-5)

---

## Table of Contents

1. [Technical Research Scope Confirmation](#technical-research-scope-confirmation)
2. [Technology Stack Analysis](#technology-stack-analysis)
   - Core Framework: Next.js 15
   - UI Framework: shadcn/ui + Tailwind CSS
   - Database: Supabase (PostgreSQL)
   - Authentication: Auth.js + Supabase
   - Deployment: Vercel
   - AI SDK: Vercel AI SDK 5.0
   - Agent Protocols: AG-UI, A2A, MCP
   - AI Agent Frameworks: CopilotKit, Mastra, Claude Agent SDK
   - Production-Ready Starter Templates
   - Technology Adoption Trends
3. [Integration Patterns Analysis](#integration-patterns-analysis)
   - Jira REST API v3 Integration
   - GitHub API Integration (Octokit)
   - Anthropic Claude API Streaming
   - MCP Server Ecosystem (Jira + GitHub)
   - CopilotKit In-App AI Integration
   - Mastra Agent Integration
   - Supabase Realtime for Dashboard Updates
   - Integration Security Patterns
4. [Architectural Patterns and Design](#architectural-patterns-and-design)
   - System Architecture: Modular Monolith
   - RBAC Architecture: Three-Layer Defense
   - Folder Structure: Feature-Based Colocation
   - Server vs Client Component Boundaries
   - Data Fetching & Caching Architecture
   - AI Agent Architecture: CopilotKit + Mastra
   - AI Dashboard Generation Architecture
   - Deployment and Operations Architecture
5. [Implementation Approaches and Technology Adoption](#implementation-approaches-and-technology-adoption)
   - Fastest Path to Production
   - Development Workflow and Tooling
   - Testing Strategy
   - AI Chat Production Patterns
   - Production Deployment Checklist
   - Cost Analysis
   - AI-Assisted Development Strategy
   - Risk Assessment and Mitigation
   - Implementation Roadmap (6-Week Timeline)
6. [Strategic Recommendations](#strategic-recommendations)
7. [Research Methodology](#research-methodology)

---

## Research Overview

This technical research validates architecture choices, identifies proven implementation patterns, and assesses technical risks for CurryDash Central Hub — a role-based project management portal for the CurryDash ecosystem.

---

## Technical Research Scope Confirmation

**Research Topic:** CurryDash Central Hub MVP Architecture
**Research Goals:** Validate architecture choices, find proven implementation patterns, and assess technical risks for a 4-6 week aggressive MVP timeline.

**Technical Research Scope:**

- Architecture Analysis — design patterns, frameworks, system architecture
- Implementation Approaches — development methodologies, coding patterns
- Technology Stack — languages, frameworks, tools, platforms
- Integration Patterns — APIs, protocols, interoperability
- Performance Considerations — scalability, optimization, patterns

**Expanded Scope (User-Requested):**

- AI Agent Ecosystem — AG-UI, A2A, A2UI protocols
- CopilotKit v1.50 (Open Source) integration potential
- Claude Skills, Agent Skills (multi-provider: Gemini, Codex, etc.)
- Sub-agents, Agent Teams architecture patterns
- MCP Servers (Model Context Protocol)
- Popular GitHub repos relevant to AI-powered dashboards and agent UIs

**Research Methodology:**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights
- MVP-focused — proven patterns only, no experimental approaches

**Scope Confirmed:** 2026-02-17

---

## Technology Stack Analysis

### Core Framework: Next.js 15 (App Router)

**Stability & Maturity: [High Confidence]**

Next.js 15 with the App Router is production-stable and the recommended approach for new projects. The App Router is file-system based and built on React Server Components (RSC), Suspense, and Server Functions. Key patterns:

- **Server Components** render exclusively on the server, sending only HTML to the client — reducing bundle size, enabling direct backend access, and improving security. [Source: [Next.js Docs](https://nextjs.org/docs/app/getting-started/server-and-client-components)]
- **Server Actions** replace separate API endpoints — functions are called directly from components, and Next.js turns them into POST requests automatically, eliminating ~90% of server-client boilerplate. [Source: [Next.js Advanced Patterns 2026](https://johal.in/next-js-15-advanced-patterns-app-router-server-actions-and-caching-strategies-for-2026/)]
- **Turbopack** is now the default bundler (written in Rust), with cold starts 10x faster and HMR 700x faster than Webpack. [Source: [Next.js 15 in 2025](https://javascript.plainenglish.io/next-js-15-in-2025-features-best-practices-and-why-its-still-the-framework-to-beat-a535c7338ca8)]
- **Intelligent prefetching** reduced average page load times by 38%. [Source: [Next.js Advanced Patterns 2026](https://johal.in/next-js-15-advanced-patterns-app-router-server-actions-and-caching-strategies-for-2026/)]

**CurryDash Relevance:** The App Router's file-system routing maps naturally to CurryDash's 4 role-based dashboards (`/admin`, `/dev`, `/qa`, `/stakeholder`). Server Components are ideal for data-heavy dashboards that fetch from Jira/GitHub APIs server-side without exposing credentials to the client.

**Verdict:** Next.js 15 App Router is the right choice — stable, performant, and well-suited for role-based dashboards with server-side data fetching.

### UI Framework: shadcn/ui + Tailwind CSS

**Ecosystem Maturity: [High Confidence]**

shadcn/ui has become the dominant component library for Next.js applications, with extensive dashboard templates available:

- **Dashboard Templates:** Production-ready admin panels with RBAC (Owner/Member roles), analytics dashboards, and data visualization interfaces. MIT-licensed. [Source: [shadcn.io Templates](https://www.shadcn.io/template/category/dashboard)]
- **next-shadcn-dashboard-starter:** Open-source admin dashboard starter built with Next.js + shadcn/ui + Tailwind CSS + TypeScript, using colocation-based architecture where each feature keeps its own pages, components, and logic inside its route folder. [Source: [GitHub: Kiranism/next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter)]
- **Built-in Accessibility:** Fully WAI-ARIA compliant via Radix UI primitives. Includes command palette, dark/light mode, RTL support, and responsive layouts. [Source: [Vercel shadcn Admin Template](https://vercel.com/templates/next.js/next-js-and-shadcn-ui-admin-dashboard)]
- **next-auth-roles-template:** A shadcn/ui template specifically for NextAuth with role-based access patterns. [Source: [shadcn.io Next Auth Roles](https://www.shadcn.io/template/mickasmt-next-auth-roles-template)]

**CurryDash Relevance:** The colocation-based architecture directly supports CurryDash's need for 4 role-specific dashboard views. Existing RBAC templates accelerate implementation. The spice-themed design tokens from the current scaffold can be mapped to Tailwind CSS custom theme variables.

**Verdict:** shadcn/ui + Tailwind CSS replaces the current custom CSS approach and dramatically accelerates UI development.

### Database & Backend: Supabase (PostgreSQL)

**Platform Maturity: [High Confidence]**

Supabase provides managed PostgreSQL with auth, storage, realtime subscriptions, and edge functions:

- **Row Level Security (RLS):** Granular authorization at the database level via SQL policies. Supports SELECT, INSERT, UPDATE, DELETE policies per table. For RBAC, create an `authorize` method that reads user roles from JWT and checks permissions. [Source: [Supabase RLS Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)]
- **Custom Claims RBAC:** Supabase provides `authenticated` and `anon` roles by default, with custom roles for specific access levels. [Source: [Supabase RBAC Docs](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac)]
- **Multi-Tenant Pattern:** Add `tenant_id` or `org_id` column to every table, set custom claims in JWT via Auth hooks, create policies matching column against JWT claim. Always index columns referenced in RLS policies (top performance killer). [Source: [AntStack Multi-Tenant RLS](https://www.antstack.com/blog/multi-tenant-applications-with-rls-on-supabase-postgress/)]
- **Postgres 15+:** Supports `security_invoker = true` on views to obey underlying RLS policies. [Source: [DesignRevision Supabase RLS Guide 2026](https://designrevision.com/blog/supabase-row-level-security)]

**CurryDash Relevance:** Supabase RLS enforces CurryDash's 7-role RBAC at the database level — a critical security boundary. Custom claims in JWT tokens map naturally to CurryDash roles (Admin, Developer, QA, Stakeholder, etc.). The free tier is viable for MVP development.

**Verdict:** Supabase is excellent for the MVP. RLS provides defense-in-depth for role-based access. Migration from Prisma schema to Supabase migrations is straightforward.

### Authentication: NextAuth.js (Auth.js) + Supabase

**Integration Pattern: [High Confidence]**

Two viable approaches exist:

1. **Auth.js with SupabaseAdapter:** Uses `@auth/supabase-adapter` to store sessions in Supabase while leveraging Auth.js provider ecosystem (Google, GitHub, email magic links). Session callback signs JWTs with Supabase secret for RLS compatibility. [Source: [Auth.js Supabase Adapter](https://authjs.dev/getting-started/adapters/supabase)]

2. **Direct Supabase Auth:** Uses Supabase's built-in auth with `@supabase/ssr` package for App Router cookie-based sessions. Simpler setup, fewer moving parts. [Source: [Supabase Server-Side Auth Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)]

**Security Best Practice:** HTTP-only cookies over localStorage (prevents XSS). Proper token validation on every server request. [Source: [NextAuth Deep Dive](https://medium.com/@sidharrthnix/next-js-authentication-with-supabase-and-nextauth-js-part-1-of-3-76dc97d3a345)]

**CurryDash Relevance:** Auth.js v5 gives CurryDash maximum flexibility with email magic links + Google + GitHub OAuth, which maps to the original Action Plan requirements. The SupabaseAdapter keeps sessions in the same database as application data.

**Verdict:** Auth.js (NextAuth.js v5) with SupabaseAdapter is the recommended approach for maximum provider flexibility.

### Deployment: Vercel

**Platform Fit: [High Confidence]**

Vercel is purpose-built for Next.js and provides:

- **Runtime Options:** Server-render with Node.js runtime (Serverless Functions) or Edge runtime (Edge Functions) per page. [Source: [Vercel Next.js Docs](https://vercel.com/docs/frameworks/full-stack/nextjs)]
- **Edge Functions:** Run on V8 engine closer to users, fast cold starts, ideal for personalization and auth. [Source: [Vercel Functions](https://vercel.com/docs/functions)]
- **Best Practices 2025:** Prefer static generation with ISR; use serverless only when necessary. Deploy databases in regions closest to functions. Separate dev/preview/production configs. [Source: [Sider AI Vercel Tutorials](https://sider.ai/blog/ai-tools/best-vercel-tutorials-to-master-deployment-edge-and-ai-in-2025)]
- **Preview Deployments:** Every PR gets a unique URL for testing.

**CurryDash Relevance:** Vercel gives CurryDash the fastest deployment path for Next.js 15. Preview deploys enable the team to test role-specific dashboards in isolation.

**Verdict:** Vercel is the optimal deployment target. Pair with Supabase hosted in the same region.

### AI SDK: Vercel AI SDK 5.0

**Framework Maturity: [High Confidence]**

Released July 31, 2025, the AI SDK 5.0 is the TypeScript standard for AI-powered applications:

- **Streaming via SSE:** Server-Sent Events as standard streaming protocol, natively supported in all browsers. [Source: [Vercel AI SDK 5 Blog](https://vercel.com/blog/ai-sdk-5)]
- **Agentic Loop Control:** `stopWhen` and `prepareStep` primitives for precise control over multi-step tool calls and agent execution flow. [Source: [Vercel AI SDK 5 Blog](https://vercel.com/blog/ai-sdk-5)]
- **UIMessage + ModelMessage:** Distinct message types — `UIMessage` as application state source-of-truth, `ModelMessage` optimized for LLM communication. [Source: [Vercel AI SDK 5 Blog](https://vercel.com/blog/ai-sdk-5)]
- **Multi-Provider:** Supports Anthropic Claude, OpenAI, Google Gemini, and others with a unified API. [Source: [AI SDK Docs](https://ai-sdk.dev/docs/introduction)]
- **Tool Calling:** `streamText` handles multiple tool steps automatically with typed tool definitions. [Source: [AI SDK Docs](https://ai-sdk.dev/docs/introduction)]

**CurryDash Relevance:** AI SDK 5.0 is the ideal foundation for CurryDash's AI Assistant (Claude chat) and AI Dashboard Generator features. Streaming SSE works perfectly with Next.js App Router server actions. Agentic loop control enables the Claude-powered dashboard generation workflow.

**Verdict:** Vercel AI SDK 5.0 should replace the current `ai-chat-engine.ts` custom implementation as the AI communication layer.

### Agent Protocols: AG-UI, A2A, and MCP

#### AG-UI (Agent-User Interaction Protocol)

AG-UI is the standardized bi-directional protocol between user-facing applications and agentic backends. Born from CopilotKit's partnerships with LangGraph and CrewAI, it's now adopted across the ecosystem:

- **Shared State:** Bi-directional synchronization of agent and application state (read/write or read-only). [Source: [AG-UI Docs](https://docs.ag-ui.com/)]
- **Framework Support:** LangGraph, CrewAI, Mastra, Google ADK, Microsoft Agent Framework. [Source: [CopilotKit AG-UI Blog](https://www.copilotkit.ai/blog/ag-ui-protocol-bridging-agents-to-any-front-end)]
- **Microsoft Compatibility:** Microsoft Agent Framework is fully AG-UI compatible. [Source: [Microsoft Learn AG-UI](https://learn.microsoft.com/en-us/agent-framework/integrations/ag-ui/)]
- **Google ADK Integration:** Combine ADK Agents with fancy frontends using AG-UI. [Source: [Google Developers Blog](https://developers.googleblog.com/delight-users-by-combining-adk-agents-with-fancy-frontends-using-ag-ui/)]

#### A2A (Agent-to-Agent Protocol)

Google's A2A protocol enables agent-to-agent communication across different frameworks:

- **Version 0.3** released with gRPC support, security card signing, and extended Python SDK. [Source: [Google Cloud A2A Upgrade Blog](https://cloud.google.com/blog/products/ai-machine-learning/agent2agent-protocol-is-getting-an-upgrade)]
- **Linux Foundation Governance:** Donated by Google to Linux Foundation in June 2025. Co-developed with 50+ partners including Atlassian, Salesforce, SAP, PayPal. [Source: [Linux Foundation A2A](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents)]
- **Agent Cards:** JSON-format capability discovery allowing agents to find and negotiate with other agents. [Source: [IBM A2A Explainer](https://www.ibm.com/think/topics/agent2agent-protocol)]

#### MCP (Model Context Protocol)

Anthropic's MCP is the dominant standard for connecting LLMs to external tools and data:

- **Ecosystem Scale:** 10,000+ active public MCP servers. Adopted by ChatGPT, Cursor, Gemini, VS Code, Microsoft Copilot. 97M+ monthly SDK downloads. [Source: [Pento MCP Year in Review](https://www.pento.ai/blog/a-year-of-mcp-2025-review)]
- **Foundation Governance:** Donated to Agentic AI Foundation (AAIF) under Linux Foundation, co-founded by Anthropic, Block, and OpenAI (December 2025). [Source: [Anthropic AAIF Announcement](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation)]
- **Specification:** November 2025 spec release with standardized tool definitions, resource exposure, and prompt templates. [Source: [MCP Specification](https://modelcontextprotocol.io/specification/2025-11-25)]

**CurryDash Relevance:** MCP is the most mature and directly relevant protocol — it enables the AI Assistant to access Jira, GitHub, and internal data via standardized MCP servers. AG-UI enables rich AI-user interaction in the dashboards. A2A is forward-looking for multi-agent orchestration but likely post-MVP.

### AI Agent Frameworks for CurryDash

#### CopilotKit (v1.50, MIT Licensed)

CopilotKit is the leading open-source framework for building in-app AI copilots:

- **28,000+ GitHub stars.** Full-stack framework bridging frontend with any AI backend. [Source: [GitHub CopilotKit](https://github.com/CopilotKit/CopilotKit)]
- **React Components:** Production-ready chat UIs, sidebars, floating buttons, and headless options. React & Angular supported. [Source: [CopilotKit Docs](https://docs.copilotkit.ai/)]
- **Protocol Support:** Works with AG-UI, MCP, and A2A. Any agentic backend (LangGraph, CrewAI, Mastra, custom). [Source: [CopilotKit Product](https://www.copilotkit.ai/product)]
- **CoAgents:** Frontend infrastructure for LangGraph agents with shared state streaming, agent steering, and real-time frontend actions. [Source: [CopilotKit CoAgents](https://github.com/CopilotKit/CopilotKit/blob/main/docs/content/docs/coagents/index.mdx)]
- **Self-Hostable:** Core framework is open source and free to self-host. [Source: [CopilotKit Docs](https://docs.copilotkit.ai/)]

**CurryDash Relevance:** CopilotKit's React components could power CurryDash's AI Assistant UI (chat sidebar, floating button). CoAgents infrastructure could support the AI Dashboard Generator feature. Self-hosting keeps the MVP costs low.

#### Mastra (TypeScript-Native Agent Framework)

Mastra is the fastest-growing TypeScript agent framework, from the Gatsby team:

- **150,000 weekly downloads**, YC-backed, $13M seed round. Enterprise users: Replit, PayPal, Adobe, Docker. [Source: [Mastra.ai](https://mastra.ai/)]
- **Next.js Native:** Two flexible integration approaches with Next.js. Abstractions feel natural to Next.js developers. [Source: [Mastra Next.js Integration](https://mastra.ai/blog/nextjs-integration-guide)]
- **AI Primitives:** Agents with memory and tool-calling, deterministic LLM workflows, RAG for knowledge integration, and evals for quality/accuracy. [Source: [Mastra Docs](https://mastra.ai/docs)]
- **AG-UI Compatible:** Direct AG-UI protocol support for frontend-agent interaction. [Source: [AG-UI Docs](https://docs.ag-ui.com/)]

**CurryDash Relevance:** Mastra's TypeScript-native approach and Next.js integration make it a strong candidate for CurryDash's AI backend. Its agent workflow primitives could power the AI Dashboard Generator and AI-assisted doc search features.

#### Claude Agent SDK (Sub-Agents & Teams)

Anthropic's production-grade framework for building autonomous AI agents:

- **Sub-Agents:** Lighter approach for isolated tasks (research, data analysis). Best for focused helper calls with summarized results. [Source: [Claude API Subagents Docs](https://platform.claude.com/docs/en/agent-sdk/subagents)]
- **Agent Teams:** Heavier but collaborative. Teammates communicate, share task boards, auto-manage dependencies. [Source: [Claude Code Agent Teams](https://code.claude.com/docs/en/agent-teams)]
- **Swarms:** Experimental feature — team lead agent delegates to specialist background agents working in parallel. [Source: [Geeky Gadgets Agent Teams Guide](https://www.geeky-gadgets.com/claude-code-agent-team-guide/)]
- **Industry Trend:** Multi-agent system inquiries surged 1,445% from Q1 2024 to Q2 2025 (Gartner). 40% of enterprise apps will include task-specific AI agents by end of 2026. [Source: [Geeky Gadgets](https://www.geeky-gadgets.com/claude-code-agent-team-guide/)]

**CurryDash Relevance:** Claude Agent SDK sub-agents could power CurryDash's AI features — one agent for dashboard generation, one for doc search, one for Jira analysis. The team architecture maps well to CurryDash's multi-role system. However, this is more of a development-time tool than a runtime feature for the MVP.

### Production-Ready Starter Templates

Several proven templates exist for the exact CurryDash stack:

| Template | Stack | Key Features | Source |
|----------|-------|-------------|--------|
| **Razikus Supabase Next.js** | Next.js 15, Supabase, Tailwind | Auth, RBAC, file storage, RLS, i18n, legal docs | [GitHub](https://github.com/Razikus/supabase-nextjs-template) |
| **Vercel Supabase Starter** | Next.js App Router, Supabase | Cookie-based auth, TypeScript, Tailwind | [Vercel Templates](https://vercel.com/templates/next.js/supabase) |
| **MakerKit SaaS Starter** | Next.js, Supabase | Production-grade SaaS architecture, free tier | [MakerKit](https://makerkit.dev/blog/changelog/free-nextjs-saas-boilerplate) |
| **next-shadcn-dashboard-starter** | Next.js, shadcn/ui, Tailwind, TS | Admin dashboard, colocation architecture, 10+ pages | [GitHub](https://github.com/Kiranism/next-shadcn-dashboard-starter) |
| **next-auth-roles-template** | Next.js, NextAuth, shadcn/ui | RBAC with Owner/Member roles | [shadcn.io](https://www.shadcn.io/template/mickasmt-next-auth-roles-template) |

**CurryDash Relevance:** The `next-shadcn-dashboard-starter` and `next-auth-roles-template` are directly applicable. Combining their patterns gives CurryDash a running start on the role-based dashboard architecture.

### Popular GitHub Repos for AI-Powered Applications

| Repository | Stars | Description | Relevance |
|-----------|-------|-------------|-----------|
| **CopilotKit** | 28K+ | Open-source in-app AI copilots (React) | Direct fit for AI Assistant UI |
| **Mastra** | Growing fast | TypeScript AI agent framework (YC) | Agent backend for Next.js |
| **Vercel AI SDK** | 15K+ | TypeScript AI toolkit, streaming, tools | AI communication layer |
| **AutoGPT** | 177K | Autonomous AI agents | Architecture reference |
| **Langflow** | 140K | Low-code AI agent builder | Workflow reference |
| **Data Formulator** (Microsoft) | Active | AI-powered data visualization | Dashboard gen reference |
| **n8n** | 100K+ | Open-source workflow automation | Integration patterns |
| **claude-flow** | Active | Multi-agent orchestration for Claude | Agent architecture reference |

[Source: [GitHub AI Dashboard Topic](https://github.com/topics/ai-dashboard), [ODSC Top AI Repos 2025](https://opendatascience.com/the-top-ten-github-agentic-ai-repositories-in-2025/), [Agentailor Top Frameworks 2026](https://blog.agentailor.com/posts/top-ai-agent-frameworks-github-2026)]

### Technology Adoption Trends

**The Convergence Pattern:** The AI agent ecosystem is converging around three standardized protocols:
- **MCP** (tool/data access) — the "USB-C for AI" connecting agents to external systems
- **AG-UI** (agent-user interaction) — the standard for agent-powered frontends
- **A2A** (agent-to-agent) — the standard for multi-agent collaboration

All three are now under Linux Foundation governance, with broad industry backing. [Source: [Anthropic AAIF](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation), [Linux Foundation A2A](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents)]

**TypeScript-First AI:** The shift toward TypeScript-native AI frameworks (Vercel AI SDK 5, Mastra, CopilotKit) means CurryDash can use a single language across frontend, backend, and AI agent code. [Medium Confidence]

**Multi-Agent Surge:** Gartner reports 1,445% surge in multi-agent inquiries. 40% of enterprise apps projected to include task-specific AI agents by end of 2026. [Source: [Geeky Gadgets](https://www.geeky-gadgets.com/claude-code-agent-team-guide/)]

---

## Integration Patterns Analysis

### Jira REST API v3 Integration

**API Architecture: [High Confidence]**

Jira Cloud REST API v3 is the primary integration path for CurryDash's sprint board and issue tracking features:

- **Rate Limiting:** New points-based model where each API call consumes points based on data returned and operation complexity. Enforcement of tiered quota rate limits begins **March 2, 2026**. On 429 (Too Many Requests), respect the `Retry-After` header with exponential backoff. [Source: [Atlassian Rate Limiting](https://developer.atlassian.com/cloud/jira/platform/rate-limiting/), [Atlassian Blog](https://www.atlassian.com/blog/platform/evolving-api-rate-limits)]
- **Pagination:** Uses `startAt` + `maxResults` for offset pagination. **Warning:** The new `/rest/api/3/search/jql` token-based endpoint has reported issues — slower fetching, no `totalIssues` field. Consider fallback strategies. [Source: [Atlassian Developer Community](https://community.developer.atlassian.com/t/jira-cloud-rest-api-v3-search-jql-slower-fetching-with-nextpagetoken-no-totalissues-any-workarounds/90176)]
- **Webhooks:** HTTP POST on Jira events (issue created, updated, transitioned). Webhook registrations via REST API **expire after 30 days** — must implement a refresh mechanism. Use webhooks instead of polling to minimize API requests. [Source: [Inventive HQ Webhooks Guide](https://inventivehq.com/blog/jira-webhooks-guide)]
- **Client Libraries:** `jira.js` provides typed TypeScript client with full v3 support, including webhooks management. [Source: [jira.js Webhooks](https://mrrefactoring.github.io/jira.js/classes/Version3.Webhooks.html)]

**CurryDash Implementation Pattern:**
```
Server Component (data fetch) → Jira API v3 → Cache with ISR/revalidate
Webhook endpoint (App Router route handler) → Real-time issue updates → Supabase (persist)
```

**Risk:** MEDIUM — New rate limiting model (March 2026) requires monitoring. Pagination issues on new endpoint need workaround.

### GitHub API Integration (Octokit)

**API Architecture: [High Confidence]**

GitHub's REST and GraphQL APIs via Octokit provide PR status, repository data, and issue tracking:

- **Octokit.js:** All-batteries-included GitHub SDK for browsers, Node.js, and Deno. Provides typed API access with authentication handling. [Source: [GitHub: octokit.js](https://github.com/octokit/octokit.js/)]
- **@octokit-next/core:** Experimental minimalistic SDK with modern fetch support — lighter alternative for Next.js App Router. [Source: [GitHub: octokit-next](https://github.com/octokit/octokit-next.js/)]
- **Webhook Integration:** GitHub webhooks work with Next.js App Router route handlers. Use Octokit's `App` client for webhook verification and event handling. [Source: [Karim Shehadeh Blog](https://www.karimshehadeh.com/blog/posts/GithubWebhooksAndNextJS)]
- **Auth with NextAuth.js:** GitHub OAuth via Auth.js provides user-scoped access tokens. Octokit can be initialized with the session's access token for user-context API calls. [Source: [Octokit Discussion #2208](https://github.com/octokit/octokit.js/discussions/2208)]

**CurryDash Implementation Pattern:**
```
Auth.js GitHub OAuth → User access token → Octokit client (server-side)
Server Action → Octokit.rest.pulls.list() → Dashboard data
GitHub Webhook → Route handler → Supabase update → Realtime push to UI
```

**Risk:** LOW — Mature, well-documented, strongly typed SDK.

### Anthropic Claude API Streaming

**Streaming Architecture: [High Confidence]**

Two implementation paths for CurryDash's AI Assistant and Dashboard Generator:

#### Path 1: Vercel AI SDK 5.0 (Recommended)

- **Unified Provider:** `@ai-sdk/anthropic` provider wraps Claude API with unified interface. Same code works with OpenAI/Gemini if you want to switch later. [Source: [AI SDK Anthropic Provider](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic)]
- **SSE Streaming:** Data stream protocol uses Server-Sent Events with keep-alive ping, reconnect, and cache handling. `toTextStreamResponse()` method for route handlers. [Source: [AI SDK Stream Protocol](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol)]
- **Tool Calling:** `streamText` with tool definitions for multi-step agent workflows. Ideal for AI Dashboard Generator (Claude generates widget configs via tool calls). [Source: [AI SDK Docs](https://ai-sdk.dev/docs/introduction)]
- **Edge Compatible:** Works with Next.js Edge Runtime for low-latency AI responses. [Source: [TechEduByte Guide](https://www.techedubyte.com/claude-streaming-api-nextjs-edge-guide/)]

#### Path 2: Direct Anthropic SDK

- **@anthropic-ai/sdk:** `client.messages.stream()` with event handlers and accumulation helpers. `client.messages.create({ stream: true })` returns async iterable (less memory). [Source: [GitHub: anthropic-sdk-typescript](https://github.com/anthropics/anthropic-sdk-typescript)]
- **Use when:** You need direct control over Anthropic-specific features not exposed in AI SDK.

**CurryDash Implementation Pattern:**
```
AI Chat: useChat() hook → API route → streamText(anthropic('claude-sonnet-4-5-20250929')) → SSE → UI
Dashboard Gen: streamText() with tools → tool_call(generate_widget) → React component render
```

**Verdict:** Use Vercel AI SDK 5.0 as the primary layer. Fall back to direct SDK only for edge cases.

### MCP Server Ecosystem (Jira + GitHub)

**Ecosystem Maturity: [High Confidence]**

Pre-built MCP servers exist for both Jira and GitHub, enabling the AI Assistant to directly access project data:

#### Jira MCP Servers

| Server | Type | Features | Source |
|--------|------|----------|--------|
| **Official Atlassian MCP** | Remote MCP | Jira + Confluence, search, create/update issues, natural language | [GitHub: atlassian-mcp-server](https://github.com/atlassian/atlassian-mcp-server) |
| **aashari/mcp-server-atlassian-jira** | Node.js/TS | List projects, search (JQL), get issues, view dev info (commits, PRs) | [GitHub](https://github.com/aashari/mcp-server-atlassian-jira) |
| **OrenGrinker/jira-mcp-server** | Production-ready | Advanced features, robust error handling, AI agent tooling | [GitHub](https://github.com/OrenGrinker/jira-mcp-server) |

**Key Insight:** The official Atlassian MCP server is the strongest option — maintained by Atlassian, covers both Jira and Confluence, and supports natural language commands.

#### GitHub MCP Servers

GitHub MCP servers are available via `awesome-mcp-servers` curated lists, with implementations supporting repository browsing, issue/PR management, and code search. [Source: [GitHub: awesome-mcp-servers](https://github.com/wong2/awesome-mcp-servers)]

**CurryDash Implementation Pattern:**
```
AI Assistant → MCP Client (Vercel AI SDK or Mastra) → Jira MCP Server → Jira API
                                                     → GitHub MCP Server → GitHub API
                                                     → Custom MCP Server → Supabase (internal data)
```

**Verdict:** Use official Atlassian MCP server for Jira/Confluence. Use community GitHub MCP server. Build custom MCP server for CurryDash internal data.

### CopilotKit In-App AI Integration

**Integration Architecture: [High Confidence]**

CopilotKit provides the frontend infrastructure for CurryDash's AI features:

- **Two Packages:** `@copilotkit/react-core` (provider, hooks) + `@copilotkit/react-ui` (CopilotSidebar, CopilotPopup, CopilotChat). [Source: [CopilotKit Docs](https://docs.copilotkit.ai/)]
- **CLI Setup:** `npx copilotkit init` bootstraps in a Next.js project. [Source: [CopilotKit Quickstart](https://docs.copilotkit.ai/direct-to-llm/guides/quickstart)]
- **Core Hooks:**
  - `useCopilotAction` — define custom actions the AI can trigger (e.g., generate dashboard, create Jira issue)
  - `useCopilotReadable` — expose application context to the AI
  - `useCopilotChat` — programmatic chat control
- **Mastra Integration:** CopilotKit works directly with Mastra agents as a frontend layer. [Source: [Mastra CopilotKit Docs](https://mastra.ai/docs/frameworks/agentic-uis/copilotkit)]
- **Self-Hosted:** Can run against any LLM backend, including direct Anthropic API. [Source: [CopilotKit GitHub](https://github.com/CopilotKit/CopilotKit)]

**CurryDash Implementation Pattern:**
```
<CopilotKit> provider wrapping App Router layout
  → CopilotSidebar (AI Assistant chat)
  → useCopilotReadable (dashboard context, user role, current view)
  → useCopilotAction("generate_dashboard_widget", handler)
  → Backend: Mastra agent or direct AI SDK route
```

**Verdict:** CopilotKit is the optimal choice for CurryDash's AI Assistant UI — production-ready React components, self-hostable, and directly compatible with both Mastra agents and Vercel AI SDK.

### Mastra Agent Integration

**Framework Architecture: [High Confidence]**

Mastra provides the TypeScript-native agent backend for CurryDash:

- **MCP Client & Server:** Mastra supports both consuming MCP servers (connecting to Jira/GitHub) and authoring MCP servers (exposing CurryDash agents). [Source: [MCP.run Mastra Tutorial](https://docs.mcp.run/integrating/tutorials/mcpx-mastra-ts/)]
- **Next.js Integration:** Two approaches — embedded in Next.js API routes or standalone service. Abstractions feel natural to Next.js developers. [Source: [Mastra Next.js Guide](https://mastra.ai/blog/nextjs-integration-guide)]
- **Agent-to-Frontend:** AG-UI compatible, works with CopilotKit for frontend-agent interaction. [Source: [Mastra CopilotKit Docs](https://mastra.ai/docs/frameworks/agentic-uis/copilotkit)]
- **CLI Setup:** `mastra init` guides setup, can install custom MCP server into IDE for context. [Source: [WorkOS Mastra Quickstart](https://workos.com/blog/mastra-ai-quick-start)]

**CurryDash Agent Architecture:**
```
CopilotKit (frontend) → AG-UI → Mastra Agent (backend)
                                  → MCP: Jira Server (sprint data)
                                  → MCP: GitHub Server (PR status)
                                  → MCP: Custom Server (Supabase data)
                                  → Tool: Dashboard Widget Generator
                                  → Tool: Doc Search (RAG)
```

### Supabase Realtime for Dashboard Updates

**Integration Pattern: [High Confidence]**

Supabase Realtime enables live dashboard updates without polling:

- **Setup:** Enable replication on target tables. Subscribe to changes in client components. [Source: [Supabase Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs)]
- **Architecture:** Server Components fetch initial data → Client component subscribes to Realtime channel → UI updates on INSERT/UPDATE/DELETE. [Source: [ShipSaaS Realtime Guide](https://shipsaas.com/blog/next-js-supabase-realtime)]
- **Dashboard Pattern:** Ideal for collaborative tools and dashboards. Supabase handles backend sync, Next.js handles optimal rendering. [Source: [FAB Web Studio](https://fabwebstudio.com/blog/build-a-blazing-fast-scalable-app-with-next-js-and-supabase-step-by-step-tutorial)]

**CurryDash Pattern:**
```
Jira Webhook → Route Handler → Supabase INSERT → Realtime broadcast → Dashboard update
GitHub Webhook → Route Handler → Supabase INSERT → Realtime broadcast → Dashboard update
```

### Integration Security Patterns

**Security Architecture: [High Confidence]**

Multi-layered security for CurryDash's third-party integrations:

- **Three Auth Layers in Next.js App Router:** Middleware (edge route protection), Server Components (secure data fetching with user context), Client Components (interactive UI). [Source: [Strapi NextAuth Guide](https://strapi.io/blog/nextauth-js-secure-authentication-next-js-guide)]
- **OAuth 2.0 Best Practices:** Short-lived access tokens, tight scopes, server-side refresh token storage. Never ship client secrets in SPA bundles. [Source: [Treblle OAuth Guide](https://treblle.com/blog/oauth-2.0-for-apis)]
- **API Key Management:** Server-side only for Jira/GitHub API tokens. Store in environment variables, never expose to client. Use Vercel's env var system with dev/preview/production separation. [Source: [API7 API Key Guide](https://api7.ai/blog/what-is-api-key-why-need-them-complete-guide)]
- **JWT Security:** Auth.js signs JWTs with Supabase secret for RLS compatibility. CSRF tokens protect every sign-in request. HTTP-only secure cookies prevent XSS token leakage. [Source: [Strapi NextAuth Guide](https://strapi.io/blog/nextauth-js-secure-authentication-next-js-guide)]

**CurryDash Security Architecture:**
```
Layer 1: Edge Middleware — route protection by role
Layer 2: Auth.js JWT → Supabase RLS — database-level enforcement
Layer 3: Server-side API tokens — Jira/GitHub never exposed to client
Layer 4: MCP Server auth — credentials isolated in MCP server process
```

---

## Architectural Patterns and Design

### System Architecture Pattern: Modular Monolith

**Architecture Decision: [High Confidence]**

CurryDash should adopt a **modular monolith** pattern within Next.js 15 — a single deployable unit with feature-isolated modules. This is the optimal pattern for a 4-6 week MVP:

- **Why not microservices:** Overhead of service discovery, inter-service communication, and deployment complexity is not justified for an MVP with a single team. [Source: [SoftwareMill Full Stack Architecture](https://softwaremill.com/modern-full-stack-application-architecture-using-next-js-15/)]
- **Why modular monolith:** Achieves separation of concerns (each role's dashboard is isolated) while maintaining the simplicity of a single Next.js deployment. Can extract services later if needed. [Source: [Next.js Project Structure Docs](https://nextjs.org/docs/app/getting-started/project-structure)]
- **Deployment:** Single Vercel deployment with per-route runtime selection (Node.js serverless vs Edge). AI agent backend (Mastra) runs as a standalone sidecar or embedded in API routes.

### RBAC Architecture: Three-Layer Defense

**Pattern: [High Confidence]**

CurryDash requires a three-layer RBAC architecture to protect 4+ role-specific dashboards:

#### Layer 1: Middleware Route Protection

Next.js middleware intercepts requests **before pages load**. A centralized config maps roles to allowed route patterns:

```
middleware.ts
  → Read JWT from cookie → Extract role
  → Check role against route config: { admin: ['/admin/*'], dev: ['/dev/*'], ... }
  → If role mismatch → Redirect to user's home dashboard
  → If unauthenticated → Redirect to /login
```

[Source: [jigz.dev RBAC Middleware Guide](https://www.jigz.dev/blogs/how-to-use-middleware-for-role-based-access-control-in-next-js-15-app-router), [Medium: Multi-Role Middleware](https://medium.com/@abdullahmufti/nextjs-middleware-route-protection-with-multiple-roles-using-serverside-authentication-cb3457ff5b41)]

#### Layer 2: Server Component Data Authorization

Server Components validate roles before fetching data. This is the **data-level** protection:

```
Dashboard page (Server Component)
  → getServerSession() → verify role
  → Fetch only data authorized for this role
  → Pass sanitized props to Client Components
```

[Source: [Descope Next.js 14 RBAC](https://www.descope.com/blog/post/auth-nextjs14-app-router)]

#### Layer 3: Supabase RLS Database Enforcement

RLS provides the **final security boundary** — even if middleware and app code are bypassed, the database enforces access:

- Start with `user_id = auth.uid()` policies for basic row isolation
- Add role-based policies using custom JWT claims
- RLS catches what application code misses; application code handles what SQL cannot express cleanly
- Every table exposed through Supabase API **needs RLS enabled**, or you're one API call from a data breach

[Source: [DesignRevision Supabase RLS Guide](https://designrevision.com/blog/supabase-row-level-security), [Supabase RLS Docs](https://supabase.com/docs/guides/database/postgres/row-level-security)]

**CurryDash RBAC Matrix:**

| Role | Routes | Data Access | Supabase RLS |
|------|--------|-------------|--------------|
| Admin | `/admin/*` | All data, user management | Full read/write on all tables |
| Developer | `/dev/*` | Assigned issues, PRs, code metrics | Own team data + assigned items |
| QA | `/qa/*` | Test cases, bug reports, quality metrics | Own team data + test items |
| Stakeholder | `/stakeholder/*` | Business metrics, sprint progress, reports | Read-only aggregated data |

#### Auth.js RBAC Integration

Auth.js supports RBAC with roles attached directly to user sessions — no additional network requests needed. Two approaches based on session strategy (JWT vs database). For Supabase, JWT strategy is required so roles flow into RLS policies. [Source: [Auth.js RBAC Guide](https://authjs.dev/guides/role-based-access-control)]

### Folder Structure: Feature-Based Colocation

**Pattern: [High Confidence]**

CurryDash should adopt feature-based colocation following Next.js 15 best practices:

```
src/
├── app/                        # App Router (routes only)
│   ├── (auth)/                 # Auth group (login, register)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/            # Dashboard group
│   │   ├── admin/              # Admin dashboard route
│   │   │   ├── page.tsx
│   │   │   ├── _components/    # Private: admin-specific components
│   │   │   └── _lib/           # Private: admin-specific utils
│   │   ├── dev/                # Developer dashboard route
│   │   ├── qa/                 # QA dashboard route
│   │   └── stakeholder/        # Stakeholder dashboard route
│   ├── api/                    # API routes
│   │   ├── auth/[...nextauth]/ # Auth.js handler
│   │   ├── ai/                 # AI SDK streaming endpoints
│   │   └── webhooks/           # Jira/GitHub webhook handlers
│   └── layout.tsx              # Root layout with CopilotKit provider
├── modules/                    # Feature modules (self-contained)
│   ├── auth/                   # Auth module
│   ├── jira/                   # Jira integration module
│   ├── github/                 # GitHub integration module
│   ├── ai-assistant/           # AI Assistant + CopilotKit
│   ├── dashboard-gen/          # AI Dashboard Generator
│   └── docs-hub/               # Documentation hub
├── components/                 # Shared UI components (shadcn/ui)
├── lib/                        # Shared utilities
└── styles/                     # Global styles, Tailwind config
```

**Key Principles:**
- Route-specific code colocated inside route folders using `_prefixed` private folders [Source: [Next.js Colocation Template](https://next-colocation-template.vercel.app/)]
- Feature modules encapsulate their own components, hooks, services, types [Source: [Medium: Feature-Based Architecture](https://medium.com/@albert_barsegyan/best-next-js-folder-structure-2025-da809c0cb68c)]
- Shared components at root level only if used by 2+ features [Source: [Wisp CMS Structure Guide](https://www.wisp.blog/blog/the-ultimate-guide-to-organizing-your-nextjs-15-project-structure)]
- `src/` directory recommended for larger projects [Source: [Medium: Battle-Tested Structure](https://medium.com/@burpdeepak96/the-battle-tested-nextjs-project-structure-i-use-in-2025-f84c4eb5f426)]

### Server vs Client Component Boundaries

**Decision Guide: [High Confidence]**

The architectural rule: **default to Server Components, opt into Client Components only for interactivity.**

| Component Type | Use For | CurryDash Examples |
|---------------|---------|-------------------|
| **Server Component** (default) | Data fetching, auth checks, API calls, layouts | Dashboard pages, Jira data display, GitHub PR lists, metrics cards |
| **Client Component** (`'use client'`) | User interaction, state, browser APIs, event handlers | Charts, drag-and-drop sprint boards, AI chat UI, real-time subscriptions |

**Dashboard Architecture Pattern:**
```
Server Component (page.tsx)           ← Fetches data, checks auth
  └── Server Component (DataGrid)    ← Renders static data table
  └── Client Component (InteractiveChart)  ← User interaction, animations
  └── Client Component (RealtimeWidget)    ← Supabase realtime subscription
  └── Client Component (CopilotSidebar)    ← AI chat interface
```

Push Client Components to the **leaf nodes** of the component tree. Keep them as small as possible. [Source: [Next.js Server/Client Components Docs](https://nextjs.org/docs/app/getting-started/server-and-client-components), [Medium: Client vs Server Decision Guide](https://medium.com/@Saroj_bist/client-vs-server-components-in-next-js-what-goes-where-74badf8c5620)]

### Data Fetching & Caching Architecture

**Pattern: [High Confidence]**

CurryDash data comes from three sources with different freshness requirements:

| Data Source | Freshness | Strategy | Pattern |
|-------------|-----------|----------|---------|
| **Supabase (internal)** | Real-time | Supabase Realtime + ISR | Server Component fetch + Client subscription |
| **Jira API** | ~5 min | ISR with cache tags | `revalidateTag('jira-issues')` on webhook |
| **GitHub API** | ~5 min | ISR with cache tags | `revalidateTag('github-prs')` on webhook |
| **AI responses** | Streaming | SSE via AI SDK | Client Component with `useChat()` |

**Webhook-Triggered Revalidation:**
Instead of polling Jira/GitHub APIs, use webhooks to invalidate cache tags:
```
Jira webhook → /api/webhooks/jira → revalidateTag('jira-issues') → Next.js re-fetches
GitHub webhook → /api/webhooks/github → revalidateTag('github-prs') → Next.js re-fetches
```

This balances freshness with API rate limit efficiency. [Source: [Supabase Caching Blog](https://supabase.com/blog/fetching-and-caching-supabase-data-in-next-js-server-components), [Medium: Supabase Webhooks Caching](https://tylermarshall.medium.com/enhancing-data-caching-in-nextjs-14-with-supabase-webhooks-124524e4acdd)]

### AI Agent Architecture: CopilotKit + Mastra

**Architecture Pattern: [High Confidence]**

The AI features (AI Assistant + AI Dashboard Generator) follow a three-tier architecture:

```
┌─────────────────────────────────────────────────┐
│  FRONTEND (Next.js + CopilotKit)                │
│  ┌───────────┐  ┌──────────────┐  ┌──────────┐ │
│  │ CopilotKit│  │ useCopilot   │  │Dashboard │ │
│  │ Sidebar   │  │ Action hooks │  │Widgets   │ │
│  └─────┬─────┘  └──────┬───────┘  └────┬─────┘ │
│        └────────┬───────┘               │       │
│              AG-UI Protocol             │       │
└──────────────┬──────────────────────────┘       │
               │                                   │
┌──────────────▼──────────────────────────────────┐
│  AGENT BACKEND (Mastra)                          │
│  ┌──────────────┐  ┌────────────────────────┐   │
│  │ AI Assistant  │  │ Dashboard Generator    │   │
│  │ Agent         │  │ Agent                  │   │
│  └──────┬───────┘  └──────────┬─────────────┘   │
│         │                      │                  │
│  ┌──────▼──────────────────────▼─────────────┐   │
│  │  MCP Client Layer                          │   │
│  │  ┌─────────┐ ┌──────────┐ ┌────────────┐ │   │
│  │  │Jira MCP │ │GitHub MCP│ │Custom MCP  │ │   │
│  │  │Server   │ │Server    │ │(Supabase)  │ │   │
│  │  └─────────┘ └──────────┘ └────────────┘ │   │
│  └───────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

**Two deployment options:**
1. **Standalone Mastra server** (port 4111) — recommended for production. Separate scaling, independent deployment. [Source: [Mastra CopilotKit Docs](https://mastra.ai/docs/frameworks/agentic-uis/copilotkit)]
2. **Embedded in Next.js API routes** — simpler for MVP, single deployment. [Source: [Mastra Next.js Integration](https://mastra.ai/blog/nextjs-integration-guide)]

**AG-UI enables:** Event-driven communication, shared state management, tool usage, and streaming AI responses between CopilotKit frontend and Mastra backend. [Source: [CopilotKit AG-UI Blog](https://www.copilotkit.ai/blog/how-to-add-a-frontend-to-any-mastra-agent-using-ag-ui-protocol)]

**Full-stack TypeScript:** Both CopilotKit and Mastra are TypeScript-native, enabling a single-language stack with type safety from frontend to agent backend. [Source: [Mastra Blog: Full-Stack TS Agents](https://mastra.ai/blog/fullstack-typescript-agents-with-mastra-and-copilotkit)]

### AI Dashboard Generation Architecture

**Pattern: [Medium Confidence — Emerging Pattern]**

The AI Dashboard Generator is CurryDash's most innovative feature. Architectural pattern:

1. **User Request:** "Show me sprint velocity for the last 3 sprints" via CopilotKit chat
2. **Agent Processing:** Mastra agent receives request → determines needed data → calls MCP tools
3. **Data Gathering:** MCP Jira server fetches sprint data → MCP custom server queries Supabase
4. **Widget Generation:** Agent produces a widget config (JSON) specifying chart type, data, layout
5. **Frontend Rendering:** CopilotKit renders the widget using shared shadcn/ui chart components
6. **Persistence:** Widget config saved to Supabase → appears on dashboard permanently

**Key Design Decision:** Generate **widget configurations** (JSON), not raw React code. This is safer, faster, and avoids code injection risks. The widget renderer maps configs to pre-built shadcn/ui chart/table/metric components. [Source: [Claude AI Frontend Skills](https://claude.com/blog/improving-frontend-design-through-skills)]

**MVP Widget Types:** Metric cards, bar/line/pie charts (via Recharts or Chart.js), data tables, status lists — all built from shadcn/ui components.

### Deployment and Operations Architecture

**Vercel + Supabase Production Pattern: [High Confidence]**

```
┌─────────────────────────────────────┐
│  Vercel                              │
│  ┌──────────┐  ┌─────────────────┐  │
│  │ Edge      │  │ Serverless      │  │
│  │ Middleware│  │ Functions       │  │
│  │ (RBAC)   │  │ (API routes,    │  │
│  │           │  │  webhooks)      │  │
│  └──────────┘  └─────────────────┘  │
│  ┌──────────────────────────────┐   │
│  │ Static/ISR Pages (CDN)       │   │
│  └──────────────────────────────┘   │
└──────────────┬──────────────────────┘
               │ Same region
┌──────────────▼──────────────────────┐
│  Supabase                            │
│  PostgreSQL + RLS + Realtime + Auth  │
│  + Edge Functions + Storage          │
└──────────────────────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Mastra Agent Server (optional)      │
│  Standalone or embedded in Vercel    │
└──────────────────────────────────────┘
```

**Key deployment rules:**
- Deploy Supabase in the same region as Vercel functions (avoid cross-region latency)
- Use ISR for dashboard pages, SSR only for personalized real-time views
- Edge Middleware for RBAC checks (fast, close to user)
- Preview deployments for every PR (test each role's dashboard)

---

## Implementation Approaches and Technology Adoption

### Fastest Path to Production

**Strategy: [High Confidence]**

CurryDash should bootstrap from a **free production-ready template** rather than starting from scratch:

**Recommended Approach:**
1. Start with the [Vercel Supabase Starter](https://vercel.com/templates/next.js/supabase) for auth baseline (cookie-based App Router auth)
2. Layer in [next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter) patterns for dashboard architecture
3. Reference [next-auth-roles-template](https://www.shadcn.io/template/mickasmt-next-auth-roles-template) for RBAC patterns
4. Add CopilotKit and Mastra incrementally for AI features

**Why not premium boilerplates ($100-$400)?** The free templates provide enough foundation. Premium boilerplates like MakerKit ($349) or Supastarter ($99-$399) include billing/subscription features CurryDash doesn't need for MVP. [Source: [DesignRevision Boilerplate Rankings](https://designrevision.com/blog/best-nextjs-boilerplates)]

**Setup Steps:**
```
1. npx create-next-app@latest --typescript --tailwind --app
2. npx shadcn@latest init
3. npm install @supabase/supabase-js @supabase/ssr
4. npm install next-auth @auth/supabase-adapter
5. npx copilotkit init
6. npm install mastra (when AI features start)
```

[Source: [Supabase Next.js Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)]

### Development Workflow and Tooling

**Developer Experience: [High Confidence]**

Next.js 15.5 provides excellent DX out of the box:

- **Turbopack:** 2-5x faster builds in production (beta). `next build --turbopack` now supports production builds. Vercel sites handle 1.2B+ requests with Turbopack. [Source: [InfoQ Next.js 15.5](https://www.infoq.com/news/2025/09/nextjs-15-5-ships/)]
- **Typed Routes:** Stable in 15.5 — link targets validated at compile time. Helper types for PageProps, LayoutProps, RouteContext. `next typegen` generates types without full build. [Source: [Abdulkader Safi Next.js 15.5 Guide](https://abdulkadersafi.com/blog/nextjs-155-a-developers-guide-to-turbocharged-builds-full-node-middleware-smarter-typescript)]
- **ESLint + Prettier:** Add `eslint-config-prettier` to avoid conflicts. Note: `next lint` is being deprecated in favor of explicit linter configs (change coming in Next.js 16). [Source: [Next.js ESLint Docs](https://nextjs.org/docs/app/api-reference/config/eslint)]
- **Husky + lint-staged:** Pre-commit hooks for code quality enforcement. [Source: [Medium: Robust Next.js Setup](https://medium.com/@keshavkattel1998/setting-up-a-robust-next-js-e79b89e7d44e)]

**Recommended DX Stack:**
```
TypeScript strict mode + Turbopack + ESLint + Prettier + Husky + lint-staged
```

### Testing Strategy

**Approach: [High Confidence]**

Next.js App Router requires a **dual testing strategy:**

| Layer | Tool | What to Test | CurryDash Coverage |
|-------|------|-------------|-------------------|
| **Unit** | Vitest + React Testing Library | Sync components, hooks, utils | Shared UI components, auth logic, data transforms |
| **E2E** | Playwright | Async server components, full flows | RBAC routing, dashboard data loading, AI chat |

**Important Limitation:** Vitest cannot currently test async Server Components. Use Playwright for those. [Source: [Next.js Vitest Docs](https://nextjs.org/docs/app/guides/testing/vitest)]

**MVP Testing Priority (time-constrained):**
1. **E2E tests for RBAC** — verify each role can only access their dashboard (critical security)
2. **E2E tests for AI chat** — verify streaming responses render correctly
3. **Unit tests for shared components** — shadcn/ui wrapper components, data formatting
4. **Skip for MVP:** Comprehensive unit test coverage, visual regression testing

[Source: [Next.js Testing Guide](https://nextjs.org/docs/app/guides/testing), [Strapi Testing Guide](https://strapi.io/blog/nextjs-testing-guide-unit-and-e2e-tests-with-vitest-and-playwright)]

### AI Chat Production Patterns

**Implementation: [High Confidence]**

Streaming AI responses in production requires handling failure modes that basic implementations miss:

- **Partial Response Preservation:** Most streaming failures are partial (70-80% received before break). Error handling must preserve partial content, not discard it. [Source: [Vladimir Siedykh Production AI Streaming](https://vladimirsiedykh.com/blog/ai-streaming-responses-nextjs-production-patterns)]
- **Front-loaded Validation:** Authenticate and rate-limit **before** streaming starts, not during. [Source: [Vladimir Siedykh Production AI Streaming](https://vladimirsiedykh.com/blog/ai-streaming-responses-nextjs-production-patterns)]
- **Vercel AI SDK Error Handling:** `useChat()` hook exposes `error` value directly with descriptive messages. [Source: [Pockit Vercel AI SDK Guide](https://pockit.tools/blog/vercel-ai-sdk-nextjs-guide/)]
- **Graceful Degradation:** Show partial response + "Continue" option rather than error-and-retry. [Source: [Vladimir Siedykh Production AI Streaming](https://vladimirsiedykh.com/blog/ai-streaming-responses-nextjs-production-patterns)]

**CurryDash AI Chat Pattern:**
```
1. Auth check (middleware) → Rate limit check (server)
2. Stream via AI SDK useChat() → SSE to client
3. On error: preserve partial, show "Continue" button
4. On tool_call: render widget via CopilotKit action
5. Save conversation to Supabase for history
```

### Production Deployment Checklist

**Vercel + Supabase Deployment: [High Confidence]**

| Step | Action | Notes |
|------|--------|-------|
| 1 | Create Supabase project (Pro plan for production) | Same region as Vercel functions |
| 2 | Set env vars in Vercel (per environment) | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY` |
| 3 | Configure `SUPABASE_SECRET_KEY` as sensitive | Never expose in client code — bypasses RLS |
| 4 | Set `NEXT_PUBLIC_` vars before build | Client-side vars must be set at build time |
| 5 | Configure auth redirect URLs | Set in Supabase Auth > URL Configuration |
| 6 | Set up SMTP (Resend/SendGrid) | For email magic links |
| 7 | Configure DB webhooks | Point to `/api/webhooks/*` endpoints |
| 8 | Enable RLS on all tables | Every exposed table needs policies |
| 9 | Set up preview environments | Separate Supabase projects for dev/preview/prod |
| 10 | Configure Vercel Supabase integration | Auto-syncs env vars between platforms |

[Source: [MakerKit Deployment Checklist](https://makerkit.dev/docs/next-supabase-turbo/going-to-production/checklist), [MakerKit Env Vars Guide](https://makerkit.dev/docs/next-supabase-turbo/going-to-production/production-environment-variables)]

### Cost Analysis

**MVP Budget: [High Confidence]**

| Service | Plan | Monthly Cost | What You Get |
|---------|------|-------------|-------------|
| **Vercel** | Hobby (Free) | $0 | 100 GB transfer, CI/CD, previews, SSL |
| **Vercel** | Pro (if needed) | $20/user | 1 TB transfer, 10M edge requests |
| **Supabase** | Free | $0 | 500 MB DB, 50K MAUs, 1 GB storage |
| **Supabase** | Pro (production) | $25 | 8 GB DB, 100K MAUs, 100 GB storage |
| **Anthropic** | API usage | ~$10-50/mo | Claude API for AI features |
| **Total (MVP dev)** | Free tiers | **~$0-10/mo** | Sufficient for development |
| **Total (production)** | Pro tiers | **~$55-95/mo** | Sufficient for initial users |

**Key Limits:**
- Supabase Free tier pauses after 7 days of inactivity — **not viable for production**. Use Pro ($25/mo) for anything user-facing. [Source: [DesignRevision Supabase Pricing](https://designrevision.com/blog/supabase-pricing)]
- Vercel Hobby is sufficient for MVP development. Upgrade to Pro only when team grows. [Source: [Vercel Pricing](https://vercel.com/pricing)]
- Anthropic API costs depend on usage volume. Budget ~$10-50/mo for MVP-level AI chat traffic.

### AI-Assisted Development Strategy

**Productivity: [Medium Confidence — Varies by Task]**

AI coding tools save top teams **2-6 hours per week** on average, but complex tasks can cost experienced teams **19% velocity** due to debugging/verification overhead. [Source: [Faros AI Coding Agents Review](https://www.faros.ai/blog/best-ai-coding-agents-2026)]

**CurryDash Development Approach:**
- **Use AI for:** Boilerplate generation, component scaffolding, test generation, documentation, repetitive CRUD operations
- **Don't use AI for:** Architecture decisions (already researched), security-critical auth logic (review manually), complex business logic (specify clearly first)
- **Claude Code + Agent Teams:** Use for parallel development of independent features (e.g., Jira module + GitHub module simultaneously)
- **Human oversight required:** Architecture, security review, integration testing, UX decisions

[Source: [Anthropic Agentic Coding Trends 2026](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf), [BayTech AI Code Revolution](https://www.baytechconsulting.com/blog/mastering-ai-code-revolution-2026)]

### Risk Assessment and Mitigation

| Risk | Severity | Probability | Mitigation |
|------|----------|-------------|------------|
| **Jira API rate limit changes (March 2026)** | High | High | Build with rate limit awareness from day 1. Implement exponential backoff. Use webhooks over polling. |
| **4-6 week timeline overrun** | High | Medium | Strict feature prioritization. Cut AI Dashboard Gen to basic if behind. Auth+Dashboards are non-negotiable core. |
| **Supabase RLS complexity** | Medium | Medium | Start with simple `user_id = auth.uid()` policies. Layer complexity incrementally. Test RLS policies in isolation. |
| **CopilotKit/Mastra immaturity** | Medium | Low | Both actively maintained with large communities. Fallback: direct Vercel AI SDK without agent framework. |
| **Next.js 16 breaking changes** | Low | Low | Pin to Next.js 15.x for MVP. Upgrade post-launch. |
| **AI API costs exceed budget** | Medium | Low | Implement token budgets per user. Cache common queries. Use Claude Haiku for simple tasks, Sonnet for complex. |

### Implementation Roadmap (4-6 Week Timeline)

**Week 1: Foundation**
- Project setup (Next.js 15 + Supabase + shadcn/ui + Tailwind)
- Auth implementation (Auth.js + Supabase, all OAuth providers)
- Database schema + RLS policies for all roles
- Basic layout with role-based routing (middleware)
- **Deliverable:** Users can register, login, see role-appropriate dashboard shell

**Week 2: Core Dashboards**
- Admin dashboard (user management, system overview)
- Developer dashboard (personal metrics, task list)
- QA dashboard (test metrics, bug tracking)
- Stakeholder dashboard (business metrics, sprint progress)
- Shared components (metric cards, data tables, navigation)
- **Deliverable:** All 4 dashboards rendering with mock data

**Week 3: External Integrations**
- Jira integration (API client, webhooks, sprint data)
- GitHub integration (Octokit, PR status, commit activity)
- Webhook handlers + ISR cache revalidation
- Real data flowing into dashboards
- **Deliverable:** Live Jira and GitHub data on dashboards

**Week 4: AI Features**
- Vercel AI SDK setup + Claude streaming
- CopilotKit sidebar integration
- AI Assistant basic chat (role-aware prompts)
- MCP server connections (Jira, GitHub)
- **Deliverable:** Working AI chat assistant with project context

**Week 5: AI Dashboard Gen + Docs Hub**
- AI Dashboard Generator (widget config generation)
- Pre-built widget renderers (charts, tables, metrics)
- Docs Hub (MDX content, architecture browser)
- Search functionality
- **Deliverable:** AI can generate dashboard widgets, docs are browsable

**Week 6: Polish + Deploy**
- E2E tests (RBAC, AI chat, critical flows)
- Error handling and edge cases
- Performance optimization (ISR tuning, bundle analysis)
- Production deployment (Vercel + Supabase Pro)
- **Deliverable:** Production-ready MVP deployed

**Build Order Rationale:** Auth and dashboards first because everything depends on RBAC. Integrations second because dashboards need real data. AI features last because they build on top of the data layer. This order provides the fastest feedback loops.

---

## Strategic Recommendations

### 1. Adopt the CopilotKit + Mastra + MCP Architecture

**Priority: Critical for MVP**

The AI features are CurryDash's primary differentiator. The researched architecture provides a production-proven, full-stack TypeScript path:

- **CopilotKit** handles all AI frontend concerns (chat UI, action hooks, context sharing)
- **Mastra** handles agent logic (tool calling, memory, workflows)
- **MCP servers** provide standardized access to Jira, GitHub, and internal data
- **AG-UI protocol** connects frontend to agents with shared state and streaming

This stack avoids building custom AI infrastructure while remaining fully open-source and self-hostable.

### 2. Use Widget Config Generation, Not Code Generation

**Priority: Critical for AI Dashboard Generator**

Generate JSON widget configurations (chart type, data source, layout) via Claude tool calls, then render through pre-built shadcn/ui components. This approach:
- Eliminates code injection risk
- Enables faster generation (JSON vs code)
- Allows non-technical users to customize widgets post-generation
- Simplifies testing (validate JSON schema, not arbitrary code)

### 3. Implement Defense-in-Depth RBAC from Day 1

**Priority: Critical for Security**

The three-layer RBAC architecture (Edge Middleware → Server Components → Supabase RLS) must be built in Week 1. Retrofitting RBAC is exponentially harder than building it from the start:
- Define the role → routes mapping in a centralized config
- Create Supabase RLS policies for every table before writing application code
- Test with Playwright E2E tests verifying each role's access boundaries

### 4. Leverage Webhook-Driven Data Freshness

**Priority: High for Integration Quality**

Replace polling patterns with webhook-triggered ISR revalidation for Jira and GitHub data:
- Jira webhooks → `revalidateTag('jira-issues')` — fresh data without API rate limit pressure
- GitHub webhooks → `revalidateTag('github-prs')` — real-time PR status updates
- Supabase Realtime → direct client subscription for internal data changes

This approach scales better, costs less (fewer API calls), and provides near-real-time dashboards.

### 5. Start from Free Templates, Not From Scratch

**Priority: High for Timeline**

The research identified multiple production-ready templates that match CurryDash's stack exactly. Starting from these saves 1-2 weeks of boilerplate development:
- **Vercel Supabase Starter** for auth baseline
- **next-shadcn-dashboard-starter** for dashboard architecture patterns
- **next-auth-roles-template** for RBAC implementation patterns

### 6. Plan for the Jira API Rate Limit Changes

**Priority: High for March 2026**

New points-based rate limiting enforcement begins March 2, 2026 — during or immediately after MVP development. Build with rate limit awareness from the start:
- Implement exponential backoff on 429 responses
- Use webhooks instead of polling
- Cache aggressively with ISR
- Monitor API point consumption

---

## Research Methodology

### Research Approach

This technical research was conducted using the BMAD Method 6-step technical research workflow:

1. **Scope Confirmation** — Validated 5 research areas with user, expanded to include AI agent ecosystem
2. **Technology Stack Analysis** — 14 parallel web searches across core stack and AI ecosystem
3. **Integration Patterns Analysis** — 8 parallel searches targeting CurryDash's specific integrations
4. **Architectural Patterns** — 8 parallel searches for RBAC, components, AI architecture, deployment
5. **Implementation Research** — 8 parallel searches for practical build guidance
6. **Synthesis** — Compiled all findings into this comprehensive document

**Total:** 38+ targeted web searches with source citations throughout.

### Source Verification Standards

- Every factual claim backed by web sources with URL citations
- Multiple independent sources for critical claims (tech stack validation, protocol adoption)
- Confidence levels applied: [High], [Medium], or [Low] for uncertain information
- Distinction maintained between Facts (sourced), Analysis (interpretation), and Speculation

### Research Limitations

- Pricing information is point-in-time (February 2026) and may change
- AI agent ecosystem is evolving rapidly — CopilotKit and Mastra release frequently
- Jira API v3 pagination issues reported by community may be resolved by implementation time
- AI-assisted development productivity metrics vary significantly by team and task type

### Key Source Categories

| Category | Primary Sources |
|----------|----------------|
| Next.js | nextjs.org docs, Vercel blog, InfoQ |
| Supabase | supabase.com docs, community guides |
| AI SDK | ai-sdk.dev, Vercel blog |
| CopilotKit | copilotkit.ai, GitHub, docs.copilotkit.ai |
| Mastra | mastra.ai, GitHub, YC |
| MCP | modelcontextprotocol.io, Anthropic blog |
| AG-UI | docs.ag-ui.com, CopilotKit blog |
| A2A | Google Developers blog, Linux Foundation |
| Jira API | developer.atlassian.com |
| GitHub API | GitHub/octokit |

---

## Technical Research Conclusion

### Summary of Key Findings

The CurryDash Central Hub MVP architecture is **technically sound and achievable**. Every component of the proposed stack (Next.js 15, Supabase, shadcn/ui, Auth.js, Vercel) is production-proven with extensive documentation and community support. The AI agent ecosystem has matured significantly through 2025-2026, with standardized protocols (MCP, AG-UI) and production-ready frameworks (CopilotKit, Mastra, Vercel AI SDK 5.0) enabling the AI Assistant and AI Dashboard Generator features that differentiate CurryDash.

### Critical Success Factors

1. **RBAC first** — build the three-layer security architecture in Week 1
2. **Templates as foundation** — leverage existing production-ready templates
3. **AI features are incremental** — core dashboards work without AI, AI adds value on top
4. **Webhook-driven freshness** — avoid polling, use event-driven data updates
5. **Cost discipline** — free tiers for development, Pro tiers ($55-95/mo) only for production

### Next Steps

This research directly feeds into the next BMAD workflow steps:
1. **Product Brief** (`/bmad:bmm:workflows:create-product-brief`) — use findings to inform product strategy
2. **PRD** (`/bmad:bmm:workflows:prd`) — translate research into formal requirements
3. **Architecture Design** (`/bmad:bmm:workflows:create-architecture`) — formalize the patterns identified here
4. **Epics & Stories** (`/bmad:bmm:workflows:create-epics-and-stories`) — break down the 6-week roadmap

---

**Technical Research Completion Date:** 2026-02-17
**Research Period:** Comprehensive current technical analysis
**Source Verification:** All facts cited with current sources (38+ web searches)
**Confidence Level:** High — based on multiple authoritative sources across all research areas

_This comprehensive technical research document serves as the authoritative reference for CurryDash Central Hub MVP architecture decisions and provides actionable guidance for the 4-6 week implementation timeline._
