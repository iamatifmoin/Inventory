export interface Product {
  id: number
  name: string
  sku: string
  price: string
  quantity_in_stock: number
  created_at: string
  updated_at: string
}

export interface Customer {
  id: number
  full_name: string
  email: string
  phone: string
  created_at: string
  order_count: number
}

export interface Order {
  id: number
  customer_id: number
  product_id: number
  customer_name: string
  product_name: string
  quantity: number
  total_amount: string
  status: 'active' | 'cancelled'
  created_at: string
}

export interface Page<T> {
  items: T[]
  total: number
  skip: number
  limit: number
}

export interface DashboardSummary {
  total_products: number
  total_customers: number
  total_orders: number
  low_stock_count: number
  low_stock_products: {
    id: number
    name: string
    sku: string
    quantity_in_stock: number
  }[]
  recent_orders: {
    id: number
    customer_name: string
    product_name: string
    total_amount: string
    status: string
    created_at: string
  }[]
}
