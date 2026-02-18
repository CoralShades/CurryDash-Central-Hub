'use client'

import { useState } from 'react'
import { ErrorBoundary } from '@/components/shared'
import { UserTable } from './user-table'
import { UserFormModal } from './user-form-modal'
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAddClick = () => {
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  const handleEditClick = (user: AdminUser) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleDeactivateClick = (user: AdminUser) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${user.email}? They will no longer be able to access the system.`
    )
    if (!confirmed) return

    handleDeactivate(user)
  }

  const handleDeactivate = async (user: AdminUser) => {
    setIsLoading(true)
    const result = await deactivateUser({ userId: user.id })
    setIsLoading(false)

    if (result.error) {
      showToast(`Failed to deactivate user: ${result.error.message}`, 'error')
      return
    }

    if (result.data) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === result.data!.id ? result.data! : u
        )
      )
      showToast(`${result.data.email} has been deactivated`)
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
          showToast(`${result.data.email} role updated successfully`)
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
          showToast(`${result.data.email} created successfully`)
          setIsModalOpen(false)
        }
      }
    } catch (err) {
      setIsLoading(false)
      showToast(
        err instanceof Error ? err.message : 'An error occurred',
        'error'
      )
    }
  }

  return (
    <ErrorBoundary>
      <div>
        {toast && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '12px 16px',
              backgroundColor: toast.type === 'success' ? '#ECFDF5' : '#FEE2E2',
              color: toast.type === 'success' ? 'var(--color-coriander)' : 'var(--color-chili)',
              borderRadius: '6px',
              fontSize: '14px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 100,
            }}
          >
            {toast.message}
          </div>
        )}

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
      </div>
    </ErrorBoundary>
  )
}
