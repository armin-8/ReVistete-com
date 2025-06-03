from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Product, ProductImage, Sale, Offer
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
import datetime

from api.cloudinary_service import upload_image, upload_multiple_images, delete_image

import secrets

password_reset_tokens = {}

api = Blueprint('api', __name__)
CORS(api, supports_credentials=True, origins="*")  # Para pruebas


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }
    return jsonify(response_body), 200


# Endpoint para registrar vendedores
@api.route('/register/seller', methods=['POST'])
def register_seller():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400

    data = request.get_json()

    # Validar campos requeridos (ahora incluye 'phone')
    required_fields = ["email", "password", "first_name", "last_name", "username", "phone"]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Verificar si el email ya existe
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    # Verificar si el username ya existe
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 400

    # Crear nuevo usuario con rol de vendedor, incluyendo 'phone'
    new_user = User(
        email=data["email"],
        password=data["password"],
        first_name=data["first_name"],
        last_name=data["last_name"],
        username=data["username"],
        role="seller",
        is_active=True,
        phone=data["phone"]
    )

    try:
        db.session.add(new_user)
        db.session.commit()

        # Crear token de acceso
        access_token = create_access_token(
            identity=str(new_user.id),
            expires_delta=datetime.timedelta(hours=24)
        )

        return jsonify({
            "message": "Seller registered successfully",
            "token": access_token,
            "user": new_user.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# Endpoint para obtener productos de un vendedor
@api.route('/seller/products', methods=['GET'])
@jwt_required()
def get_seller_products():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role != "seller":
        return jsonify({"error": "Access denied, user is not a seller"}), 403

    products = Product.query.filter_by(seller_id=user.id).all()
    return jsonify({
        "products": [product.serialize() for product in products]
    }), 200


# Endpoint para crear un nuevo producto
@api.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role != "seller":
        return jsonify({"error": "Access denied, user is not a seller"}), 403

    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400

    data = request.get_json()
    required_fields = ["title", "description", "category", "size", "condition", "price"]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    new_product = Product(
        title=data["title"],
        description=data["description"],
        category=data["category"],
        subcategory=data.get("subcategory"),
        size=data["size"],
        brand=data.get("brand"),
        condition=data["condition"],
        material=data.get("material"),
        color=data.get("color"),
        price=float(data["price"]),
        discount=float(data.get("discount", 0)),
        seller_id=user.id
    )

    try:
        db.session.add(new_product)
        db.session.commit()

        image_urls = data.get("images", [])
        for index, url in enumerate(image_urls):
            image = ProductImage(
                url=url,
                product_id=new_product.id,
                position=index
            )
            db.session.add(image)

        db.session.commit()

        return jsonify({
            "message": "Product created successfully",
            "product": new_product.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/login', methods=['POST'])
def login():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400

    data = request.get_json()
    if "email" not in data or "password" not in data:
        return jsonify({"error": "Missing email or password"}), 400

    user = User.query.filter_by(email=data["email"]).first()
    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(
        identity=str(user.id),
        expires_delta=datetime.timedelta(hours=24)
    )

    return jsonify({
        "token": access_token,
        "user": user.serialize()
    }), 200


@api.route('/register/buyer', methods=['POST'])
def register_buyer():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400

    data = request.get_json()
    required_fields = ["email", "first_name", "last_name", "username", "password", "role"]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    if data["role"] != "buyer":
        return jsonify({"error": "Invalid role, must be 'buyer'"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 400

    new_user = User(
        email=data["email"],
        password=data["password"],
        first_name=data["first_name"],
        last_name=data["last_name"],
        username=data["username"],
        role="buyer",
        is_active=True
    )

    try:
        db.session.add(new_user)
        db.session.commit()

        access_token = create_access_token(
            identity=str(new_user.id),
            expires_delta=datetime.timedelta(hours=24)
        )

        return jsonify({
            "message": "Buyer registered successfully",
            "token": access_token,
            "user": new_user.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/categories', methods=['GET'])
def get_categories():
    categories = [
        {"id": 1, "name": "Vestidos", "image": "/images/vestidos.jpg"},
        {"id": 2, "name": "Abrigos", "image": "/images/abrigos.jpg"},
        {"id": 3, "name": "Deportivo", "image": "/images/deportivo.jpg"},
        {"id": 4, "name": "Blusas", "image": "/images/blusas.jpg"},
        {"id": 5, "name": "Pantalones", "image": "/images/pantalones.jpg"},
        {"id": 6, "name": "Camisas", "image": "/images/camisas.jpg"},
    ]
    return jsonify(categories), 200


@api.route("/user/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.json

    user.nombre = data.get("nombre")
    user.apellidos = data.get("apellidos")
    user.username = data.get("username")
    user.email = data.get("email")

    db.session.commit()
    return jsonify({"msg": "Perfil actualizado"}), 200


@api.route("/user/change-password", methods=["POST"])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.json

    if not user.check_password(data.get("current_password")):
        return jsonify({"msg": "Contraseña actual incorrecta"}), 401

    if data.get("new_password") != data.get("confirm_password"):
        return jsonify({"msg": "Las contraseñas no coinciden"}), 400

    user.set_password(data.get("new_password"))
    db.session.commit()
    return jsonify({"msg": "Contraseña actualizada"}), 200


@api.route('/seller/sales', methods=['GET'])
@jwt_required()
def get_seller_sales():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role != "seller":
        return jsonify({"error": "Access denied, user is not a seller"}), 403

    sales = Sale.query.filter_by(seller_id=user.id).order_by(Sale.created_at.desc()).all()
    total_earnings = sum(sale.price for sale in sales)

    return jsonify({
        "sales": [sale.serialize() for sale in sales],
        "total_earnings": total_earnings,
        "total_sales": len(sales)
    }), 200


@api.route('/seller/profile', methods=['GET'])
@jwt_required()
def get_seller_profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role != "seller":
        return jsonify({"error": "Access denied, user is not a seller"}), 403

    return jsonify({
        "first_name": user.first_name,
        "last_name": user.last_name,
        "username": user.username,
        "email": user.email,
        "phone": user.phone,
    }), 200


@api.route('/seller/profile', methods=['PUT'])
@jwt_required()
def update_seller_profile():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role != "seller":
        return jsonify({"error": "Access denied, user is not a seller"}), 403

    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400

    data = request.get_json()
    required_fields = ["first_name", "last_name", "username", "email"]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    if data["email"] != user.email:
        existing_email = User.query.filter_by(email=data["email"]).first()
        if existing_email:
            return jsonify({"error": "Email already exists"}), 400

    if data["username"] != user.username:
        existing_username = User.query.filter_by(username=data["username"]).first()
        if existing_username:
            return jsonify({"error": "Username already exists"}), 400

    if data.get("new_password"):
        if not data.get("current_password"):
            return jsonify({"error": "Current password is required to change password"}), 400
        if not user.check_password(data["current_password"]):
            return jsonify({"error": "Current password is incorrect"}), 400
        if len(data["new_password"]) < 6:
            return jsonify({"error": "New password must be at least 6 characters long"}), 400

    try:
        user.first_name = data["first_name"]
        user.last_name = data["last_name"]
        user.username = data["username"]
        user.email = data["email"]
        user.phone = data.get("phone", user.phone)
        if data.get("new_password"):
            user.password = generate_password_hash(data["new_password"])

        db.session.commit()

        return jsonify({
            "message": "Profile updated successfully",
            "user": user.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/request-password-reset', methods=['POST'])
def request_password_reset():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400

    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({
            "message": "Si el correo existe, recibirás un enlace para restablecer tu contraseña"
        }), 200

    token = secrets.token_urlsafe(32)
    expiration = datetime.datetime.now() + datetime.timedelta(hours=24)
    password_reset_tokens[token] = {
        'user_id': user.id,
        'expiration': expiration
    }

    frontend_url = request.headers.get('Origin', 'http://localhost:3000')
    reset_url = f"{frontend_url}/reset-password/{token}"

    return jsonify({
        "message": "Si el correo existe, recibirás un enlace para restablecer tu contraseña",
        "debug_token": token,
        "debug_url": reset_url
    }), 200


@api.route('/reset-password', methods=['POST'])
def reset_password():
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400

    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')

    if not token or not new_password:
        return jsonify({"error": "Token and new password are required"}), 400

    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters long"}), 400

    token_data = password_reset_tokens.get(token)
    if not token_data:
        return jsonify({"error": "Invalid or expired token"}), 400

    if datetime.datetime.now() > token_data['expiration']:
        password_reset_tokens.pop(token, None)
        return jsonify({"error": "Token has expired"}), 400

    user = User.query.get(token_data['user_id'])
    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        user.password = generate_password_hash(new_password)
        db.session.commit()
        password_reset_tokens.pop(token, None)

        return jsonify({"message": "Password reset successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/products/catalog', methods=['GET'])
def get_products_catalog():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    if per_page > 50:
        per_page = 50

    gender = request.args.get('gender', '').lower()
    category = request.args.get('category', '').lower()
    subcategory = request.args.get('subcategory', '').lower()
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    size = request.args.get('size', '')
    condition = request.args.get('condition', '')
    brand = request.args.get('brand', '')
    color = request.args.get('color', '').lower()
    search = request.args.get('search', '')
    sort = request.args.get('sort', 'newest')

    query = Product.query

    if gender:
        if gender == 'hombre':
            query = query.filter(Product.category.like('hombre_%'))
        elif gender == 'mujer':
            query = query.filter(Product.category.like('mujer_%'))
        elif gender == 'unisex':
            query = query.filter(Product.category.like('unisex_%'))

    if category:
        if '_' not in category:
            query = query.filter(
                db.or_(
                    Product.category.like(f'%_{category}'),
                    Product.category.ilike(f'%{category}%')
                )
            )
        else:
            query = query.filter(Product.category == category)

    if subcategory:
        query = query.filter(Product.subcategory.ilike(f'%{subcategory}%'))

    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if size:
        query = query.filter(Product.size == size)

    if condition:
        query = query.filter(Product.condition == condition)

    if brand:
        query = query.filter(Product.brand.ilike(f'%{brand}%'))

    if color:
        query = query.filter(Product.color.ilike(f'%{color}%'))

    if search:
        search_term = f'%{search}%'
        query = query.filter(
            db.or_(
                Product.title.ilike(search_term),
                Product.description.ilike(search_term),
                Product.brand.ilike(search_term)
            )
        )

    if sort == 'price_asc':
        query = query.order_by(Product.price.asc())
    elif sort == 'price_desc':
        query = query.order_by(Product.price.desc())
    elif sort == 'newest':
        query = query.order_by(Product.created_at.desc())
    else:
        query = query.order_by(Product.created_at.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    products = [product.serialize() for product in pagination.items]

    available_filters = {
        "sizes": db.session.query(Product.size).distinct().all(),
        "brands": db.session.query(Product.brand).filter(Product.brand.isnot(None)).distinct().all(),
        "colors": db.session.query(Product.color).filter(Product.color.isnot(None)).distinct().all(),
        "conditions": db.session.query(Product.condition).distinct().all(),
    }

    available_filters = {
        "sizes": [size[0] for size in available_filters["sizes"] if size[0]],
        "brands": [brand[0] for brand in available_filters["brands"] if brand[0]],
        "colors": [color[0] for color in available_filters["colors"] if color[0]],
        "conditions": [condition[0] for condition in available_filters["conditions"] if condition[0]],
    }

    return jsonify({
        "products": products,
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": pagination.total,
            "pages": pagination.pages,
            "has_prev": pagination.has_prev,
            "has_next": pagination.has_next
        },
        "available_filters": available_filters,
        "applied_filters": {
            "gender": gender,
            "category": category,
            "subcategory": subcategory,
            "min_price": min_price,
            "max_price": max_price,
            "size": size,
            "condition": condition,
            "brand": brand,
            "color": color,
            "search": search,
            "sort": sort
        }
    }), 200


@api.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role != "seller":
        return jsonify({"error": "Access denied, user is not a seller"}), 403

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    if product.seller_id != user.id:
        return jsonify({"error": "Access denied, this product belongs to another seller"}), 403

    try:
        db.session.delete(product)
        db.session.commit()
        return jsonify({"message": "Product deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role != "seller":
        return jsonify({"error": "Access denied, user is not a seller"}), 403

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    if product.seller_id != user.id:
        return jsonify({"error": "Access denied, this product belongs to another seller"}), 403

    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400

    data = request.get_json()
    try:
        if "title" in data:
            product.title = data["title"]
        if "description" in data:
            product.description = data["description"]
        if "category" in data:
            product.category = data["category"]
        if "subcategory" in data:
            product.subcategory = data["subcategory"]
        if "size" in data:
            product.size = data["size"]
        if "brand" in data:
            product.brand = data["brand"]
        if "condition" in data:
            product.condition = data["condition"]
        if "material" in data:
            product.material = data["material"]
        if "color" in data:
            product.color = data["color"]
        if "price" in data:
            product.price = float(data["price"])
        if "discount" in data:
            product.discount = float(data["discount"])

        if "images" in data:
            ProductImage.query.filter_by(product_id=product.id).delete()
            for index, url in enumerate(data["images"]):
                image = ProductImage(
                    url=url,
                    product_id=product.id,
                    position=index
                )
                db.session.add(image)

        db.session.commit()
        return jsonify({
            "message": "Product updated successfully",
            "product": product.serialize()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/products/<int:product_id>', methods=['GET'])
@jwt_required()
def get_product(product_id):
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    if user.role == "seller" and product.seller_id != user.id:
        pass

    return jsonify(product.serialize()), 200


@api.route('/products/<int:product_id>/details', methods=['GET'])
def get_product_details(product_id):
    """
    Obtiene los detalles completos de un producto para la página de detalle.
    Incluye información del vendedor y productos relacionados.
    No requiere autenticación para que cualquiera pueda ver los productos.
    """
    product = Product.query.options(
        db.joinedload(Product.seller),
        db.joinedload(Product.images)
    ).get(product_id)

    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404

    product_data = product.serialize()
    product_data['seller'] = {
        'id': product.seller.id,
        'username': product.seller.username,
        'first_name': product.seller.first_name,
        'city': product.seller.city or 'No especificada',
        'phone': product.seller.phone or ''    # <-- Agregado teléfono
    }

    other_products = Product.query.filter(
        Product.seller_id == product.seller_id,
        Product.id != product_id
    ).limit(4).all()

    product_data['seller_other_products'] = [p.serialize() for p in other_products]

    similar_products = Product.query.filter(
        Product.category == product.category,
        Product.id != product_id
    ).limit(4).all()

    product_data['similar_products'] = [p.serialize() for p in similar_products]

    return jsonify(product_data), 200


@api.route('/upload/image', methods=['POST'])
@jwt_required()
def upload_single_image():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    result = upload_image(file, folder=f"revistete/users/{user_id}")
    if result["success"]:
        return jsonify({
            "message": "Image uploaded successfully",
            "url": result["url"],
            "public_id": result["public_id"]
        }), 200
    else:
        return jsonify({
            "error": "Failed to upload image",
            "details": result.get("error", "Unknown error")
        }), 500


# Endpoint para crear una oferta en un producto


@api.route('/products/<int:product_id>/offers', methods=['POST'])
@jwt_required()
def create_offer(product_id):
    """
    Permite a un comprador hacer una oferta en un producto.
    El comprador envía el monto y un mensaje opcional.
    """
    product_id = request.view_args.get('product_id')
    user_id = get_jwt_identity()

    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    if user.role != "buyer":
        return jsonify({"error": "Solo los compradores pueden hacer ofertas"}), 403

    data = request.get_json()
    if not data or 'amount' not in data:
        return jsonify({"error": "Debe especificar el monto de la oferta"}), 400

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404

    try:
        amount = float(data['amount'])
    except ValueError:
        return jsonify({"error": "El monto debe ser un número válido"}), 400

    if amount <= 0:
        return jsonify({"error": "El monto debe ser mayor a 0"}), 400

    if amount > product.price:
        return jsonify({"error": "La oferta no puede ser mayor al precio del producto"}), 400

    if amount < (product.price * 0.5):
        return jsonify({
            "warning": "Tu oferta es muy baja, es poco probable que sea aceptada",
            "suggested_min": product.price * 0.7
        }), 400

    existing_offer = Offer.query.filter_by(
        product_id=product_id,
        buyer_id=user.id,
        status='pending'
    ).first()

    if existing_offer:
        return jsonify({"error": "Ya tienes una oferta pendiente en este producto"}), 400

    new_offer = Offer(
        product_id=product_id,
        buyer_id=user.id,
        seller_id=product.seller_id,
        amount=amount,
        message=data.get('message', ''),
        status='pending'
    )

    try:
        db.session.add(new_offer)
        db.session.commit()

        return jsonify({
            "message": "Oferta enviada exitosamente",
            "offer": new_offer.serialize()
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/seller/offers', methods=['GET'])
@jwt_required()
def get_seller_offers():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or user.role != "seller":
        return jsonify({"error": "Acceso denegado"}), 403

    status = request.args.get('status', '')
    sort = request.args.get('sort', 'newest')

    query = Offer.query.filter_by(seller_id=user.id)
    if status:
        query = query.filter_by(status=status)

    if sort == 'newest':
        query = query.order_by(Offer.created_at.desc())
    elif sort == 'oldest':
        query = query.order_by(Offer.created_at.asc())
    elif sort == 'amount_high':
        query = query.order_by(Offer.amount.desc())
    elif sort == 'amount_low':
        query = query.order_by(Offer.amount.asc())

    offers = query.all()
    pending_count = Offer.query.filter_by(seller_id=user.id, status='pending').count()
    accepted_count = Offer.query.filter_by(seller_id=user.id, status='accepted').count()
    rejected_count = Offer.query.filter_by(seller_id=user.id, status='rejected').count()

    return jsonify({
        "offers": [offer.serialize() for offer in offers],
        "stats": {
            "pending": pending_count,
            "accepted": accepted_count,
            "rejected": rejected_count,
            "total": len(offers)
        }
    }), 200


@api.route('/offers/<int:offer_id>/accept', methods=['PUT'])
@jwt_required()
def accept_offer(offer_id):
    user_id = get_jwt_identity()

    offer = Offer.query.get(offer_id)
    if not offer:
        return jsonify({"error": "Oferta no encontrada"}), 404

    if offer.seller_id != int(user_id):
        return jsonify({"error": "No tienes permiso para gestionar esta oferta"}), 403

    if offer.status != 'pending':
        return jsonify({"error": "Esta oferta ya fue procesada"}), 400

    data = request.get_json() or {}

    try:
        offer.status = 'accepted'
        offer.seller_response = data.get('message', 'Oferta aceptada')
        offer.responded_at = datetime.datetime.utcnow()

        other_offers = Offer.query.filter(
            Offer.product_id == offer.product_id,
            Offer.id != offer_id,
            Offer.status == 'pending'
        ).all()

        for other in other_offers:
            other.status = 'rejected'
            other.seller_response = 'Otra oferta fue aceptada'
            other.responded_at = datetime.datetime.utcnow()

        db.session.commit()

        return jsonify({
            "message": "Oferta aceptada exitosamente",
            "offer": offer.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/offers/<int:offer_id>/reject', methods=['PUT'])
@jwt_required()
def reject_offer(offer_id):
    user_id = get_jwt_identity()

    offer = Offer.query.get(offer_id)
    if not offer:
        return jsonify({"error": "Oferta no encontrada"}), 404

    if offer.seller_id != int(user_id):
        return jsonify({"error": "No tienes permiso para gestionar esta oferta"}), 403

    if offer.status != 'pending':
        return jsonify({"error": "Esta oferta ya fue procesada"}), 400

    data = request.get_json() or {}

    try:
        offer.status = 'rejected'
        offer.seller_response = data.get('message', 'Oferta rechazada')
        offer.responded_at = datetime.datetime.utcnow()

        db.session.commit()

        return jsonify({
            "message": "Oferta rechazada",
            "offer": offer.serialize()
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route('/buyer/offers', methods=['GET'])
@jwt_required()
def get_buyer_offers():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user or user.role != "buyer":
        return jsonify({"error": "Acceso denegado"}), 403

    status = request.args.get('status', '')

    query = Offer.query.filter_by(buyer_id=user.id)
    if status:
        query = query.filter_by(status=status)

    offers = query.order_by(Offer.created_at.desc()).all()

    return jsonify({
        "offers": [offer.serialize() for offer in offers]
    }), 200


@api.route('/upload/product-images', methods=['POST'])
@jwt_required()
def upload_product_images():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user.role != "seller":
        return jsonify({"error": "Access denied, user is not a seller"}), 403

    files = request.files.getlist('images[]')
    if not files:
        return jsonify({"error": "No image files provided"}), 400
    if len(files) > 5:
        return jsonify({"error": "Maximum 5 images allowed per product"}), 400

    results = upload_multiple_images(files, folder=f"revistete/products/{user_id}")
    successful = [r for r in results if r["success"]]
    failed = [r for r in results if not r["success"]]
    if successful:
        return jsonify({
            "message": f"{len(successful)} images uploaded successfully",
            "uploaded": successful,
            "failed": failed
        }), 200
    else:
        return jsonify({
            "error": "Failed to upload all images",
            "details": failed
        }), 500
