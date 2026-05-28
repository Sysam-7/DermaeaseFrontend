import './MyProfile.page.css';
import { useEffect, useState, useRef } from 'react';
import { fetchCurrentUser, updateCurrentUser, uploadProfileImage } from '../../services/users.js';
import { profileImageUrl } from '../../utils/profileImageUrl.js';

export default function MyProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
  });
  const [profilePic, setProfilePic] = useState('');
  /** File chosen in file picker; upload runs only when user clicks Save photo */
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const token = () => localStorage.getItem('token') || '';

  useEffect(() => {
    if (!pendingPhoto) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(pendingPhoto);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingPhoto]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg({ type: '', text: '' });
      try {
        const body = await fetchCurrentUser(token());
        const u = body?.data;
        if (u) {
          setForm({
            name: u.name || '',
            email: u.email || '',
            bio: u.bio || '',
            location: u.location || '',
          });
          setProfilePic(u.profilePic || '');
        }
      } catch {
        setMsg({ type: 'error', text: 'Could not load your profile.' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    if (!form.email?.trim()) {
      setMsg({ type: 'error', text: 'Email is required.' });
      return;
    }
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const body = await updateCurrentUser(
        {
          name: form.name.trim(),
          email: form.email.trim(),
          bio: form.bio.trim(),
          location: form.location.trim(),
        },
        token()
      );
      const u = body?.data;
      if (u) {
        setForm({
          name: u.name || '',
          email: u.email || '',
          bio: u.bio || '',
          location: u.location || '',
        });
        if (u.profilePic) setProfilePic(u.profilePic);
        if (u.name) localStorage.setItem('name', u.name);
      }
      try {
        window.dispatchEvent(new CustomEvent('dermaease-profile-updated'));
      } catch {
        /* ignore */
      }
      setMsg({ type: 'success', text: body?.message || 'Profile saved.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Could not save profile.' });
    } finally {
      setSaving(false);
    }
  }

  function onPickImage(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png|gif|webp)$/i.test(file.type)) {
      setMsg({ type: 'error', text: 'Please choose a JPEG, PNG, GIF, or WebP image.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'Image must be 5 MB or smaller.' });
      return;
    }
    setMsg({ type: '', text: '' });
    setPendingPhoto(file);
  }

  async function handleSavePhoto() {
    if (!pendingPhoto) return;
    setUploading(true);
    setMsg({ type: '', text: '' });
    try {
      const body = await uploadProfileImage(pendingPhoto, token());
      const u = body?.data;
      if (u?.profilePic) setProfilePic(u.profilePic);
      setPendingPhoto(null);
      try {
        window.dispatchEvent(new CustomEvent('dermaease-profile-updated'));
      } catch {
        /* ignore */
      }
      setMsg({ type: 'success', text: body?.message || 'Profile photo saved. It will appear across the app for doctors and in your dashboard.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  }

  function cancelPendingPhoto() {
    setPendingPhoto(null);
    setMsg({ type: '', text: '' });
  }

  const savedSrc = profileImageUrl(profilePic);
  const displaySrc = previewUrl || savedSrc;
  const initial = (form.name || form.email || 'P').trim().charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="py-8 text-center text-[#6B6280] dark:text-slate-400">Loading your profile…</div>
    );
  }

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold text-[#2D2640] dark:text-gray-100 mb-1">My Profile</h2>
      <p className="text-sm text-[#6B6280] dark:text-slate-400 mb-6">
        Update your details and profile photo. After you save a new photo, it appears on chats, booking, and for your doctors.
      </p>

      <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-8">
        <div className="shrink-0">
          <div className="relative h-28 w-28 rounded-full ring-2 ring-[#E8E0F5] dark:ring-slate-600 overflow-hidden bg-[#F3EEF9] dark:bg-slate-800 flex items-center justify-center">
            {displaySrc ? (
              <img src={displaySrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-[#5B3FA8] dark:text-indigo-300">{initial}</span>
            )}
            {pendingPhoto && (
              <span className="absolute bottom-1 right-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                New
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={onPickImage}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center justify-center rounded-xl border border-[#5B3FA8] bg-white px-4 py-2.5 text-sm font-semibold text-[#5B3FA8] transition hover:bg-[#F3EEF9] dark:border-indigo-400 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700"
            >
              Choose photo
            </button>
            <button
              type="button"
              disabled={!pendingPhoto || uploading}
              onClick={handleSavePhoto}
              className="inline-flex items-center justify-center rounded-xl bg-[#5B3FA8] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A3289] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Saving…' : 'Save photo'}
            </button>
            {pendingPhoto && (
              <button
                type="button"
                onClick={cancelPendingPhoto}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            )}
          </div>
          <p className="text-xs text-[#9B8CB8] dark:text-slate-500">
            JPEG, PNG, GIF, or WebP. Max 5 MB. Choose a file, then click <strong>Save photo</strong> to apply.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#2D2640] dark:text-gray-200 mb-1">Full name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-[#E8E0F5] bg-white px-3 py-2.5 text-[#2D2640] shadow-sm focus:border-[#5B3FA8] focus:outline-none focus:ring-1 focus:ring-[#5B3FA8] dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#2D2640] dark:text-gray-200 mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-[#E8E0F5] bg-white px-3 py-2.5 text-[#2D2640] shadow-sm focus:border-[#5B3FA8] focus:outline-none focus:ring-1 focus:ring-[#5B3FA8] dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#2D2640] dark:text-gray-200 mb-1">City / location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full rounded-xl border border-[#E8E0F5] bg-white px-3 py-2.5 text-[#2D2640] shadow-sm focus:border-[#5B3FA8] focus:outline-none focus:ring-1 focus:ring-[#5B3FA8] dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100"
            placeholder="e.g. Kathmandu"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#2D2640] dark:text-gray-200 mb-1">About you</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            className="w-full rounded-xl border border-[#E8E0F5] bg-white px-3 py-2.5 text-[#2D2640] shadow-sm focus:border-[#5B3FA8] focus:outline-none focus:ring-1 focus:ring-[#5B3FA8] dark:border-slate-600 dark:bg-slate-800 dark:text-gray-100"
            placeholder="Optional note for your care team"
          />
        </div>

        {msg.text && (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              msg.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200'
                : 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200'
            }`}
          >
            {msg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-xl bg-[#5B3FA8] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A3289] disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
