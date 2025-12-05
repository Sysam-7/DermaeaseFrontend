const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

async function request(path, { method = 'GET', body, headers = {}, token, withAuth } = {}) {
  const finalHeaders = { ...headers };
  if (body && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (withAuth && token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API}${path}`, {
    method,
    headers: finalHeaders,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const message = data?.message || data?.error || 'Request failed';
    const err = new Error(message);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export const checkAdminExists = () => request('/admin/check');
export const createAdminAccount = (payload) => request('/admin/create', { method: 'POST', body: payload });
export const loginAdminAccount = (payload) => request('/admin/login', { method: 'POST', body: payload });
export const fetchDoctorsForAdmin = (token) =>
  request('/doctors', { method: 'GET', token, withAuth: Boolean(token) });
export const deleteDoctorAsAdmin = (doctorId, token) =>
  request(`/doctors/${doctorId}`, { method: 'DELETE', token, withAuth: true });


