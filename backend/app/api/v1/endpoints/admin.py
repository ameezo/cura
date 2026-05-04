from flask import Blueprint, jsonify
from app.models.user import User, UserRole
from app.core.security import require_role
from app import db

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/doctors", methods=["GET"])
@require_role(["admin"])
def list_doctors():
    """Returns all users registered as doctors, with verification status."""
    doctors = User.query.filter_by(role=UserRole.DOCTOR).order_by(User.id.desc()).all()
    return jsonify([
        {
            "id": d.id,
            "email": d.email,
            "is_verified": d.is_verified,
            "has_profile": d.doctor_profile is not None,
            "profile_name": (
                f"{d.doctor_profile.first_name} {d.doctor_profile.last_name}"
                if d.doctor_profile else None
            ),
            "specialty": d.doctor_profile.specialty if d.doctor_profile else None,
        }
        for d in doctors
    ]), 200


@admin_bp.route("/users", methods=["GET"])
@require_role(["admin"])
def list_users():
    """Returns all users with basic info (admin overview)."""
    users = User.query.order_by(User.id.desc()).all()
    return jsonify([
        {
            "id": u.id,
            "email": u.email,
            "role": u.role.value,
            "is_verified": u.is_verified,
        }
        for u in users
    ]), 200


@admin_bp.route("/verify-doctor/<int:user_id>", methods=["PUT"])
@require_role(["admin"])
def verify_doctor(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    if user.role.value != "doctor":
        return jsonify({"msg": "User is not registered as a doctor"}), 400

    user.is_verified = True
    db.session.commit()

    return jsonify({"msg": "Doctor verified successfully. They can now log in."}), 200


@admin_bp.route("/revoke-doctor/<int:user_id>", methods=["PUT"])
@require_role(["admin"])
def revoke_doctor(user_id):
    """Revoke a doctor's verification (e.g., if credentials are invalid)."""
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    if user.role.value != "doctor":
        return jsonify({"msg": "User is not registered as a doctor"}), 400

    user.is_verified = False
    db.session.commit()

    return jsonify({"msg": "Doctor verification revoked."}), 200
