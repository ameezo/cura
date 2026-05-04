/* ============================================
   Bookings API — Availability + Appointments
   ============================================ */

import { apiRequest } from "./client";

// ---------- Availability ---------- //

export function getAvailability(date) {
  const query = date ? `?date=${date}` : "";
  return apiRequest(`/bookings/availability${query}`, {
    method: "GET",
  });
}

export function getDoctorAvailability(doctorId, date) {
  const query = date ? `?date=${date}` : "";
  return apiRequest(`/bookings/availability/${doctorId}${query}`, {
    method: "GET",
  });
}

export function addAvailability(payload) {
  return apiRequest("/bookings/availability", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteAvailability(slotId) {
  return apiRequest(`/bookings/availability/${slotId}`, {
    method: "DELETE",
  });
}

export function getMyAvailability() {
  return apiRequest("/bookings/availability/mine", {
    method: "GET",
  });
}

// ---------- Appointments ---------- //

export function createAppointment(payload) {
  return apiRequest("/bookings/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getAppointments() {
  return apiRequest("/bookings/appointments", {
    method: "GET",
  });
}

export function cancelAppointment(appointmentId) {
  return apiRequest(`/bookings/appointments/${appointmentId}/cancel`, {
    method: "PUT",
  });
}
