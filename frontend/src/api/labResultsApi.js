import { apiRequest } from "./client";

export function getPatientLabResults() {
  return apiRequest("/lab-results/", {
    method: "GET",
  });
}

export function getDoctorLabResults() {
  return apiRequest("/lab-results/doctor", {
    method: "GET",
  });
}

export function publishLabResult(payload) {
  // If there's a report_file, construct FormData
  if (payload.report_file) {
    const formData = new FormData();
    for (const key in payload) {
      if (payload[key] !== undefined && payload[key] !== null) {
        formData.append(key, payload[key]);
      }
    }
    return apiRequest("/lab-results/", {
      method: "POST",
      body: formData,
    });
  }

  // Otherwise fallback to JSON
  return apiRequest("/lab-results/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function releaseLabResult(id) {
  return apiRequest(`/lab-results/${id}/release`, {
    method: "PATCH",
  });
}

export async function downloadLabReport(id, filename) {
  // We cannot use apiRequest directly because it tries to parse JSON.
  // We need to fetch the blob manually.
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api/v1";
  const token = localStorage.getItem("cura_token");
  let rawToken = token;
  try { rawToken = JSON.parse(token); } catch {}

  const response = await fetch(`${API_BASE_URL}/lab-results/${id}/download`, {
    headers: {
      Authorization: `Bearer ${rawToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to download report");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `lab_report_${id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
