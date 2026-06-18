import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { cancelOrder, createOrder, listOrders, type CreateOrderInput } from '../api/orders'
import type { Order } from '../types'

export function useOrdersList(skip: number, limit: number, status?: Order['status']) {
  return useQuery({
    queryFn: () => listOrders(skip, limit, status),
    queryKey: ['orders', skip, limit, status],
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateOrderInput) => createOrder(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => cancelOrder(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
