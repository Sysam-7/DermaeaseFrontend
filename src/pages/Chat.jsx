import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { fetchChatHistory, sendChatMessage } from '../services/users.js';

export default function Chat() {
  const [withId, setWithId] = useState('');
  const [text, setText] = useState('');
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem('token');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io('/', { auth: { token } });
    s.on('chat:receive', (m) => setHistory((h) => [...h, m]));
    setSocket(s);
    return () => s.close();
  }, []);

  async function loadHistory() {
    const d = await fetchChatHistory(withId, token);
    if (d.success !== false) setHistory(d.data || []);
  }

  async function send() {
    if (!withId || !text) return;
    await sendChatMessage({ to: withId, message: text }, token);
    socket?.emit('chat:send', { to: withId, message: text });
    setText('');
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Chat</h2>
      <input className="border p-2 w-full" placeholder="User ID" value={withId} onChange={(e)=>setWithId(e.target.value)} />
      <button className="bg-gray-200 px-3 py-1 rounded" onClick={loadHistory}>Load History</button>
      <div className="border p-2 h-64 overflow-auto">
        {history.map((m, i) => (
          <div key={i}>{m.from ? `${m.from}: ` : ''}{m.message}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="border p-2 flex-1" value={text} onChange={(e)=>setText(e.target.value)} placeholder="Type a message" />
        <button className="bg-yellow-400 px-3 py-2 rounded" onClick={send}>Send</button>
      </div>
    </div>
  );
}


