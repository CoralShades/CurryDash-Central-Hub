import { z } from 'zod'

/**
 * Schema for AI cost data query — optional date range filter.
 * When omitted, the action uses the current month.
 */
export const aiCostQuerySchema = z.object({
  year: z.number().int().min(2024).max(2100).optional(),
  month: z.number().int().min(1).max(12).optional(),
})

export type AiCostQuery = z.infer<typeof aiCostQuerySchema>
