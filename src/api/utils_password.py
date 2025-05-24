# src/api/utils_password.py

import os
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired

SECRET = os.getenv("RESET_SECRET", "cámbiame")   # Pon un secreto real en tu .env
SALT   = "password-reset-salt"
TS     = URLSafeTimedSerializer(SECRET, salt=SALT)

def generate_reset_token(user_id: int) -> str:
    return TS.dumps({"uid": user_id})

def verify_reset_token(token: str, max_age=3600) -> int | None:
    try:
        data = TS.loads(token, max_age=max_age)
        return data.get("uid")
    except (BadSignature, SignatureExpired):
        return None
