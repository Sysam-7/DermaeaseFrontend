import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/users.js';
import { verifyToken } from '../services/auth.js';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    
    loadNotifications();
    
    // Set up socket for real-time notifications
    let socket;
    (async () => {
      try {
        const vb = await verifyToken(token);
        if (vb && vb.success && vb.data?.user) {
          const user = vb.data.user;
          socket = io(API, { transports: ['websocket'] });
          socket.on('connect', () => {
            socket.emit('join', user._id);
          });
          
          // Listen for new chat messages
          socket.on('new-chat-message', () => {
            loadNotifications(); // Reload notifications when new chat message arrives
          });
          
          // Listen for appointment updates
          socket.on('new-appointment', () => {
            loadNotifications(); // Reload notifications when new appointment arrives
          });
          
          socket.on('appointment-updated', () => {
            loadNotifications(); // Reload notifications when appointment status changes
          });
        }
      } catch (err) {
        console.error('Socket setup error:', err);
      }
    })();
    
    // Poll for new notifications every 10 seconds as backup
    const interval = setInterval(loadNotifications, 10000);
    
    return () => {
      clearInterval(interval);
      if (socket) socket.disconnect();
    };
  }, [token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    if (!token) return;
    try {
      const response = await fetchNotifications(token);
      const notificationList = response.data || response.notifications || [];
      setNotifications(notificationList);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification._id, token);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
        );
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }

    // Navigate based on notification type and role
    const userRole = localStorage.getItem('role');
    
    if (notification.appointmentId) {
      if (userRole === 'doctor') {
        navigate('/doctor/manage-appointments');
      } else if (userRole === 'patient') {
        navigate('/patient/appointments');
      }
    } else if (notification.type === 'chat_message') {
      // Navigate to chat page
      if (userRole === 'doctor') {
        navigate('/doctor/chats');
      } else if (userRole === 'patient') {
        navigate('/patient/chat');
      }
    }

    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    try {
      await markAllNotificationsAsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    if (type === 'appointment_request') return '📅';
    if (type === 'appointment_confirmed') return '✅';
    if (type === 'appointment_cancelled') return '❌';
    if (type === 'appointment_completed') return '✔️';
    if (type === 'chat_message') return '💬';
    return '🔔';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-full transition"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-5 w-5 text-xs text-white bg-red-500 rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-gray-300"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            !notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {notification.message}
                        </p>
                        {notification.appointmentId && typeof notification.appointmentId === 'object' && (
                          <>
                            {notification.appointmentId.patientId && typeof notification.appointmentId.patientId === 'object' && (
                              <p className="text-xs text-gray-500 mt-1">
                                Patient: {notification.appointmentId.patientId.name || 'Unknown'}
                              </p>
                            )}
                            {notification.appointmentId.doctorId && typeof notification.appointmentId.doctorId === 'object' && (
                              <p className="text-xs text-gray-500 mt-1">
                                Doctor: {notification.appointmentId.doctorId.name || 'Unknown'}
                              </p>
                            )}
                            {notification.appointmentId.date && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.appointmentId.date).toLocaleDateString()}
                                {notification.appointmentId.time && ` at ${notification.appointmentId.time}`}
                              </p>
                            )}
                          </>
                        )}
                        {notification.relatedData && (
                          <>
                            {notification.relatedData.patientName && (
                              <p className="text-xs text-gray-500 mt-1">
                                Patient: {notification.relatedData.patientName}
                              </p>
                            )}
                            {notification.relatedData.doctorName && (
                              <p className="text-xs text-gray-500 mt-1">
                                Doctor: {notification.relatedData.doctorName}
                              </p>
                            )}
                            {notification.relatedData.senderName && (
                              <p className="text-xs text-gray-500 mt-1">
                                From: {notification.relatedData.senderName}
                              </p>
                            )}
                            {notification.relatedData.message && notification.type === 'chat_message' && (
                              <p className="text-xs text-gray-400 mt-1 italic">
                                "{notification.relatedData.message}"
                              </p>
                            )}
                          </>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
