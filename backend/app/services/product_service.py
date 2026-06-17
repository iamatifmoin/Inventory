from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Order, Product
from app.schemas import ProductCreate, ProductUpdate
from app.services.exceptions import DuplicateSKUError, ProductHasOrdersError, ProductNotFoundError


def create_product(db: Session, product_in: ProductCreate) -> Product:
    existing_product = db.scalar(select(Product).where(Product.sku == product_in.sku))
    if existing_product is not None:
        raise DuplicateSKUError(product_in.sku)

    product = Product(**product_in.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_products(db: Session, skip: int, limit: int) -> tuple[list[Product], int]:
    products = list(db.scalars(select(Product).order_by(Product.id).offset(skip).limit(limit)))
    total = db.scalar(select(func.count()).select_from(Product)) or 0
    return products, total


def get_product_by_id(db: Session, product_id: int) -> Product:
    product = db.get(Product, product_id)
    if product is None:
        raise ProductNotFoundError(product_id)
    return product


def update_product(db: Session, product_id: int, product_in: ProductUpdate) -> Product:
    product = get_product_by_id(db, product_id)
    update_data = product_in.model_dump(exclude_unset=True)

    new_sku = update_data.get("sku")
    if new_sku is not None and new_sku != product.sku:
        conflicting_product = db.scalar(
            select(Product).where(Product.sku == new_sku, Product.id != product.id)
        )
        if conflicting_product is not None:
            raise DuplicateSKUError(new_sku)

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> None:
    product = get_product_by_id(db, product_id)
    has_orders = db.scalar(select(func.count()).select_from(Order).where(Order.product_id == product_id)) or 0
    if has_orders > 0:
        raise ProductHasOrdersError(product_id)

    db.delete(product)
    db.commit()
