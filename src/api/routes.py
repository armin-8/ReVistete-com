# """
# This module takes care of starting the API Server, Loading the DB and Adding the endpoints
# """
# from flask import Flask, request, jsonify, url_for, Blueprint
# from api.models import db, User
# from api.utils import generate_sitemap, APIException
# from flask_cors import CORS

# api = Blueprint('api', __name__)

# # Allow CORS requests to this API
# CORS(api)


# @api.route('/hello', methods=['POST', 'GET'])
# def handle_hello():

#     response_body = {
#         "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
#     }

#     return jsonify(response_body), 200
# src/api/routes.py (modificación)

from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Product, ProductImage
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import datetime

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
    products = Product.query.filter_by(seller_id=user.id).all()

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
        db.session.add(new_product)
        db.session.commit()

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
