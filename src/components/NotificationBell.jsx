import { useEffect, useState } from 'react';

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const token = localStorage.getItem('token');
  useEffect(() => {
    let mounted = true;
    async function poll() {
      try {
        const res = await fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } });
        const d = await res.json();
        if (mounted && d.success) setCount((d.data || []).filter((n) => !n.read).length);
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


