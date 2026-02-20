'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { WidgetSkeleton } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
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

const ROLE_BADGE_STYLES: Record<string, string> = {
  admin: 'bg-chili/10 text-chili border-chili/20',
  developer: 'bg-coriander/10 text-coriander border-coriander/20',
  qa: 'bg-turmeric/10 text-turmeric border-turmeric/20',
  stakeholder: 'bg-cinnamon/10 text-cinnamon border-cinnamon/20',
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
      return <ArrowUpDown className="inline h-3 w-3 ml-1 opacity-30" />
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="inline h-3 w-3 ml-1" />
      : <ArrowDown className="inline h-3 w-3 ml-1" />
  }

  if (isLoading) {
    return <WidgetSkeleton variant="table" />
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex gap-3 items-center flex-wrap">
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setPageIndex(0)
          }}
          className="flex-1 min-w-[200px]"
        />

        <Select
          value={roleFilter}
          onValueChange={(value) => {
            setRoleFilter(value as Role | 'all')
            setPageIndex(0)
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value as 'all' | 'active' | 'inactive')
            setPageIndex(0)
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onAddClick} className="whitespace-nowrap">
          + Add User
        </Button>
      </div>

      {/* Empty State */}
      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-12 px-6 bg-muted/30 rounded-lg">
          <p className="mb-4 text-muted-foreground">
            No team members yet.
          </p>
          <Button onClick={onAddClick}>
            Add User
          </Button>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead
                    onClick={() => handleSort('name')}
                    className="cursor-pointer select-none font-semibold"
                  >
                    Name <SortIcon column="name" />
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort('email')}
                    className="cursor-pointer select-none font-semibold"
                  >
                    Email <SortIcon column="email" />
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort('role')}
                    className="cursor-pointer select-none font-semibold"
                  >
                    Role <SortIcon column="role" />
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort('status')}
                    className="cursor-pointer select-none font-semibold"
                  >
                    Status <SortIcon column="status" />
                  </TableHead>
                  <TableHead className="font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      {user.fullName || '—'}
                    </TableCell>
                    <TableCell>
                      {user.email}
                    </TableCell>
                    <TableCell>
                      {user.roleName ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs font-medium',
                            ROLE_BADGE_STYLES[user.roleName] ?? ''
                          )}
                        >
                          {user.roleName.charAt(0).toUpperCase() + user.roleName.slice(1)}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs font-medium',
                          user.isActive
                            ? 'bg-coriander/10 text-coriander border-coriander/20'
                            : 'bg-muted text-muted-foreground border-border'
                        )}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditClick(user)}
                        >
                          Edit
                        </Button>
                        {user.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeactivateClick(user)}
                            className="bg-destructive/10 text-chili border-chili/20 hover:bg-destructive/20"
                          >
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center py-3">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedUsers.length > 0 ? pageIndex * pageSize + 1 : 0} to{' '}
              {Math.min((pageIndex + 1) * pageSize, filteredAndSorted.length)} of{' '}
              {filteredAndSorted.length}
            </div>

            <div className="flex gap-2 items-center">
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setPageIndex(0)
                }}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                disabled={pageIndex === 0}
              >
                ← Previous
              </Button>

              <span className="text-sm min-w-[60px] text-center">
                Page {pageIndex + 1} of {Math.max(1, totalPages)}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(Math.min(totalPages - 1, pageIndex + 1))}
                disabled={pageIndex >= totalPages - 1}
              >
                Next →
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
