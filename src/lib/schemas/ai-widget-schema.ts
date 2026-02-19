import { z } from 'zod'

export const AI_WIDGET_TYPES = [
  'metric-card',
  'bar-chart',
  'line-chart',
  'pie-chart',
  'data-table',
] as const

export type AiWidgetType = (typeof AI_WIDGET_TYPES)[number]

/** Zod schema for an AI-generated widget configuration (FR42). */
export const aiWidgetConfigSchema = z.object({
  type: z.enum(['metric-card', 'bar-chart', 'line-chart', 'pie-chart', 'data-table']),
  title: z.string().min(1, 'Title is required').max(80, 'Title must be 80 characters or fewer'),
  description: z.string().max(200, 'Description must be 200 characters or fewer').optional(),
  dataSource: z.enum(['jira', 'github', 'supabase']),
  query: z.string().min(1, 'Query is required').max(500, 'Query must be 500 characters or fewer'),
  colSpan: z.union([z.literal(3), z.literal(4), z.literal(6), z.literal(12)]),
  refreshBehavior: z.enum(['static', 'realtime', 'polling']),
  displayProperties: z
    .object({
      /** Must be a CSS custom property (e.g. var(--color-turmeric)) — never a hardcoded hex value. */
      primaryColor: z
        .string()
        .regex(/^var\(--/, 'Colors must use CSS custom properties (e.g. var(--color-turmeric))')
        .optional(),
      secondaryColor: z
        .string()
        .regex(/^var\(--/, 'Colors must use CSS custom properties (e.g. var(--color-coriander))')
        .optional(),
      xAxisLabel: z.string().max(50).optional(),
      yAxisLabel: z.string().max(50).optional(),
    })
    .optional(),
})

export type AiWidgetConfig = z.infer<typeof aiWidgetConfigSchema>
