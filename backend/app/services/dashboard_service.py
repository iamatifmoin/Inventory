from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Customer, Order, Product
from app.schemas.dashboard import DashboardSummary, LowStockProduct, RecentOrder


LOW_STOCK_THRESHOLD = 10


def get_dashboard_summary(db: Session) -> DashboardSummary:
    total_products = db.scalar(select(func.count(Product.id))) or 0
    total_customers = db.scalar(select(func.count(Customer.id))) or 0
    total_orders = db.scalar(select(func.count(Order.id))) or 0
    low_stock_count = db.scalar(
        select(func.count(Product.id)).where(Product.quantity_in_stock < LOW_STOCK_THRESHOLD)
    ) or 0

    low_stock_rows = db.execute(
        select(
            Product.id,
            Product.name,
            Product.sku,
            Product.quantity_in_stock,
        )
        .where(Product.quantity_in_stock < LOW_STOCK_THRESHOLD)
        .order_by(Product.quantity_in_stock.asc(), Product.id.asc())
        .limit(5)
    ).all()

    recent_order_rows = db.execute(
        select(
            Order.id,
            Customer.full_name.label("customer_name"),
            Product.name.label("product_name"),
            Order.total_amount,
            Order.status,
            Order.created_at,
        )
        .join(Customer, Order.customer_id == Customer.id)
        .join(Product, Order.product_id == Product.id)
        .order_by(Order.created_at.desc(), Order.id.desc())
        .limit(5)
    ).all()

    return DashboardSummary(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_count=low_stock_count,
        low_stock_products=[
            LowStockProduct(
                id=row.id,
                name=row.name,
                sku=row.sku,
                quantity_in_stock=row.quantity_in_stock,
            )
            for row in low_stock_rows
        ],
        recent_orders=[
            RecentOrder(
                id=row.id,
                customer_name=row.customer_name,
                product_name=row.product_name,
                total_amount=row.total_amount,
                status=row.status,
                created_at=row.created_at,
            )
            for row in recent_order_rows
        ],
    )
