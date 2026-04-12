import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAdminUsers, deleteUserByAdmin, unrestrictUserByAdmin } from '../../services/admin.js';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [reasonMap, setReasonMap] = useState({});
  const [deleteCodeMap, setDeleteCodeMap] = useState({});
  const [popup, setPopup] = useState({ open: false, title: '', message: '', tone: 'success' });

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  useEffect(() => {
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    let active = true;
    async function loadUsers() {
      setLoading(true);
      setError('');
      try {
        const data = await fetchAdminUsers(token);
        if (!active) return;
        setUsers(data.data || []);
      } catch (err) {
        if (!active) return;
        if (err.status === 401) {
          localStorage.removeItem('admin_token');
          navigate('/admin/login', { replace: true });
          return;
        }
        setError(err.message || 'Failed to fetch users');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUsers();
    return () => {
      active = false;
    };
  }, [navigate, token]);

  function showPopup(title, message, tone = 'success') {
    setPopup({ open: true, title, message, tone });
  }

  async function handleDelete(id) {
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }

    const reason = (reasonMap[id] || '').trim();
    if (!reason) {
      showPopup('Missing reason', 'Please enter a reason before removing the user.', 'error');
      return;
    }
    if ((deleteCodeMap[id] || '').trim().toUpperCase() !== 'DELETE') {
      showPopup('Confirmation needed', 'Please type DELETE to confirm removal.', 'error');
      return;
    }

    try {
      await deleteUserByAdmin(id, reason, token);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, accessStatus: 'deleted', accessReason: reason } : u))
      );
      if (selectedUser?._id === id) {
        setSelectedUser((prev) => (prev ? { ...prev, accessStatus: 'deleted', accessReason: reason } : prev));
      }
      showPopup('User removed', 'User has been deleted successfully.');
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login', { replace: true });
        return;
      }
      showPopup('Remove failed', err.message || 'Failed to remove user', 'error');
    }
  }

  async function handleRestore(id) {
    if (!token) {
      navigate('/admin/login', { replace: true });
      return;
    }
    try {
      await unrestrictUserByAdmin(id, token);
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, accessStatus: 'active', accessReason: '' } : u))
      );
      if (selectedUser?._id === id) {
        setSelectedUser((prev) => (prev ? { ...prev, accessStatus: 'active', accessReason: '' } : prev));
      }
      showPopup('User restored', 'User has been restored successfully.');
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login', { replace: true });
        return;
      }
      showPopup('Restore failed', err.message || 'Failed to restore user', 'error');
    }
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  }

  const roleFilteredUsers = users.filter((u) => {
    if (roleFilter === 'all') return true;
    return u.role === roleFilter;
  });

  const searchedUsers = roleFilteredUsers.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q) ||
      (u._id || '').toLowerCase().includes(q)
    );
  });

  const visibleUsers = searchedUsers.filter((u) => {
    if (userFilter === 'active') return (u.accessStatus || 'active') === 'active';
    if (userFilter === 'removed') return u.accessStatus === 'deleted';
    return true;
  });

  const activeCount = users.filter((u) => (u.accessStatus || 'active') === 'active').length;
  const removedCount = users.filter((u) => u.accessStatus === 'deleted').length;
  const patientCount = users.filter((u) => u.role === 'patient').length;
  const doctorCount = users.filter((u) => u.role === 'doctor').length;

  return (
    <div className="min-h-screen bg-[#F4F1FA] text-[#2D2640] dark:bg-slate-950 dark:text-gray-100">
      <div className="flex min-h-screen">
        <aside className="flex w-[270px] shrink-0 flex-col justify-between border-r border-[#E8E0F5] bg-white px-4 py-8 shadow-[4px_0_32px_rgba(91,63,168,0.06)] dark:border-slate-700 dark:bg-slate-900">
          <div>
            <div className="mb-10 flex items-center gap-3 px-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#7C5DD6] to-[#5B3FA8] text-lg font-bold text-white shadow-md">
                A
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-[#2D2640] dark:text-gray-100">DermaEase</h2>
                <p className="text-xs text-[#8B7EAE] dark:text-slate-400">Admin portal</p>
              </div>
            </div>

            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#9B8CB8] dark:text-slate-500">
              Control Center
            </p>
            <div className="space-y-2 px-2 text-sm">
              <div className="rounded-xl bg-[#F3EEF9] px-3 py-2 dark:bg-violet-950/40">
                <span className="font-semibold">Users:</span> {users.length}
              </div>
              <div className="rounded-xl bg-[#F8F5FD] px-3 py-2 dark:bg-slate-800">
                <span className="font-semibold">Patients:</span> {patientCount}
              </div>
              <div className="rounded-xl bg-[#F8F5FD] px-3 py-2 dark:bg-slate-800">
                <span className="font-semibold">Doctors:</span> {doctorCount}
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700">
            Logout
          </button>
        </aside>

        <main className="flex-1 px-6 py-8 sm:px-10">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-[#6B6280] dark:text-slate-400">
              Review user profiles and remove accounts with proper reason tracking.
            </p>
          </header>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setUserFilter('active')}
              className={`rounded-2xl bg-white p-4 text-left shadow-sm ring-1 transition dark:bg-slate-900 ${
                userFilter === 'active'
                  ? 'ring-[#5B3FA8] dark:ring-indigo-500'
                  : 'ring-[#E8E0F5] dark:ring-slate-700'
              }`}
            >
              <p className="text-xs uppercase tracking-wide text-[#9B8CB8]">Active users</p>
              <p className="mt-2 text-2xl font-bold">{activeCount}</p>
            </button>
            <button
              type="button"
              onClick={() => setUserFilter('removed')}
              className={`rounded-2xl bg-white p-4 text-left shadow-sm ring-1 transition dark:bg-slate-900 ${
                userFilter === 'removed'
                  ? 'ring-[#5B3FA8] dark:ring-indigo-500'
                  : 'ring-[#E8E0F5] dark:ring-slate-700'
              }`}
            >
              <p className="text-xs uppercase tracking-wide text-[#9B8CB8]">Removed users</p>
              <p className="mt-2 text-2xl font-bold">{removedCount}</p>
            </button>
            <button
              type="button"
              onClick={() => setUserFilter('all')}
              className={`rounded-2xl bg-white p-4 text-left shadow-sm ring-1 transition dark:bg-slate-900 ${
                userFilter === 'all'
                  ? 'ring-[#5B3FA8] dark:ring-indigo-500'
                  : 'ring-[#E8E0F5] dark:ring-slate-700'
              }`}
            >
              <p className="text-xs uppercase tracking-wide text-[#9B8CB8]">Visible now</p>
              <p className="mt-2 text-2xl font-bold">{visibleUsers.length}</p>
            </button>
          </div>

          <div className="mb-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                roleFilter === 'all'
                  ? 'bg-[#5B3FA8] text-white'
                  : 'bg-white text-[#2D2640] ring-1 ring-[#E8E0F5] dark:bg-slate-900 dark:text-gray-100 dark:ring-slate-700'
              }`}
            >
              All Users
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('patient')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                roleFilter === 'patient'
                  ? 'bg-[#5B3FA8] text-white'
                  : 'bg-white text-[#2D2640] ring-1 ring-[#E8E0F5] dark:bg-slate-900 dark:text-gray-100 dark:ring-slate-700'
              }`}
            >
              Patients Only
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('doctor')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                roleFilter === 'doctor'
                  ? 'bg-[#5B3FA8] text-white'
                  : 'bg-white text-[#2D2640] ring-1 ring-[#E8E0F5] dark:bg-slate-900 dark:text-gray-100 dark:ring-slate-700'
              }`}
            >
              Doctors Only
            </button>
          </div>

          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, role, or user id..."
              className="w-full rounded-xl border border-[#E8E0F5] bg-white px-4 py-3 text-sm outline-none ring-[#5B3FA8] focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          {error && <p className="mb-4 text-red-600">{error}</p>}
          {loading ? (
            <div className="rounded-2xl bg-white p-4 dark:bg-slate-900">Loading users...</div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-2xl border border-[#E8E0F5] bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h2 className="mb-3 text-lg font-semibold">
                  {userFilter === 'active' ? 'Active Users' : userFilter === 'removed' ? 'Removed Users' : 'All Users'}
                </h2>
                <div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
                  {visibleUsers.map((u) => (
                    <div key={u._id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{u.name || 'Unnamed user'}</p>
                          <p className="text-sm text-slate-500">{u.email}</p>
                          <p className="text-xs uppercase tracking-wide text-[#5B3FA8]">{u.role}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.accessStatus === 'deleted' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'}`}>
                          {u.accessStatus || 'active'}
                        </span>
                      </div>

                      <p className="mt-2 text-xs">
                        ID: <span className="font-mono">{u._id}</span>
                      </p>
                      {u.accessReason && <p className="mt-1 text-xs text-rose-500">Reason: {u.accessReason}</p>}

                      <input
                        type="text"
                        placeholder="Reason for removal"
                        value={reasonMap[u._id] || ''}
                        onChange={(e) => setReasonMap((prev) => ({ ...prev, [u._id]: e.target.value }))}
                        className="mt-3 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
                        disabled={(u.accessStatus || 'active') === 'deleted'}
                      />
                      <input
                        type="text"
                        placeholder="Type DELETE to confirm"
                        value={deleteCodeMap[u._id] || ''}
                        onChange={(e) => setDeleteCodeMap((prev) => ({ ...prev, [u._id]: e.target.value }))}
                        className="mt-2 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800"
                        disabled={(u.accessStatus || 'active') === 'deleted'}
                      />
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => setSelectedUser(u)} className="rounded-md bg-slate-700 px-3 py-1.5 text-xs text-white hover:bg-slate-800">
                          View Profile
                        </button>
                        {(u.accessStatus || 'active') === 'deleted' ? (
                          <button onClick={() => handleRestore(u._id)} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
                            Restore
                          </button>
                        ) : (
                          <button onClick={() => handleDelete(u._id)} className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700">
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {visibleUsers.length === 0 && <p className="text-sm text-slate-500">No users match your search.</p>}
                </div>
              </section>

              <section className="rounded-2xl border border-[#E8E0F5] bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h2 className="mb-3 text-lg font-semibold">Selected Profile</h2>
                {selectedUser ? (
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Name:</span> {selectedUser.name || '-'}</p>
                    <p><span className="font-semibold">Email:</span> {selectedUser.email || '-'}</p>
                    <p><span className="font-semibold">User ID:</span> <span className="font-mono">{selectedUser._id}</span></p>
                    <p><span className="font-semibold">Role:</span> {selectedUser.role}</p>
                    <p><span className="font-semibold">Specialty:</span> {selectedUser.specialty || '-'}</p>
                    <p><span className="font-semibold">Location:</span> {selectedUser.location || '-'}</p>
                    <p><span className="font-semibold">Bio:</span> {selectedUser.bio || '-'}</p>
                    <p><span className="font-semibold">Access Status:</span> {selectedUser.accessStatus || 'active'}</p>
                    <p><span className="font-semibold">Reason:</span> {selectedUser.accessReason || '-'}</p>
                    <p><span className="font-semibold">Joined:</span> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : '-'}</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Choose a user from the list to view full details.</p>
                )}
              </section>
            </div>
          )}
        </main>
      </div>

      {popup.open && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900">
            <h3 className={`text-lg font-bold ${popup.tone === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
              {popup.title}
            </h3>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{popup.message}</p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setPopup({ open: false, title: '', message: '', tone: 'success' })}
                className="rounded-lg bg-[#5B3FA8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a3289]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


