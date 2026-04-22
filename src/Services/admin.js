const baseURL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;

async function request(path, { method = 'GET', body, headers = {}, token, withAuth, rawBody } = {}) {
  const finalHeaders = { ...headers };
  if (body && !rawBody && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (withAuth && token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API}${path}`, {
    method,
    headers: finalHeaders,
    credentials: 'include',
    body: rawBody ? body : (body ? JSON.stringify(body) : undefined),
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
export const registerFirstAdmin = (payload) => request('/admin/register-first', { method: 'POST', body: payload });
export const loginAdmin = (payload) => request('/admin/login', { method: 'POST', body: payload });
export const fetchAdminUsers = (token) =>
  request('/admin/users', { method: 'GET', token, withAuth: Boolean(token) });
export const restrictUserByAdmin = (userId, reason, token) =>
  request(`/admin/users/${userId}/restrict`, { method: 'PATCH', body: { reason }, token, withAuth: true });
export const unrestrictUserByAdmin = (userId, token) =>
  request(`/admin/users/${userId}/unrestrict`, { method: 'PATCH', token, withAuth: true });
export const deleteUserByAdmin = (userId, reason, token) =>
  request(`/admin/users/${userId}/delete`, { method: 'PATCH', body: { reason }, token, withAuth: true });

export const fetchPendingDoctorApplications = (token) =>
  request('/doctor-applications/pending', { method: 'GET', token, withAuth: true });

export const reviewDoctorApplication = (applicationId, action, reviewNotes, token) =>
  request(`/doctor-applications/${applicationId}/review`, {
    method: 'PATCH',
    body: { action, reviewNotes },
    token,
    withAuth: true,
  });


