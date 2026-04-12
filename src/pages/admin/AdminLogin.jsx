import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../services/admin.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginAdmin({
        email: form.email.trim(),
        password: form.password,
      });
      localStorage.setItem('admin_token', data.token);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const reasonText = err?.body?.reason ? ` Reason: ${err.body.reason}` : '';
      setError((err.message || 'Login failed') + reasonText);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F1FA] p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-md rounded-2xl border border-[#E8E0F5] bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-[#2D2640] dark:text-gray-100">Admin Portal Login</h1>
        <p className="mt-1 text-sm text-[#6B6280] dark:text-slate-400">Access with admin credentials.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input name="email" type="email" placeholder="Admin email" value={form.email} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100" />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#5B3FA8] px-4 py-2 font-semibold text-white hover:bg-[#4a3289] disabled:opacity-60">
            {loading ? 'Signing in...' : 'Login as Admin'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          First time? <Link className="font-semibold text-[#5B3FA8]" to="/admin/register">Register first admin</Link>
        </p>
      </div>
    </div>
  );
}


