import { z } from 'zod'

// Use literal union instead of spreading ROLES array to satisfy zod's type requirements
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'developer', 'qa', 'stakeholder'] as const, {
    errorMap: () => ({ message: 'Invalid role selection' }),
  }),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['admin', 'developer', 'qa', 'stakeholder'] as const, {
    errorMap: () => ({ message: 'Invalid role selection' }),
  }),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

export const deactivateUserSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
})

export type DeactivateUserInput = z.infer<typeof deactivateUserSchema>
