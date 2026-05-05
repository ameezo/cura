from flask import Blueprint, request, jsonify, g
from app.core.security import require_role
from app.schemas.booking import AvailabilityCreate, AvailabilityResponse, AppointmentCreate, AppointmentResponse
from app.services import booking_service, patient_service, doctor_service
from app.services.notification_service import create_notification
from pydantic import ValidationError

bookings_bp = Blueprint("bookings", __name__)

# ---- Helper: enrich an availability slot with doctor_name ---- #
def _slot_to_response(slot):
    data = AvailabilityResponse.model_validate(slot).model_dump(mode="json")
    if slot.doctor:
        data["doctor_name"] = slot.doctor.full_name
    return data

# ---- Helper: enrich an appointment with doctor_name + patient_name ---- #
def _appointment_to_response(appointment):
    data = AppointmentResponse.model_validate(appointment).model_dump(mode="json")
    if appointment.doctor:
        data["doctor_name"] = appointment.doctor.full_name
    if appointment.patient:
        data["patient_name"] = f"{appointment.patient.first_name} {appointment.patient.last_name}"
    # Also enrich the nested slot
    if data.get("slot") and appointment.slot and appointment.slot.doctor:
        data["slot"]["doctor_name"] = appointment.slot.doctor.full_name
    return data

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
        
    return jsonify(_slot_to_response(slot)), 201

# Everyone (including guests) can view open slots across the whole clinic
@bookings_bp.route("/availability", methods=["GET"])
def get_all_availability():
    date_str = request.args.get("date")
    target_date = None
    if date_str:
        from datetime import datetime
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        
    slots = booking_service.get_all_available_slots(target_date)
    return jsonify([_slot_to_response(s) for s in slots]), 200

# Doctor-only: view ALL of their own slots (booked + free) for management dashboard
@bookings_bp.route("/availability/mine", methods=["GET"])
@require_role(["doctor"])
def get_my_availability():
    current_user = g.current_user
    doctor_profile = doctor_service.get_doctor_by_user_id(int(current_user["sub"]))
    if not doctor_profile:
        return jsonify({"msg": "Profile required"}), 400
    
    slots = booking_service.get_doctor_all_slots(doctor_profile.id)
    result = []
    for s in slots:
        data = _slot_to_response(s)
        # If the slot is booked, include the patient name for the doctor's view
        if s.is_booked and hasattr(s, 'appointment') and s.appointment:
            appointment = s.appointment
            if appointment.status == "confirmed" and appointment.patient:
                data["booked_patient_name"] = f"{appointment.patient.first_name} {appointment.patient.last_name}"
                data["appointment_id"] = appointment.id
        result.append(data)
    return jsonify(result), 200

# View open slots for a specific doctor
@bookings_bp.route("/availability/<int:doctor_id>", methods=["GET"])
def get_availability(doctor_id):
    date_str = request.args.get("date")
    target_date = None
    if date_str:
        from datetime import datetime
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        
    slots = booking_service.get_doctor_available_slots(doctor_id, target_date)
    return jsonify([_slot_to_response(s) for s in slots]), 200

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
    
    # Block deletion if the slot has a confirmed booking
    if slot.is_booked:
        return jsonify({"msg": "Cannot delete this session — a patient has already booked it. Only the patient can cancel their booking."}), 409
        
    success = booking_service.delete_availability_slot(slot_id)
    if not success:
        return jsonify({"msg": "Cannot delete slot because it contains historical cancelled bookings."}), 400
        
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

    # Notify the doctor about the new booking
    try:
        patient_name = f"{patient_profile.first_name} {patient_profile.last_name}"
        doctor_profile = doctor_service.get_doctor_by_id(appointment.doctor_id)
        if doctor_profile:
            slot = appointment.slot
            slot_info = f"{slot.date.strftime('%b %d')} at {slot.start_time.strftime('%I:%M %p')}" if slot else ""
            create_notification(
                user_id=doctor_profile.user_id,
                type="appointment",
                title="New Appointment Booked",
                message=f"{patient_name} booked an appointment with you for {slot_info}.",
                related_id=appointment.id
            )
    except Exception:
        pass  # Don't fail the booking if notification fails

    return jsonify(_appointment_to_response(appointment)), 201

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
        
    return jsonify([_appointment_to_response(a) for a in appointments]), 200

@bookings_bp.route("/appointments/<int:appointment_id>/cancel", methods=["PUT"])
@require_role(["patient"])  # Only PATIENTS can cancel — doctors must honour their availability
def cancel_appointment(appointment_id):
    from app.models.appointment import Appointment
    appointment = Appointment.query.get(appointment_id)
    if not appointment:
        return jsonify({"msg": "Appointment not found"}), 404
        
    current_user = g.current_user
    # Only the patient who owns this appointment can cancel it
    profile = patient_service.get_patient_by_user_id(int(current_user["sub"]))
    if not profile or appointment.patient_id != profile.id:
        return jsonify({"msg": "Unauthorized — only the patient who booked this appointment can cancel it"}), 403

    if appointment.status == "cancelled":
        return jsonify({"msg": "This appointment is already cancelled"}), 400

    # Notify the doctor about the cancellation
    try:
        patient_name = f"{profile.first_name} {profile.last_name}"
        doctor_profile = doctor_service.get_doctor_by_id(appointment.doctor_id)
        if doctor_profile:
            create_notification(
                user_id=doctor_profile.user_id,
                type="appointment",
                title="Appointment Cancelled",
                message=f"{patient_name} cancelled their appointment with you.",
                related_id=appointment.id
            )
    except Exception:
        pass

    success = booking_service.cancel_appointment(appointment_id)
    return jsonify({"msg": "Appointment cancelled and slot freed"}), 200
