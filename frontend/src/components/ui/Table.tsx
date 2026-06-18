import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'

export const Table = forwardRef<HTMLTableElement, ComponentPropsWithoutRef<'table'>>(function Table(
  { className, ...props },
  ref,
) {
  return (
    <div className="overflow-hidden rounded border border-outline-variant/40 bg-surface-container-lowest">
      <div className="overflow-x-auto">
        <table ref={ref} className={clsx('min-w-full border-collapse', className)} {...props} />
      </div>
    </div>
  )
})

export const TableHeader = forwardRef<
  HTMLTableSectionElement,
  ComponentPropsWithoutRef<'thead'>
>(function TableHeader({ className, ...props }, ref) {
  return <thead ref={ref} className={clsx('bg-transparent', className)} {...props} />
})

export const TableBody = forwardRef<HTMLTableSectionElement, ComponentPropsWithoutRef<'tbody'>>(
  function TableBody({ className, ...props }, ref) {
    return <tbody ref={ref} className={className} {...props} />
  },
)

export const TableRow = forwardRef<HTMLTableRowElement, ComponentPropsWithoutRef<'tr'>>(
  function TableRow({ className, ...props }, ref) {
    return (
      <tr
        ref={ref}
        className={clsx(
          'border-b border-outline-variant/40 transition-colors hover:bg-surface-container-low',
          className,
        )}
        {...props}
      />
    )
  },
)

export const TableHeaderCell = forwardRef<HTMLTableCellElement, ComponentPropsWithoutRef<'th'>>(
  function TableHeaderCell({ className, ...props }, ref) {
    return (
      <th
        ref={ref}
        className={clsx(
          'border-b border-outline-variant px-3 py-3 text-left font-display text-label-caps uppercase tracking-wide text-on-surface-variant',
          className,
        )}
        {...props}
      />
    )
  },
)

type TableCellProps = ComponentPropsWithoutRef<'td'> & {
  mono?: boolean
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { className, mono = false, ...props },
  ref,
) {
  return (
    <td
      ref={ref}
      className={clsx(
        'px-3 py-3 font-body text-body-md text-on-surface',
        mono && 'font-mono text-data-mono',
        className,
      )}
      {...props}
    />
  )
})

type TableSkeletonProps = {
  columns: number
  rows: number
}

export function TableSkeleton({ columns, rows }: TableSkeletonProps) {
  return (
    <Table aria-label="Loading table">
      <TableHeader>
        <tr>
          {Array.from({ length: columns }, (_, index) => (
            <TableHeaderCell key={`header-${index}`}>
              <div className="h-4 w-20 animate-pulse rounded bg-surface-container-high" />
            </TableHeaderCell>
          ))}
        </tr>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <TableRow key={`row-${rowIndex}`}>
            {Array.from({ length: columns }, (_, columnIndex) => (
              <TableCell key={`cell-${rowIndex}-${columnIndex}`}>
                <div className="h-4 animate-pulse rounded bg-surface-container-high" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

type TableEmptyStateProps = {
  action?: ReactNode
  description: string
  icon: LucideIcon
  title: string
}

export function TableEmptyState({
  action,
  description,
  icon: Icon,
  title,
}: TableEmptyStateProps) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded border border-outline-variant/40 bg-surface-container-lowest px-6 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-low text-on-surface-variant">
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <div className="mt-4 space-y-2">
        <h3 className="font-display text-headline-sm text-on-surface">{title}</h3>
        <p className="max-w-sm font-body text-body-md text-on-surface-variant">{description}</p>
      </div>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
