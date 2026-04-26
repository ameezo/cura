from flask import Blueprint, jsonify
from app.models.user import User
from app.core.security import require_role
from app import db

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/verify-doctor/<int:user_id>", methods=["PUT"])
@require_role(["admin"])
# question , if i send a json request with the admin role , am i able to accept my self as a doctor ?
def verify_doctor(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    if user.role.value != "doctor":
        return jsonify({"msg": "User is not registered as a doctor"}), 400
        
    user.is_verified = True
    db.session.commit()
    
    return jsonify({"msg": "Doctor verified successfully. They can now log in."}), 200
