import { Plus, Search, Trash2, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { CustomerFormModal } from '../components/customers/CustomerFormModal'
import { AppShell } from '../components/layout/AppShell'
import {
  Button,
  Input,
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableSkeleton,
} from '../components/ui'
import { useCustomersList, useDeleteCustomer } from '../hooks/useCustomers'
import { formatPageTitle } from '../lib/utils'
import type { Customer } from '../types'
import { useToast } from '../components/ui'

const PAGE_SIZE = 8

function OrdersChip({ count }: { count: number }) {
  if (count === 0) {
    return <span className="font-body text-body-md text-on-surface">0</span>
  }

  return (
    <span className="inline-flex h-5 items-center rounded-full border border-tertiary bg-tertiary/10 px-2 font-display text-label-caps uppercase tracking-wide text-tertiary">
      {count} orders
    </span>
  )
}

export function CustomersPage() {
  document.title = formatPageTitle('Customers')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [skip, setSkip] = useState(0)
  const { data, isLoading } = useCustomersList(skip, PAGE_SIZE)
  const deleteCustomer = useDeleteCustomer()
  const toast = useToast()
  const filteredItems = useMemo(() => {
    if (!data) {
      return []
    }

    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return data.items
    }

    return data.items.filter((customer) => {
      return (
        customer.full_name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query)
      )
    })
  }, [data, searchQuery])

  useEffect(() => {
    if (!data || isLoading) {
      return
    }

    if (data.items.length === 0 && skip > 0) {
      setSkip((currentSkip) => Math.max(0, currentSkip - PAGE_SIZE))
    }
  }, [data, isLoading, skip])

  const totalItems = data?.total ?? 0
  const currentPage = totalItems === 0 ? 1 : Math.floor(skip / PAGE_SIZE) + 1
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / PAGE_SIZE)
  const hasNextPage = skip + PAGE_SIZE < totalItems
  const hasPreviousPage = skip > 0
  const showEmptyState = !isLoading && totalItems === 0
  const showNoMatches = !isLoading && totalItems > 0 && filteredItems.length === 0

  async function handleDelete(customer: Customer) {
    const confirmed = window.confirm(`Delete ${customer.full_name}?`)

    if (!confirmed) {
      return
    }

    try {
      await deleteCustomer.mutateAsync(customer.id)
      toast.success('Customer deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete customer.')
    }
  }

  return (
    <AppShell
      title="Customers"
      actions={
        <Button icon={<Plus size={16} strokeWidth={1.8} />} onClick={() => setIsModalOpen(true)}>
          New Customer
        </Button>
      }
    >
      <div className="space-y-6">
        <section className="rounded-lg border border-outline-variant bg-surface-container-low">
          <div className="border-b border-outline-variant/40 p-4">
            <div className="max-w-sm">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name or email"
                aria-label="Search customers"
              />
            </div>
          </div>

          <div className="p-4">
            {isLoading ? (
              <TableSkeleton rows={8} columns={5} />
            ) : showEmptyState ? (
              <TableEmptyState
                icon={Users}
                title="No customers yet"
                description="Add your first customer"
                action={
                  <Button
                    icon={<Plus size={16} strokeWidth={1.8} />}
                    onClick={() => setIsModalOpen(true)}
                  >
                    New Customer
                  </Button>
                }
              />
            ) : showNoMatches ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center rounded border border-outline-variant/40 bg-surface-container-lowest px-6 py-12 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-low text-on-surface-variant">
                  <Search size={18} strokeWidth={1.8} />
                </div>
                <h2 className="mt-4 font-display text-headline-sm text-on-surface">
                  No matching customers
                </h2>
                <p className="mt-2 max-w-sm font-body text-body-md text-on-surface-variant">
                  This filter only searches the current page of loaded customers by name or email.
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHeaderCell>Full Name</TableHeaderCell>
                      <TableHeaderCell>Email</TableHeaderCell>
                      <TableHeaderCell>Phone</TableHeaderCell>
                      <TableHeaderCell>Orders</TableHeaderCell>
                      <TableHeaderCell className="w-[64px] text-right">Actions</TableHeaderCell>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((customer) => (
                      <TableRow key={customer.id} className="group">
                        <TableCell>{customer.full_name}</TableCell>
                        <TableCell mono>{customer.email}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>
                          <OrdersChip count={customer.order_count} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="compact"
                              className="h-8 w-8 px-0 text-error hover:bg-error/10 hover:text-error"
                              disabled={deleteCustomer.isPending}
                              onClick={() => void handleDelete(customer)}
                              aria-label={`Delete ${customer.full_name}`}
                              icon={<Trash2 size={14} strokeWidth={1.8} />}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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

      <CustomerFormModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </AppShell>
  )
}
