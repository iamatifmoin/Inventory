import { apiClient } from './client'
import type { Order, Page } from '../types'

export type CreateOrderInput = Pick<Order, 'customer_id' | 'product_id' | 'quantity'>

export async function listOrders(
  skip: number,
  limit: number,
  status?: Order['status'],
): Promise<Page<Order>> {
  const response = await apiClient.get<Page<Order>>('/orders', {
    params: { limit, skip, status },
  })

  return response.data
}

export async function getOrder(id: number): Promise<Order> {
  const response = await apiClient.get<Order>(`/orders/${id}`)
  return response.data
}

export async function createOrder(data: CreateOrderInput): Promise<Order> {
  const response = await apiClient.post<Order>('/orders', data)
  return response.data
}

export async function cancelOrder(id: number): Promise<Order> {
  const response = await apiClient.delete<Order>(`/orders/${id}`)
  return response.data
}
