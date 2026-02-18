'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/auth'
import { logger } from '@/lib/logger'
import type { ApiResponse } from '@/types/api'
import type { Role } from '@/types/roles'
import {
  createUserSchema,
  updateUserSchema,
  deactivateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type DeactivateUserInput,
} from '../schemas/user-schema'

export interface AdminUser {
  id: string
  email: string
  fullName: string | null
  roleId: string | null
  roleName: Role | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Raw row shape returned by Supabase joins
interface UserRow {
  id: string
  email: string
  full_name: string | null
  role_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  roles: { name: string } | null
}

function mapUserRow(row: UserRow): AdminUser {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    roleId: row.role_id,
    roleName: (row.roles?.name as Role) ?? null,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const USER_SELECT = 'id, email, full_name, role_id, is_active, created_at, updated_at, roles(name)'

/**
 * Create a new user with an assigned role.
 * Admin-only operation.
 */
export async function createUser(input: CreateUserInput): Promise<ApiResponse<AdminUser>> {
  try {
    const session = await requireAuth('admin')

    const validation = createUserSchema.safeParse(input)
    if (!validation.success) {
      return {
        data: null,
        error: { code: 'VALIDATION_ERROR', message: validation.error.errors[0]?.message ?? 'Validation failed' },
      }
    }

    const supabase = createAdminClient()

    // Look up the role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', validation.data.role)
      .single()

    if (roleError ?? !roleData) {
      logger.error('Failed to find role', { source: 'admin', data: { role: validation.data.role, error: roleError } })
      return { data: null, error: { code: 'ROLE_NOT_FOUND', message: 'Role does not exist' } }
    }

    // Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validation.data.email,
      password: Math.random().toString(36).slice(-12),
      email_confirm: true,
    })

    if (authError ?? !authData.user) {
      logger.error('Failed to create auth user', { source: 'admin', data: { email: validation.data.email, error: authError } })
      return { data: null, error: { code: 'AUTH_USER_CREATE_FAILED', message: 'Could not create user account' } }
    }

    // Create user record with role assignment
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({ id: authData.user.id, email: validation.data.email, role_id: roleData.id, is_active: true })
      .select(USER_SELECT)
      .single()

    if (userError ?? !userData) {
      logger.error('Failed to create user record', { source: 'admin', data: { userId: authData.user.id, error: userError } })
      return { data: null, error: { code: 'USER_RECORD_CREATE_FAILED', message: 'Could not create user record' } }
    }

    logger.info('User created successfully', { source: 'admin', data: { userId: authData.user.id, role: validation.data.role, createdBy: session.id } })

    return { data: mapUserRow(userData as unknown as UserRow), error: null }
  } catch (err) {
    logger.error('Unexpected error creating user', { source: 'admin', data: { error: err } })
    return { data: null, error: { code: 'SERVER_ERROR', message: 'Failed to create user' } }
  }
}

/**
 * Update a user's role assignment.
 * Admin-only operation.
 */
export async function updateUser(input: UpdateUserInput): Promise<ApiResponse<AdminUser>> {
  try {
    const session = await requireAuth('admin')

    const validation = updateUserSchema.safeParse(input)
    if (!validation.success) {
      return {
        data: null,
        error: { code: 'VALIDATION_ERROR', message: validation.error.errors[0]?.message ?? 'Validation failed' },
      }
    }

    const supabase = createAdminClient()

    // Look up the role ID
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', validation.data.role)
      .single()

    if (roleError ?? !roleData) {
      return { data: null, error: { code: 'ROLE_NOT_FOUND', message: 'Role does not exist' } }
    }

    // Update user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .update({ role_id: roleData.id })
      .eq('id', validation.data.userId)
      .select(USER_SELECT)
      .single()

    if (userError ?? !userData) {
      logger.error('Failed to update user role', { source: 'admin', data: { userId: validation.data.userId, error: userError } })
      return { data: null, error: { code: 'USER_UPDATE_FAILED', message: 'Could not update user role' } }
    }

    logger.info('User role updated successfully', { source: 'admin', data: { userId: validation.data.userId, newRole: validation.data.role, updatedBy: session.id } })

    return { data: mapUserRow(userData as unknown as UserRow), error: null }
  } catch (err) {
    logger.error('Unexpected error updating user', { source: 'admin', data: { error: err } })
    return { data: null, error: { code: 'SERVER_ERROR', message: 'Failed to update user' } }
  }
}

/**
 * Deactivate a user account (sets is_active = false).
 * Admin-only operation.
 */
export async function deactivateUser(input: DeactivateUserInput): Promise<ApiResponse<AdminUser>> {
  try {
    const session = await requireAuth('admin')

    const validation = deactivateUserSchema.safeParse(input)
    if (!validation.success) {
      return {
        data: null,
        error: { code: 'VALIDATION_ERROR', message: validation.error.errors[0]?.message ?? 'Validation failed' },
      }
    }

    const supabase = createAdminClient()

    const { data: userData, error: userError } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', validation.data.userId)
      .select(USER_SELECT)
      .single()

    if (userError ?? !userData) {
      logger.error('Failed to deactivate user', { source: 'admin', data: { userId: validation.data.userId, error: userError } })
      return { data: null, error: { code: 'USER_DEACTIVATION_FAILED', message: 'Could not deactivate user' } }
    }

    logger.info('User deactivated successfully', { source: 'admin', data: { userId: validation.data.userId, deactivatedBy: session.id } })

    return { data: mapUserRow(userData as unknown as UserRow), error: null }
  } catch (err) {
    logger.error('Unexpected error deactivating user', { source: 'admin', data: { error: err } })
    return { data: null, error: { code: 'SERVER_ERROR', message: 'Failed to deactivate user' } }
  }
}
