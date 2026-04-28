from flask import Blueprint, request, jsonify, g
from app.core.security import require_role
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.services import patient_service
from pydantic import ValidationError

patients_bp = Blueprint("patients", __name__)

@patients_bp.route("/", methods=["POST"])
@require_role(["patient", "admin"]) # Admin can create for patients manually
def create_patient():
    payload = request.json.copy()
    current_user = g.current_user
    
    # Secure user_id inference: Patients can exclusively gefnerate profiles for themselves
    if current_user["role"] == "patient":
        payload["user_id"] = int(current_user["sub"])
        
    try:
        data = PatientCreate(**payload)
    except ValidationError as e:
        return jsonify(e.errors()), 400
        
    # Block redundant dual profiles mapping to the same user
    if patient_service.get_patient_by_user_id(data.user_id):
        return jsonify({"msg": "Patient profile already exists for this user"}), 400
        
    patient = patient_service.create_patient(data.model_dump())
    return jsonify(PatientResponse.model_validate(patient).model_dump(mode="json")), 201

@patients_bp.route("/<int:patient_id>", methods=["GET"])
@require_role(["patient", "doctor", "admin"])
def get_patient(patient_id):
    patient = patient_service.get_patient_by_id(patient_id)
    if not patient:
        return jsonify({"msg": "Patient not found"}), 404
        
    # IDOR Protection: Block patients trying to snoop on other patients
    current_user = g.current_user
    if current_user["role"] == "patient" and str(patient.user_id) != current_user["sub"]:
        return jsonify({"msg": "Unauthorized to view this patient profile"}), 403
        
    # TODO Module 3: Implement doctor restriction here so they only see booked patients
        
    return jsonify(PatientResponse.model_validate(patient).model_dump(mode="json")), 200

@patients_bp.route("/", methods=["GET"])
@require_role(["doctor", "admin"])
def list_patients():
    skip = request.args.get("skip", 0, type=int)
    limit = request.args.get("limit", 100, type=int)
    patients = patient_service.get_all_patients(skip=skip, limit=limit)
    return jsonify([PatientResponse.model_validate(p).model_dump(mode="json") for p in patients]), 200

@patients_bp.route("/<int:patient_id>", methods=["PUT"])
@require_role(["patient", "admin", "doctor"]) # Doctors inherently modify clinical histories
def update_patient(patient_id):
    patient = patient_service.get_patient_by_id(patient_id)
    if not patient:
        return jsonify({"msg": "Patient not found"}), 404
        
    # IDOR Protection
    current_user = g.current_user
    if current_user["role"] == "patient" and str(patient.user_id) != current_user["sub"]:
        return jsonify({"msg": "Unauthorized to update this patient profile"}), 403
        
    try:
        data = PatientUpdate(**request.json)
    except ValidationError as e:
        return jsonify(e.errors()), 400
        
    updated_patient = patient_service.update_patient(patient, data.model_dump(exclude_unset=True))
    return jsonify(PatientResponse.model_validate(updated_patient).model_dump(mode="json")), 200

@patients_bp.route("/<int:patient_id>", methods=["DELETE"])
@require_role(["admin"]) # Strictly restricted to admin management
def delete_patient(patient_id):
    patient = patient_service.get_patient_by_id(patient_id)
    if not patient:
        return jsonify({"msg": "Patient not found"}), 404
        
    patient_service.soft_delete_patient(patient)
    return jsonify({"msg": "Patient soft deleted successfully"}), 200
