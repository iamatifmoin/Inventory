from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Customer, Order
from app.schemas import CustomerCreate
from app.services.exceptions import CustomerHasOrdersError, CustomerNotFoundError, DuplicateEmailError


def create_customer(db: Session, customer_in: CustomerCreate) -> Customer:
    normalized_email = customer_in.email.lower()
    existing_customer = db.scalar(
        select(Customer).where(func.lower(Customer.email) == normalized_email)
    )
    if existing_customer is not None:
        raise DuplicateEmailError(customer_in.email)

    customer = Customer(**customer_in.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    customer.order_count = 0
    return customer


def get_customers(db: Session, skip: int, limit: int) -> tuple[list[Customer], int]:
    active_order_counts = (
        select(
            Order.customer_id.label("customer_id"),
            func.count(Order.id).label("order_count"),
        )
        .where(Order.status == "active")
        .group_by(Order.customer_id)
        .subquery()
    )

    rows = db.execute(
        select(
            Customer,
            func.coalesce(active_order_counts.c.order_count, 0).label("order_count"),
        )
        .outerjoin(active_order_counts, Customer.id == active_order_counts.c.customer_id)
        .order_by(Customer.id)
        .offset(skip)
        .limit(limit)
    ).all()

    customers: list[Customer] = []
    for customer, order_count in rows:
        customer.order_count = int(order_count)
        customers.append(customer)

    total = db.scalar(select(func.count()).select_from(Customer)) or 0
    return customers, total


def get_customer_by_id(db: Session, customer_id: int) -> Customer:
    customer = db.get(Customer, customer_id)
    if customer is None:
        raise CustomerNotFoundError(customer_id)

    active_order_count = db.scalar(
        select(func.count()).select_from(Order).where(
            Order.customer_id == customer_id,
            Order.status == "active",
        )
    ) or 0
    customer.order_count = int(active_order_count)
    return customer


def delete_customer(db: Session, customer_id: int) -> None:
    customer = db.get(Customer, customer_id)
    if customer is None:
        raise CustomerNotFoundError(customer_id)

    has_orders = db.scalar(
        select(func.count()).select_from(Order).where(Order.customer_id == customer_id)
    ) or 0
    if has_orders > 0:
        raise CustomerHasOrdersError(customer_id)

    db.delete(customer)
    db.commit()
