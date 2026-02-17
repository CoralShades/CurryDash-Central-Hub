# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-02-17

### Added

- **Product Brief** — Comprehensive product brief created through 6-step collaborative
  discovery: vision (unified AI-native ops center), 4 primary personas (Demi PM, Arjun Dev,
  Priya QA, Marcus Stakeholder), success metrics with measurable targets, MVP feature scope
  (4-week timeline), and phased roadmap through 5 growth phases.
- **Product Requirements Document (PRD)** — Full BMAD-standard PRD with 56 Functional
  Requirements across 8 capability areas (Identity & Access, Dashboard, Jira Integration,
  GitHub Integration, AI Assistant, AI Reports/Widgets, Data Pipeline, System Admin) and
  46 Non-Functional Requirements across 5 categories (Performance, Security, Integration,
  Reliability, Scalability). Includes Executive Summary, Success Criteria with go/no-go gates,
  6 narrative User Journeys, Domain-Specific Requirements, Innovation & Novel Patterns analysis,
  SaaS B2B Platform Requirements (RBAC matrix, integration spec, tenant model), and 5-phase
  Project Scoping.
- **PRD Validation Report** — 12-step BMAD validation covering format detection, information
  density (0 violations), product brief coverage (95%+), measurability, traceability (complete
  chain integrity), implementation leakage analysis (14 contextual warnings), domain compliance,
  project-type compliance (100%), SMART scoring (4.91/5.0 average), holistic quality (4/5 Good),
  and completeness (100%). Overall status: Warning (usable, minor improvements recommended).

### Changed

- Updated BMAD workflow status tracker with product brief and PRD completion.
- Updated session tracking files (progress.md, task_plan.md) for product brief workflow.

## [0.1.0] - 2026-02-17

### Added

- **BMAD Methodology Framework** — Complete installation of the BMad Method with four modules:
  BMM (Build Method Module), CIS (Creative Innovation Suite), Core (master agent, shared tasks),
  and JBM (Jira Bridge Module). 373 files across agents, workflows, test architecture knowledge
  base, configuration, and sidecar memory stores.
- **Multi-IDE Agent Configurations** — BMAD agent and workflow definitions for Copilot
  (`.agent/workflows/bmad/`), Claude Code (`.claude/commands/bmad/`), Gemini
  (`.gemini/commands/`), and GitHub Copilot (`.github/agents/`). 188 files enabling consistent
  BMAD methodology access across AI coding assistants.
- **CurryDash Central Hub MVP Action Plan** — Strategic action plan defining MVP scope, roles,
  features, and 4-6 week timeline.
- **MVP Architecture Research** — Comprehensive technical research document (~1000 lines)
  covering technology stack validation (Next.js 15, Supabase, shadcn/ui, Auth.js, Vercel),
  AI agent architecture (Vercel AI SDK 5.0, CopilotKit, Mastra, MCP), integration patterns
  (Jira API, GitHub API, Claude streaming), architectural patterns (3-layer RBAC, feature-based
  colocation, ISR caching), 6-week implementation roadmap, and 38+ web-sourced citations.
- **BMAD Workflow Status Tracker** — YAML-based progress tracking through all BMAD phases.
- **Session Planning Files** — Research findings, progress log, and task plan for AI-assisted
  development session continuity.

### Changed

- Updated project documentation (CLAUDE.md, AGENTS.md, README.md, copilot-instructions.md)
  to reflect the new MVP architecture direction and BMAD methodology.
- Updated `.gitignore` with BMAD-related entries.
- Updated Prisma schema for current project state.

### Removed

- **BREAKING CHANGE:** Removed all Next.js 14 scaffold source code, configuration, and
  dependencies (18 files). The project enters a greenfield planning phase for rebuild with
  Next.js 15, Supabase, and a modern AI agent architecture.

[0.2.0]: https://github.com/CoralShades/CurryDash-Central-Hub/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/CoralShades/CurryDash-Central-Hub/compare/fbda430...v0.1.0
