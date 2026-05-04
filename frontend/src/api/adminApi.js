/* ============================================
   Admin API — Doctor Verification & User Management
   ============================================ */

import { apiRequest } from "./client";

export function getDoctors() {
  return apiRequest("/admin/doctors", { method: "GET" });
}

export function getUsers() {
  return apiRequest("/admin/users", { method: "GET" });
}

export function verifyDoctor(userId) {
  return apiRequest(`/admin/verify-doctor/${userId}`, {
    method: "PUT",
  });
}

export function revokeDoctor(userId) {
  return apiRequest(`/admin/revoke-doctor/${userId}`, {
    method: "PUT",
  });
}
