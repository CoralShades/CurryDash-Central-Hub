# Jira Reviews & Audit — Master Index

> **Last updated**: 2026-03-12
> **To continue in a new session**: Start by reading `progress.md` (repo root), then this index.

---

## AI Achievability Audit (2026-03-12)

| File | Description | Read When |
|------|-------------|-----------|
| [ai-achievability-2026-03-12/AI-ACHIEVABILITY-AUDIT.md](ai-achievability-2026-03-12/AI-ACHIEVABILITY-AUDIT.md) | Full assessment of all tickets by AI implementability — 38 HIGH, 27 MEDIUM, 18 LOW, 52+ NOT. Top 10 quick wins, skills map, implementation order. | **Planning which tickets to implement with Claude Code** |

## Full Board Audit (2026-03-11)

| File | Description | Read When |
|------|-------------|-----------|
| [board-audit-2026-03-11/BOARD-AUDIT-2026-03-11.md](board-audit-2026-03-11/BOARD-AUDIT-2026-03-11.md) | Complete inventory of all 490 tickets across 4 projects (CAD, CAR, PACK, CUR) | Understanding what's on each board |
| [board-audit-2026-03-11/CLUSTER-ANALYSIS.md](board-audit-2026-03-11/CLUSTER-ANALYSIS.md) | 12 ticket clusters with dependency chains and execution order | Planning sprint work |
| [board-audit-2026-03-11/CROSS-PROJECT-DEPENDENCIES.md](board-audit-2026-03-11/CROSS-PROJECT-DEPENDENCIES.md) | Full dependency map: PACK→backend, CUR→platform, CAD↔CAR, missing links | Understanding what blocks what |
| [board-audit-2026-03-11/DECISIONS-NEEDED.md](board-audit-2026-03-11/DECISIONS-NEEDED.md) | 8 decisions for Demi with options, impact matrix | **Read first — decisions block cleanup** |
| [board-audit-2026-03-11/SPRINT-ROADMAP.md](board-audit-2026-03-11/SPRINT-ROADMAP.md) | 4-sprint priority plan for Ramesh + Ruchiran | Planning developer work |
| [board-audit-2026-03-11/COMMENT-ANALYSIS.md](board-audit-2026-03-11/COMMENT-ANALYSIS.md) | Comment/link analysis for 7 flagged tickets + all Jira actions taken | Understanding ticket state |

## Vendor Management Reviews (2026-03-10)

| File | Description |
|------|-------------|
| [vendor-management/](vendor-management/) | 15 files: ticket snapshots, reviews, implementation plans for CAD-97, CAD-98, CAD-101, CAR-156 |
| [vendor-management/CROSS-TICKET-ANALYSIS.md](vendor-management/CROSS-TICKET-ANALYSIS.md) | Dependencies and shared work across 4 vendor tickets |
| [vendor-management/FINDINGS.md](vendor-management/FINDINGS.md) | Codebase analysis (Laravel + Flutter) |
| [vendor-management/NEXT-STEPS.md](vendor-management/NEXT-STEPS.md) | Sprint planning and action items |

## QA Reviews (2026-03-06)

| File | Description |
|------|-------------|
| [qa-reviews-2026-03-06/CAR-203-review.md](qa-reviews-2026-03-06/CAR-203-review.md) | Disable Delete for food items |
| [qa-reviews-2026-03-06/CAR-204-review.md](qa-reviews-2026-03-06/CAR-204-review.md) | Disable Delete for packages |
| [qa-reviews-2026-03-06/CAR-205-review.md](qa-reviews-2026-03-06/CAR-205-review.md) | Handling inactive food items |
| [qa-reviews-2026-03-06/CAD-147-review.md](qa-reviews-2026-03-06/CAD-147-review.md) | Remove inactive items from packages |
| [qa-reviews-2026-03-06/CAR-206-review.md](qa-reviews-2026-03-06/CAR-206-review.md) | Auto-cancellation logic |
| [qa-reviews-2026-03-06/DUPLICATE-ANALYSIS.md](qa-reviews-2026-03-06/DUPLICATE-ANALYSIS.md) | Cross-project duplicate analysis |
| [qa-reviews-2026-03-06/MASTER-REVIEW-SUMMARY.md](qa-reviews-2026-03-06/MASTER-REVIEW-SUMMARY.md) | Summary of all 5 reviews |

---

## Key Constants (for resuming work)

| Constant | Value |
|----------|-------|
| Cloud ID | `71923a4c-1995-46c0-aad1-cd71cd8b572e` |
| Ramesh Account ID | `712020:fd7e5b19-06dd-4b48-ad43-89bd772e1e48` |
| Ruchiran Account ID | `712020:66e04391-0253-4aad-9f45-302a0e84d8ba` |
| Demi Account ID | `712020:fa38c43a-dbc3-450d-8a30-de63d9a2772a` |
| Confluence Space | FoodApp |
| MCP | Use `mcp__claude_ai_Atlassian__` (not `_2__`) |
| Overview Page ID | 122191873 |

## Codebases

| Project | Path | Stack |
|---------|------|-------|
| Admin-Seller Portal | `D:\ailocal\currydash\Admin-Seller_Portal` | Laravel 10, PHP 8.3, 123 models |
| User Mobile/Web App | `D:\ailocal\currydash\User-Web-Mobile` | Flutter/Dart, GetX, 30+ feature modules |
| Central Hub | `D:\ailocal\CurryDash-Central-Hub` | Next.js 15, Supabase, shadcn/ui |

## Session Recovery

1. Read `progress.md` (repo root) — 5-question reboot check
2. Read `DECISIONS-NEEDED.md` — 8 pending decisions
3. Read `AI-ACHIEVABILITY-AUDIT.md` — what to implement with AI agents
4. Read `CLUSTER-ANALYSIS.md` — 12 dependency clusters
5. Read `task_plan.md` (repo root) — checklist of all tasks
