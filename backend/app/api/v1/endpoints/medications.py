from flask import Blueprint, request, jsonify, g
from app.core.security import require_role
from app.schemas.medication import MedicationCreate
from app.services import medication_service, patient_service, doctor_service
from app.services.notification_service import create_notification
from pydantic import ValidationError

medications_bp = Blueprint("medications", __name__)


@medications_bp.route("/", methods=["GET"])
@require_role(["patient"])
def get_my_medications():
    """Patient: get own medications (auto-resolve patient_id from auth)."""
    current_user = g.current_user
    patient_profile = patient_service.get_patient_by_user_id(int(current_user["sub"]))
    if not patient_profile:
        return jsonify([]), 200

    meds = medication_service.get_all_patient_medications(patient_profile.id)

    data = []
    for m in meds:
        doctor_name = "Unknown Doctor"
        if m.doctor:
            doctor_name = f"Dr. {m.doctor.full_name}"

        data.append({
            "id": m.id,
            "patient_id": m.patient_id,
            "doctor_id": m.doctor_id,
            "doctor": doctor_name,
            "name": m.name,
            "dosage": m.dosage,
            "form": m.form,
            "frequency_type": m.frequency_type,
            "times_per_day": m.times_per_day,
            "instruction_text": m.instruction_text,
            "before_meal": m.before_meal,
            "after_meal": m.after_meal,
            "notes": m.notes,
            "start_date": m.start_date.strftime("%Y-%m-%d"),
            "end_date": m.end_date.strftime("%Y-%m-%d") if m.end_date else None,
            "is_active": m.is_active,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "updated_at": m.updated_at.isoformat() if m.updated_at else None,
        })

    return jsonify(data), 200


@medications_bp.route("/doctor", methods=["GET"])
@require_role(["doctor"])
def get_doctor_medications():
    """Doctor: get all medications they have prescribed."""
    current_user = g.current_user
    doctor_profile = doctor_service.get_doctor_by_user_id(int(current_user["sub"]))
    if not doctor_profile:
        return jsonify([]), 200

    meds = medication_service.get_doctor_medications(doctor_profile.id)

    data = []
    for m in meds:
        # Resolve patient name
        patient_name = "Unknown Patient"
        if m.patient:
            patient_name = f"{m.patient.first_name} {m.patient.last_name}"

        data.append({
            "id": m.id,
            "patient_id": m.patient_id,
            "doctor_id": m.doctor_id,
            "patient_name": patient_name,
            "doctor": f"Dr. {doctor_profile.full_name}",
            "name": m.name,
            "dosage": m.dosage,
            "form": m.form,
            "frequency_type": m.frequency_type,
            "times_per_day": m.times_per_day,
            "instruction_text": m.instruction_text,
            "before_meal": m.before_meal,
            "after_meal": m.after_meal,
            "notes": m.notes,
            "start_date": m.start_date.strftime("%Y-%m-%d"),
            "end_date": m.end_date.strftime("%Y-%m-%d") if m.end_date else None,
            "is_active": m.is_active,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "updated_at": m.updated_at.isoformat() if m.updated_at else None,
        })

    return jsonify(data), 200


@medications_bp.route("/", methods=["POST"])
@require_role(["doctor", "admin"])
def assign_medication():
    """Doctor prescribes a medication for a patient."""
    current_user = g.current_user
    doctor_profile = doctor_service.get_doctor_by_user_id(int(current_user["sub"]))
    if not doctor_profile:
        return jsonify({"msg": "Doctor profile required to prescribe medications."}), 400

    payload = request.json or {}

    try:
        data = MedicationCreate(**payload)
    except ValidationError as e:
        return jsonify(e.errors()), 400

    # Verify patient exists
    patient_profile = patient_service.get_patient_by_id(data.patient_id)
    if not patient_profile:
        return jsonify({"msg": "Patient not found"}), 404

    med_data = data.model_dump()
    med_data["doctor_id"] = doctor_profile.id

    med = medication_service.create_medication(med_data)

    # Notify the patient
    try:
        create_notification(
            user_id=patient_profile.user_id,
            type="medication",
            title="New Medication Prescribed",
            message=f"Dr. {doctor_profile.full_name} prescribed {med.name} ({med.dosage}) for you.",
            related_id=med.id
        )
    except Exception:
        pass  # Don't fail the prescription if notification fails

    return jsonify({"msg": "Medication prescribed successfully", "id": med.id}), 201


@medications_bp.route("/<int:med_id>", methods=["DELETE"])
@require_role(["doctor", "admin"])
def remove_medication(med_id):
    success = medication_service.deactivate_medication(med_id)
    if not success:
        return jsonify({"msg": "Medication not found"}), 404
    return jsonify({"msg": "Medication schedule deactivated"}), 200


# Keep backward compat for old /patient/<id> route
@medications_bp.route("/patient/<int:patient_id>", methods=["GET"])
@require_role(["doctor", "admin", "patient"])
def view_patient_medications(patient_id):
    current_user = g.current_user

    # IDOR Check: Ensure patients can only view their own medications
    if current_user["role"] == "patient":
        profile = patient_service.get_patient_by_user_id(int(current_user["sub"]))
        if not profile or profile.id != patient_id:
            return jsonify({"msg": "Unauthorized to view this patient's medications"}), 403

    meds = medication_service.get_all_patient_medications(patient_id)

    data = []
    for m in meds:
        doctor_name = "Unknown Doctor"
        if m.doctor:
            doctor_name = f"Dr. {m.doctor.full_name}"
        data.append({
            "id": m.id,
            "patient_id": m.patient_id,
            "doctor_id": m.doctor_id,
            "doctor": doctor_name,
            "name": m.name,
            "dosage": m.dosage,
            "form": m.form,
            "frequency_type": m.frequency_type,
            "times_per_day": m.times_per_day,
            "instruction_text": m.instruction_text,
            "before_meal": m.before_meal,
            "after_meal": m.after_meal,
            "notes": m.notes,
            "start_date": m.start_date.strftime("%Y-%m-%d"),
            "end_date": m.end_date.strftime("%Y-%m-%d") if m.end_date else None,
            "is_active": m.is_active,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "updated_at": m.updated_at.isoformat() if m.updated_at else None,
        })

    return jsonify(data), 200
