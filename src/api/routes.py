
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Product, ProductImage, Sale
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask import Blueprint, jsonify
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
    required_fields = ["email", "first_name", "last_name", "username", "password", "role"]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"Missing required field: {field}"}), 400

    # Validar que el role sea exactamente "buyer"
    if data["role"] != "buyer":
        return jsonify({"error": "Invalid role, must be 'buyer'"}), 400

    # Verificar si el email ya existe
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    # Verificar si el username ya existe
    if User.query.filter_by(username=data["username"]).first():
        return jsonify({"error": "Username already exists"}), 400

    # Crear nuevo usuario comprador
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

        # Crear token JWT
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
