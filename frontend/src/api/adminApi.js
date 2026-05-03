/* ============================================
   Admin API — Doctor Verification
   ============================================ */

import { apiRequest } from "./client";

export function verifyDoctor(userId) {
  return apiRequest(`/admin/verify-doctor/${userId}`, {
    method: "PUT",
  });
}
