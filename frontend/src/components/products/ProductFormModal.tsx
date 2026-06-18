import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useCreateProduct, useUpdateProduct } from '../../hooks/useProducts'
import type { Product } from '../../types'
import { Button, Input, Modal } from '../ui'
import { useToast } from '../ui/Toast'

const productSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required'),
  sku: z.string().trim().min(1, 'SKU is required'),
  price: z.coerce.number().gt(0, 'Price must be greater than 0'),
  quantity_in_stock: z.coerce
    .number()
    .int('Quantity must be a whole number')
    .min(0, 'Quantity cannot be negative'),
})

type ProductFormInput = z.input<typeof productSchema>
type ProductFormValues = z.output<typeof productSchema>

type ProductFormModalProps = {
  onClose: () => void
  open: boolean
  product?: Product
}

function getDefaultValues(product?: Product): ProductFormInput {
  return {
    name: product?.name ?? '',
    price: product ? Number.parseFloat(product.price) : '',
    quantity_in_stock: product?.quantity_in_stock ?? '',
    sku: product?.sku ?? '',
  }
}

export function ProductFormModal({ onClose, open, product }: ProductFormModalProps) {
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const toast = useToast()
  const isEditMode = Boolean(product)
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<ProductFormInput, undefined, ProductFormValues>({
    defaultValues: getDefaultValues(product),
    resolver: zodResolver(productSchema),
  })

  useEffect(() => {
    if (open) {
      reset(getDefaultValues(product))
    }
  }, [open, product, reset])

  async function onSubmit(values: ProductFormValues) {
    const payload = {
      name: values.name.trim(),
      price: values.price.toFixed(2),
      quantity_in_stock: values.quantity_in_stock,
      sku: values.sku.trim(),
    }

    try {
      if (product) {
        await updateProduct.mutateAsync({ data: payload, id: product.id })
      } else {
        await createProduct.mutateAsync(payload)
      }

      toast.success(product ? 'Product updated' : 'Product created')
      onClose()
      reset(getDefaultValues())
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setError('sku', { message: error.message, type: 'manual' })
        return
      }

      setError('root', {
        message: error instanceof Error ? error.message : 'Unable to save product.',
        type: 'server',
      })
    }
  }

  const isPending = createProduct.isPending || updateProduct.isPending

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!isPending) {
          onClose()
        }
      }}
      title={isEditMode ? 'Edit Product' : 'New Product'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" form="product-form" disabled={isPending}>
            {isPending ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Product'}
          </Button>
        </>
      }
    >
      <form id="product-form" className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Product Name"
          error={errors.name?.message}
          placeholder="Ergonomic Office Chair"
          {...register('name')}
        />

        <Input
          label="SKU"
          error={errors.sku?.message}
          placeholder="FUR-CHR-ERG"
          {...register('sku')}
        />

        <div className="space-y-1.5">
          <label
            htmlFor="product-price"
            className="font-display text-label-caps uppercase tracking-wide text-on-surface-variant"
          >
            Price
          </label>
          <div
            className={`flex h-row-height items-center rounded border bg-surface-container-lowest focus-within:border-primary ${
              errors.price?.message ? 'border-error' : 'border-outline-variant'
            }`}
          >
            <span className="px-3 font-mono text-body-md text-on-surface-variant">\u20B9</span>
            <input
              id="product-price"
              type="number"
              step="0.01"
              min="0"
              className="h-full w-full bg-transparent pr-3 font-body text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/60"
              placeholder="499.00"
              {...register('price')}
            />
          </div>
          {errors.price?.message ? (
            <p className="font-body text-body-sm text-error">{errors.price.message}</p>
          ) : null}
        </div>

        <Input
          label={isEditMode ? 'Quantity in Stock' : 'Initial Stock'}
          error={errors.quantity_in_stock?.message}
          type="number"
          min="0"
          step="1"
          {...register('quantity_in_stock')}
        />

        {errors.root?.message ? (
          <div className="rounded border border-error/40 bg-error/10 px-3 py-2 font-body text-body-sm text-error">
            {errors.root.message}
          </div>
        ) : null}
      </form>
    </Modal>
  )
}
