from flask import Blueprint, jsonify, request, g
from app.models.user import User, UserRole
from app.models.admin_profile import AdminProfile
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
                d.doctor_profile.full_name
                if d.doctor_profile else None
            ),
            "specialty": d.doctor_profile.specialization if d.doctor_profile else None,
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


# ── Admin Profile Endpoints ──────────────────────────────────────────────────


@admin_bp.route("/profile", methods=["GET"])
@require_role(["admin"])
def get_admin_profile():
    """Returns the current admin's profile info."""
    user_id = int(g.current_user["sub"])
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    profile = user.admin_profile
    return jsonify({
        "id": user.id,
        "email": user.email,
        "role": user.role.value,
        "is_verified": user.is_verified,
        "has_profile": profile is not None,
        "profile": {
            "full_name": profile.full_name,
            "phone_number": profile.phone_number,
            "department": profile.department,
            "created_at": profile.created_at.isoformat() if profile.created_at else None,
            "updated_at": profile.updated_at.isoformat() if profile.updated_at else None,
        } if profile else None,
    }), 200


@admin_bp.route("/profile", methods=["PUT"])
@require_role(["admin"])
def update_admin_profile():
    """Create or update the current admin's profile."""
    user_id = int(g.current_user["sub"])
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    data = request.json
    full_name = data.get("full_name")
    if not full_name:
        return jsonify({"msg": "full_name is required"}), 400

    profile = user.admin_profile
    if profile is None:
        # Create new profile
        profile = AdminProfile(
            user_id=user_id,
            full_name=full_name,
            phone_number=data.get("phone_number"),
            department=data.get("department"),
        )
        db.session.add(profile)
    else:
        # Update existing profile
        profile.full_name = full_name
        if "phone_number" in data:
            profile.phone_number = data["phone_number"]
        if "department" in data:
            profile.department = data["department"]

    db.session.commit()

    return jsonify({
        "msg": "Admin profile saved successfully.",
        "profile": {
            "full_name": profile.full_name,
            "phone_number": profile.phone_number,
            "department": profile.department,
        }
    }), 200
