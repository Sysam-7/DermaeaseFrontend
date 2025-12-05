const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

async function handleResponse(res) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export async function register(payload) {
  return fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload)
  }).then(handleResponse);
}

export async function login({ email, password }) {
  return fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  }).then(handleResponse);
}

export async function forgotPassword({ email }) {
  return fetch(`${API}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email })
  }).then(handleResponse);
}

export async function resetPassword({ email, token, password }) {
  return fetch(`${API}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, token, password })
  }).then(handleResponse);
}

export async function changePassword({ oldPassword, newPassword, token }) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${API}/auth/change-password`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ oldPassword, newPassword })
  }).then(handleResponse);
}

export async function verifyToken(token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${API}/auth/verify-token`, {
    method: 'GET',
    headers,
    credentials: 'include'
  }).then(handleResponse);
}