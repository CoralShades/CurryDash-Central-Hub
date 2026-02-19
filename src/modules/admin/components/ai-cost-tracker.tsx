import { getAiCostData } from '../actions/ai-cost-tracker'
import type { DailyAiSpend, ModelUsage, TopExpensiveRequest, DailyAiBreakdown } from '../actions/ai-cost-tracker'

// ── Helpers ───────────────────────────────────────────────────────────────────

function budgetBarColor(percent: number): string {
  if (percent >= 80) return 'var(--color-chili)'
  if (percent >= 60) return 'var(--color-turmeric)'
  return 'var(--color-coriander)'
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
  valueColor?: string
}

function AiMetricCard({ label, value, subtext, valueColor }: AiMetricCardProps) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#9ca3af',
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: '2rem',
          fontWeight: 700,
          lineHeight: 1,
          color: valueColor ?? 'var(--color-text)',
        }}
      >
        {value}
      </p>
      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{subtext}</p>
    </div>
  )
}

// ── Daily Spend Sparkline (CSS-based bar chart) ────────────────────────────────

function DailySparkline({ data }: { data: DailyAiSpend[] }) {
  const maxCost = Math.max(...data.map((d) => d.estimatedCost), 0.001)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '2px',
        height: '48px',
        width: '100%',
      }}
      aria-label="Daily AI spend trend (last 30 days)"
    >
      {data.map((day) => {
        const heightPercent = Math.max(4, (day.estimatedCost / maxCost) * 100)
        return (
          <div
            key={day.date}
            title={`${day.date}: ${formatUsd(day.estimatedCost)} (${day.queries} queries)`}
            style={{
              flex: 1,
              height: `${heightPercent}%`,
              backgroundColor:
                day.estimatedCost === 0 ? '#e5e7eb' : 'var(--color-coriander)',
              borderRadius: '2px 2px 0 0',
              opacity: day.estimatedCost === 0 ? 0.4 : 0.85,
              minWidth: '2px',
              transition: 'height 0.2s ease',
            }}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {models.length === 0 && (
        <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>No model usage this month</p>
      )}
      {models.map((m) => {
        const costShare = total > 0 ? Math.round((m.cost / total) * 100) : 0
        return (
          <div key={m.model} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{m.modelLabel}</span>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>
                {m.queries.toLocaleString()} queries · {formatTokens(m.tokens)} tokens ·{' '}
                <strong style={{ color: 'var(--color-text)' }}>{formatUsd(m.cost)}</strong>
              </span>
            </div>
            <div
              style={{
                height: '4px',
                backgroundColor: 'var(--color-border)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
              role="progressbar"
              aria-valuenow={costShare}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                style={{
                  height: '100%',
                  width: `${costShare}%`,
                  backgroundColor: m.model.includes('haiku')
                    ? 'var(--color-coriander)'
                    : 'var(--color-cinnamon)',
                  borderRadius: '2px',
                }}
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
      <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>No requests this month</p>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            {['Date', 'Model', 'Prompt', 'Completion', 'Total', 'Cost'].map((h) => (
              <th
                key={h}
                style={{
                  padding: '8px 12px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {requests.map((r, i) => (
            <tr
              key={i}
              style={{
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: i === 0 ? '#FFF8DC' : 'transparent',
              }}
            >
              <td style={{ padding: '8px 12px', color: '#6b7280' }}>{r.date}</td>
              <td style={{ padding: '8px 12px', fontWeight: 500 }}>{r.modelLabel}</td>
              <td style={{ padding: '8px 12px' }}>{r.promptTokens.toLocaleString()}</td>
              <td
                style={{
                  padding: '8px 12px',
                  color:
                    r.completionTokens >= 4000 ? 'var(--color-chili)' : 'var(--color-text)',
                  fontWeight: r.completionTokens >= 4000 ? 600 : 400,
                }}
              >
                {r.completionTokens.toLocaleString()}
                {r.completionTokens >= 4000 && ' ⚠'}
              </td>
              <td style={{ padding: '8px 12px' }}>{r.totalTokens.toLocaleString()}</td>
              <td style={{ padding: '8px 12px', fontWeight: 600 }}>{formatUsd(r.estimatedCost)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Daily Breakdown Table ─────────────────────────────────────────────────────

function DailyBreakdownTable({ rows }: { rows: DailyAiBreakdown[] }) {
  // Show only days with activity for brevity
  const activeRows = rows.filter((r) => r.queries > 0)

  if (activeRows.length === 0) {
    return (
      <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>No activity in the last 30 days</p>
    )
  }

  return (
    <div style={{ overflowX: 'auto', maxHeight: '320px', overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            {['Date', 'Queries', 'Haiku', 'Sonnet', 'Tokens', 'Cost'].map((h) => (
              <th
                key={h}
                style={{
                  padding: '8px 12px',
                  textAlign: 'left',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activeRows.map((r, i) => (
            <tr
              key={r.date}
              style={{
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: i % 2 === 0 ? 'transparent' : '#fafafa',
              }}
            >
              <td style={{ padding: '8px 12px', color: '#6b7280' }}>{r.date}</td>
              <td style={{ padding: '8px 12px', fontWeight: 500 }}>{r.queries}</td>
              <td style={{ padding: '8px 12px', color: 'var(--color-coriander)' }}>
                {r.haikuQueries}
              </td>
              <td style={{ padding: '8px 12px', color: 'var(--color-cinnamon)' }}>
                {r.sonnetQueries}
              </td>
              <td style={{ padding: '8px 12px' }}>{formatTokens(r.totalTokens)}</td>
              <td style={{ padding: '8px 12px', fontWeight: 600 }}>{formatUsd(r.estimatedCost)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
        style={{
          padding: '16px',
          backgroundColor: '#FEE2E2',
          borderRadius: '8px',
          color: 'var(--color-chili)',
          fontSize: '14px',
        }}
        role="alert"
      >
        Failed to load AI cost data. Please refresh the page.
      </div>
    )
  }

  const barColor = budgetBarColor(data.spendPercent)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>

      {/* ── Budget Alert Banner ─────────────────────────────────────────────── */}
      {data.budgetAlertTriggered && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            backgroundColor: '#FFF8DC',
            border: '1px solid var(--color-turmeric)',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#92400e',
          }}
          role="alert"
        >
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <span>
            AI spend has reached{' '}
            <strong>{data.spendPercent}%</strong> of the ${data.budgetCeilingUsd}/month budget.
            Review model routing to reduce costs.
          </span>
        </div>
      )}

      {/* ── Section 1: Budget Overview ──────────────────────────────────────── */}
      <section>
        <h2
          style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Monthly Budget
        </h2>

        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: `1px solid ${data.budgetAlertTriggered ? 'var(--color-turmeric)' : 'var(--color-border)'}`,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Spend amount */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <p
                style={{
                  margin: '0 0 4px 0',
                  fontSize: '3rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  color: barColor,
                }}
              >
                {formatUsd(data.currentMonthSpend)}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                of ${data.budgetCeilingUsd} monthly budget · {data.spendPercent}% used
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#6b7280' }}>
                Remaining
              </p>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
                {formatUsd(Math.max(0, data.budgetCeilingUsd - data.currentMonthSpend))}
              </p>
            </div>
          </div>

          {/* Budget bar */}
          <div>
            <div
              style={{
                height: '10px',
                backgroundColor: 'var(--color-border)',
                borderRadius: '5px',
                overflow: 'hidden',
              }}
              role="progressbar"
              aria-label={`AI budget: ${data.spendPercent}% consumed`}
              aria-valuenow={data.spendPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                style={{
                  height: '100%',
                  width: `${data.spendPercent}%`,
                  backgroundColor: barColor,
                  borderRadius: '5px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '6px',
                fontSize: '11px',
                color: '#9ca3af',
              }}
            >
              <span>$0</span>
              <span style={{ color: 'var(--color-turmeric)' }}>
                ${(data.budgetCeilingUsd * data.budgetWarnPercent).toFixed(0)} (80% warn)
              </span>
              <span>${data.budgetCeilingUsd}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Key Metrics ──────────────────────────────────────────── */}
      <section>
        <h2
          style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Usage Summary
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          <AiMetricCard
            label="Total Queries (Month)"
            value={data.totalQueriesThisMonth.toLocaleString()}
            subtext="AI requests processed"
          />
          <AiMetricCard
            label="Capped Requests"
            value={data.cappedRequestsThisMonth}
            subtext={`hit ${data.perRequestTokenCap.toLocaleString()} token output cap`}
            valueColor={
              data.cappedRequestsThisMonth > 0 ? 'var(--color-turmeric)' : 'var(--color-coriander)'
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
              valueColor={
                data.aiAvailabilityPercent === 100
                  ? 'var(--color-coriander)'
                  : 'var(--color-chili)'
              }
            />
          )}
        </div>
      </section>

      {/* ── Section 3: Daily Spend Trend ───────────────────────────────────── */}
      <section>
        <h2
          style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Daily Spend Trend
        </h2>

        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
            Last 30 days · hover bars for daily totals · gaps indicate zero spend
          </p>
          <DailySparkline data={data.dailySpend} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af' }}>
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>
      </section>

      {/* ── Section 4: Model Split ─────────────────────────────────────────── */}
      <section>
        <h2
          style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Model Breakdown
        </h2>

        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            padding: '20px 24px',
          }}
        >
          <ModelBreakdownSection models={data.modelBreakdown} />
        </div>
      </section>

      {/* ── Section 5: Top Expensive Requests ─────────────────────────────── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
            Top 5 Requests by Token Usage
          </h2>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
            ⚠ = completion tokens at cap ({data.perRequestTokenCap.toLocaleString()})
          </span>
        </div>

        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
          }}
        >
          <TopExpensiveTable requests={data.topExpensiveRequests} />
        </div>
      </section>

      {/* ── Section 6: Daily Breakdown Table ──────────────────────────────── */}
      <section>
        <h2
          style={{
            margin: '0 0 16px 0',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--color-text)',
          }}
        >
          Daily Breakdown
        </h2>

        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
          }}
        >
          <DailyBreakdownTable rows={data.dailyBreakdownTable} />
        </div>
      </section>

    </div>
  )
}
