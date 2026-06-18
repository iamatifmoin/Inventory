import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  type CreateCustomerInput,
} from '../api/customers'

export function useCustomersList(skip: number, limit: number) {
  return useQuery({
    queryFn: () => listCustomers(skip, limit),
    queryKey: ['customers', skip, limit],
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCustomerInput) => createCustomer(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteCustomer(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
