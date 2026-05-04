/* ============================================
   Data Mappers — Backend → Frontend Shape
   ============================================
   The backend uses snake_case and different
   field names than the frontend mock data.
   These mappers centralize the translation.
   ============================================ */

/**
 * Map a backend DoctorResponse to the shape the frontend UI expects.
 * Backend: { full_name, specialization, clinic_location, ... }
 * Frontend display: { name, specialty, location, ... }
 */
export function mapDoctor(doctor) {
  return {
    id: doctor.id,
    userId: doctor.user_id,
    name: doctor.full_name,
    specialty: doctor.specialization,
    location: doctor.clinic_location || null,
    isOnlineAvailable: doctor.is_online_available,
    isOnsiteAvailable: doctor.is_onsite_available,
    contactPhone: doctor.contact_phone || null,
    createdAt: doctor.created_at,
    updatedAt: doctor.updated_at,
    // Keep raw fields for components that already use backend naming
    full_name: doctor.full_name,
    specialization: doctor.specialization,
    clinic_location: doctor.clinic_location,
  };
}

/**
 * Map a backend AvailabilityResponse to a display-friendly slot object.
 * Backend: { start_time, end_time, is_booked, slot_type, ... }
 */
export function mapAvailabilitySlot(slot) {
  return {
    id: slot.id,
    doctorId: slot.doctor_id,
    date: slot.date,
    startTime: slot.start_time,
    endTime: slot.end_time,
    slotType: slot.slot_type,
    isBooked: slot.is_booked,
    // Formatted display time (e.g. "10:30 AM")
    displayTime: formatTime(slot.start_time),
  };
}

/**
 * Map a backend AppointmentResponse to the shape the frontend AppointmentsPage expects.
 *
 * @param {Object} appointment - Backend appointment response
 * @param {Object} [doctorMap] - Map of doctor_id → doctor data (from GET /doctors/)
 * @param {Object} [patientMap] - Map of patient_id → patient data (from GET /patients/)
 */
export function mapAppointment(appointment, doctorMap = {}, patientMap = {}) {
  const doctor = doctorMap[appointment.doctor_id] || {};
  const patient = patientMap[appointment.patient_id] || {};
  const slot = appointment.slot || {};

  return {
    id: appointment.id,
    patientId: appointment.patient_id,
    doctorId: appointment.doctor_id,
    availabilityId: appointment.availability_id,
    // Enriched fields from doctor + patient joins
    doctor_name: doctor.full_name || `Doctor #${appointment.doctor_id}`,
    specialty: doctor.specialization || 'Unknown',
    patient_name: patient.first_name ? `${patient.first_name} ${patient.last_name}` : `Patient #${appointment.patient_id}`,
    // Directly from nested backend payload
    date: slot.date || 'TBD',
    time: slot.start_time ? formatTime(slot.start_time) : 'TBD',
    // Direct fields
    status: appointment.status,
    type: appointment.booking_type,
    notes: appointment.notes || '',
    createdAt: appointment.created_at,
  };
}

/**
 * Map a backend PatientResponse to a frontend-friendly shape.
 */
export function mapPatient(patient) {
  return {
    id: patient.id,
    userId: patient.user_id,
    firstName: patient.first_name,
    lastName: patient.last_name,
    fullName: `${patient.first_name} ${patient.last_name}`,
    dateOfBirth: patient.date_of_birth,
    gender: patient.gender,
    phoneNumber: patient.phone_number,
    medicalHistory: patient.medical_history,
    createdAt: patient.created_at,
    updatedAt: patient.updated_at,
  };
}

/**
 * Format a time string like "10:30:00" → "10:30 AM"
 */
export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  return `${displayH}:${minutes} ${ampm}`;
}
