# CAD-101: Story 4.6 — Vendor Performance Metrics

> Snapshot captured: 2026-03-10
> Source: [CAD-101](https://coralshades.atlassian.net/browse/CAD-101)

## Ticket Details

| Field | Value |
|-------|-------|
| **Key** | CAD-101 |
| **Type** | Story |
| **Project** | CurryPackApp - Admin Dashboard (CAD) |
| **Epic** | Epic 4: Vendor Management |
| **Status** | To Do |
| **Priority** | Medium |
| **Assignee** | Ramesh Sanjaya |
| **Reporter** | Deshan Thathsara (Demi) |
| **Created** | 2025-12-17 |
| **Updated** | 2026-03-09 |
| **FR Reference** | FR52 |

## Description

As an **admin**,
I want **to view vendor performance metrics and ratings history**,
So that **I can identify high performers and vendors needing attention**.

## Acceptance Criteria

1. Key metrics: rating, completion rate, prep time, cancellation rate, complaints
2. Rating history with trend graphs
3. Warning flag when rating <3.5 or cancellation >10%
4. Platform-wide benchmarks for comparison

---

## Comments History

### Comment 1 — Ramesh Sanjaya (2026-03-09) ⭐ LATEST
> @Deshan Thathsara @Kasun Mendis
>
> We need to setup this in restaurant details page. Need to clarify how we implement this:
>
> 1. As a **separate tab** (like existing tabs section)
>    - [Screenshot: restaurant details tabs — Overview, Orders, Reviews, etc.]
> 2. As a **widget in overview page**
>    - [Screenshot: restaurant overview page with existing widgets]
>
> Also need to discuss UIs for graphs and tables.

---

## Current Implementation Status

| AC Item | Status | Notes |
|---------|--------|-------|
| Key metrics display | ❌ Not Started | Greenfield feature |
| Rating history with trend graphs | ❌ Not Started | Needs UI design decision |
| Warning flags | ❌ Not Started | Thresholds defined in AC |
| Platform benchmarks | ❌ Not Started | Requires aggregation queries |

## Ramesh's Open Questions (2026-03-09)
1. Separate tab vs widget in overview page?
2. UI design for graphs and tables?
3. What charting library to use? (Chart.js already in ecosystem)

## Design Decision (from plan)
**Decision**: Separate "Performance" tab in restaurant details page
**Rationale**: Performance data is complex enough to warrant its own dedicated view. Embedding as a widget in overview would be too cramped for trend charts, comparison tables, and date range selectors.
