import { useEffect, useState } from 'react';
import { fetchSmsLogs } from '../../services/admin.js';

export default function Messages() {
  const [sms, setSms] = useState([]);
  const token = localStorage.getItem('token');
  useEffect(() => {
    fetchSmsLogs(token).then((d) => d.success === false ? setSms([]) : setSms(d.data || [])).catch(()=>setSms([]));
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


