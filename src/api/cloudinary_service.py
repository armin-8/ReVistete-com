# 🎯 EXPLICACIÓN: Este archivo maneja toda la lógica de Cloudinary
# Centraliza la configuración y las funciones de subida de imágenes

import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
import os
from flask import jsonify

# 📍 Configuración de Cloudinary usando variables de entorno
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)


def upload_image(file, folder="revistete"):
    """
    🎯 Sube una imagen a Cloudinary

    Args:
        file: Archivo de imagen desde el request
        folder: Carpeta en Cloudinary donde se guardará

    Returns:
        dict: URL de la imagen o error
    """
    try:
        # Subir imagen a Cloudinary
        upload_result = cloudinary.uploader.upload(
            file,
            folder=folder,  # Organiza las imágenes en carpetas
            resource_type="image",
            allowed_formats=['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation=[
                # Limita el tamaño máximo
                {'width': 1000, 'height': 1000, 'crop': 'limit'},
                {'quality': 'auto'},  # Optimiza la calidad automáticamente
                {'fetch_format': 'auto'}  # Convierte al mejor formato
            ]
        )

        return {
            "success": True,
            "url": upload_result['secure_url'],
            "public_id": upload_result['public_id']
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def delete_image(public_id):
    """
    🎯 Elimina una imagen de Cloudinary

    Args:
        public_id: ID público de la imagen en Cloudinary

    Returns:
        dict: Resultado de la operación
    """
    try:
        result = cloudinary.uploader.destroy(public_id)
        return {
            "success": result['result'] == 'ok',
            "result": result
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def upload_multiple_images(files, folder="revistete/products"):
    """
    🎯 Sube múltiples imágenes (para productos con varias fotos)

    Args:
        files: Lista de archivos de imagen
        folder: Carpeta en Cloudinary

    Returns:
        list: Lista de URLs o errores
    """
    results = []

    for file in files:
        result = upload_image(file, folder)
        results.append(result)

    return results
