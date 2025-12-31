const API = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

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

export const listDoctorsForUsers = (queryString = '') =>
  request(`/users/doctors${queryString ? `?${queryString}` : ''}`);

export const updateUsername = (username, token) =>
  request('/users/username', { method: 'PUT', body: { username }, token });

export const fetchCurrentUser = (token) =>
  request('/users/me', { method: 'GET', token });

export const updateCurrentUser = (payload, token) =>
  request('/users/me', { method: 'PATCH', body: payload, token });

export const fetchNotifications = (token) =>
  request('/notifications', { method: 'GET', token });

export const fetchReviews = (doctorId, token) =>
  request(`/reviews/${doctorId}`, { method: 'GET', token });

export const submitReview = (payload, token) =>
  request('/reviews', { method: 'POST', body: payload, token });

export const deleteReviewById = (reviewId, token) =>
  request(`/reviews/${reviewId}`, { method: 'DELETE', token });

export const fetchChatHistory = (withUserId, token) =>
  request(`/chat/history?withUserId=${withUserId}`, { method: 'GET', token });

export const sendChatMessage = (payload, token) =>
  request('/chat/send', { method: 'POST', body: payload, token });

export const getPatientConversations = (token) =>
  request('/chat/conversations/patient', { method: 'GET', token });

export const getDoctorConversations = (token) =>
  request('/chat/conversations/doctor', { method: 'GET', token });

export const fetchPrescriptions = (token) =>
  request('/prescriptions', { method: 'GET', token });

export const createPrescription = (payload, token) =>
  request('/prescriptions', { method: 'POST', body: payload, token });

