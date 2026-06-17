from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import OrderCreate, OrderOut, Page
from app.services.exceptions import (
    CustomerNotFoundError,
    InsufficientStockError,
    OrderAlreadyCancelledError,
    OrderNotFoundError,
    ProductNotFoundError,
)
from app.services.order_service import cancel_order, create_order, get_order_by_id, get_orders


router = APIRouter(prefix="/orders", tags=["Orders"])


def serialize_order(order: object) -> OrderOut:
    if isinstance(order, dict):
        return OrderOut(**order)

    return OrderOut(
        id=order.id,
        customer_id=order.customer_id,
        product_id=order.product_id,
        customer_name=order.customer.full_name,
        product_name=order.product.name,
        quantity=order.quantity,
        total_amount=order.total_amount,
        status=order.status,
        created_at=order.created_at,
    )


@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order_endpoint(order_in: OrderCreate, db: Session = Depends(get_db)) -> OrderOut:
    try:
        return serialize_order(create_order(db, order_in))
    except CustomerNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ProductNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except InsufficientStockError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get("/", response_model=Page[OrderOut])
def list_orders(
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    status: Literal["active", "cancelled"] | None = None,
    db: Session = Depends(get_db),
) -> Page[OrderOut]:
    orders, total = get_orders(db, skip, limit, status=status)
    return Page[OrderOut](
        items=[serialize_order(order) for order in orders],
        total=total,
        skip=skip,
        limit=limit,
    )


@router.get("/{order_id}", response_model=OrderOut)
def get_order_endpoint(order_id: int, db: Session = Depends(get_db)) -> OrderOut:
    try:
        return serialize_order(get_order_by_id(db, order_id))
    except OrderNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{order_id}", response_model=OrderOut)
def cancel_order_endpoint(order_id: int, db: Session = Depends(get_db)) -> OrderOut:
    try:
        return serialize_order(cancel_order(db, order_id))
    except OrderNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except OrderAlreadyCancelledError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
