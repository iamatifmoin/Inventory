import { apiClient } from './client'
import type { Page, Product } from '../types'

export type CreateProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at'>
export type UpdateProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at'>

export async function listProducts(skip: number, limit: number): Promise<Page<Product>> {
  const response = await apiClient.get<Page<Product>>('/products', {
    params: { limit, skip },
  })

  return response.data
}

export async function getProduct(id: number): Promise<Product> {
  const response = await apiClient.get<Product>(`/products/${id}`)
  return response.data
}

export async function createProduct(data: CreateProductInput): Promise<Product> {
  const response = await apiClient.post<Product>('/products', data)
  return response.data
}

export async function updateProduct(id: number, data: UpdateProductInput): Promise<Product> {
  const response = await apiClient.put<Product>(`/products/${id}`, data)
  return response.data
}

export async function deleteProduct(id: number): Promise<void> {
  await apiClient.delete(`/products/${id}`)
}
