from flask import Blueprint, request, jsonify
from app.models.user import User, UserRole
from app import db
from app.core.security import create_access_token
import hashlib
import uuid

auth_bp = Blueprint("auth", __name__)

def hash_password(password: str) -> str:
    # Use simple str hashing for demo purposes; recommend bcrypt in prod
    return hashlib.sha256(password.encode()).hexdigest()

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    role_str = data.get("role", "guest")
    
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already registered"}), 400
        
    try:
        role = UserRole(role_str)
    except ValueError:
        return jsonify({"msg": "Invalid role"}), 400
        
    user = User(email=email, password_hash=hash_password(password), role=role)
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"msg": "User created successfully", "user_id": user.id}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    
    user = User.query.filter_by(email=email).first()
    if not user or user.password_hash != hash_password(password):
        return jsonify({"msg": "Incorrect email or password"}), 401
        
    access_token = create_access_token(subject=user.id, role=user.role.value, is_verified=user.is_verified)
    
    # we have to cancel this or something like that , once you login you actually dont have to see your credentials again
    return jsonify({
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role.value,
            "is_verified": user.is_verified
        }
    }), 200

@auth_bp.route("/anonymous-guest", methods=["POST"])
def anonymous_guest():
    guest_id = str(uuid.uuid4())
    access_token = create_access_token(subject=guest_id, role="guest", is_verified=True)
    
    return jsonify({
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": guest_id,
            "role": "guest"
        }
    }), 200
