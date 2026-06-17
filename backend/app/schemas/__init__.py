from app.schemas.common import ErrorResponse, Page
from app.schemas.customer import CustomerBase, CustomerCreate, CustomerOut
from app.schemas.dashboard import DashboardSummary, LowStockProduct, RecentOrder
from app.schemas.order import OrderCreate, OrderOut
from app.schemas.product import ProductBase, ProductCreate, ProductOut, ProductUpdate

__all__ = [
    "ErrorResponse",
    "Page",
    "DashboardSummary",
    "LowStockProduct",
    "RecentOrder",
    "ProductBase",
    "ProductCreate",
    "ProductUpdate",
    "ProductOut",
    "CustomerBase",
    "CustomerCreate",
    "CustomerOut",
    "OrderCreate",
    "OrderOut",
]
