const API = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

async function request(path, { method = 'GET', headers = {}, token } = {}) {
  const res = await fetch(`${API}${path}`, {
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

export const fetchDoctorProfile = (doctorId, token) =>
  request(`/doctors/${doctorId}`, { token });

export const fetchDoctorAppointmentsSummary = (doctorId, token) =>
  request(`/appointments?doctorId=${doctorId}&sort=date`, { token });

export const fetchDoctorMessages = (doctorId, token) =>
  request(`/chat/history?doctorId=${doctorId}`, { token });

