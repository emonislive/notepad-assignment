const RAW_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const API_BASE = RAW_URL
  ? (RAW_URL.endsWith('/api') ? RAW_URL : `${RAW_URL}/api`)
  : '/api';

/**
 * Lightweight HTTP client for API interactions.
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr) {
    throw new Error('Unable to reach the server. If this is a free-tier deployment (e.g. Render), it may be spinning up from idle (takes ~30-50s). Please wait a moment and try again.');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || (data.details ? data.details.join(', ') : 'An unexpected error occurred');
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
