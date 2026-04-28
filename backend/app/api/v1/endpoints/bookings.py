from flask import Blueprint, request, jsonify, g
from app.core.security import require_role
from app.schemas.booking import AvailabilityCreate, AvailabilityResponse, AppointmentCreate, AppointmentResponse
from app.services import booking_service, patient_service, doctor_service
from pydantic import ValidationError

bookings_bp = Blueprint("bookings", __name__)

# ----------------- AVAILABILITY ROUTES ----------------- #

@bookings_bp.route("/availability", methods=["POST"])
@require_role(["doctor"]) # Only doctors can define their own slots
def add_availability():
    payload = request.json.copy() if request.json else {}
    
    # Infer doctor profile ID securely utilizing the JWT sub linked to users
    current_user = g.current_user
    doctor_profile = doctor_service.get_doctor_by_user_id(int(current_user["sub"]))
    if not doctor_profile:
        return jsonify({"msg": "You must create a doctor profile before setting availability"}), 400
        
    payload["doctor_id"] = doctor_profile.id
    
    try:
        data = AvailabilityCreate(**payload)
    except ValidationError as e:
        return jsonify(e.errors()), 400
        
    slot = booking_service.create_availability(data.model_dump())
    if not slot:
        return jsonify({"msg": "You already have a slot registered for this exact date and start time."}), 409
        
    return jsonify(AvailabilityResponse.model_validate(slot).model_dump(mode="json")), 201

# Everyone (including guests) can view open slots across the whole clinic
@bookings_bp.route("/availability", methods=["GET"])
def get_all_availability():
    date_str = request.args.get("date")
    target_date = None
    if date_str:
        from datetime import datetime
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        
    slots = booking_service.get_all_available_slots(target_date)
    return jsonify([AvailabilityResponse.model_validate(s).model_dump(mode="json") for s in slots]), 200

# View open slots for a specific doctor
@bookings_bp.route("/availability/<int:doctor_id>", methods=["GET"])
def get_availability(doctor_id):
    date_str = request.args.get("date")
    target_date = None
    if date_str:
        from datetime import datetime
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        
    slots = booking_service.get_doctor_available_slots(doctor_id, target_date)
    return jsonify([AvailabilityResponse.model_validate(s).model_dump(mode="json") for s in slots]), 200

@bookings_bp.route("/availability/<int:slot_id>", methods=["DELETE"])
@require_role(["doctor"])
def delete_availability(slot_id):
    current_user = g.current_user
    doctor_profile = doctor_service.get_doctor_by_user_id(int(current_user["sub"]))
    if not doctor_profile:
        return jsonify({"msg": "Profile required"}), 400
        
    # Security: Verify the slot belongs to this doctor before deleting
    slot = booking_service.get_slot_by_id(slot_id)
    if not slot:
        return jsonify({"msg": "Slot not found"}), 404
    if slot.doctor_id != doctor_profile.id:
        return jsonify({"msg": "Unauthorized to delete this slot"}), 403
        
    success = booking_service.delete_availability_slot(slot_id)
    if not success:
        return jsonify({"msg": "Cannot delete slot because it is actively booked, or contains historical cancelled bookings."}), 400
        
    return jsonify({"msg": "Available slot successfully deleted"}), 200

# ----------------- APPOINTMENT ROUTES ----------------- #

@bookings_bp.route("/appointments", methods=["POST"])
@require_role(["patient"]) # Only patients can book slots
def create_appointment():
    payload = request.json.copy() if request.json else {}
    
    # Infer patient_id securely from JWT so patients cannot impersonate others
    current_user = g.current_user
    patient_profile = patient_service.get_patient_by_user_id(int(current_user["sub"]))
    if not patient_profile:
        return jsonify({"msg": "You must create a patient profile before booking appointments"}), 400
        
    payload["patient_id"] = patient_profile.id
    
    try:
        data = AppointmentCreate(**payload)
    except ValidationError as e:
        return jsonify(e.errors()), 400
        
    # Inject patient_id AFTER Pydantic schema validation cleanly drops it from frontend payload
    appointment_data = data.model_dump()
    appointment_data["patient_id"] = patient_profile.id
        
    appointment = booking_service.create_appointment(appointment_data)
    if not appointment:
        return jsonify({"msg": "This slot is no longer available or double-booked"}), 409
        
    return jsonify(AppointmentResponse.model_validate(appointment).model_dump(mode="json")), 201

@bookings_bp.route("/appointments", methods=["GET"])
@require_role(["patient", "doctor"]) 
def list_appointments():
    current_user = g.current_user
    if current_user["role"] == "patient":
        profile = patient_service.get_patient_by_user_id(int(current_user["sub"]))
        if not profile: return jsonify([]), 200
        appointments = booking_service.get_patient_appointments(profile.id)
    else:
        profile = doctor_service.get_doctor_by_user_id(int(current_user["sub"]))
        if not profile: return jsonify([]), 200
        appointments = booking_service.get_doctor_appointments(profile.id)
        
    return jsonify([AppointmentResponse.model_validate(a).model_dump(mode="json") for a in appointments]), 200

@bookings_bp.route("/appointments/<int:appointment_id>/cancel", methods=["PUT"])
@require_role(["patient", "doctor"])
def cancel_appointment(appointment_id):
    # IDOR Check: Ensure the user actually owns this appointment
    from app.models.appointment import Appointment
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({"msg": "Appointment not found"}), 404
        
    current_user = g.current_user
    if current_user["role"] == "patient":
        profile = patient_service.get_patient_by_user_id(int(current_user["sub"]))
        if not profile or appointment.patient_id != profile.id:
            return jsonify({"msg": "Unauthorized"}), 403
    elif current_user["role"] == "doctor":
        profile = doctor_service.get_doctor_by_user_id(int(current_user["sub"]))
        if not profile or appointment.doctor_id != profile.id:
            return jsonify({"msg": "Unauthorized"}), 403

    success = booking_service.cancel_appointment(appointment_id)
    return jsonify({"msg": "Appointment cancelled and slot freed"}), 200
