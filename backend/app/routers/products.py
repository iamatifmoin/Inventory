from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import Page, ProductCreate, ProductOut, ProductUpdate
from app.services.exceptions import DuplicateSKUError, ProductHasOrdersError, ProductNotFoundError
from app.services.product_service import (
    create_product,
    delete_product,
    get_product_by_id,
    get_products,
    update_product,
)


router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product_endpoint(product_in: ProductCreate, db: Session = Depends(get_db)) -> ProductOut:
    try:
        return create_product(db, product_in)
    except DuplicateSKUError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get("/", response_model=Page[ProductOut])
def list_products(
    skip: int = 0,
    limit: int = Query(default=20, le=100),
    db: Session = Depends(get_db),
) -> Page[ProductOut]:
    products, total = get_products(db, skip, limit)
    return Page[ProductOut](items=products, total=total, skip=skip, limit=limit)


@router.get("/{product_id}", response_model=ProductOut)
def get_product_endpoint(product_id: int, db: Session = Depends(get_db)) -> ProductOut:
    try:
        return get_product_by_id(db, product_id)
    except ProductNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.put("/{product_id}", response_model=ProductOut)
def update_product_endpoint(
    product_id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
) -> ProductOut:
    try:
        return update_product(db, product_id, product_in)
    except ProductNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except DuplicateSKUError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product_endpoint(product_id: int, db: Session = Depends(get_db)) -> None:
    try:
        delete_product(db, product_id)
    except ProductNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ProductHasOrdersError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
