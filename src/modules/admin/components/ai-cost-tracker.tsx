import { getAiCostData } from '../actions/ai-cost-tracker'
import type { DailyAiSpend, ModelUsage, TopExpensiveRequest, DailyAiBreakdown } from '../actions/ai-cost-tracker'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

// ── Helpers ───────────────────────────────────────────────────────────────────

function budgetBarColorClass(percent: number): string {
  if (percent >= 80) return 'bg-chili'
  if (percent >= 60) return 'bg-turmeric'
  return 'bg-coriander'
}

function budgetValueColorClass(percent: number): string {
  if (percent >= 80) return 'text-chili'
  if (percent >= 60) return 'text-turmeric'
  return 'text-coriander'
}

function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface AiMetricCardProps {
  label: string
  value: string | number
  subtext: string
  valueColorClass?: string
}

function AiMetricCard({ label, value, subtext, valueColorClass }: AiMetricCardProps) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className={cn('text-4xl font-bold leading-none', valueColorClass ?? 'text-foreground')}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </CardContent>
    </Card>
  )
}

// ── Daily Spend Sparkline (CSS-based bar chart) ────────────────────────────────

function DailySparkline({ data }: { data: DailyAiSpend[] }) {
  const maxCost = Math.max(...data.map((d) => d.estimatedCost), 0.001)

  return (
    <div
      className="flex items-end gap-0.5 h-12 w-full"
      aria-label="Daily AI spend trend (last 30 days)"
    >
      {data.map((day) => {
        const heightPercent = Math.max(4, (day.estimatedCost / maxCost) * 100)
        return (
          <div
            key={day.date}
            title={`${day.date}: ${formatUsd(day.estimatedCost)} (${day.queries} queries)`}
            className={cn(
              'flex-1 rounded-t-sm transition-all duration-200 min-w-0.5',
              day.estimatedCost === 0 ? 'bg-muted opacity-40' : 'bg-coriander opacity-85'
            )}
            style={{ height: `${heightPercent}%` }}
          />
        )
      })}
    </div>
  )
}

// ── Model Breakdown ───────────────────────────────────────────────────────────

function ModelBreakdownSection({ models }: { models: ModelUsage[] }) {
  const total = models.reduce((sum, m) => sum + m.cost, 0)

  return (
    <div className="flex flex-col gap-3">
      {models.length === 0 && (
        <p className="text-sm text-muted-foreground">No model usage this month</p>
      )}
      {models.map((m) => {
        const costShare = total > 0 ? Math.round((m.cost / total) * 100) : 0
        return (
          <div key={m.model} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">{m.modelLabel}</span>
              <span className="text-sm text-muted-foreground">
                {m.queries.toLocaleString()} queries · {formatTokens(m.tokens)} tokens ·{' '}
                <strong className="text-foreground">{formatUsd(m.cost)}</strong>
              </span>
            </div>
            <div
              className="h-1 bg-border rounded-sm overflow-hidden"
              role="progressbar"
              aria-valuenow={costShare}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className={cn(
                  'h-full rounded-sm',
                  m.model.includes('haiku') ? 'bg-coriander' : 'bg-cinnamon'
                )}
                style={{ width: `${costShare}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Top Expensive Requests Table ───────────────────────────────────────────────

function TopExpensiveTable({ requests }: { requests: TopExpensiveRequest[] }) {
  if (requests.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No requests this month</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {['Date', 'Model', 'Prompt', 'Completion', 'Total', 'Cost'].map((h) => (
              <TableHead
                key={h}
                className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((r, i) => (
            <TableRow
              key={i}
              className={i === 0 ? 'bg-turmeric/5' : ''}
            >
              <TableCell className="text-muted-foreground">{r.date}</TableCell>
              <TableCell className="font-medium">{r.modelLabel}</TableCell>
              <TableCell>{r.promptTokens.toLocaleString()}</TableCell>
              <TableCell
                className={cn(
                  r.completionTokens >= 4000 ? 'text-chili font-semibold' : ''
                )}
              >
                {r.completionTokens.toLocaleString()}
                {r.completionTokens >= 4000 && ' ⚠'}
              </TableCell>
              <TableCell>{r.totalTokens.toLocaleString()}</TableCell>
              <TableCell className="font-semibold">{formatUsd(r.estimatedCost)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ── Daily Breakdown Table ─────────────────────────────────────────────────────

function DailyBreakdownTable({ rows }: { rows: DailyAiBreakdown[] }) {
  // Show only days with activity for brevity
  const activeRows = rows.filter((r) => r.queries > 0)

  if (activeRows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No activity in the last 30 days</p>
    )
  }

  return (
    <ScrollArea className="h-80">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            {['Date', 'Queries', 'Haiku', 'Sonnet', 'Tokens', 'Cost'].map((h) => (
              <TableHead
                key={h}
                className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {activeRows.map((r, i) => (
            <TableRow
              key={r.date}
              className={i % 2 !== 0 ? 'bg-muted/30' : ''}
            >
              <TableCell className="text-muted-foreground">{r.date}</TableCell>
              <TableCell className="font-medium">{r.queries}</TableCell>
              <TableCell className="text-coriander">{r.haikuQueries}</TableCell>
              <TableCell className="text-cinnamon">{r.sonnetQueries}</TableCell>
              <TableCell>{formatTokens(r.totalTokens)}</TableCell>
              <TableCell className="font-semibold">{formatUsd(r.estimatedCost)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}

// ── AiCostTracker ─────────────────────────────────────────────────────────────

/**
 * AiCostTracker — async Server Component.
 * Displays AI API spend telemetry: monthly budget consumption, daily trend,
 * model split, daily breakdown table, top expensive requests, and token cap stats.
 * Admin-only (enforced by the parent page via requireAuth).
 */
export async function AiCostTracker() {
  const result = await getAiCostData()
  const data = result.data

  if (result.error || !data) {
    return (
      <div
        className="p-4 bg-destructive/10 rounded-lg text-chili text-sm"
        role="alert"
      >
        Failed to load AI cost data. Please refresh the page.
      </div>
    )
  }

  const barColorClass = budgetBarColorClass(data.spendPercent)
  const valueColorClass = budgetValueColorClass(data.spendPercent)

  return (
    <div className="flex flex-col gap-9">

      {/* ── Budget Alert Banner ─────────────────────────────────────────────── */}
      {data.budgetAlertTriggered && (
        <div
          className="flex items-center gap-3 p-3 px-4 bg-turmeric/10 border border-turmeric rounded-lg text-sm text-amber-900"
          role="alert"
        >
          <span className="text-lg">⚠️</span>
          <span>
            AI spend has reached{' '}
            <strong>{data.spendPercent}%</strong> of the ${data.budgetCeilingUsd}/month budget.
            Review model routing to reduce costs.
          </span>
        </div>
      )}

      {/* ── Section 1: Budget Overview ──────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Monthly Budget
        </h2>

        <Card className={cn(data.budgetAlertTriggered && 'border-turmeric')}>
          <CardContent className="flex flex-col gap-4 pt-6">
            {/* Spend amount */}
            <div className="flex justify-between items-baseline">
              <div>
                <p className={cn('text-5xl font-bold leading-none mb-1', valueColorClass)}>
                  {formatUsd(data.currentMonthSpend)}
                </p>
                <p className="text-sm text-muted-foreground">
                  of ${data.budgetCeilingUsd} monthly budget · {data.spendPercent}% used
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Remaining</p>
                <p className="text-2xl font-semibold">
                  {formatUsd(Math.max(0, data.budgetCeilingUsd - data.currentMonthSpend))}
                </p>
              </div>
            </div>

            {/* Budget bar */}
            <div>
              <div
                className="h-2.5 bg-border rounded-full overflow-hidden"
                role="progressbar"
                aria-label={`AI budget: ${data.spendPercent}% consumed`}
                aria-valuenow={data.spendPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={cn('h-full rounded-full transition-all duration-300', barColorClass)}
                  style={{ width: `${data.spendPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground">
                <span>$0</span>
                <span className="text-turmeric">
                  ${(data.budgetCeilingUsd * data.budgetWarnPercent).toFixed(0)} (80% warn)
                </span>
                <span>${data.budgetCeilingUsd}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Section 2: Key Metrics ──────────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Usage Summary
        </h2>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          <AiMetricCard
            label="Total Queries (Month)"
            value={data.totalQueriesThisMonth.toLocaleString()}
            subtext="AI requests processed"
          />
          <AiMetricCard
            label="Capped Requests"
            value={data.cappedRequestsThisMonth}
            subtext={`hit ${data.perRequestTokenCap.toLocaleString()} token output cap`}
            valueColorClass={
              data.cappedRequestsThisMonth > 0 ? 'text-turmeric' : 'text-coriander'
            }
          />
          <AiMetricCard
            label="Per-Request Cap"
            value={`${data.perRequestTokenCap.toLocaleString()} t`}
            subtext="max output tokens per request"
          />
          <AiMetricCard
            label="Per-Session Cap"
            value={`${data.perSessionTokenCap.toLocaleString()} t`}
            subtext="max output tokens per session"
          />
          {data.aiAvailabilityPercent !== null && (
            <AiMetricCard
              label="AI Availability"
              value={`${data.aiAvailabilityPercent}%`}
              subtext="based on integration status"
              valueColorClass={
                data.aiAvailabilityPercent === 100
                  ? 'text-coriander'
                  : 'text-chili'
              }
            />
          )}
        </div>
      </section>

      {/* ── Section 3: Daily Spend Trend ───────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Daily Spend Trend
        </h2>

        <Card>
          <CardContent className="flex flex-col gap-2 pt-5">
            <p className="text-xs text-muted-foreground">
              Last 30 days · hover bars for daily totals · gaps indicate zero spend
            </p>
            <DailySparkline data={data.dailySpend} />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ── Section 4: Model Split ─────────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Model Breakdown
        </h2>

        <Card>
          <CardContent className="pt-5">
            <ModelBreakdownSection models={data.modelBreakdown} />
          </CardContent>
        </Card>
      </section>

      {/* ── Section 5: Top Expensive Requests ─────────────────────────────── */}
      <section>
        <div className="flex items-baseline gap-3 mb-4">
          <h2 className="text-lg font-semibold">
            Top 5 Requests by Token Usage
          </h2>
          <span className="text-xs text-muted-foreground">
            ⚠ = completion tokens at cap ({data.perRequestTokenCap.toLocaleString()})
          </span>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <TopExpensiveTable requests={data.topExpensiveRequests} />
          </CardContent>
        </Card>
      </section>

      {/* ── Section 6: Daily Breakdown Table ──────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">
          Daily Breakdown
        </h2>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <DailyBreakdownTable rows={data.dailyBreakdownTable} />
          </CardContent>
        </Card>
      </section>

    </div>
  )
}
