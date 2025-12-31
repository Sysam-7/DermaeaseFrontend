import React, { useState } from 'react';
import AuthInput from '../components/AuthInput.jsx';
import AuthButton from '../components/AuthButton.jsx';
import { changePassword } from '../services/auth.js';
import { useToast } from '../contexts/ToastContext.jsx';

export default function ChangePasswordPage() {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function handleSubmit(e) {
    e?.preventDefault();
    if (!oldPass || !newPass) {
      toast.addToast('All fields required', 'error');
      return;
    }
    if (newPass !== confirm) {
      toast.addToast('Passwords do not match', 'error');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await changePassword({ oldPassword: oldPass, newPassword: newPass, token });
      toast.addToast('Password changed successfully', 'success');
      setOldPass(''); setNewPass(''); setConfirm('');
    } catch (err) {
      toast.addToast(err.message || 'Change failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-semibold mb-4">Change password</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <AuthInput label="Current password" type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} />
        <AuthInput label="New password" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} />
        <AuthInput label="Confirm new password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
        <div className="flex justify-end">
          <AuthButton type="submit" loading={loading}>Change password</AuthButton>
        </div>
      </form>
    </div>
  );
}