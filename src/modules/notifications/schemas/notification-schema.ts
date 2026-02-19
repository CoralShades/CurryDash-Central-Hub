import { z } from 'zod'

export const markAsReadSchema = z.object({
  notificationId: z.string().uuid('Invalid notification ID'),
})

export type MarkAsReadInput = z.infer<typeof markAsReadSchema>

export const notificationTypeSchema = z.enum([
  'webhook_failure',
  'dead_letter_growth',
  'integration_disconnect',
  'ai_budget',
  'webhook_refresh_failure',
  'rate_limit_warning',
  'info',
])

export type NotificationType = z.infer<typeof notificationTypeSchema>
