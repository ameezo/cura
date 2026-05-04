from flask import Blueprint, request, jsonify, g
from app.models.user import User, UserRole
from app import db
from app.core.security import create_access_token, require_role
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
    
    # Security: Only patient and doctor can self-register
    # Admin accounts must be created manually in the database
    if role not in (UserRole.PATIENT, UserRole.DOCTOR):
        return jsonify({"msg": "Can only register as patient or doctor"}), 400
        
    user = User(email=email, password_hash=hash_password(password), role=role)
    db.session.add(user)
    db.session.commit()
    
    # Return JWT so user is auto-logged-in after registration
    access_token = create_access_token(
        subject=user.id, role=user.role.value, is_verified=user.is_verified
    )
    has_profile = False
    profile_id = None
    
    return jsonify({
        "msg": "User created successfully",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role.value,
            "is_verified": user.is_verified,
            "has_profile": has_profile,
            "profile_id": profile_id,
        }
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    
    user = User.query.filter_by(email=email).first()
    if not user or user.password_hash != hash_password(password):
        return jsonify({"msg": "Incorrect email or password"}), 401
        
    access_token = create_access_token(subject=user.id, role=user.role.value, is_verified=user.is_verified)
    
    has_profile = False
    profile_id = None
    name = None
    if user.role == UserRole.ADMIN:
        # Admins always skip onboarding, but may have a profile
        has_profile = True
        if user.admin_profile:
            profile_id = user.admin_profile.id
            name = user.admin_profile.full_name
    elif user.role == UserRole.PATIENT:
        if user.patient_profile:
            has_profile = True
            profile_id = user.patient_profile.id
            name = f"{user.patient_profile.first_name} {user.patient_profile.last_name}"
    elif user.role == UserRole.DOCTOR:
        if user.doctor_profile:
            has_profile = True
            profile_id = user.doctor_profile.id
            name = user.doctor_profile.full_name

    return jsonify({
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role.value,
            "is_verified": user.is_verified,
            "has_profile": has_profile,
            "profile_id": profile_id,
            "name": name,
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

@auth_bp.route("/me", methods=["GET"])
@require_role(["guest", "patient", "doctor", "admin"])
def get_me():
    user_id = int(g.current_user["sub"])
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    has_profile = False
    profile_id = None
    name = None
    if user.role == UserRole.ADMIN:
        has_profile = True
        if user.admin_profile:
            profile_id = user.admin_profile.id
            name = user.admin_profile.full_name
    elif user.role == UserRole.PATIENT:
        if user.patient_profile:
            has_profile = True
            profile_id = user.patient_profile.id
            name = f"{user.patient_profile.first_name} {user.patient_profile.last_name}"
    elif user.role == UserRole.DOCTOR:
        if user.doctor_profile:
            has_profile = True
            profile_id = user.doctor_profile.id
            name = user.doctor_profile.full_name
    
    return jsonify({
        "id": user.id,
        "email": user.email,
        "role": user.role.value,
        "is_verified": user.is_verified,
        "has_profile": has_profile,
        "profile_id": profile_id,
        "name": name,
    }), 200
