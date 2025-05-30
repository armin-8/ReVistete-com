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

    # NUEVOS campos para vendedores
    phone: Mapped[str] = mapped_column(String(20), nullable=True)
    store_name: Mapped[str] = mapped_column(String(100), nullable=True)
    store_description: Mapped[str] = mapped_column(Text, nullable=True)

    # Relaciones existentes
    products = relationship(
        "Product", back_populates="seller", cascade="all, delete-orphan")
    # Nueva relación para ventas
    sales = relationship("Sale", foreign_keys="Sale.seller_id",
                         back_populates="seller", cascade="all, delete-orphan")
    purchases = relationship("Sale", foreign_keys="Sale.buyer_id",
                             back_populates="buyer", cascade="all, delete-orphan")

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
    url: Mapped[str] = mapped_column(Text, nullable=False)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("product.id"), nullable=False)
    position: Mapped[int] = mapped_column(nullable=False, default=0)

    # Relaciones
    product = relationship("Product", back_populates="images")

    def serialize(self):
        return {
            "id": self.id,
            "url": self.url,
            "position": self.position
        }

# Modelo Sale


class Sale(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("product.id"), nullable=False)
    seller_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"), nullable=False)
    buyer_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    discount: Mapped[float] = mapped_column(Float, nullable=True, default=0)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relaciones
    product = relationship("Product")
    seller = relationship("User", foreign_keys=[
                          seller_id], back_populates="sales")
    buyer = relationship("User", foreign_keys=[
                         buyer_id], back_populates="purchases")

    def serialize(self):
        return {
            "id": self.id,
            "product": self.product.serialize() if self.product else None,
            "seller": {
                "id": self.seller.id,
                "first_name": self.seller.first_name,
                "last_name": self.seller.last_name,
                "email": self.seller.email
            } if self.seller else None,
            "buyer": {
                "id": self.buyer.id,
                "first_name": self.buyer.first_name,
                "last_name": self.buyer.last_name,
                "email": self.buyer.email
            } if self.buyer else None,
            "price": self.price,
            "discount": self.discount,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

# Modelo Offer - Sistema de ofertas entre compradores y vendedores


class Offer(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)

    # Relación con el producto
    product_id: Mapped[int] = mapped_column(
        ForeignKey("product.id"), nullable=False)

    # Quién hace la oferta (comprador)
    buyer_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"), nullable=False)

    # Quién recibe la oferta (vendedor) - redundante pero útil para consultas
    seller_id: Mapped[int] = mapped_column(
        ForeignKey("user.id"), nullable=False)

    # Monto de la oferta
    amount: Mapped[float] = mapped_column(Float, nullable=False)

    # Mensaje opcional del comprador al hacer la oferta
    message: Mapped[str] = mapped_column(Text, nullable=True)

    # Estado de la oferta: pending, accepted, rejected, expired
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending")

    # Respuesta del vendedor (opcional)
    seller_response: Mapped[str] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow)
    responded_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=True)  # Cuando el vendedor respondió

    # Relaciones
    product = relationship("Product")
    buyer = relationship("User", foreign_keys=[buyer_id])
    seller = relationship("User", foreign_keys=[seller_id])

    def serialize(self):
        """Convierte la oferta en un diccionario para enviar como JSON"""
        return {
            "id": self.id,
            "product_id": self.product_id,
            "product": {
                "id": self.product.id,
                "title": self.product.title,
                "price": self.product.price,
                # Solo primera imagen
                "images": [img.serialize() for img in self.product.images[:1]]
            } if self.product else None,
            "buyer": {
                "id": self.buyer.id,
                "username": self.buyer.username,
                "first_name": self.buyer.first_name
            } if self.buyer else None,
            "seller": {
                "id": self.seller.id,
                "username": self.seller.username
            } if self.seller else None,
            "amount": self.amount,
            "message": self.message,
            "status": self.status,
            "seller_response": self.seller_response,
            "created_at": self.created_at.isoformat(),
            "responded_at": self.responded_at.isoformat() if self.responded_at else None
        }
