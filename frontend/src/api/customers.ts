import { apiClient } from './client'
import type { Customer, Page } from '../types'

export type CreateCustomerInput = Pick<Customer, 'full_name' | 'email' | 'phone'>

export async function listCustomers(skip: number, limit: number): Promise<Page<Customer>> {
  const response = await apiClient.get<Page<Customer>>('/customers', {
    params: { limit, skip },
  })

  return response.data
}

export async function createCustomer(data: CreateCustomerInput): Promise<Customer> {
  const response = await apiClient.post<Customer>('/customers', data)
  return response.data
}

export async function deleteCustomer(id: number): Promise<void> {
  await apiClient.delete(`/customers/${id}`)
}
