from flask import Blueprint, request, jsonify, g
from app.core.security import require_role
from app.schemas.doctor import DoctorCreate, DoctorUpdate, DoctorResponse
from app.services import doctor_service
from pydantic import ValidationError

doctors_bp = Blueprint("doctors", __name__)

@doctors_bp.route("/", methods=["POST"])
@require_role(["doctor", "admin"], allow_unverified=True)  # Unverified doctors must be able to create their profile during onboarding
def create_doctor():
    payload = request.json.copy() if request.json else {}
    current_user = g.current_user
    
    # IDOR Protection: Doctors can only seed profiles connecting to their own user accounts
    if current_user["role"] == "doctor":
        payload["user_id"] = int(current_user["sub"])
        
    try:
        data = DoctorCreate(**payload)
    except ValidationError as e:
        return jsonify(e.errors()), 400
        
    if doctor_service.get_doctor_by_user_id(data.user_id):
        return jsonify({"msg": "Doctor profile already exists for this user"}), 400
        
    doctor = doctor_service.create_doctor(data.model_dump())
    return jsonify(DoctorResponse.model_validate(doctor).model_dump(mode="json")), 201

@doctors_bp.route("/<int:doctor_id>", methods=["GET"])
@require_role(["guest", "patient", "doctor", "admin"], allow_unverified=True)  # Unverified doctors need to view their own profile
def get_doctor(doctor_id):
    doctor = doctor_service.get_doctor_by_id(doctor_id)
    if not doctor:
        return jsonify({"msg": "Doctor not found"}), 404
    return jsonify(DoctorResponse.model_validate(doctor).model_dump(mode="json")), 200

@doctors_bp.route("/", methods=["GET"])
@require_role(["guest", "patient", "doctor", "admin"])
def list_doctors():
    skip = request.args.get("skip", 0, type=int)
    limit = request.args.get("limit", 100, type=int)
    doctors = doctor_service.get_all_doctors(skip=skip, limit=limit)
    return jsonify([DoctorResponse.model_validate(d).model_dump(mode="json") for d in doctors]), 200

@doctors_bp.route("/<int:doctor_id>", methods=["PUT"])
@require_role(["doctor", "admin"], allow_unverified=True)  # Unverified doctors can still edit their pending profile
def update_doctor(doctor_id):
    doctor = doctor_service.get_doctor_by_id(doctor_id)
    if not doctor:
        return jsonify({"msg": "Doctor not found"}), 404
        
    # Block Doctors from tweaking other Doctor data (IDOR)
    current_user = g.current_user
    if current_user["role"] == "doctor" and str(doctor.user_id) != current_user["sub"]:
        return jsonify({"msg": "Unauthorized to update this doctor profile"}), 403
        
    try:
        data = DoctorUpdate(**request.json)
    except ValidationError as e:
        return jsonify(e.errors()), 400
        
    updated_doctor = doctor_service.update_doctor(doctor, data.model_dump(exclude_unset=True))
    return jsonify(DoctorResponse.model_validate(updated_doctor).model_dump(mode="json")), 200

@doctors_bp.route("/<int:doctor_id>", methods=["DELETE"])
@require_role(["admin"])
def delete_doctor(doctor_id):
    doctor = doctor_service.get_doctor_by_id(doctor_id)
    if not doctor:
        return jsonify({"msg": "Doctor not found"}), 404
        
    doctor_service.soft_delete_doctor(doctor)
    return jsonify({"msg": "Doctor soft deleted successfully"}), 200
