import { useEffect, useState } from 'react';
import { fetchNotifications } from '../services/users.js';

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const token = localStorage.getItem('token');
  useEffect(() => {
    let mounted = true;
    async function poll() {
      try {
        const d = await fetchNotifications(token);
        if (mounted && d) setCount((d.data || d.notifications || []).filter((n) => !n.read).length);
      } catch {}
    }
    poll();
    const id = setInterval(poll, 8000);
    return () => { mounted = false; clearInterval(id); };
  }, []);
  return (
    <div className="relative inline-block">
      <span>🔔</span>
      {count > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">{count}</span>}
    </div>
  );
}


