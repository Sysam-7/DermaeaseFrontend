import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { getPatientConversations, fetchChatHistory, sendChatMessage, fetchCurrentUser } from '../../services/users.js';
import { getDoctors } from '../../services/Aboutdoctors.js';
import { Link } from 'react-router-dom';

export default function PatientChat() {
  const [conversations, setConversations] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const s = io('/', { auth: { token } });
    s.on('chat:receive', (msg) => {
      if (selectedDoctor && (msg.senderId === selectedDoctor.userId || msg.receiverId === selectedDoctor.userId)) {
        setMessages((prev) => [...prev, msg]);
      }
      // Refresh conversations to update last message
      loadConversations();
    });
    setSocket(s);
    return () => s.close();
  }, [token]);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      loadMessages(selectedDoctor.userId);
    }
  }, [selectedDoctor]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function loadConversations() {
    try {
      setLoading(true);
      const result = await getPatientConversations(token);
      if (result.success) {
        setConversations(result.data || []);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(doctorId) {
    try {
      setLoading(true);
      const result = await fetchChatHistory(doctorId, token);
      if (result.success) {
        setMessages(result.data || []);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!messageText.trim() || !selectedDoctor || sending) return;

    try {
      setSending(true);
      const result = await sendChatMessage({ to: selectedDoctor.userId, message: messageText }, token);
      if (result.success) {
        const newMessage = {
          ...result.data,
          senderId: result.data.senderId.toString(),
          receiverId: result.data.receiverId.toString(),
        };
        setMessages((prev) => [...prev, newMessage]);
        setMessageText('');
        socket?.emit('chat:send', { to: selectedDoctor.userId, message: messageText });
        loadConversations(); // Refresh to update last message
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }

  function formatTimestamp(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
  }

  function formatMessageTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    // Get userId from token or fetch user info
    async function getUserId() {
      try {
        const userInfo = await fetchCurrentUser(token);
        if (userInfo?.data?._id || userInfo?._id) {
          setCurrentUserId((userInfo.data?._id || userInfo._id).toString());
        } else {
          // Fallback: decode JWT token (simple base64 decode)
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.userId) setCurrentUserId(payload.userId.toString());
          } catch (e) {
            console.error('Failed to decode token:', e);
          }
        }
      } catch (err) {
        console.error('Failed to get user ID:', err);
        // Fallback: decode JWT token
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.userId) setCurrentUserId(payload.userId.toString());
        } catch (e) {
          console.error('Failed to decode token:', e);
        }
      }
    }
    if (token) getUserId();
  }, [token]);

  return (
    <div className="chat-shell text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:py-12 space-y-6">
        <header className="chat-hero flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">Patient workspace</p>
            <h1 className="mt-1 text-3xl font-bold leading-tight text-slate-900">Chat with your doctors</h1>
            <p className="mt-1 text-sm text-slate-600">Connect with your healthcare providers instantly.</p>
          </div>
          <Link
            to="/patient/find-doctors"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-md transition hover:border-indigo-400 hover:text-indigo-600 hover:shadow-lg"
          >
            ← Find doctors
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="chat-surface shadow-xl overflow-hidden">
              <div className="border-b border-slate-100 px-4 py-4 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">Your doctors</h2>
                  <span className="chat-header-pill">{conversations.length} total</span>
                </div>
              </div>
              <div className="chat-scroll max-h-[calc(100vh-300px)] overflow-y-auto">
                {loading && conversations.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">Loading...</div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">No doctors available. Start a conversation!</div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.userId}
                      onClick={() => setSelectedDoctor(conv)}
                      className={`w-full text-left px-4 py-3 border-b border-slate-100 transition-all hover:bg-slate-50 ${
                        selectedDoctor?.userId === conv.userId ? 'bg-indigo-50/70 border-indigo-200 shadow-inner' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <div className="w-12 h-12 rounded-full bg-indigo-50 ring-2 ring-indigo-100 flex items-center justify-center text-indigo-600 font-semibold shadow-sm">
                            {conv.profilePic ? (
                              <img src={`/Images/doctors/${conv.profilePic}`} alt={conv.name} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                              conv.name.charAt(0).toUpperCase()
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900 truncate">{conv.name}</div>
                          <div className="text-xs text-indigo-600 truncate">{conv.specialty}</div>
                          {conv.lastMessage && (
                            <div className="text-xs text-slate-500 mt-1 truncate">
                              {conv.lastMessage.message}
                            </div>
                          )}
                          {conv.lastMessage && (
                            <div className="text-xs text-slate-400 mt-1">
                              {formatTimestamp(conv.lastMessage.timestamp)}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            {selectedDoctor ? (
              <div className="chat-surface shadow-2xl overflow-hidden flex flex-col h-[calc(100vh-220px)]">
                <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold ring-2 ring-white/40 shadow">
                      {selectedDoctor.profilePic ? (
                        <img src={`/Images/doctors/${selectedDoctor.profilePic}`} alt={selectedDoctor.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        selectedDoctor.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-white">{selectedDoctor.name}</div>
                      <div className="text-xs text-white/80">{selectedDoctor.specialty}</div>
                    </div>
                  </div>
                </div>

                <div className="chat-scroll flex-1 overflow-y-auto p-6 lg:p-8 space-y-4 bg-slate-50/70 chat-pane">
                  {loading && messages.length === 0 ? (
                    <div className="text-center text-slate-500">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                      <p className="text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isOwn = msg.senderId.toString() === currentUserId;
                      return (
                        <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`chat-bubble ${isOwn ? 'chat-bubble-own' : 'chat-bubble-other'} max-w-[72%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words`}
                          >
                            <div className="mb-1">{msg.message}</div>
                            <span className="chat-meta">
                              {formatMessageTime(msg.timestamp)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-slate-200/70 px-4 py-4 bg-white/90">
                  <div className="chat-input flex items-center gap-3 px-3 py-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Type your message..."
                      className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                      disabled={sending}
                    />
                    <button
                      onClick={handleSend}
                      disabled={sending || !messageText.trim()}
                      className="rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="chat-surface shadow-xl p-12 text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Select a doctor to start chatting</h3>
                <p className="text-sm text-slate-600">Choose a doctor from the list to begin your conversation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
