from decimal import Decimal

from app.database import SessionLocal
from app.models import Customer, Order, Product


def seed_database(db) -> bool:
    if db.query(Product).count() > 0:
        print("Database already seeded, skipping.")
        return False

    # Stock values below represent current on-hand inventory after active orders
    # and after any cancelled order has already been restocked.
    products = [
        Product(name="Daawat Basmati Rice 5kg", sku="GRC-BAS-5KG", price=Decimal("499"), quantity_in_stock=42),
        Product(name="Fortune Sunflower Oil 1L", sku="GRC-OIL-1L", price=Decimal("179"), quantity_in_stock=8),
        Product(name="Aashirvaad Atta 10kg", sku="GRC-ATTA-10KG", price=Decimal("429"), quantity_in_stock=24),
        Product(name="Premium Toor Dal 1kg", sku="GRC-TOOR-1KG", price=Decimal("159"), quantity_in_stock=6),
        Product(name='Prestige Mixer Grinder 750W', sku="HOM-MIX-750", price=Decimal("4999"), quantity_in_stock=12),
        Product(
            name="Milton Stainless Steel Bottle 1L",
            sku="HOM-BOT-1L",
            price=Decimal("699"),
            quantity_in_stock=18,
        ),
        Product(name="Ergonomic Office Chair", sku="FUR-CHR-ERG", price=Decimal("12499"), quantity_in_stock=4),
        Product(name='LG IPS Monitor 24"', sku="ELE-MON-24", price=Decimal("12999"), quantity_in_stock=9),
    ]

    customers = [
        Customer(full_name="Aarav Sharma", email="aarav.sharma@example.in", phone="+919876543210"),
        Customer(full_name="Priya Nair", email="priya.nair@example.in", phone="+919812345678"),
        Customer(full_name="Rohan Mehta", email="rohan.mehta@example.in", phone="+919923456781"),
        Customer(full_name="Sneha Iyer", email="sneha.iyer@example.in", phone="+919834567812"),
        Customer(full_name="Vikram Patel", email="vikram.patel@example.in", phone="+919745678123"),
    ]

    db.add_all(products)
    db.add_all(customers)
    db.flush()

    product_by_sku = {product.sku: product for product in products}
    customer_by_email = {customer.email: customer for customer in customers}

    orders = [
        Order(
            customer_id=customer_by_email["aarav.sharma@example.in"].id,
            product_id=product_by_sku["GRC-OIL-1L"].id,
            quantity=2,
            total_amount=Decimal("358"),
            status="active",
        ),
        Order(
            customer_id=customer_by_email["priya.nair@example.in"].id,
            product_id=product_by_sku["HOM-MIX-750"].id,
            quantity=1,
            total_amount=Decimal("4999"),
            status="active",
        ),
        Order(
            customer_id=customer_by_email["rohan.mehta@example.in"].id,
            product_id=product_by_sku["FUR-CHR-ERG"].id,
            quantity=1,
            total_amount=Decimal("12499"),
            status="active",
        ),
        Order(
            customer_id=customer_by_email["sneha.iyer@example.in"].id,
            product_id=product_by_sku["ELE-MON-24"].id,
            quantity=2,
            total_amount=Decimal("25998"),
            status="active",
        ),
        Order(
            customer_id=customer_by_email["vikram.patel@example.in"].id,
            product_id=product_by_sku["GRC-TOOR-1KG"].id,
            quantity=2,
            total_amount=Decimal("318"),
            status="cancelled",
        ),
    ]

    db.add_all(orders)
    print(f"Seeded {len(products)} products, {len(customers)} customers, {len(orders)} orders.")
    return True


def main() -> None:
    db = SessionLocal()
    try:
        seed_database(db)
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
