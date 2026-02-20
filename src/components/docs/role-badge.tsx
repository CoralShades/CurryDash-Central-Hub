import type { Role } from '@/types/roles'
import { cn } from '@/lib/utils'

interface RoleBadgeProps {
  role: Role
  className?: string
}

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  developer: 'Developer',
  qa: 'QA',
  stakeholder: 'Stakeholder',
}

const ROLE_STYLES: Record<Role, string> = {
  admin: 'bg-[var(--color-role-admin-bg)] text-[var(--color-role-admin)] border-[var(--color-role-admin)]',
  developer: 'bg-[var(--color-role-developer-bg)] text-[var(--color-role-developer)] border-[var(--color-role-developer)]',
  qa: 'bg-[var(--color-role-qa-bg)] text-[var(--color-role-qa)] border-[var(--color-role-qa)]',
  stakeholder: 'bg-[var(--color-role-stakeholder-bg)] text-[var(--color-role-stakeholder)] border-[var(--color-role-stakeholder)]',
}

/**
 * RoleBadge — inline role indicator pill using spice palette role colors.
 * Usage in MDX: <RoleBadge role="admin" />
 */
export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        ROLE_STYLES[role],
        className
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  )
}
