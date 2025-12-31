// Align with other services: default to backend http://localhost:5000 and ensure /api suffix
const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;

async function request(path, { method = 'GET', headers = {}, token, params } = {}) {
  const url = new URL(`${API}${path}`, window.location.origin);
  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
    });
  }

  const res = await fetch(url.toString(), {
    method,
    headers: token ? { ...headers, Authorization: `Bearer ${token}` } : headers,
    credentials: 'include',
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const err = new Error(data?.message || data?.error || 'Request failed');
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

/**
 * Get all doctors with optional filters
 * GET /api/doctors?q=...&specialty=...&location=...&availableDate=...&page=...&limit=...
 * @param {Object} query - Query parameters
 * @returns {Promise} Response with doctors list
 */
export const getDoctors = (query = {}) => request('/doctors', { params: query });

/**
 * Get a specific doctor by ID
 * GET /api/doctors/:id
 * @param {string} id - Doctor ID
 * @returns {Promise} Response with doctor data
 */
export const getDoctorById = (id) => request(`/doctors/${id}`);

/**
 * Get list of all specialties
 * GET /api/doctors/specialties
 * @returns {Promise} Response with specialties list
 */
export const getSpecialties = () => request('/doctors/specialties');
