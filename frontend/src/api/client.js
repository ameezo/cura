/* ============================================
   Shared API Client for Cura Frontend
   ============================================
   Single source of truth for all HTTP requests.
   Handles base URL, JWT headers, JSON parsing,
   and error normalization.
   ============================================ */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api/v1";

/**
 * Maximum number of retry attempts for network-level failures.
 * Only retries on TypeError (network error), not on HTTP error responses.
 */
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("cura_token");

  const headers = {
    "Content-Type": "application/json",
    // Explicitly accept JSON responses
    Accept: "application/json",
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

  const fetchOptions = {
    ...options,
    headers,
    // Required for mobile browsers (Firefox, Safari) to properly handle
    // same-origin requests through reverse proxies like Nginx/Cloudflare
    credentials: "same-origin",
  };

  // Retry loop — handles transient network failures common on mobile
  // browsers (Firefox mobile throws "TypeError: Load failed" on network
  // issues, Cloudflare tunnel latency, SSL handshake timeouts, etc.)
  let lastError = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, fetchOptions);

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.msg || data?.message || data?.error || `API error: ${response.status}`
        );
      }

      return data;
    } catch (err) {
      // TypeError = network-level failure (no HTTP response received).
      // Common on mobile browsers: "Load failed", "NetworkError",
      // "Failed to fetch", "The Internet connection appears to be offline".
      const isNetworkError = err instanceof TypeError;

      if (isNetworkError && attempt < MAX_RETRIES) {
        lastError = err;
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      // If it's a network error after all retries, provide a clear message
      if (isNetworkError) {
        throw new Error(
          "Unable to connect to the server. Please check your internet connection and try again."
        );
      }

      // Re-throw API errors (from !response.ok) as-is
      throw err;
    }
  }

  // Should never reach here, but just in case
  throw lastError || new Error("Request failed");
}
