/* ============================================
   Shared API Client for Cura Frontend
   ============================================
   Single source of truth for all HTTP requests.
   Handles base URL, JWT headers, JSON parsing,
   and error normalization.
   ============================================ */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api/v1";

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("cura_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Let the browser set the Content-Type boundary for FormData automatically
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  if (token) {
    // Token is stored JSON-stringified by the storage util, so parse it
    let rawToken = token;
    try {
      rawToken = JSON.parse(token);
    } catch {
      // Already a raw string
    }
    headers.Authorization = `Bearer ${rawToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.msg || data?.message || data?.error || `API error: ${response.status}`);
  }

  return data;
}
