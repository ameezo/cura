/* ============================================
   Medications API — Prescribe, View (Doctor + Patient)
   ============================================ */

import { apiRequest } from "./client";

/** Patient: get own medications (auto-resolved from auth) */
export function getMyMedications() {
  return apiRequest("/medications/", {
    method: "GET",
  });
}

/** Doctor: get medications they prescribed */
export function getDoctorMedications() {
  return apiRequest("/medications/doctor", {
    method: "GET",
  });
}

/** Doctor: prescribe a medication */
export function prescribeMedication(payload) {
  return apiRequest("/medications/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Doctor: deactivate a medication */
export function deleteMedication(medId) {
  return apiRequest(`/medications/${medId}`, {
    method: "DELETE",
  });
}

/** Legacy: get patient medications by ID */
export function getPatientMedications(patientId) {
  return apiRequest(`/medications/patient/${patientId}`, {
    method: "GET",
  });
}
