import React from 'react';

export default function Settings() {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">Settings</h2>
      <p>Notification preferences are simplified for this demo.</p>
      <ChangePassword />
    </div>
  );
}

function ChangePassword(){
  const token = localStorage.getItem('token');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [msg, setMsg] = React.useState('');
  async function submit(e){
    e.preventDefault();
    const res = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ currentPassword, newPassword }) });
    const d = await res.json();
    setMsg(d.message || (d.success ? 'Changed' : 'Failed'));
  }
  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-semibold mb-2">Change Password</h3>
      {msg && <p className="text-sm text-gray-600">{msg}</p>}
      <form onSubmit={submit} className="space-y-2 max-w-sm">
        <input className="border p-2 w-full" placeholder="Current password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} />
        <input className="border p-2 w-full" placeholder="New password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} />
        <button className="bg-yellow-400 px-3 py-2 rounded" type="submit">Update</button>
      </form>
    </div>
  );
}


