const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function postAuth(path, body) {
  const res = await fetch(`${BASE}/auth${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // include cookies if backend sets httpOnly cookie
    body: JSON.stringify(body)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || data?.error || 'Request failed';
    throw new Error(msg);
  }
  return data;
}

export const login = (email, password) => postAuth('/login', { email, password });
export const register = (payload) => postAuth('/register', payload);