from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session, joinedload

from app.models import Customer, Order, Product
from app.schemas import OrderCreate
from app.services.exceptions import (
    CustomerNotFoundError,
    InsufficientStockError,
    OrderAlreadyCancelledError,
    OrderNotFoundError,
    ProductNotFoundError,
)


def create_order(db: Session, order_in: OrderCreate) -> Order:
    customer = db.get(Customer, order_in.customer_id)
    if customer is None:
        raise CustomerNotFoundError(order_in.customer_id)

    product = db.query(Product).filter(Product.id == order_in.product_id).with_for_update().first()
    if product is None:
        raise ProductNotFoundError(order_in.product_id)

    if product.quantity_in_stock < order_in.quantity:
        raise InsufficientStockError(order_in.quantity, product.quantity_in_stock)

    total_amount = product.price * order_in.quantity
    product.quantity_in_stock -= order_in.quantity

    order = Order(
        customer_id=customer.id,
        product_id=product.id,
        quantity=order_in.quantity,
        total_amount=total_amount,
        status="active",
    )
    db.add(order)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    db.refresh(order)
    return get_order_by_id(db, order.id)


def get_orders(
    db: Session,
    skip: int,
    limit: int,
    status: str | None = None,
) -> tuple[list[dict], int]:
    filters = []
    if status is not None:
        filters.append(Order.status == status)

    rows = db.execute(
        select(
            Order.id,
            Order.customer_id,
            Order.product_id,
            Customer.full_name.label("customer_name"),
            Product.name.label("product_name"),
            Order.quantity,
            Order.total_amount,
            Order.status,
            Order.created_at,
        )
        .join(Customer, Order.customer_id == Customer.id)
        .join(Product, Order.product_id == Product.id)
        .where(*filters)
        .order_by(desc(Order.id))
        .offset(skip)
        .limit(limit)
    ).all()

    total = db.scalar(select(func.count()).select_from(Order).where(*filters)) or 0
    orders = [
        {
            "id": row.id,
            "customer_id": row.customer_id,
            "product_id": row.product_id,
            "customer_name": row.customer_name,
            "product_name": row.product_name,
            "quantity": row.quantity,
            "total_amount": row.total_amount,
            "status": row.status,
            "created_at": row.created_at,
        }
        for row in rows
    ]
    return orders, total


def get_order_by_id(db: Session, order_id: int) -> Order:
    order = (
        db.query(Order)
        .options(joinedload(Order.customer), joinedload(Order.product))
        .filter(Order.id == order_id)
        .first()
    )
    if order is None:
        raise OrderNotFoundError(order_id)
    return order


def cancel_order(db: Session, order_id: int) -> Order:
    order = get_order_by_id(db, order_id)
    if order.status == "cancelled":
        raise OrderAlreadyCancelledError(order_id)

    product = db.query(Product).filter(Product.id == order.product_id).with_for_update().first()
    if product is None:
        raise ProductNotFoundError(order.product_id)

    product.quantity_in_stock += order.quantity
    order.status = "cancelled"

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    db.refresh(order)
    return get_order_by_id(db, order.id)
