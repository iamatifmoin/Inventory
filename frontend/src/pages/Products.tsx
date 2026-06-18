import clsx from 'clsx'
import { Package, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { ProductFormModal } from '../components/products/ProductFormModal'
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
import { useDeleteProduct, useProductsList } from '../hooks/useProducts'
import { formatCurrency, formatDate } from '../lib/format'
import { formatPageTitle } from '../lib/utils'
import type { Product } from '../types'
import { useToast } from '../components/ui'

const PAGE_SIZE = 8

function getStockBadgeStatus(quantity: number): 'in-stock' | 'low-stock' | 'out-of-stock' {
  if (quantity === 0) {
    return 'out-of-stock'
  }

  if (quantity < 10) {
    return 'low-stock'
  }

  return 'in-stock'
}

function getStockTextClass(quantity: number): string {
  const status = getStockBadgeStatus(quantity)

  if (status === 'out-of-stock') {
    return 'text-error'
  }

  if (status === 'low-stock') {
    return 'text-tertiary'
  }

  return 'text-on-surface'
}

export function ProductsPage() {
  document.title = formatPageTitle('Products')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>()
  const [skip, setSkip] = useState(0)
  const { data, isLoading } = useProductsList(skip, PAGE_SIZE)
  const deleteProduct = useDeleteProduct()
  const toast = useToast()
  const filteredItems = useMemo(() => {
    if (!data) {
      return []
    }

    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return data.items
    }

    return data.items.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query)
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

  function openCreateModal() {
    setSelectedProduct(undefined)
    setIsModalOpen(true)
  }

  function openEditModal(product: Product) {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
    setSelectedProduct(undefined)
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(`Delete ${product.name}?`)

    if (!confirmed) {
      return
    }

    try {
      await deleteProduct.mutateAsync(product.id)
      toast.success('Product deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete product.')
    }
  }

  return (
    <AppShell
      title="Products"
      actions={
        <Button
          icon={<Plus size={16} strokeWidth={1.8} />}
          iconOnlyMobile
          aria-label="New product"
          onClick={openCreateModal}
        >
          New Product
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
                placeholder="Search by name or SKU"
                aria-label="Search products"
              />
            </div>
          </div>

          <div className="p-4">
            {isLoading ? (
              <TableSkeleton rows={8} columns={6} />
            ) : showEmptyState ? (
              <TableEmptyState
                icon={Package}
                title="No products yet"
                description="Add your first product to get started"
                action={
                  <Button icon={<Plus size={16} strokeWidth={1.8} />} onClick={openCreateModal}>
                    New Product
                  </Button>
                }
              />
            ) : showNoMatches ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center rounded border border-outline-variant/40 bg-surface-container-lowest px-6 py-12 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-low text-on-surface-variant">
                  <Search size={18} strokeWidth={1.8} />
                </div>
                <h2 className="mt-4 font-display text-headline-sm text-on-surface">
                  No matching products
                </h2>
                <p className="mt-2 max-w-sm font-body text-body-md text-on-surface-variant">
                  This filter only searches the current page of loaded products by name or SKU.
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHeaderCell>Name</TableHeaderCell>
                      <TableHeaderCell>SKU</TableHeaderCell>
                      <TableHeaderCell>Price</TableHeaderCell>
                      <TableHeaderCell>Stock</TableHeaderCell>
                      <TableHeaderCell>Updated</TableHeaderCell>
                      <TableHeaderCell className="w-[96px] text-right">Actions</TableHeaderCell>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((product) => (
                      <TableRow key={product.id} className="group">
                        <TableCell>{product.name}</TableCell>
                        <TableCell mono>{product.sku}</TableCell>
                        <TableCell mono>{formatCurrency(product.price)}</TableCell>
                        <TableCell mono className={clsx(getStockTextClass(product.quantity_in_stock))}>
                          {product.quantity_in_stock}
                        </TableCell>
                        <TableCell mono>{formatDate(product.updated_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="compact"
                              className="h-8 w-8 px-0"
                              disabled={deleteProduct.isPending}
                              onClick={() => openEditModal(product)}
                              aria-label={`Edit ${product.name}`}
                              icon={<Pencil size={14} strokeWidth={1.8} />}
                            />
                            <Button
                              variant="ghost"
                              size="compact"
                              className="h-8 w-8 px-0 text-error hover:bg-error/10 hover:text-error"
                              disabled={deleteProduct.isPending}
                              onClick={() => void handleDelete(product)}
                              aria-label={`Delete ${product.name}`}
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

      <ProductFormModal open={isModalOpen} onClose={closeModal} product={selectedProduct} />
    </AppShell>
  )
}
