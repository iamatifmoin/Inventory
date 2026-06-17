from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import CustomerCreate, CustomerOut, Page
from app.services.customer_service import (
    create_customer,
    delete_customer,
    get_customer_by_id,
    get_customers,
)
from app.services.exceptions import CustomerHasOrdersError, CustomerNotFoundError, DuplicateEmailError


router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("/", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer_endpoint(customer_in: CustomerCreate, db: Session = Depends(get_db)) -> CustomerOut:
    try:
        return create_customer(db, customer_in)
    except DuplicateEmailError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get("/", response_model=Page[CustomerOut])
def list_customers(
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
) -> Page[CustomerOut]:
    customers, total = get_customers(db, skip, limit)
    return Page[CustomerOut](items=customers, total=total, skip=skip, limit=limit)


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer_endpoint(customer_id: int, db: Session = Depends(get_db)) -> CustomerOut:
    try:
        return get_customer_by_id(db, customer_id)
    except CustomerNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer_endpoint(customer_id: int, db: Session = Depends(get_db)) -> None:
    try:
        delete_customer(db, customer_id)
    except CustomerNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except CustomerHasOrdersError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
