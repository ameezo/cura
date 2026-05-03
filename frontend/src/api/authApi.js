/* ============================================
   Auth API — Registration, Login, Me
   ============================================ */

import { apiRequest } from "./client";

export function register(payload) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMe() {
  return apiRequest("/auth/me", {
    method: "GET",
  });
}

export function loginAsGuest() {
  return apiRequest("/auth/anonymous-guest", {
    method: "POST",
  });
}
