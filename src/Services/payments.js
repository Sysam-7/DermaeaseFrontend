function getApiBase() {
  const explicit = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  if (explicit) return explicit.endsWith('/api') ? explicit : `${explicit}/api`;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5000/api';
}

const API = getApiBase();

async function handleResponse(res) {
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    const err = new Error(text?.slice(0, 120) || 'Invalid response');
    err.status = res.status;
    throw err;
  }
  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

/** Public: fee shown in UI (matches server Khalti charge) */
export async function fetchPaymentFee() {
  return fetch(`${API}/payments/fee`).then(handleResponse);
}

export async function initiateKhaltiPayment(appointmentId, customerInfo, token) {
  return fetch(`${API}/payments/khalti/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ appointmentId, customerInfo }),
  }).then(handleResponse);
}

export async function verifyKhaltiPayment(pidx, token) {
  return fetch(`${API}/payments/khalti/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
    body: JSON.stringify({ pidx }),
  }).then(handleResponse);
}
