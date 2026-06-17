from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class LowStockProduct(BaseModel):
    id: int
    name: str
    sku: str
    quantity_in_stock: int


class RecentOrder(BaseModel):
    id: int
    customer_name: str
    product_name: str
    total_amount: Decimal
    status: str
    created_at: datetime


class DashboardSummary(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_count: int
    low_stock_products: list[LowStockProduct]
    recent_orders: list[RecentOrder]
