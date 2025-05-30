
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

# Allow CORS requests to this API
CORS(api)


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

    # Validar campos requeridos
    required_fields = ["email", "password",
                       "first_name", "last_name", "username"]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Verificar si el email ya existe
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    # Verificar si el username ya existe
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 400

    # Crear nuevo usuario con rol de vendedor
    new_user = User(
        email=data["email"],
        password=data["password"],
        first_name=data["first_name"],
        last_name=data["last_name"],
        username=data["username"],
        role="seller",
        is_active=True
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
    # Obtener ID del usuario del token
    user_id = get_jwt_identity()

    # Verificar que el usuario existe y es vendedor
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role != "seller":
        return jsonify({"error": "Access denied, user is not a seller"}), 403

    # Obtener productos del vendedor
    print(f"DEBUG: User ID: {user.id}")
    products = Product.query.filter_by(seller_id=user.id).all()
    print(f"DEBUG: Found {len(products)} products")
    for product in products:
        print(
            f"DEBUG: Product: {product.title}, ID: {product.id}, Seller: {product.seller_id}")

    return jsonify({
        "products": [product.serialize() for product in products]
    }), 200

# Endpoint para crear un nuevo producto


@api.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    # Obtener ID del usuario del token
    user_id = get_jwt_identity()

    # Verificar que el usuario existe y es vendedor
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role != "seller":
        return jsonify({"error": "Access denied, user is not a seller"}), 403

    # Validar datos del producto
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400

    data = request.get_json()

    # Campos requeridos para un producto
    required_fields = ["title", "description",
                       "category", "size", "condition", "price"]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Crear nuevo producto
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
        print(f"DEBUG CREATE: About to save product for user {user.id}")
        print(f"DEBUG CREATE: Product title: {new_product.title}")
        db.session.add(new_product)
        db.session.commit()
        print(f"DEBUG CREATE: Product saved with ID {new_product.id}")

        # Procesar imágenes si las hay
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

    # Validar campos requeridos
    if "email" not in data or "password" not in data:
        return jsonify({"error": "Missing email or password"}), 400

    # Buscar usuario por email
    user = User.query.filter_by(email=data["email"]).first()

    # Verificar si el usuario existe y la contraseña es correcta
    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    # Crear token de acceso
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

    # Validar campos requeridos
    required_fields = ["email", "password", "first_name",
                       "last_name", "username", "address", "city"]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Verificar si el email ya existe
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    # Verificar si el username ya existe
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 400

    # Crear nuevo usuario con rol de comprador
    new_user = User(
        email=data["email"],
        password=data["password"],
        first_name=data["first_name"],
        last_name=data["last_name"],
        username=data["username"],
        role="buyer",
        is_active=True
    )

    # Crear o actualizar información de dirección
    # Esto requiere un modelo adicional o campos en el modelo usuario
    # Para simplificar, vamos a almacenar estos datos en una propiedad
    new_user.address = data["address"]
    new_user.city = data["city"]
    new_user.zip_code = data.get("zip_code", "")

    try:
        db.session.add(new_user)
        db.session.commit()

        # Crear token de acceso
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


# Endpoint para obtener las ventas del vendedor


@api.route('/seller/sales', methods=['GET'])
@jwt_required()
def get_seller_sales():
    # Obtener ID del usuario del token
    user_id = get_jwt_identity()

    # Verificar que el usuario existe y es vendedor
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role != "seller":
        return jsonify({"error": "Access denied, user is not a seller"}), 403

    # Obtener ventas del vendedor
    sales = Sale.query.filter_by(seller_id=user.id).order_by(
        Sale.created_at.desc()).all()

    # Calcular ganancias totales
    total_earnings = sum(sale.price for sale in sales)

    return jsonify({
        "sales": [sale.serialize() for sale in sales],
        "total_earnings": total_earnings,
        "total_sales": len(sales)
    }), 200

# Endpoint para obtener el perfil del vendedor


@api.route('/seller/profile', methods=['GET'])
@jwt_required()
def get_seller_profile():
    # Obtener ID del usuario del token
    user_id = get_jwt_identity()

    # Verificar que el usuario existe y es vendedor
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
        # "store_name": user.store_name,
        # "store_description": user.store_description
    }), 200

# Endpoint para actualizar el perfil del vendedor


@api.route('/seller/profile', methods=['PUT'])
@jwt_required()
def update_seller_profile():
    # Obtener ID del usuario del token
    user_id = get_jwt_identity()

    # Verificar que el usuario existe y es vendedor
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role != "seller":
        return jsonify({"error": "Access denied, user is not a seller"}), 403

    # Validar datos del request
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400

    data = request.get_json()

    # Validar campos requeridos
    required_fields = ["first_name", "last_name", "username", "email"]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Verificar si el email ya existe (para otro usuario)
    if data["email"] != user.email:
        existing_email = User.query.filter_by(email=data["email"]).first()
        if existing_email:
            return jsonify({"error": "Email already exists"}), 400

    # Verificar si el username ya existe (para otro usuario)
    if data["username"] != user.username:
        existing_username = User.query.filter_by(
            username=data["username"]).first()
        if existing_username:
            return jsonify({"error": "Username already exists"}), 400

    # Verificar contraseña actual si se quiere cambiar
    if data.get("new_password"):
        if not data.get("current_password"):
            return jsonify({"error": "Current password is required to change password"}), 400

        if not user.check_password(data["current_password"]):
            return jsonify({"error": "Current password is incorrect"}), 400

        if len(data["new_password"]) < 6:
            return jsonify({"error": "New password must be at least 6 characters long"}), 400

    try:
        # Actualizar campos básicos
        user.first_name = data["first_name"]
        user.last_name = data["last_name"]
        user.username = data["username"]
        user.email = data["email"]
        user.phone = data.get("phone", user.phone)
        # user.store_name = data.get("store_name", user.store_name)
        # user.store_description = data.get(
        #     "store_description", user.store_description)

        # Actualizar contraseña si se proporcionó
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

    # Buscar usuario por email
    user = User.query.filter_by(email=email).first()
    if not user:
        # Por seguridad, no revelar si el email existe o no
        return jsonify({"message": "Si el correo existe, recibirás un enlace para restablecer tu contraseña"}), 200

    # Generar token único
    token = secrets.token_urlsafe(32)

    # Guardar token con tiempo de expiración (24 horas)
    expiration = datetime.datetime.now() + datetime.timedelta(hours=24)
    password_reset_tokens[token] = {
        'user_id': user.id,
        'expiration': expiration
    }

    # En un entorno real, aquí enviarías un email con el enlace
    # Pero para desarrollo, simplemente devolvemos el token para pruebas
    frontend_url = request.headers.get('Origin', 'http://localhost:3000')
    reset_url = f"{frontend_url}/reset-password/{token}"

    # Para desarrollo/pruebas, devolver el token y la URL
    return jsonify({
        "message": "Si el correo existe, recibirás un enlace para restablecer tu contraseña",
        "debug_token": token,  # Solo para desarrollo
        "debug_url": reset_url  # Solo para desarrollo
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

    # Validar longitud de contraseña
    if len(new_password) < 6:
        return jsonify({"error": "New password must be at least 6 characters long"}), 400

    # Verificar token
    token_data = password_reset_tokens.get(token)
    if not token_data:
        return jsonify({"error": "Invalid or expired token"}), 400

    # Verificar expiración
    if datetime.datetime.now() > token_data['expiration']:
        # Eliminar token expirado
        password_reset_tokens.pop(token, None)
        return jsonify({"error": "Token has expired"}), 400

    # Obtener usuario
    user = User.query.get(token_data['user_id'])
    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        # Actualizar contraseña
        user.password = generate_password_hash(new_password)
        db.session.commit()

        # Eliminar token usado
        password_reset_tokens.pop(token, None)

        return jsonify({"message": "Password reset successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Endpoint público para obtener el catálogo de productos con filtros


@api.route('/products/catalog', methods=['GET'])
def get_products_catalog():
    """
    Obtiene el catálogo de productos con múltiples opciones de filtrado.
    No requiere autenticación para que los compradores puedan navegar libremente.

    Query Parameters:
    - gender: 'hombre', 'mujer', 'unisex' (género del producto)
    - category: categoría del producto (vestidos, camisetas, etc.)
    - subcategory: subcategoría específica
    - min_price: precio mínimo
    - max_price: precio máximo
    - size: talla específica
    - condition: estado del producto (new, like_new, good, etc.)
    - brand: marca del producto
    - color: color del producto
    - search: término de búsqueda en título y descripción
    - sort: ordenamiento (price_asc, price_desc, newest)
    - page: número de página (default: 1)
    - per_page: productos por página (default: 12)
    """

    # Obtener parámetros de la query con valores por defecto
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)

    # Limitar productos por página para evitar sobrecarga
    if per_page > 50:
        per_page = 50

    # Obtener filtros de la query
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

    # Construir la consulta base
    query = Product.query

    # Aplicar filtro de género a través de la categoría
    # Las categorías ahora vienen en formato: genero_categoria (ej: mujer_vestidos)
    if gender:
        if gender == 'hombre':
            # Filtrar categorías que empiecen con 'hombre_'
            query = query.filter(Product.category.like('hombre_%'))
        elif gender == 'mujer':
            # Filtrar categorías que empiecen con 'mujer_'
            query = query.filter(Product.category.like('mujer_%'))
        elif gender == 'unisex':
            # Filtrar categorías que empiecen con 'unisex_'
            query = query.filter(Product.category.like('unisex_%'))

    # Filtro por categoría específica
    if category:
        # Si viene solo la categoría sin género (ej: 'vestidos'), buscar en todas
        if '_' not in category:
            query = query.filter(
                db.or_(
                    # Busca '_vestidos' en cualquier género
                    Product.category.like(f'%_{category}'),
                    # O coincidencia parcial
                    Product.category.ilike(f'%{category}%')
                )
            )
        else:
            # Si viene con formato completo (ej: 'mujer_vestidos')
            query = query.filter(Product.category == category)

    # Filtro por subcategoría
    if subcategory:
        query = query.filter(Product.subcategory.ilike(f'%{subcategory}%'))

    # Filtro por rango de precio
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # Filtro por talla
    if size:
        query = query.filter(Product.size == size)

    # Filtro por condición/estado
    if condition:
        query = query.filter(Product.condition == condition)

    # Filtro por marca
    if brand:
        query = query.filter(Product.brand.ilike(f'%{brand}%'))

    # Filtro por color
    if color:
        query = query.filter(Product.color.ilike(f'%{color}%'))

    # Búsqueda por texto en título y descripción
    if search:
        search_term = f'%{search}%'
        query = query.filter(
            db.or_(
                Product.title.ilike(search_term),
                Product.description.ilike(search_term),
                Product.brand.ilike(search_term)
            )
        )

    # Aplicar ordenamiento
    if sort == 'price_asc':
        # Ordenar por precio ascendente
        query = query.order_by(Product.price.asc())
    elif sort == 'price_desc':
        # Ordenar por precio descendente
        query = query.order_by(Product.price.desc())
    elif sort == 'newest':
        # Ordenar por más recientes primero
        query = query.order_by(Product.created_at.desc())
    else:
        # Por defecto, ordenar por más recientes
        query = query.order_by(Product.created_at.desc())

    # Ejecutar paginación
    pagination = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    # Preparar respuesta con productos serializados
    products = [product.serialize() for product in pagination.items]

    # Obtener valores únicos para los filtros disponibles
    # Esto ayuda al frontend a mostrar qué filtros están disponibles
    available_filters = {
        "sizes": db.session.query(Product.size).distinct().all(),
        "brands": db.session.query(Product.brand).filter(Product.brand.isnot(None)).distinct().all(),
        "colors": db.session.query(Product.color).filter(Product.color.isnot(None)).distinct().all(),
        "conditions": db.session.query(Product.condition).distinct().all(),
    }

    # Limpiar los filtros disponibles (convertir de tuplas a lista)
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
    # Obtener ID del usuario del token
    user_id = get_jwt_identity()

    # Verificar que el usuario existe y es vendedor
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role != "seller":
        return jsonify({"error": "Access denied, user is not a seller"}), 403

    # Buscar el producto
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    # Verificar que el producto pertenece al vendedor
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
    # Obtener ID del usuario del token
    user_id = get_jwt_identity()

    # Verificar que el usuario existe y es vendedor
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role != "seller":
        return jsonify({"error": "Access denied, user is not a seller"}), 403

    # Buscar el producto
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    # Verificar que el producto pertenece al vendedor
    if product.seller_id != user.id:
        return jsonify({"error": "Access denied, this product belongs to another seller"}), 403

    # Validar datos
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400

    data = request.get_json()

    try:
        # Actualizar campos del producto
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

        # Actualizar imágenes si se proporcionan
        if "images" in data:
            # Eliminar imágenes existentes
            ProductImage.query.filter_by(product_id=product.id).delete()

            # Agregar nuevas imágenes
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
    # Obtener ID del usuario del token
    user_id = get_jwt_identity()

    # Verificar que el usuario existe
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Buscar el producto
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    # Si el usuario es el vendedor o es un comprador, puede ver el producto
    if user.role == "seller" and product.seller_id != user.id:
        # Si es vendedor pero no es su producto, verificar si tiene permisos
        # Aquí podrías implementar lógica adicional si los vendedores pueden ver productos de otros
        pass

    return jsonify(product.serialize()), 200

# Endpoint público para ver detalles de un producto (sin autenticación requerida)


@api.route('/products/<int:product_id>/details', methods=['GET'])
def get_product_details(product_id):
    """
    Obtiene los detalles completos de un producto para la página de detalle.
    Incluye información del vendedor y productos relacionados.
    No requiere autenticación para que cualquiera pueda ver los productos.
    """
    product_id = request.view_args.get('product_id')

    # Buscar el producto con su vendedor
    product = Product.query.options(
        db.joinedload(Product.seller),
        db.joinedload(Product.images)
    ).get(product_id)

    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404

    # Serializar el producto con información adicional
    product_data = product.serialize()

    # Agregar información del vendedor (sin datos sensibles)
    product_data['seller'] = {
        'id': product.seller.id,
        'username': product.seller.username,
        'first_name': product.seller.first_name,
        'city': product.seller.city or 'No especificada',
        # Puedes agregar calificación cuando implementes ese sistema
        # 'rating': product.seller.rating,
        # 'total_sales': product.seller.total_sales
    }

    # Obtener otros productos del mismo vendedor (máximo 4)
    other_products = Product.query.filter(
        Product.seller_id == product.seller_id,
        Product.id != product_id
    ).limit(4).all()

    product_data['seller_other_products'] = [p.serialize()
                                             for p in other_products]

    # Obtener productos similares (misma categoría, diferente vendedor)
    similar_products = Product.query.filter(
        Product.category == product.category,
        Product.id != product_id
    ).limit(4).all()

    product_data['similar_products'] = [p.serialize()
                                        for p in similar_products]

    return jsonify(product_data), 200


# 🎯 NUEVO ENDPOINT: Subir imagen única
@api.route('/upload/image', methods=['POST'])
@jwt_required()
def upload_single_image():
    """
    Endpoint para subir una imagen a Cloudinary
    Espera un archivo con el nombre 'image' en el request
    """
    # Verificar que el usuario está autenticado
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Verificar que se envió un archivo
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']

    # Verificar que el archivo no está vacío
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # Subir imagen a Cloudinary
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


# ========== SISTEMA DE OFERTAS ==========

# Endpoint para crear una oferta en un producto


@api.route('/products/<int:product_id>/offers', methods=['POST'])
@jwt_required()
def create_offer():
    """
    Permite a un comprador hacer una oferta en un producto.
    El comprador envía el monto y un mensaje opcional.
    """
    product_id = request.view_args.get('product_id')
    user_id = get_jwt_identity()

    # Verificar que el usuario existe
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    # Solo los compradores pueden hacer ofertas
    if user.role != "buyer":
        return jsonify({"error": "Solo los compradores pueden hacer ofertas"}), 403

    # Obtener datos de la oferta
    data = request.get_json()
    if not data or 'amount' not in data:
        return jsonify({"error": "Debe especificar el monto de la oferta"}), 400

    # Buscar el producto
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Producto no encontrado"}), 404

    # Validar el monto de la oferta
    try:
        amount = float(data['amount'])
    except ValueError:
        return jsonify({"error": "El monto debe ser un número válido"}), 400

    # Validaciones del monto
    if amount <= 0:
        return jsonify({"error": "El monto debe ser mayor a 0"}), 400

    if amount > product.price:
        return jsonify({"error": "La oferta no puede ser mayor al precio del producto"}), 400

    # Sugerencia: ofertas muy bajas (menos del 50% del precio)
    if amount < (product.price * 0.5):
        return jsonify({
            "warning": "Tu oferta es muy baja, es poco probable que sea aceptada",
            "suggested_min": product.price * 0.7
        }), 400

    # Verificar si ya tiene una oferta pendiente en este producto
    existing_offer = Offer.query.filter_by(
        product_id=product_id,
        buyer_id=user.id,
        status='pending'
    ).first()

    if existing_offer:
        return jsonify({"error": "Ya tienes una oferta pendiente en este producto"}), 400

    # Crear la nueva oferta
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


# Endpoint para que el vendedor vea sus ofertas recibidas
@api.route('/seller/offers', methods=['GET'])
@jwt_required()
def get_seller_offers():
    """
    Obtiene todas las ofertas recibidas por el vendedor.
    Incluye filtros por estado y ordenamiento.
    """
    user_id = get_jwt_identity()

    # Verificar que es un vendedor
    user = User.query.get(int(user_id))
    if not user or user.role != "seller":
        return jsonify({"error": "Acceso denegado"}), 403

    # Obtener parámetros de filtrado
    status = request.args.get('status', '')  # pending, accepted, rejected
    # newest, oldest, amount_high, amount_low
    sort = request.args.get('sort', 'newest')

    # Construir query base
    query = Offer.query.filter_by(seller_id=user.id)

    # Filtrar por estado si se especifica
    if status:
        query = query.filter_by(status=status)

    # Aplicar ordenamiento
    if sort == 'newest':
        query = query.order_by(Offer.created_at.desc())
    elif sort == 'oldest':
        query = query.order_by(Offer.created_at.asc())
    elif sort == 'amount_high':
        query = query.order_by(Offer.amount.desc())
    elif sort == 'amount_low':
        query = query.order_by(Offer.amount.asc())

    # Ejecutar query
    offers = query.all()

    # Contar ofertas por estado para el dashboard
    pending_count = Offer.query.filter_by(
        seller_id=user.id, status='pending').count()
    accepted_count = Offer.query.filter_by(
        seller_id=user.id, status='accepted').count()
    rejected_count = Offer.query.filter_by(
        seller_id=user.id, status='rejected').count()

    return jsonify({
        "offers": [offer.serialize() for offer in offers],
        "stats": {
            "pending": pending_count,
            "accepted": accepted_count,
            "rejected": rejected_count,
            "total": len(offers)
        }
    }), 200


# Endpoint para aceptar una oferta
@api.route('/offers/<int:offer_id>/accept', methods=['PUT'])
@jwt_required()
def accept_offer(offer_id):
    """
    Permite al vendedor aceptar una oferta.
    Cuando se acepta, cambia el estado a 'accepted'.
    """
    user_id = get_jwt_identity()

    # Buscar la oferta
    offer = Offer.query.get(offer_id)
    if not offer:
        return jsonify({"error": "Oferta no encontrada"}), 404

    # Verificar que el usuario es el vendedor del producto
    if offer.seller_id != int(user_id):
        return jsonify({"error": "No tienes permiso para gestionar esta oferta"}), 403

    # Verificar que la oferta está pendiente
    if offer.status != 'pending':
        return jsonify({"error": "Esta oferta ya fue procesada"}), 400

    # Obtener mensaje de respuesta opcional
    data = request.get_json() or {}

    try:
        # Actualizar el estado de la oferta
        offer.status = 'accepted'
        offer.seller_response = data.get('message', 'Oferta aceptada')
        offer.responded_at = datetime.datetime.utcnow()

        # Rechazar automáticamente otras ofertas pendientes del mismo producto
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


# Endpoint para rechazar una oferta
@api.route('/offers/<int:offer_id>/reject', methods=['PUT'])
@jwt_required()
def reject_offer(offer_id):
    """
    Permite al vendedor rechazar una oferta.
    Puede incluir un mensaje explicando el rechazo.
    """
    user_id = get_jwt_identity()

    # Buscar la oferta
    offer = Offer.query.get(offer_id)
    if not offer:
        return jsonify({"error": "Oferta no encontrada"}), 404

    # Verificar que el usuario es el vendedor del producto
    if offer.seller_id != int(user_id):
        return jsonify({"error": "No tienes permiso para gestionar esta oferta"}), 403

    # Verificar que la oferta está pendiente
    if offer.status != 'pending':
        return jsonify({"error": "Esta oferta ya fue procesada"}), 400

    # Obtener mensaje de respuesta opcional
    data = request.get_json() or {}

    try:
        # Actualizar el estado de la oferta
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


# Endpoint para que el comprador vea sus ofertas enviadas
@api.route('/buyer/offers', methods=['GET'])
@jwt_required()
def get_buyer_offers():
    """
    Obtiene todas las ofertas enviadas por el comprador.
    Incluye el estado actual de cada oferta.
    """
    user_id = get_jwt_identity()

    # Verificar que es un comprador
    user = User.query.get(int(user_id))
    if not user or user.role != "buyer":
        return jsonify({"error": "Acceso denegado"}), 403

    # Obtener parámetros de filtrado
    status = request.args.get('status', '')

    # Construir query
    query = Offer.query.filter_by(buyer_id=user.id)

    if status:
        query = query.filter_by(status=status)

    # Ordenar por más recientes primero
    offers = query.order_by(Offer.created_at.desc()).all()

    return jsonify({
        "offers": [offer.serialize() for offer in offers]
    }), 200


# 🎯 NUEVO ENDPOINT: Subir múltiples imágenes para productos
@api.route('/upload/product-images', methods=['POST'])
@jwt_required()
def upload_product_images():
    """
    Endpoint para subir múltiples imágenes de productos
    Espera archivos con nombres 'images[]' en el request
    """
    # Verificar que el usuario es vendedor
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.role != "seller":
        return jsonify({"error": "Access denied, user is not a seller"}), 403

    # Obtener archivos del request
    files = request.files.getlist('images[]')

    if not files:
        return jsonify({"error": "No image files provided"}), 400

    # Verificar que no se excedan 5 imágenes
    if len(files) > 5:
        return jsonify({"error": "Maximum 5 images allowed per product"}), 400

    # Subir imágenes
    results = upload_multiple_images(
        files, folder=f"revistete/products/{user_id}")

    # Filtrar resultados exitosos y fallidos
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
