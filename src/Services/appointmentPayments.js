const PAYMENT_STORAGE_KEY = 'appointment_payments_v1';
const MOCK_NOTIFICATION_STORAGE_KEY = 'mock_notifications_v1';

/** Same-origin tabs (patient + doctor) — localStorage "storage" can be flaky; this is reliable. */
const PAYMENT_SYNC_CHANNEL = 'dermaease-appointment-payment-sync';

function normalizeAppointmentId(id) {
  if (id == null) return '';
  if (typeof id === 'object' && id !== null && typeof id.toString === 'function') {
    return String(id.toString());
  }
  return String(id);
}

function broadcastLocalSync() {
  try {
    const ch = new BroadcastChannel(PAYMENT_SYNC_CHANNEL);
    ch.postMessage({ type: 'app-local-sync', at: Date.now() });
    ch.close();
  } catch {
    /* ignore — older browsers */
  }
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Failed to parse local storage key: ${key}`, error);
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function emitPaymentUpdate() {
  window.dispatchEvent(new CustomEvent('appointment-payment-updated'));
  broadcastLocalSync();
}

function emitNotificationsUpdate() {
  window.dispatchEvent(new CustomEvent('mock-notifications-updated'));
  broadcastLocalSync();
}

export function getPaymentStateMap() {
  return readJson(PAYMENT_STORAGE_KEY, {});
}

export function isAppointmentPaid(appointmentId) {
  const map = getPaymentStateMap();
  const key = normalizeAppointmentId(appointmentId);
  if (!key) return false;
  if (map[key]?.paid) return true;
  /* Legacy keys (e.g. object-as-key serialized differently) */
  return Object.keys(map).some(
    (k) => normalizeAppointmentId(k) === key && map[k]?.paid
  );
}

export function markAppointmentPaid({ appointmentId, doctorId, doctorName, patientName, amount }) {
  const map = getPaymentStateMap();
  const key = normalizeAppointmentId(appointmentId);
  map[key] = {
    paid: true,
    paidAt: new Date().toISOString(),
    amount: Number(amount) || 0,
  };

  const notifications = readJson(MOCK_NOTIFICATION_STORAGE_KEY, []);
  notifications.unshift({
    _id: `mock-payment-${key}-${Date.now()}`,
    type: 'appointment_payment_success',
    message: `${patientName || 'A patient'} paid for appointment with ${doctorName || 'you'}.`,
    read: false,
    createdAt: new Date().toISOString(),
    appointmentId: key,
    recipientRole: 'doctor',
    recipientUserId: doctorId != null ? String(doctorId) : '',
    relatedData: {
      patientName: patientName || 'Patient',
      doctorName: doctorName || 'Doctor',
      amount: Number(amount) || 0,
    },
  });
  /* Persist both first so other tabs read consistent data on sync. */
  writeJson(PAYMENT_STORAGE_KEY, map);
  writeJson(MOCK_NOTIFICATION_STORAGE_KEY, notifications);
  emitPaymentUpdate();
  emitNotificationsUpdate();
}

export function getMockNotifications({ userRole, userId }) {
  const notifications = readJson(MOCK_NOTIFICATION_STORAGE_KEY, []);
  if (userRole !== 'doctor') return [];
  return notifications.filter((n) => n.recipientRole === 'doctor' && String(n.recipientUserId) === String(userId));
}

/**
 * Subscribe to payment / mock-notification updates (same browser, same origin, any tab).
 * Returns unsubscribe.
 */
export function subscribeToPaymentUpdates(callback) {
  const handler = () => callback();
  window.addEventListener('appointment-payment-updated', handler);
  window.addEventListener('mock-notifications-updated', handler);

  let bc;
  try {
    bc = new BroadcastChannel(PAYMENT_SYNC_CHANNEL);
    bc.onmessage = () => callback();
  } catch {
    bc = null;
  }

  const onStorage = (event) => {
    if (
      event.key === PAYMENT_STORAGE_KEY ||
      event.key === MOCK_NOTIFICATION_STORAGE_KEY
    ) {
      callback();
    }
  };
  window.addEventListener('storage', onStorage);

  return () => {
    window.removeEventListener('appointment-payment-updated', handler);
    window.removeEventListener('mock-notifications-updated', handler);
    window.removeEventListener('storage', onStorage);
    if (bc) {
      bc.close();
    }
  };
}

export function markMockNotificationAsRead(notificationId) {
  const notifications = readJson(MOCK_NOTIFICATION_STORAGE_KEY, []);
  const updated = notifications.map((n) => (n._id === notificationId ? { ...n, read: true } : n));
  writeJson(MOCK_NOTIFICATION_STORAGE_KEY, updated);
  emitNotificationsUpdate();
}

export function markAllMockNotificationsAsRead({ userRole, userId }) {
  const notifications = readJson(MOCK_NOTIFICATION_STORAGE_KEY, []);
  const updated = notifications.map((n) => {
    if (userRole === 'doctor' && n.recipientRole === 'doctor' && String(n.recipientUserId) === String(userId)) {
      return { ...n, read: true };
    }
    return n;
  });
  writeJson(MOCK_NOTIFICATION_STORAGE_KEY, updated);
  emitNotificationsUpdate();
}
