import jwt
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from functools import wraps
from flask import request, jsonify, g
from app.core.config import settings

def create_access_token(subject: str, role: str, is_verified: bool = False) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject), "role": role, "ver": is_verified}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return decoded_token
    except jwt.PyJWTError:
        return None

def require_role(roles: List[str], allow_unverified: bool = False):
    """
    Decorator that enforces JWT authentication and role-based access.

    Args:
        roles: List of role strings that are permitted to access the endpoint.
        allow_unverified: If True, skip the doctor verification check.
                          Use this for endpoints that unverified doctors must
                          access (e.g., profile creation during onboarding,
                          /auth/me).
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return jsonify({"msg": "Missing or invalid Authorization header"}), 401
                
            token = auth_header.split(" ")[1]
            token_data = decode_access_token(token)
            
            if not token_data:
                return jsonify({"msg": "Invalid token"}), 401
                
            user_role = token_data.get("role")
            if user_role not in roles:
                return jsonify({"msg": "Insufficient permissions"}), 403
                
            if user_role == "doctor" and not allow_unverified and not token_data.get("ver", False):
                return jsonify({"msg": "Doctor account pending admin verification"}), 403
                
            g.current_user = token_data
            return f(*args, **kwargs)
        return decorated_function
    return decorator
