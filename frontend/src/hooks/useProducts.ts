import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
  type CreateProductInput,
  type UpdateProductInput,
} from '../api/products'

export function useProductsList(skip: number, limit: number) {
  return useQuery({
    queryFn: () => listProducts(skip, limit),
    queryKey: ['products', skip, limit],
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProductInput) => createProduct(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data, id }: { id: number; data: UpdateProductInput }) => updateProduct(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
