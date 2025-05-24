# from flask_sqlalchemy import SQLAlchemy
# from sqlalchemy import String, Boolean
# from sqlalchemy.orm import Mapped, mapped_column

# db = SQLAlchemy()

# class User(db.Model):
#     id: Mapped[int] = mapped_column(primary_key=True)
#     email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
#     password: Mapped[str] = mapped_column(nullable=False)
#     is_active: Mapped[bool] = mapped_column(Boolean(), nullable=False)


#     def serialize(self):
#         return {
#             "id": self.id,
#             "email": self.email,
#             # do not serialize the password, its a security breach
#         }

# src/api/models.py (modificación)

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    username: Mapped[str] = mapped_column(
        String(80), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(256), nullable=False)
    first_name: Mapped[str] = mapped_column(String(80), nullable=False)
    last_name: Mapped[str] = mapped_column(String(80), nullable=False)
    role: Mapped[str] = mapped_column(
        String(20), nullable=False, default="buyer")  # "buyer" o "seller"
    is_active: Mapped[bool] = mapped_column(
        Boolean(), nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow)

    # Campos adicionales para compradores
    address: Mapped[str] = mapped_column(String(200), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=True)
    zip_code: Mapped[str] = mapped_column(String(20), nullable=True)

    # Relaciones
    products = relationship(
        "Product", back_populates="seller", cascade="all, delete-orphan")

    def __init__(self, **kwargs):
        # Hashear la contraseña al crear un nuevo usuario
        if "password" in kwargs:
            kwargs["password"] = generate_password_hash(kwargs["password"])
        super().__init__(**kwargs)

    def check_password(self, password):
        # Verificar si la contraseña es correcta
        return check_password_hash(self.password, password)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "role": self.role,
            "is_active": self.is_active,
            # No serializar la contraseña por seguridad
        }


class Product(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    subcategory: Mapped[str] = mapped_column(String(50), nullable=True)
    size: Mapped[str] = mapped_column(String(20), nullable=False)
    brand: Mapped[str] = mapped_column(String(100), nullable=True)
    condition: Mapped[str] = mapped_column(
        String(50), nullable=False, default="two_wears")
    material: Mapped[str] = mapped_column(String(100), nullable=True)
    color: Mapped[str] = mapped_column(String(50), nullable=True)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    discount: Mapped[float] = mapped_column(Float, nullable=True, default=0)
    seller_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow)

    # Relaciones
    seller = relationship("User", back_populates="products")
    images = relationship(
        "ProductImage", back_populates="product", cascade="all, delete-orphan")

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "subcategory": self.subcategory,
            "size": self.size,
            "brand": self.brand,
            "condition": self.condition,
            "material": self.material,
            "color": self.color,
            "price": self.price,
            "discount": self.discount,
            "seller_id": self.seller_id,
            "created_at": self.created_at.isoformat(),
            "images": [image.serialize() for image in self.images]
        }


class ProductImage(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    product_id: Mapped[int] = mapped_column(ForeignKey("product.id"), nullable=False)

    product = relationship("Product", back_populates="images")

    def serialize(self):
        return {
            "id": self.id,
            "url": self.url
        }


