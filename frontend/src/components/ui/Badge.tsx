import clsx from 'clsx'

type BadgeStatus = 'active' | 'cancelled' | 'in-stock' | 'low-stock' | 'out-of-stock'

type BadgeProps = {
  status: BadgeStatus
}

const badgeVariants: Record<BadgeStatus, string> = {
  active: 'border-success text-success bg-success/10',
  'in-stock': 'border-success text-success bg-success/10',
  'low-stock': 'border-tertiary text-tertiary bg-tertiary/10',
  cancelled: 'border-error text-error bg-error/10',
  'out-of-stock': 'border-error text-error bg-error/10',
}

export function Badge({ status }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex h-5 items-center rounded-full border px-2 font-display text-label-caps uppercase tracking-wide',
        badgeVariants[status],
      )}
    >
      {status.replace(/-/g, ' ')}
    </span>
  )
}
