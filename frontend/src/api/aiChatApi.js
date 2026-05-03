/* ============================================
   AI Chat API — Send Message
   ============================================ */

import { apiRequest } from "./client";

export function sendChatMessage(message) {
  return apiRequest("/ai-chat/message", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
