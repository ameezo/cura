/* ============================================
   Notifications API — CRUD for in-app notifications
   ============================================ */

import { apiRequest } from "./client";

/** Get current user's notifications + unread_count */
export function getMyNotifications() {
  return apiRequest("/notifications/", {
    method: "GET",
  });
}

/** Quick badge count */
export function getUnreadCount() {
  return apiRequest("/notifications/unread-count", {
    method: "GET",
  });
}

/** Mark a single notification as read */
export function markAsRead(notificationId) {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}

/** Mark all notifications as read */
export function markAllAsRead() {
  return apiRequest("/notifications/read-all", {
    method: "PATCH",
  });
}

/** Delete a notification */
export function deleteNotification(notificationId) {
  return apiRequest(`/notifications/${notificationId}`, {
    method: "DELETE",
  });
}
