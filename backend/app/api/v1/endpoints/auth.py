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
        
    if len(password) < 6:
        return jsonify({"msg": "Password must be at least 6 characters long"}), 400
        
    import re
    if not re.search(r"[a-zA-Z]", password) or not re.search(r"\d", password) or not re.search(r"[^a-zA-Z\d\s]", password):
        return jsonify({"msg": "Password must contain a letter, a number, and a special character"}), 400
        
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
@require_role(["guest", "patient", "doctor", "admin"], allow_unverified=True)
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

@auth_bp.route("/update-password", methods=["PUT"])
@require_role(["guest", "patient", "doctor", "admin"], allow_unverified=True)
def update_password():
    user_id = int(g.current_user["sub"])
    data = request.json
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    
    if not current_password or not new_password:
        return jsonify({"msg": "Both current and new passwords are required"}), 400
        
    if len(new_password) < 6:
        return jsonify({"msg": "New password must be at least 6 characters long."}), 400
        
    import re
    if not re.search(r"[a-zA-Z]", new_password) or not re.search(r"\d", new_password) or not re.search(r"[^a-zA-Z\d\s]", new_password):
        return jsonify({"msg": "New password must contain a letter, a number, and a special character."}), 400
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    if user.password_hash != hash_password(current_password):
        return jsonify({"msg": "Incorrect current password"}), 400
        
    user.password_hash = hash_password(new_password)
    db.session.commit()
    
    return jsonify({"msg": "Password updated successfully"}), 200

@auth_bp.route("/delete-account", methods=["DELETE"])
@require_role(["guest", "patient", "doctor", "admin"], allow_unverified=True)
def delete_account():
    if g.current_user["role"] == "guest":
        return jsonify({"msg": "Guest account cleared"}), 200
        
    user_id = int(g.current_user["sub"])
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    try:
        # Manually cascade deletes to avoid IntegrityError missing ON DELETE CASCADE
        from app.models.ai_conversation import AIConversation, AIMessage
        from app.models.appointment import Appointment
        from app.models.medication import Medication
        from app.models.lab_result import LabResult
        from app.models.reminder import Reminder
        from app.models.availability import DoctorAvailability
        from app.models.notification_log import NotificationLog
        
        # 1. AI Conversations
        convs = AIConversation.query.filter_by(user_id=user.id).all()
        for c in convs:
            AIMessage.query.filter_by(conversation_id=c.id).delete()
        AIConversation.query.filter_by(user_id=user.id).delete()
        
        # 2. Profiles and Dependencies
        if user.role == UserRole.PATIENT and user.patient_profile:
            p_id = user.patient_profile.id
            # Reminder logs
            rems = Reminder.query.filter_by(patient_id=p_id).all()
            for r in rems:
                NotificationLog.query.filter_by(reminder_id=r.id).delete()
            Reminder.query.filter_by(patient_id=p_id).delete()
            LabResult.query.filter_by(patient_id=p_id).delete()
            Medication.query.filter_by(patient_id=p_id).delete()
            Appointment.query.filter_by(patient_id=p_id).delete()
            db.session.delete(user.patient_profile)
            
        elif user.role == UserRole.DOCTOR and user.doctor_profile:
            d_id = user.doctor_profile.id
            LabResult.query.filter_by(doctor_id=d_id).delete()
            
            # For appointments, deleting a doctor means appointments need to be deleted
            apps = Appointment.query.filter_by(doctor_id=d_id).all()
            for a in apps:
                Reminder.query.filter_by(appointment_id=a.id).delete()
            Appointment.query.filter_by(doctor_id=d_id).delete()
            
            DoctorAvailability.query.filter_by(doctor_id=d_id).delete()
            db.session.delete(user.doctor_profile)
            
        elif user.role == UserRole.ADMIN and user.admin_profile:
            db.session.delete(user.admin_profile)
            
        db.session.delete(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({"msg": "Failed to delete account due to constraints"}), 500
    
    return jsonify({"msg": "Account deleted successfully"}), 200
