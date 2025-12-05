const API = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';

async function request(path, opts = {}) {
  const url = `${API}${path}`;
  const headers = opts.headers || {};
  if (!headers['Content-Type'] && !(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  if (localStorage.getItem('token')) headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
  try {
    const res = await fetch(url, { ...opts, headers, credentials: 'include' });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) throw { status: res.status, ...data };
    return data;
  } catch (err) {
    throw err;
  }
}

export async function register({ name, username, email, password, role}) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, username, email, password, role }),
  });
}

export async function login({ email, password }) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function forgotPassword({ email }) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword({ email, token, password }) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, token, password }),
  });
}

export async function changePassword({ oldPassword, newPassword }) {
  return request('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

export async function verifyToken() {
  return request('/auth/verify-token', { method: 'GET' });
}