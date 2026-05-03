/* ============================================
   Doctors API — Profile CRUD
   ============================================ */

import { apiRequest } from "./client";

export function createDoctorProfile(payload) {
  return apiRequest("/doctors/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getDoctors() {
  return apiRequest("/doctors/", {
    method: "GET",
  });
}

export function getDoctorById(doctorId) {
  return apiRequest(`/doctors/${doctorId}`, {
    method: "GET",
  });
}

export function updateDoctor(doctorId, payload) {
  return apiRequest(`/doctors/${doctorId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
