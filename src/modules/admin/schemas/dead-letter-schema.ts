import { z } from 'zod'

export const retryEventSchema = z.object({
  eventId: z.string().uuid('Event ID must be a valid UUID'),
})
export type RetryEventInput = z.infer<typeof retryEventSchema>

/** Bulk retry has no required input fields — admin identity is verified via requireAuth */
export const bulkRetrySchema = z.object({})
export type BulkRetryInput = z.infer<typeof bulkRetrySchema>
