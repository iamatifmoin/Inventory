class AppError(Exception):
    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


class DuplicateSKUError(AppError):
    def __init__(self, sku: str) -> None:
        super().__init__(f"A product with SKU '{sku}' already exists.")


class ProductNotFoundError(AppError):
    def __init__(self, product_id: int) -> None:
        super().__init__(f"Product with ID {product_id} was not found.")


class ProductHasOrdersError(AppError):
    def __init__(self, product_id: int) -> None:
        super().__init__(f"Product with ID {product_id} cannot be deleted because it has existing orders.")


class DuplicateEmailError(AppError):
    def __init__(self, email: str) -> None:
        super().__init__(f"A customer with email '{email}' already exists.")


class CustomerNotFoundError(AppError):
    def __init__(self, customer_id: int) -> None:
        super().__init__(f"Customer with ID {customer_id} was not found.")


class CustomerHasOrdersError(AppError):
    def __init__(self, customer_id: int) -> None:
        super().__init__(f"Customer with ID {customer_id} cannot be deleted because they have existing orders.")


class InsufficientStockError(AppError):
    def __init__(self, requested_quantity: int, available_stock: int) -> None:
        super().__init__(
            f"Insufficient stock: requested {requested_quantity}, only {available_stock} available."
        )


class OrderNotFoundError(AppError):
    def __init__(self, order_id: int) -> None:
        super().__init__(f"Order with ID {order_id} was not found.")


class OrderAlreadyCancelledError(AppError):
    def __init__(self, order_id: int) -> None:
        super().__init__(f"Order with ID {order_id} has already been cancelled.")
