// Align with auth service: default to backend at http://localhost:5000 and ensure /api suffix
const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;

async function request(path, { method = 'GET', body, headers = {}, token } = {}) {
  const finalHeaders = { ...headers };
  if (body && !(body instanceof FormData) && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API}${path}`, {
    method,
    headers: finalHeaders,
    credentials: 'include',
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
  });

  const text = await res.text();
  let data = {};
  
  // Check if response is HTML (error page) instead of JSON
  if (text && text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
    const err = new Error('Server returned HTML instead of JSON. The endpoint may not exist or there was a server error.');
    err.status = res.status;
    err.body = { message: 'Invalid response from server' };
    throw err;
  }
  
  try {
    data = text ? JSON.parse(text) : {};
  } catch (parseErr) {
    const err = new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    err.status = res.status;
    err.body = { message: 'Failed to parse server response' };
    throw err;
  }
  
  if (!res.ok) {
    const err = new Error(data?.message || data?.error || 'Request failed');
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

/**
 * Book a new appointment
 * POST /api/appointments
 * @param {Object} payload - { doctorId, date, time } or { doctorId, start, end }
 * @param {string} token - Auth token
 */
export const bookAppointment = (payload, token) =>
  request('/appointments', { method: 'POST', body: payload, token });

/**
 * Legacy booking endpoint (for backward compatibility)
 * POST /api/appointments/book
 */
export const bookAppointmentLegacy = (payload, token) =>
  request('/appointments/book', { method: 'POST', body: payload, token });

/**
 * Get appointments for a specific doctor
 * GET /api/appointments/doctor/:doctorId
 * @param {string} doctorId - Doctor ID
 * @param {string} token - Auth token
 */
export const getDoctorAppointments = (doctorId, token) =>
  request(`/appointments/doctor/${doctorId}`, { method: 'GET', token });

/**
 * Get appointments for a specific patient
 * GET /api/appointments/patient/:patientId
 * @param {string} patientId - Patient ID
 * @param {string} token - Auth token
 */
export const getPatientAppointments = (patientId, token) =>
  request(`/appointments/patient/${patientId}`, { method: 'GET', token });

/**
 * Update appointment status
 * PATCH /api/appointments/:id/status
 * @param {string} id - Appointment ID
 * @param {string} status - New status (pending, confirmed, cancelled, completed)
 * @param {string} token - Auth token
 */
export const updateAppointmentStatus = (id, status, token) =>
  request(`/appointments/${id}/status`, { method: 'PATCH', body: { status }, token });

/**
 * Get current user's appointments (works for both doctor and patient)
 * GET /api/appointments/my
 * @param {string} token - Auth token
 */
export const getMyAppointments = (token) =>
  request('/appointments/my', { method: 'GET', token });

/**
 * Legacy: Get doctor's incoming appointments (pending only)
 * GET /api/appointments/doctor
 * @param {string} token - Auth token
 */
export const getIncomingAppointments = (token) =>
  request('/appointments/doctor', { method: 'GET', token });

/**
 * Get available time slots for a doctor on a specific date
 * GET /api/appointments/available-slots/:doctorId?date=YYYY-MM-DD
 * @param {string} doctorId - Doctor ID
 * @param {string} date - Date in YYYY-MM-DD format
 */
export const getAvailableSlots = (doctorId, date) =>
  request(`/appointments/available-slots/${doctorId}?date=${date}`, { method: 'GET' });

/**
 * Update doctor's working hours
 * PATCH /api/appointments/working-hours
 * @param {Object} payload - { workingHoursStart, workingHoursEnd }
 * @param {string} token - Auth token
 */
export const updateWorkingHours = (payload, token) =>
  request('/appointments/working-hours', { method: 'PATCH', body: payload, token });
