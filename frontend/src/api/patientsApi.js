/* ============================================
   Patients API — Profile CRUD
   ============================================ */

import { apiRequest } from "./client";

export function createPatientProfile(payload) {
  return apiRequest("/patients/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAllPatients() {
  return apiRequest("/patients/", {
    method: "GET",
  });
}

export function getPatientById(patientId) {
  return apiRequest(`/patients/${patientId}`, {
    method: "GET",
  });
}

export function updatePatient(patientId, payload) {
  return apiRequest(`/patients/${patientId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
