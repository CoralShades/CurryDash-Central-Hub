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
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 700 }}>
          User Management
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Manage team members, assign roles, and control access
        </p>
      </div>

      {error && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            backgroundColor: '#FEE2E2',
            color: 'var(--color-chili)',
            borderRadius: '8px',
            fontSize: '14px',
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid var(--color-border)',
          padding: '20px',
        }}
      >
        <UserTableClient initialUsers={users} />
      </div>
    </div>
  )
}
