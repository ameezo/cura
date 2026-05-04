/* ============================================
   AI Chat API — Real Gemini-powered endpoints
   ============================================ */

import { apiRequest } from "./client";

/** Get the current user's conversation metadata (auto-creates if needed) */
export function getConversation() {
  return apiRequest("/ai-chat/conversation");
}

/** Get all messages in the user's conversation */
export function getMessages() {
  return apiRequest("/ai-chat/messages");
}

/** Send a message and receive the AI response */
export function sendChatMessage(message) {
  return apiRequest("/ai-chat/message", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

/** Clear all messages in the conversation */
export function clearConversation() {
  return apiRequest("/ai-chat/clear", {
    method: "DELETE",
  });
}
