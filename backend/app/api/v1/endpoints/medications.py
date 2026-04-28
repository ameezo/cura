from flask import Blueprint, request, jsonify, g
from app.core.security import require_role
from app.schemas.medication import MedicationCreate, MedicationResponse
from app.services import medication_service, patient_service
from pydantic import ValidationError

medications_bp = Blueprint("medications", __name__)

@medications_bp.route("/", methods=["POST"])
@require_role(["doctor", "admin"]) # Only clinicians assign medications
def assign_medication():
    payload = request.json or {}
    
    try:
        data = MedicationCreate(**payload)
    except ValidationError as e:
        return jsonify(e.errors()), 400
        
    # Security: In production, verify the patient_id actually exists
    med = medication_service.create_medication(data.model_dump())
    
    return jsonify(MedicationResponse.model_validate(med).model_dump(mode="json")), 201

@medications_bp.route("/patient/<int:patient_id>", methods=["GET"])
@require_role(["doctor", "admin", "patient"])
def view_patient_medications(patient_id):
    current_user = g.current_user
    
    # IDOR Check: Ensure patients can only view their own medications
    if current_user["role"] == "patient":
        profile = patient_service.get_patient_by_user_id(int(current_user["sub"]))
        if not profile or profile.id != patient_id:
            return jsonify({"msg": "Unauthorized to view this patient's medications"}), 403
            
    meds = medication_service.get_patient_medications(patient_id)
    return jsonify([MedicationResponse.model_validate(m).model_dump(mode="json") for m in meds]), 200

@medications_bp.route("/<int:med_id>", methods=["DELETE"])
@require_role(["doctor", "admin"])
def remove_medication(med_id):
    success = medication_service.deactivate_medication(med_id)
    if not success:
        return jsonify({"msg": "Medication not found"}), 404
    return jsonify({"msg": "Medication schedule deactivated"}), 200
