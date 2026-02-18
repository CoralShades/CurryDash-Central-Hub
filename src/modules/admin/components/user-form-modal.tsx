'use client'

import { useState } from 'react'
import { ROLES } from '@/types/roles'
import type { Role } from '@/types/roles'
import type { AdminUser } from '../actions/manage-users'

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

  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          width: '90%',
          maxWidth: '400px',
          zIndex: 51,
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
          {isEditMode ? 'Edit User' : 'Add User'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isEditMode}
              placeholder="user@example.com"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                fontSize: '14px',
                opacity: isEditMode ? 0.6 : 1,
                cursor: isEditMode ? 'not-allowed' : 'text',
              }}
            />
          </div>

          {/* Role Dropdown */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="role"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginBottom: '16px',
                padding: '8px 12px',
                backgroundColor: '#FEE2E2',
                color: 'var(--color-chili)',
                borderRadius: '6px',
                fontSize: '13px',
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--color-turmeric)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? 'Creating...' : isEditMode ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
