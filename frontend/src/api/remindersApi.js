/* ============================================
   Reminders API — View + Dismiss
   ============================================ */

import { apiRequest } from "./client";

export function getMyReminders() {
  return apiRequest("/reminders/", {
    method: "GET",
  });
}

export function dismissReminder(reminderId) {
  return apiRequest(`/reminders/${reminderId}/dismiss`, {
    method: "PATCH",
  });
}
