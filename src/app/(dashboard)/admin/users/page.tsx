import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { UserTableClient } from '@/modules/admin/components/user-table-client'
import type { AdminUser } from '@/modules/admin/actions/manage-users'
import type { Role } from '@/types/roles'

export const metadata = {
  title: 'User Management | CurryDash Admin',
}

export default async function AdminUsersPage() {
  // Verify admin access
  await requireAuth('admin')

  let users: AdminUser[] = []
  let error: string | null = null

  try {
    const supabase = createAdminClient()

    // Fetch all users with their roles
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('id, email, full_name, role_id, is_active, created_at, updated_at, roles(name)')
      .order('created_at', { ascending: false })

    if (dbError) {
      logger.error('Failed to fetch users', {
        source: 'admin',
        data: { error: dbError },
      })
      error = 'Failed to load users'
    } else if (userData) {
      users = userData.map((row) => ({
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        roleId: row.role_id,
        roleName: (Array.isArray(row.roles) ? row.roles[0]?.name : (row.roles as { name: string } | null)?.name) as Role | null,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    }
  } catch (err) {
    logger.error('Unexpected error fetching users', {
      source: 'admin',
      data: { error: err },
    })
    error = 'An unexpected error occurred'
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          User Management
        </h1>
        <p className="text-muted-foreground text-sm">
          Manage team members, assign roles, and control access
        </p>
      </div>

      {error && (
        <div
          className="mb-4 px-4 py-3 bg-destructive/10 text-chili rounded-lg text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="bg-card rounded-lg border border-border p-5">
        <UserTableClient initialUsers={users} />
      </div>
    </div>
  )
}
