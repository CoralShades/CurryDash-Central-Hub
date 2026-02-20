'use client'

import { useState } from 'react'
import { ROLES } from '@/types/roles'
import type { Role } from '@/types/roles'
import type { AdminUser } from '../actions/manage-users'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { email: string; role: Role }) => Promise<void>
  user?: AdminUser | null
  isLoading?: boolean
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  isLoading = false,
}: UserFormModalProps) {
  const [email, setEmail] = useState(user?.email || '')
  const [role, setRole] = useState<Role>(user?.roleName || 'developer')
  const [error, setError] = useState<string | null>(null)

  const isEditMode = Boolean(user)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!role) {
      setError('Role is required')
      return
    }

    try {
      await onSubmit({ email: email.trim(), role })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleClose = () => {
    setEmail(user?.email || '')
    setRole(user?.roleName || 'developer')
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the role for this user.'
              : 'Invite a new team member by entering their email and assigning a role.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isEditMode}
              placeholder="user@example.com"
              className={isEditMode ? 'opacity-60 cursor-not-allowed' : ''}
            />
          </div>

          {/* Role Dropdown */}
          <div className="space-y-1.5">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as Role)}>
              <SelectTrigger id="role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="px-3 py-2 bg-destructive/10 text-chili rounded-md text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
