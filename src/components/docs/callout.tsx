import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Info, AlertTriangle, CheckCircle, StickyNote } from 'lucide-react'

type CalloutVariant = 'info' | 'warning' | 'success' | 'note'

interface CalloutProps {
  variant?: CalloutVariant
  title?: string
  children: ReactNode
  className?: string
}

const VARIANT_CONFIG: Record<
  CalloutVariant,
  { icon: typeof Info; containerClass: string; iconClass: string; titleClass: string }
> = {
  info: {
    icon: Info,
    containerClass: 'border-[var(--color-turmeric)] bg-[rgba(230,176,75,0.08)]',
    iconClass: 'text-[var(--color-turmeric)]',
    titleClass: 'text-[var(--color-turmeric-dark)]',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'border-[var(--color-chili)] bg-[rgba(197,53,31,0.06)]',
    iconClass: 'text-[var(--color-chili)]',
    titleClass: 'text-[var(--color-chili-dark)]',
  },
  success: {
    icon: CheckCircle,
    containerClass: 'border-[var(--color-coriander)] bg-[rgba(74,124,89,0.08)]',
    iconClass: 'text-[var(--color-coriander)]',
    titleClass: 'text-[var(--color-coriander-dark)]',
  },
  note: {
    icon: StickyNote,
    containerClass: 'border-[var(--color-cinnamon)] bg-[rgba(93,64,55,0.06)]',
    iconClass: 'text-[var(--color-cinnamon)]',
    titleClass: 'text-[var(--color-cinnamon-dark)]',
  },
}

/**
 * Callout — enhanced admonition component with spice palette variants.
 * Usage in MDX: <Callout variant="info" title="Quick Tip">content</Callout>
 */
export function Callout({ variant = 'info', title, children, className }: CalloutProps) {
  const config = VARIANT_CONFIG[variant]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'my-4 flex gap-3 rounded-lg border-l-4 p-4',
        config.containerClass,
        className
      )}
      role={variant === 'warning' ? 'alert' : 'note'}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', config.iconClass)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && (
          <p className={cn('mb-1 font-semibold text-sm', config.titleClass)}>
            {title}
          </p>
        )}
        <div className="text-sm text-[var(--color-text-secondary)] [&_p]:m-0 [&_p+p]:mt-2">
          {children}
        </div>
      </div>
    </div>
  )
}
