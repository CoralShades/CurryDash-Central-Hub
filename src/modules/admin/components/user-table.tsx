'use client'

import { useState, useMemo } from 'react'
import { WidgetSkeleton } from '@/components/shared'
import type { AdminUser } from '../actions/manage-users'
import { ROLES } from '@/types/roles'
import type { Role } from '@/types/roles'

type SortKey = 'name' | 'email' | 'role' | 'status' | 'created'
type SortDirection = 'asc' | 'desc'

interface UserTableProps {
  users: AdminUser[]
  isLoading?: boolean
  onAddClick: () => void
  onEditClick: (user: AdminUser) => void
  onDeactivateClick: (user: AdminUser) => void
}

export function UserTable({
  users,
  isLoading = false,
  onAddClick,
  onEditClick,
  onDeactivateClick,
}: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('created')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [pageSize, setPageSize] = useState(10)
  const [pageIndex, setPageIndex] = useState(0)

  // Filter and sort
  const filteredAndSorted = useMemo(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        (user.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = roleFilter === 'all' || user.roleName === roleFilter

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? user.isActive : !user.isActive)

      return matchesSearch && matchesRole && matchesStatus
    })

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number = ''
      let bVal: string | number = ''

      switch (sortKey) {
        case 'name':
          aVal = a.fullName || ''
          bVal = b.fullName || ''
          break
        case 'email':
          aVal = a.email
          bVal = b.email
          break
        case 'role':
          aVal = a.roleName || ''
          bVal = b.roleName || ''
          break
        case 'status':
          aVal = a.isActive ? 'active' : 'inactive'
          bVal = b.isActive ? 'active' : 'inactive'
          break
        case 'created':
          aVal = new Date(a.createdAt).getTime()
          bVal = new Date(b.createdAt).getTime()
          break
      }

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [users, searchTerm, roleFilter, statusFilter, sortKey, sortDirection])

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize)
  const paginatedUsers = filteredAndSorted.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  )

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return <span style={{ opacity: 0.3 }}>↕</span>
    }
    return <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
  }

  if (isLoading) {
    return <WidgetSkeleton variant="table" />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setPageIndex(0)
          }}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '8px 12px',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value as Role | 'all')
            setPageIndex(0)
          }}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        >
          <option value="all">All Roles</option>
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')
            setPageIndex(0)
          }}
          style={{
            padding: '8px 12px',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          onClick={onAddClick}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--color-turmeric)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          + Add User
        </button>
      </div>

      {/* Empty State */}
      {filteredAndSorted.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            backgroundColor: 'var(--color-cream)',
            borderRadius: '8px',
          }}
        >
          <p style={{ margin: 0, marginBottom: '16px', color: '#666' }}>
            No team members yet.
          </p>
          <button
            onClick={onAddClick}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--color-turmeric)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Add User
          </button>
        </div>
      ) : (
        <>
          {/* Table */}
          <div
            style={{
              overflowX: 'auto',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: '#f9fafb',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <th
                    onClick={() => handleSort('name')}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    Name <SortIcon column="name" />
                  </th>
                  <th
                    onClick={() => handleSort('email')}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    Email <SortIcon column="email" />
                  </th>
                  <th
                    onClick={() => handleSort('role')}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    Role <SortIcon column="role" />
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    Status <SortIcon column="status" />
                  </th>
                  <th
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-cream)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      {user.fullName || '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {user.roleName ? (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            backgroundColor:
                              user.roleName === 'admin'
                                ? '#FEE2E2'
                                : user.roleName === 'developer'
                                  ? '#ECFDF5'
                                  : user.roleName === 'qa'
                                    ? '#FEF3C7'
                                    : '#F5F3FF',
                            color:
                              user.roleName === 'admin'
                                ? 'var(--color-chili)'
                                : user.roleName === 'developer'
                                  ? 'var(--color-coriander)'
                                  : user.roleName === 'qa'
                                    ? '#92400E'
                                    : '#6B21A8',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                        >
                          {user.roleName.charAt(0).toUpperCase() + user.roleName.slice(1)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          backgroundColor: user.isActive ? '#ECFDF5' : '#F3F4F6',
                          color: user.isActive ? 'var(--color-coriander)' : '#6B7280',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 500,
                        }}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => onEditClick(user)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--color-border)',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: 500,
                          }}
                        >
                          Edit
                        </button>
                        {user.isActive && (
                          <button
                            onClick={() => onDeactivateClick(user)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#FEE2E2',
                              color: 'var(--color-chili)',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: 500,
                            }}
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
            }}
          >
            <div style={{ fontSize: '13px', color: '#666' }}>
              Showing {paginatedUsers.length > 0 ? pageIndex * pageSize + 1 : 0} to{' '}
              {Math.min((pageIndex + 1) * pageSize, filteredAndSorted.length)} of{' '}
              {filteredAndSorted.length}
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPageIndex(0)
                }}
                style={{
                  padding: '6px 8px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  fontSize: '13px',
                }}
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>

              <button
                onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                disabled={pageIndex === 0}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  fontSize: '13px',
                  cursor: pageIndex === 0 ? 'not-allowed' : 'pointer',
                  opacity: pageIndex === 0 ? 0.5 : 1,
                }}
              >
                ← Previous
              </button>

              <span style={{ fontSize: '13px', minWidth: '60px', textAlign: 'center' }}>
                Page {pageIndex + 1} of {Math.max(1, totalPages)}
              </span>

              <button
                onClick={() => setPageIndex(Math.min(totalPages - 1, pageIndex + 1))}
                disabled={pageIndex >= totalPages - 1}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  fontSize: '13px',
                  cursor: pageIndex >= totalPages - 1 ? 'not-allowed' : 'pointer',
                  opacity: pageIndex >= totalPages - 1 ? 0.5 : 1,
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
