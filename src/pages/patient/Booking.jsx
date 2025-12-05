import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Page from '../../components/ui/Page.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';

export default function Booking() {
  const [params] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState(params.get('doctorId') || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => { fetch('/api/users/doctors').then(r=>r.json()).then(d=>d.success && setDoctors(d.data)); }, []);

  function getDateTime(dt, t){
    return new Date(`${dt}T${t}:00`).toISOString();
  }

  async function book() {
    const start = getDateTime(date, time);
    const end = new Date(new Date(start).getTime() + 30*60*1000).toISOString();
    const res = await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ doctorId, start, end }) });
    const d = await res.json();
    if (!d.success) alert(d.message);
    else alert('Booked!');
  }

  // Simplified calendar: date + time input
  return (
    <Page title="Book an appointment" subtitle="Pick a doctor and a time">
      <Card>
        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-1">Doctor</span>
          <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-400 focus:ring-yellow-400" value={doctorId} onChange={(e)=>setDoctorId(e.target.value)}>
            <option value="">Select Doctor</option>
            {doctors.map((d)=> <option key={d._id} value={d._id}>{d.name} ({d.specialty})</option>)}
          </select>
        </label>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <Input label="Date" type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
          <Input label="Time" type="time" value={time} onChange={(e)=>setTime(e.target.value)} />
        </div>
        <div className="mt-4">
          <Button onClick={book}>Book Slot</Button>
        </div>
      </Card>
    </Page>
  );
}


