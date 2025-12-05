import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Page from '../../components/ui/Page.jsx';
import Card from '../../components/ui/Card.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { createAdminAccount } from '../../api/admin.js';

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
      await createAdminAccount({ email: form.email.trim(), password: form.password });
      setSuccess('Admin created. Redirecting to login…');
      setTimeout(() => navigate('/admin/login'), 800);
    } catch (err) {
      setError(err.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page title="Admin setup" subtitle="Create the first secure admin account">
      <Card className="max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <Input
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create admin'}
          </Button>
        </form>
      </Card>
    </Page>
  );
}


