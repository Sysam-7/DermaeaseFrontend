import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Page from '../../components/ui/Page.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { listDoctorsForUsers } from '../../services/users.js';

export default function SearchDoctors() {
  const [q, setQ] = useState({ specialty: '', location: '', rating: '' });
  const [doctors, setDoctors] = useState([]);
  function load() {
    const params = new URLSearchParams();
    Object.entries(q).forEach(([k, v]) => v && params.append(k, v));
    listDoctorsForUsers(params.toString()).then((d)=> d.success === false ? setDoctors([]) : setDoctors(d.data || [])).catch(()=>setDoctors([]));
  }
  useEffect(() => { load(); }, []);
  return (
    <Page title="Find a doctor" subtitle="Filter by specialty, location and rating">
      <Card className="mb-4">
        <div className="grid md:grid-cols-3 gap-3">
          <Input label="Specialty" placeholder="Dermatology" value={q.specialty} onChange={(e)=>setQ({...q,specialty:e.target.value})} />
          <Input label="Location" placeholder="City" value={q.location} onChange={(e)=>setQ({...q,location:e.target.value})} />
          <Input label="Min Rating" placeholder="4" value={q.rating} onChange={(e)=>setQ({...q,rating:e.target.value})} />
        </div>
        <div className="mt-3">
          <Button onClick={load}>Search</Button>
        </div>
      </Card>
      <div className="grid md:grid-cols-2 gap-4">
        {doctors.map((d)=> (
          <Card key={d._id}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-lg">{d.name}</div>
                <div className="text-gray-600">{d.specialty} • {d.location}</div>
                <div className="mt-1">⭐ {d.rating || 0}</div>
              </div>
              <Link className="underline" to={`/patient/doctor/${d._id}`}>View</Link>
            </div>
          </Card>
        ))}
      </div>
    </Page>
  );
}


