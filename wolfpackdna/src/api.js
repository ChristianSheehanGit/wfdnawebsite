/**
 * API configuration and helper functions for the Wolfpack DNA admin backend.
 * In development, the backend runs on localhost:3001.
 * In production, set VITE_API_BASE_URL to your deployed API URL.
 */

// In development, Vite proxies /api requests to the backend (see vite.config.ts).
// In production, set VITE_API_BASE_URL to your deployed API URL.
// Default to the Cloud Run deployed API URL for testing.
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://wolf2-616938642091.us-central1.run.app';

/**
 * Generic fetch wrapper with error handling.
 */
async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return body;
}

// ---------------------------------------------------------------------------
// Team Members API
// ---------------------------------------------------------------------------

export async function fetchTeamMembers() {
  const res = await request('/team');
  return res.data;
}

export async function createTeamMember(data) {
  const res = await request('/team', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateTeamMember(id, data) {
  const res = await request(`/team/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res;
}

export async function deleteTeamMember(id) {
  const res = await request(`/team/${id}`, { method: 'DELETE' });
  return res;
}

export async function reorderTeamMembers(orderedIds) {
  const res = await request('/team/reorder', {
    method: 'PUT',
    body: JSON.stringify({ orderedIds }),
  });
  return res;
}

// ---------------------------------------------------------------------------
// Cases API
// ---------------------------------------------------------------------------

export async function fetchCases() {
  const res = await request('/cases');
  return res.data;
}

export async function createCase(data) {
  const res = await request('/cases', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateCase(id, data) {
  const res = await request(`/cases/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res;
}

export async function deleteCase(id) {
  const res = await request(`/cases/${id}`, { method: 'DELETE' });
  return res;
}

// ---------------------------------------------------------------------------
// Image Upload API
// ---------------------------------------------------------------------------

/**
 * Upload a file to the GCS bucket and return its public URL.
 * @param {File} file - The image file to upload
 * @param {string} filename - Target filename in the bucket
 * @returns {Promise<string>} The public URL of the uploaded image
 */
export async function uploadImage(file, filename) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('filename', filename);

  const res = await fetch(`${API_BASE}/images/upload`, {
    method: 'POST',
    body: formData,
  });
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error || 'Image upload failed');
  }
  return body.data.url;
}

export async function deleteImage(filename) {
  const res = await request(`/images/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
  });
  return res;
}