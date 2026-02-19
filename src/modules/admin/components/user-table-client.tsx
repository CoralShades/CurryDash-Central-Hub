'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ErrorBoundary } from '@/components/shared'
import { UserTable } from './user-table'
import { UserFormModal } from './user-form-modal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { AdminUser } from '../actions/manage-users'
import { createUser, updateUser, deactivateUser } from '../actions/manage-users'
import type { Role } from '@/types/roles'

interface UserTableClientProps {
  initialUsers: AdminUser[]
}

export function UserTableClient({ initialUsers }: UserTableClientProps) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [userToDeactivate, setUserToDeactivate] = useState<AdminUser | null>(null)

  const handleAddClick = () => {
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (user: AdminUser) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDeactivateClick = (user: AdminUser) => {
    setUserToDeactivate(user)
  }

  const handleDeactivate = async (user: AdminUser) => {
    setIsLoading(true)
    const result = await deactivateUser({ userId: user.id })
    setIsLoading(false)

    if (result.error) {
      toast.error(`Failed to deactivate user: ${result.error.message}`)
      return
    }

    if (result.data) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === result.data!.id ? result.data! : u
        )
      )
      toast.success(`${result.data.email} has been deactivated`)
    }
  }

  const handleFormSubmit = async (data: { email: string; role: Role }) => {
    setIsLoading(true)

    try {
      if (selectedUser) {
        // Update mode
        const result = await updateUser({
          userId: selectedUser.id,
          role: data.role,
        })

        setIsLoading(false)

        if (result.error) {
          throw new Error(result.error.message)
        }

        if (result.data) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === result.data!.id ? result.data! : u
            )
          )
          toast.success(`${result.data.email} role updated successfully`)
          setIsModalOpen(false)
        }
      } else {
        // Create mode
        const result = await createUser({
          email: data.email,
          role: data.role,
        })

        setIsLoading(false)

        if (result.error) {
          throw new Error(result.error.message)
        }

        if (result.data) {
          setUsers((prev) => [result.data!, ...prev])
          toast.success(`${result.data.email} created successfully`)
          setIsModalOpen(false)
        }
      }
    } catch (err) {
      setIsLoading(false)
      toast.error(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <ErrorBoundary>
      <div>
        <UserTable
          users={users}
          isLoading={isLoading}
          onAddClick={handleAddClick}
          onEditClick={handleEditClick}
          onDeactivateClick={handleDeactivateClick}
        />

        <UserFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          user={selectedUser}
          isLoading={isLoading}
        />

        <AlertDialog
          open={Boolean(userToDeactivate)}
          onOpenChange={(open) => {
            if (!open) setUserToDeactivate(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to deactivate{' '}
                <strong>{userToDeactivate?.email}</strong>? They will no longer
                be able to access the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserToDeactivate(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-chili text-white hover:bg-chili/90"
                onClick={() => {
                  if (userToDeactivate) {
                    handleDeactivate(userToDeactivate)
                    setUserToDeactivate(null)
                  }
                }}
              >
                Deactivate
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ErrorBoundary>
  )
}
