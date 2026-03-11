# CAD-101 Implementation Plan: Vendor Performance Metrics

> Target Codebase: `D:\ailocal\currydash\Admin-Seller_Portal` (Laravel)
> FR: FR52 | Status: To Do — greenfield feature

## Existing Data Sources

- `Review` model: rating (1-5), scopes: `active()`, `foodReviews()`, `packageReviews()`
- `Restaurant::getRatingAttribute()` — returns star distribution array
- `VendorController@get_restaurant_ratings()` — returns avg rating + comment count
- `Order` model: `processing_time`, `order_status`, cancellation scopes
- `Vendor` model scopes: `todays_orders()`, `this_week_orders()`, `this_month_orders()`

## Implementation

### Phase 1: Performance Service

#### 1.1 New Service — `VendorPerformanceService`
- **File**: `app/Services/VendorPerformanceService.php`

```php
class VendorPerformanceService
{
    // Core metrics
    public function getAverageRating(int $restaurantId, ?Carbon $from, ?Carbon $to): float;
    public function getRatingTrend(int $restaurantId, string $period = 'monthly'): Collection;
    public function getCompletionRate(int $restaurantId, ?Carbon $from, ?Carbon $to): float;
    public function getCancellationRate(int $restaurantId, ?Carbon $from, ?Carbon $to): float;
    public function getAveragePrepTime(int $restaurantId, ?Carbon $from, ?Carbon $to): float;
    public function getComplaintCount(int $restaurantId, ?Carbon $from, ?Carbon $to): int;

    // Aggregated dashboard
    public function getPerformanceSummary(int $restaurantId, ?Carbon $from, ?Carbon $to): array;

    // Platform benchmarks
    public function getPlatformBenchmarks(?Carbon $from, ?Carbon $to): array;

    // Warning checks
    public function getWarnings(int $restaurantId, ?Carbon $from, ?Carbon $to): array;
}
```

**Metric Calculations:**
- **Average Rating**: `AVG(reviews.rating) WHERE restaurant_id AND created_at BETWEEN`
- **Completion Rate**: `COUNT(orders WHERE status = 'delivered') / COUNT(orders) * 100`
- **Cancellation Rate**: `COUNT(orders WHERE status IN ['canceled', 'failed']) / COUNT(orders) * 100`
- **Average Prep Time**: `AVG(orders.processing_time) WHERE status = 'delivered'`
- **Complaints**: `COUNT(reviews WHERE rating <= 2)`
- **Rating Trend**: Group by month/week, calculate avg per period

**Warning Thresholds** (configurable via `business_settings`):
- Rating < 3.5 → `warning`
- Cancellation > 10% → `warning`
- Rating < 2.5 → `critical`
- Cancellation > 20% → `critical`

### Phase 2: Controller & Routes

#### 2.1 New Controller — `VendorPerformanceController`
- **File**: `app/Http/Controllers/Admin/VendorPerformanceController.php`

```php
class VendorPerformanceController extends Controller
{
    public function show(Request $request, int $restaurantId): View;
    public function chartData(Request $request, int $restaurantId): JsonResponse;
}
```

- `show()`: Renders performance tab with KPI cards + initial data
- `chartData()`: AJAX endpoint for chart data (rating trend, comparison)
  - Query params: `period` (30d, 90d, 6m, 1y, custom), `from`, `to`

#### 2.2 Routes
```php
// routes/admin.php
Route::get('vendor/restaurant/{id}/performance', [VendorPerformanceController::class, 'show'])
    ->name('admin.vendor.restaurant.performance');
Route::get('vendor/restaurant/{id}/performance/chart-data', [VendorPerformanceController::class, 'chartData'])
    ->name('admin.vendor.restaurant.performance.chart');
```

### Phase 3: Frontend — Performance Tab

#### 3.1 Add Tab to Restaurant Details
- **File**: `resources/views/admin-views/vendor/view/index.blade.php`
- Add "Performance" tab to existing tab navigation

#### 3.2 Performance View
- **File**: `resources/views/admin-views/vendor/view/performance.blade.php`

**Layout:**
```
┌──────────────────────────────────────────────┐
│ Date Range: [30d] [90d] [6m] [1y] [Custom]  │
├──────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐│
│ │Rating│ │Compl.│ │ Prep │ │Cancel│ │Compl.││
│ │ 4.2  │ │ 94%  │ │ 18m  │ │  6%  │ │  12  ││
│ │  ★   │ │  ✅  │ │  ⏱   │ │  ⚠️  │ │  📋  ││
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘│
├──────────────────────────────────────────────┤
│ Rating Trend (Line Chart)                    │
│ ──── Vendor  ---- Platform Average           │
│                                              │
│ ┌────────────────────────────────────────┐   │
│ │     *                                  │   │
│ │   *   *  *                     *       │   │
│ │  *       -----*----*----*----*---      │   │
│ │ *                                      │   │
│ └────────────────────────────────────────┘   │
├──────────────────────────────────────────────┤
│ Detailed Breakdown Table                     │
│ Period | Orders | Completed | Cancelled |... │
│ Mar 26 |   45   |    42     |     3     |... │
│ Feb 26 |   52   |    49     |     3     |... │
└──────────────────────────────────────────────┘
```

#### 3.3 Chart.js Integration
- **File**: `public/js/vendor-performance-charts.js`
- Line chart for rating trend (vendor line + platform average dashed line)
- AJAX load chart data from `chartData()` endpoint
- Responsive, tooltips on hover

**KPI Card Warning Badges:**
- Normal: green background
- Warning: amber background + ⚠️ icon
- Critical: red background + 🚨 icon

### Phase 4: Platform Benchmarks

#### 4.1 Benchmark Calculation
In `VendorPerformanceService::getPlatformBenchmarks()`:
- Calculate avg across ALL active restaurants (not just one vendor)
- Return: avg_rating, avg_completion_rate, avg_prep_time, avg_cancellation_rate
- Cache result for 1 hour (benchmarks don't change frequently)

#### 4.2 Comparison Display
- Overlay platform average as dashed line on rating trend chart
- Show "vs. Platform" column in KPI cards: "4.2 ★ (Platform: 3.8)"

---

## Files Summary

### New Files
| File | Type |
|------|------|
| `app/Services/VendorPerformanceService.php` | Service |
| `app/Http/Controllers/Admin/VendorPerformanceController.php` | Controller |
| `resources/views/admin-views/vendor/view/performance.blade.php` | View |
| `public/js/vendor-performance-charts.js` | JavaScript |

### Modified Files
| File | Changes |
|------|---------|
| `resources/views/admin-views/vendor/view/index.blade.php` | Add "Performance" tab |
| `routes/admin.php` | Add performance routes |

---

## Testing Checklist

- [ ] Performance tab appears in restaurant details
- [ ] KPI cards show correct metrics for selected date range
- [ ] Rating trend chart loads via AJAX
- [ ] Date range selector changes chart and KPI data
- [ ] Warning flags appear when thresholds exceeded
- [ ] Platform benchmarks display as dashed overlay line
- [ ] Empty state handled (new vendor with no orders/reviews)
- [ ] Large dataset performance acceptable (vendor with 1000+ orders)
- [ ] Chart is responsive on tablet/mobile
