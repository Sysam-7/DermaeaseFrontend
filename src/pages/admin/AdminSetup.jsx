import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerFirstAdmin } from '../../services/admin.js';
import PasswordInput from '../../components/PasswordInput.jsx';

export default function AdminSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await registerFirstAdmin({
        email: form.email.trim(),
        password: form.password,
      });
      setSuccess('Admin created. Redirecting to login…');
      setTimeout(() => navigate('/admin/login'), 800);
    } catch (err) {
      setError(err.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F1FA] p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-lg rounded-2xl border border-[#E8E0F5] bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-[#2D2640] dark:text-gray-100">Register First Admin</h1>
        <p className="mt-1 text-sm text-[#6B6280] dark:text-slate-400">This can be done only once.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input name="email" type="email" placeholder="Admin email" value={form.email} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100" />
          <PasswordInput
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-20 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100"
            containerClassName="w-full"
          />
          <PasswordInput
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-20 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100"
            containerClassName="w-full"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <button type="submit" className="w-full rounded-lg bg-[#5B3FA8] px-4 py-2 font-semibold text-white hover:bg-[#4a3289] disabled:opacity-60" disabled={loading}>
            {loading ? 'Creating...' : 'Create Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}


