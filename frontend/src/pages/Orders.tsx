import clsx from 'clsx'
import { Plus, ShoppingCart, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { CreateOrderModal } from '../components/orders/CreateOrderModal'
import { AppShell } from '../components/layout/AppShell'
import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableSkeleton,
} from '../components/ui'
import { useCancelOrder, useOrdersList } from '../hooks/useOrders'
import { formatCurrency, formatDate, formatOrderId } from '../lib/format'
import { formatPageTitle } from '../lib/utils'
import type { Order } from '../types'
import { useToast } from '../components/ui'

const PAGE_SIZE = 8

type OrderStatusFilter = 'all' | 'active' | 'cancelled'

function StatusFilter({
  onChange,
  value,
}: {
  onChange: (status: OrderStatusFilter) => void
  value: OrderStatusFilter
}) {
  const options: OrderStatusFilter[] = ['all', 'active', 'cancelled']

  return (
    <div className="inline-flex rounded border border-outline-variant bg-surface-container-low p-1">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={clsx(
            'rounded px-3 py-1.5 font-display text-label-caps uppercase tracking-wide transition-colors',
            value === option
              ? 'bg-surface-container-high text-on-surface'
              : 'text-on-surface-variant hover:text-on-surface',
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

export function OrdersPage() {
  document.title = formatPageTitle('Orders')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [skip, setSkip] = useState(0)
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('all')
  const apiStatus = statusFilter === 'all' ? undefined : statusFilter
  const { data, isLoading } = useOrdersList(skip, PAGE_SIZE, apiStatus)
  const cancelOrder = useCancelOrder()
  const toast = useToast()

  useEffect(() => {
    setSkip(0)
  }, [statusFilter])

  useEffect(() => {
    if (!data || isLoading) {
      return
    }

    if (data.items.length === 0 && skip > 0) {
      setSkip((currentSkip) => Math.max(0, currentSkip - PAGE_SIZE))
    }
  }, [data, isLoading, skip])

  const orders = useMemo(() => data?.items ?? [], [data?.items])
  const totalItems = data?.total ?? 0
  const currentPage = totalItems === 0 ? 1 : Math.floor(skip / PAGE_SIZE) + 1
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / PAGE_SIZE)
  const hasNextPage = skip + PAGE_SIZE < totalItems
  const hasPreviousPage = skip > 0
  const showEmptyState = !isLoading && totalItems === 0

  async function handleCancel(order: Order) {
    const confirmed = window.confirm(
      `Cancel this order? This will restore ${order.quantity} units to stock.`,
    )

    if (!confirmed) {
      return
    }

    try {
      await cancelOrder.mutateAsync(order.id)
      toast.success('Order cancelled')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to cancel order.')
    }
  }

  return (
    <AppShell
      title="Orders"
      actions={
        <Button icon={<Plus size={16} strokeWidth={1.8} />} onClick={() => setIsModalOpen(true)}>
          New Order
        </Button>
      }
    >
      <div className="space-y-6">
        <section className="rounded-lg border border-outline-variant bg-surface-container-low">
          <div className="border-b border-outline-variant/40 p-4">
            <StatusFilter value={statusFilter} onChange={setStatusFilter} />
          </div>

          <div className="p-4">
            {isLoading ? (
              <TableSkeleton rows={8} columns={8} />
            ) : showEmptyState ? (
              <TableEmptyState
                icon={ShoppingCart}
                title="No orders yet"
                description="Create your first order"
                action={
                  <Button
                    icon={<Plus size={16} strokeWidth={1.8} />}
                    onClick={() => setIsModalOpen(true)}
                  >
                    New Order
                  </Button>
                }
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHeaderCell>Order ID</TableHeaderCell>
                      <TableHeaderCell>Customer</TableHeaderCell>
                      <TableHeaderCell>Product</TableHeaderCell>
                      <TableHeaderCell>Qty</TableHeaderCell>
                      <TableHeaderCell>Total</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Date</TableHeaderCell>
                      <TableHeaderCell className="w-[64px] text-right">Actions</TableHeaderCell>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const isCancelled = order.status === 'cancelled'
                      const cancelledClass = isCancelled
                        ? 'text-on-surface-variant line-through'
                        : undefined

                      return (
                        <TableRow key={order.id} className="group">
                          <TableCell mono>{formatOrderId(order.id)}</TableCell>
                          <TableCell className={cancelledClass}>{order.customer_name}</TableCell>
                          <TableCell className={cancelledClass}>{order.product_name}</TableCell>
                          <TableCell mono className={cancelledClass}>
                            {order.quantity}
                          </TableCell>
                          <TableCell mono className={cancelledClass}>
                            {formatCurrency(order.total_amount)}
                          </TableCell>
                          <TableCell>
                            <Badge status={order.status} />
                          </TableCell>
                          <TableCell mono>{formatDate(order.created_at)}</TableCell>
                          <TableCell className="text-right">
                            {order.status === 'active' ? (
                              <div className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
                                <Button
                                  variant="ghost"
                                  size="compact"
                                  className="h-8 w-8 px-0 text-error hover:bg-error/10 hover:text-error"
                                  disabled={cancelOrder.isPending}
                                  onClick={() => void handleCancel(order)}
                                  aria-label={`Cancel order ${formatOrderId(order.id)}`}
                                  icon={<XCircle size={14} strokeWidth={1.8} />}
                                />
                              </div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <p className="font-body text-body-sm text-on-surface-variant">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="compact"
                      onClick={() => setSkip((currentSkip) => Math.max(0, currentSkip - PAGE_SIZE))}
                      disabled={!hasPreviousPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="compact"
                      onClick={() => setSkip((currentSkip) => currentSkip + PAGE_SIZE)}
                      disabled={!hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <CreateOrderModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </AppShell>
  )
}
