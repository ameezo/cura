/* ============================================
   Medications API — Assign, View, Deactivate
   ============================================ */

import { apiRequest } from "./client";

export function assignMedication(payload) {
  return apiRequest("/medications/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getPatientMedications(patientId) {
  return apiRequest(`/medications/patient/${patientId}`, {
    method: "GET",
  });
}

export function deleteMedication(medId) {
  return apiRequest(`/medications/${medId}`, {
    method: "DELETE",
  });
}
