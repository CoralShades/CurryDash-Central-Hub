# CAD-101 Review: Vendor Performance Metrics

> Review Date: 2026-03-10
> Reviewer: AI Agent (Adversarial + Readiness)

## 1. Adversarial Review

### Gaps & Contradictions

| # | Finding | Severity | Details |
|---|---------|----------|---------|
| 1 | **No UI specs for trend graphs** | HIGH | AC says "Rating history with trend graphs" but no mockups, chart type (line/bar/area), time period, or data granularity specified. |
| 2 | **Warning thresholds hardcoded in AC** | MEDIUM | Rating <3.5 and cancellation >10% are specified in the AC. Should these be configurable? What if business requirements change? |
| 3 | **"Complaints" metric undefined** | MEDIUM | AC lists "complaints" but doesn't define what counts as a complaint. Reviews with rating ≤2? Explicit complaint reports? Support tickets? |
| 4 | **Platform benchmarks scope unclear** | MEDIUM | "Platform-wide benchmarks for comparison" — average of all vendors? Same category? Same zone? Anonymized? |
| 5 | **No date range specification** | MEDIUM | Over what period are metrics calculated? Last 30 days? Lifetime? Need selectable date ranges. |
| 6 | **No export/download capability mentioned** | LOW | Admin may want to export performance data for meetings or reports. |
| 7 | **No AC for action triggers** | LOW | When warning flags appear, should admin be able to take action (e.g., suspend vendor, send warning email)? |
| 8 | **Performance of aggregation queries** | MEDIUM | Calculating metrics across all orders/reviews per vendor could be slow. Caching/materialized views needed? |

### Missing Acceptance Criteria

1. **Chart specifications**: Type, granularity, interactive features (hover, zoom)
2. **Date range selector**: Predefined periods + custom range
3. **Complaints definition**: What constitutes a "complaint" in the system
4. **Benchmark methodology**: How platform averages are calculated
5. **Warning severity levels**: Just flags, or escalation tiers?
6. **Data freshness**: Real-time vs. cached with staleness indicator

## 2. Implementation Readiness Assessment

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC clarity | ⚠️ PARTIAL | Metrics listed but UI/UX unspecified |
| Design decisions made | ⚠️ PARTIAL | Separate tab decided, UI details pending |
| Technical feasibility | ✅ READY | Data exists in Review + Order models |
| Dependencies clear | ✅ CLEAR | Read-only feature, no external deps |
| Testable ACs | ⚠️ PARTIAL | Need specific metric calculation definitions |

### Overall: **CONDITIONALLY READY**
Data sources exist. Implementation blocked on UI design decisions (chart types, layout, date ranges). This is a greenfield feature — recommend a quick spec or wireframe before coding.

## 3. Recommendations

1. **Create quick spec with wireframe**: Show tab layout, KPI cards, chart types
2. **Use Chart.js**: Already in the Laravel ecosystem, consistent with other dashboards
3. **Start with service layer**: Build `VendorPerformanceService` first with calculation methods, then add UI
4. **Cache metrics**: Consider a `vendor_metrics_cache` table or Redis for expensive calculations
5. **Define "complaint"**: Explicitly as reviews with rating ≤ 2 to match existing Review model scopes
6. **Make thresholds configurable**: Store in `business_settings` table rather than hardcoding
