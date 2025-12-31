import { useEffect, useState } from 'react';
import Page from '../components/ui/Page.jsx';
import Card from '../components/ui/Card.jsx';
import { fetchSmsLogs } from '../services/admin.js';

export default function AdminDashboard() {
  const [sms, setSms] = useState([]);
  const token = localStorage.getItem('token');
  useEffect(() => {
    fetchSmsLogs(token)
      .then((d) => d.success === false ? setSms([]) : setSms(d.data || []))
      .catch(() => setSms([]));
  }, []);
  return (
    <Page title="Admin dashboard" subtitle="System overview and logs">
      <Card>
        <h3 className="font-semibold mb-2">Dummy SMS Logs</h3>
        <ul className="list-disc ml-6">
          {sms.map((s) => (
            <li key={s._id}>{s.to}: {s.message}</li>
          ))}
        </ul>
      </Card>
    </Page>
  );
}


