import { useEffect, useState } from 'react';

export default function Messages() {
  const [sms, setSms] = useState([]);
  const token = localStorage.getItem('token');
  useEffect(() => {
    fetch('/api/notifications/sms/logs', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d) => d.success && setSms(d.data || []));
  }, []);
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold">Outgoing Messages</h2>
      <ul className="list-disc ml-6">
        {sms.map((s) => (
          <li key={s._id}>{s.to}: {s.message}</li>
        ))}
      </ul>
    </div>
  );
}


