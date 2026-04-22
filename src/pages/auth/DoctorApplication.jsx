import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { applyDoctorApplication } from '../../services/auth.js';
import PasswordInput from '../../components/PasswordInput.jsx';

function strongPassword(p) {
  return p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /\d/.test(p);
}

export default function DoctorApplication() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    licenseNumber: '',
    specialization: '',
  });
  const [files, setFiles] = useState({
    medicalLicense: null,
    degreeCertificate: null,
    idDocument: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [popupMessage, setPopupMessage] = useState('');

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateFile(key, file) {
    setFiles((prev) => ({ ...prev, [key]: file || null }));
  }

  function renderUploadCard(key, title, hint) {
    const file = files[key];
    return (
      <label className="group relative flex min-h-[132px] cursor-pointer flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-indigo-400 hover:bg-indigo-50/50">
        <input
          type="file"
          className="sr-only"
          onChange={(e) => updateFile(key, e.target.files?.[0])}
          required
        />
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        </div>
        <div className="mt-3">
          <span className="inline-flex rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm group-hover:border-indigo-300">
            {file ? 'Replace file' : 'Choose file'}
          </span>
          <p className="mt-2 truncate text-xs text-slate-600">
            {file ? file.name : 'No file selected'}
          </p>
        </div>
      </label>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    const { name, email, password, licenseNumber, specialization } = form;
    if (!name || !email || !password || !licenseNumber || !specialization) {
      setMessage('Please fill in all required details.');
      return;
    }
    if (!strongPassword(password)) {
      setMessage('Password must be 8+ chars with uppercase, lowercase, and a number.');
      return;
    }
    if (!files.medicalLicense || !files.degreeCertificate || !files.idDocument) {
      setMessage('Please upload your license, degree certificate, and ID document.');
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('name', name);
      payload.append('email', email);
      payload.append('password', password);
      payload.append('licenseNumber', licenseNumber);
      payload.append('specialization', specialization);
      payload.append('medicalLicense', files.medicalLicense);
      payload.append('degreeCertificate', files.degreeCertificate);
      payload.append('idDocument', files.idDocument);
      await applyDoctorApplication(payload);
      setPopupMessage('Your doctor application was submitted successfully. Please wait for admin approval.');
    } catch (err) {
      setMessage(err?.message || 'Could not submit application');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-10">
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-40 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="mx-auto w-full max-w-5xl rounded-3xl border border-white/70 bg-white/80 shadow-2xl backdrop-blur-xl">
          <div className="grid md:grid-cols-[1.1fr_1.4fr]">
            <section className="rounded-l-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white">
              <h1 className="text-3xl font-extrabold leading-tight">Apply as a Verified Doctor</h1>
              <p className="mt-4 text-indigo-100">
                Submit your professional details and required documents. Our admin team reviews each application before doctor features are enabled.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-indigo-100">
                <li>Secure document upload</li>
                <li>Manual verification by admin</li>
                <li>Approval notification on your account</li>
              </ul>
              <Link to="/register" className="mt-8 inline-block rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/30">
                Back to User Registration
              </Link>
            </section>

            <section className="p-8 md:p-10">
              <h2 className="text-2xl font-bold text-slate-900">Doctor Application Form</h2>
              <p className="mt-1 text-sm text-slate-500">Fill everything accurately for faster approval.</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <input className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500" placeholder="Full name" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
                <input className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500" type="email" placeholder="Professional email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
                <PasswordInput
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-20 outline-none focus:border-indigo-500"
                  containerClassName="w-full"
                />
                <input className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500" placeholder="Medical license number" value={form.licenseNumber} onChange={(e) => updateField('licenseNumber', e.target.value)} required />
                <input className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500" placeholder="Specialization (e.g. Dermatology)" value={form.specialization} onChange={(e) => updateField('specialization', e.target.value)} required />

                <div className="grid gap-3 md:grid-cols-3">
                  {renderUploadCard('medicalLicense', 'Medical License', 'Upload your official medical license copy')}
                  {renderUploadCard('degreeCertificate', 'Degree Certificate', 'Upload degree or completion certificate')}
                  {renderUploadCard('idDocument', 'Government ID', 'Upload citizenship/passport/national ID')}
                </div>

                {message && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p>}

                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" disabled={loading} className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:shadow-xl disabled:opacity-60">
                    {loading ? 'Submitting...' : 'Submit for Approval'}
                  </button>
                  <Link to="/login" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-300 hover:text-indigo-700">
                    Already have an account?
                  </Link>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>

      {popupMessage && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-bold text-emerald-600">Application Submitted</h3>
            <p className="mt-2 text-sm text-slate-700">{popupMessage}</p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setPopupMessage('');
                  navigate('/login');
                }}
                className="rounded-lg bg-[#5B3FA8] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a3289]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

