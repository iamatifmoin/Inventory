import axios from 'axios'
import { Check, ChevronDown, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useCustomersList } from '../../hooks/useCustomers'
import { useCreateOrder } from '../../hooks/useOrders'
import { useProductsList } from '../../hooks/useProducts'
import { formatCurrency } from '../../lib/format'
import type { Customer, Product } from '../../types'
import { Button, Input, Modal } from '../ui'
import { useToast } from '../ui/Toast'

const LOOKUP_LIMIT = 100

type CreateOrderModalProps = {
  onClose: () => void
  open: boolean
}

type OrderFormValues = {
  quantity: string
}

function ComboBoxField<TItem>({
  emptyText,
  getKey,
  getLabel,
  getSecondaryText,
  inputPlaceholder,
  items,
  onChangeQuery,
  onClear,
  disabled = false,
  onSelect,
  open,
  query,
  selectedItem,
}: {
  emptyText: string
  getKey: (item: TItem) => number
  getLabel: (item: TItem) => string
  getSecondaryText?: (item: TItem) => string
  inputPlaceholder: string
  items: TItem[]
  onChangeQuery: (value: string) => void
  onClear: () => void
  disabled?: boolean
  onSelect: (item: TItem) => void
  open: boolean
  query: string
  selectedItem: TItem | null
}) {
  return (
    <div className="relative">
      <div className="relative">
        <Input
          disabled={disabled}
          value={selectedItem ? getLabel(selectedItem) : query}
          onChange={(event) => onChangeQuery(event.target.value)}
          placeholder={inputPlaceholder}
          className="pr-20"
        />
        {selectedItem ? (
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-on-surface"
            aria-label="Clear selection"
          >
            <X size={14} strokeWidth={1.8} />
          </button>
        ) : null}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
          <ChevronDown size={16} strokeWidth={1.8} />
        </span>
      </div>

      {open ? (
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded border border-outline-variant bg-surface-container shadow-2xl shadow-black/40">
          {items.length > 0 ? (
            items.map((item) => {
              const isSelected = selectedItem ? getKey(selectedItem) === getKey(item) : false

              return (
                <button
                  key={getKey(item)}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelect(item)}
                  className="flex w-full items-center justify-between gap-3 border-b border-outline-variant/20 px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-container-high"
                >
                  <div>
                    <p className="font-body text-body-md text-on-surface">{getLabel(item)}</p>
                    {getSecondaryText ? (
                      <p className="mt-1 font-body text-body-sm text-on-surface-variant">
                        {getSecondaryText(item)}
                      </p>
                    ) : null}
                  </div>
                  {isSelected ? (
                    <Check size={14} strokeWidth={1.8} className="shrink-0 text-primary" />
                  ) : null}
                </button>
              )
            })
          ) : (
            <div className="px-3 py-4 font-body text-body-sm text-on-surface-variant">
              {emptyText}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

function getFilteredCustomers(customers: Customer[], query: string): Customer[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return customers
  }

  return customers.filter((customer) => customer.full_name.toLowerCase().includes(normalizedQuery))
}

function getFilteredProducts(products: Product[], query: string): Product[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return products
  }

  return products.filter((product) => {
    return (
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.sku.toLowerCase().includes(normalizedQuery)
    )
  })
}

export function CreateOrderModal({ onClose, open }: CreateOrderModalProps) {
  const createOrder = useCreateOrder()
  const toast = useToast()
  const customersQuery = useCustomersList(0, LOOKUP_LIMIT)
  const productsQuery = useProductsList(0, LOOKUP_LIMIT)
  const [customerQuery, setCustomerQuery] = useState('')
  const [productQuery, setProductQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [formError, setFormError] = useState('')
  const { register, reset, watch } = useForm<OrderFormValues>({
    defaultValues: { quantity: '' },
  })

  const quantityInput = watch('quantity')
  const quantity = Number.parseInt(quantityInput || '0', 10)
  const customerItems = useMemo(() => {
    return getFilteredCustomers(customersQuery.data?.items ?? [], customerQuery)
  }, [customerQuery, customersQuery.data?.items])
  const productItems = useMemo(() => {
    return getFilteredProducts(productsQuery.data?.items ?? [], productQuery)
  }, [productQuery, productsQuery.data?.items])
  const availableStock = selectedProduct?.quantity_in_stock ?? 0
  const hasQuantityValue = Number.isFinite(quantity) && quantity > 0
  const hasInsufficientStock = Boolean(selectedProduct && hasQuantityValue && quantity > availableStock)
  const unitPrice = selectedProduct?.price ?? null
  const showSummary = Boolean(selectedProduct && hasQuantityValue && !hasInsufficientStock)
  const customerDropdownOpen = open && !selectedCustomer && customerQuery.trim().length > 0
  const productDropdownOpen = open && !selectedProduct && productQuery.trim().length > 0

  useEffect(() => {
    if (open) {
      reset({ quantity: '' })
      setCustomerQuery('')
      setProductQuery('')
      setSelectedCustomer(null)
      setSelectedProduct(null)
      setFormError('')
    }
  }, [open, reset])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedCustomer || !selectedProduct || !hasQuantityValue || hasInsufficientStock) {
      return
    }

    setFormError('')

    try {
      await createOrder.mutateAsync({
        customer_id: selectedCustomer.id,
        product_id: selectedProduct.id,
        quantity,
      })

      toast.success('Order created')
      onClose()
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setFormError(error.message)
        return
      }

      setFormError(error instanceof Error ? error.message : 'Unable to create order.')
    }
  }

  const isPending = createOrder.isPending
  const disableSubmit =
    isPending || !selectedCustomer || !selectedProduct || !hasQuantityValue || hasInsufficientStock

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!isPending) {
          onClose()
        }
      }}
      title="Create Order"
      className="max-w-2xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="create-order-form" disabled={disableSubmit}>
            {isPending ? 'Creating...' : 'Create Order'}
          </Button>
        </>
      }
    >
      <form id="create-order-form" className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="font-display text-label-caps uppercase tracking-wide text-on-surface-variant">
            Customer
          </label>
          <ComboBoxField
            open={customerDropdownOpen}
            items={customerItems}
            query={customerQuery}
            selectedItem={selectedCustomer}
            onChangeQuery={(value) => {
              setCustomerQuery(value)
              setSelectedCustomer(null)
            }}
            disabled={isPending}
            onClear={() => {
              setSelectedCustomer(null)
              setCustomerQuery('')
            }}
            onSelect={(customer) => {
              setSelectedCustomer(customer)
              setCustomerQuery('')
            }}
            inputPlaceholder="Search customer ID or name..."
            getKey={(customer) => customer.id}
            getLabel={(customer) => customer.full_name}
            getSecondaryText={(customer) => customer.email}
            emptyText={customersQuery.isLoading ? 'Loading customers...' : 'No customers found'}
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-display text-label-caps uppercase tracking-wide text-on-surface-variant">
            Product
          </label>
          <ComboBoxField
            open={productDropdownOpen}
            items={productItems}
            query={productQuery}
            selectedItem={selectedProduct}
            onChangeQuery={(value) => {
              setProductQuery(value)
              setSelectedProduct(null)
            }}
            disabled={isPending}
            onClear={() => {
              setSelectedProduct(null)
              setProductQuery('')
            }}
            onSelect={(product) => {
              setSelectedProduct(product)
              setProductQuery('')
            }}
            inputPlaceholder="Search product name or SKU..."
            getKey={(product) => product.id}
            getLabel={(product) => product.name}
            getSecondaryText={(product) => `${product.sku} - ${product.quantity_in_stock} in stock`}
            emptyText={productsQuery.isLoading ? 'Loading products...' : 'No products found'}
          />
        </div>

        <Input
          label="Quantity"
          disabled={isPending}
          type="number"
          min="1"
          step="1"
          placeholder="1"
          {...register('quantity')}
        />
        {hasInsufficientStock ? (
          <p className="font-body text-body-sm text-error">Only {availableStock} in stock.</p>
        ) : null}

        {showSummary && unitPrice ? (
          <div className="rounded border border-outline-variant bg-surface-container-lowest px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <span className="font-body text-body-md text-on-surface-variant">
                Unit Price -&gt;
              </span>
              <span className="font-mono text-body-md text-on-surface">
                {formatCurrency(unitPrice)}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4 border-t border-outline-variant/40 pt-3">
              <span className="font-display text-label-caps uppercase tracking-wide text-on-surface-variant">
                Total
              </span>
              <span className="font-mono text-headline-sm text-on-surface">
                {formatCurrency((Number.parseFloat(unitPrice) * quantity).toFixed(2))}
              </span>
            </div>
          </div>
        ) : null}

        {formError ? (
          <div className="rounded border border-error/40 bg-error/10 px-3 py-2 font-body text-body-sm text-error">
            {formError}
          </div>
        ) : null}
      </form>
    </Modal>
  )
}
