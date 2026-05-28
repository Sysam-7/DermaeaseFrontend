import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getAllPatients, createPrescription, fetchCurrentUser, sendPrescriptionToPatient } from '../../services/users.js';
import NotificationBell from '../../components/NotificationBell';
import Toast from '../../components/Toast';
import DoctorPageShell from '../../components/doctor/DoctorPageShell';
import DoctorPageHeader from '../../components/doctor/DoctorPageHeader';
import { doctorCard, doctorCardStatic, doctorBtnPrimary, doctorBtnSecondary, doctorInput, doctorLabel } from '../../components/doctor/doctorTheme';
import { avatarImageUrl } from '../../utils/profileImageUrl.js';

export default function PrescriptionGenerator() {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [disease, setDisease] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '', notes: '' }]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [toast, setToast] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const patientSearchRef = useRef(null);
  const token = localStorage.getItem('token');

  // Common skin diseases for autocomplete
  const commonSkinDiseases = [
    'Acne', 'Eczema', 'Psoriasis', 'Dermatitis', 'Rosacea', 'Melasma',
    'Vitiligo', 'Warts', 'Fungal Infection', 'Bacterial Infection',
    'Allergic Reaction', 'Contact Dermatitis', 'Seborrheic Dermatitis',
    'Urticaria', 'Atopic Dermatitis', 'Sebaceous Cyst', 'Mole', 'Skin Tag'
  ];

  useEffect(() => {
    loadPatients();
    loadDoctorInfo();
  }, []);

  async function loadPatients() {
    try {
      setLoading(true);
      const result = await getAllPatients(token);
      if (result.success) {
        // Transform the data to match the expected format
        const patientsList = (result.data || []).map(patient => ({
          userId: patient._id || patient.id,
          name: patient.name || 'Unknown',
          email: patient.email || '',
          profilePic: patient.profilePic || null
        }));
        setPatients(patientsList);
      }
    } catch (err) {
      console.error('Failed to load patients:', err);
      setToast({ message: 'Failed to load patients. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function loadDoctorInfo() {
    try {
      const userInfo = await fetchCurrentUser(token);
      if (userInfo?.data?.name || userInfo?.name) {
        setDoctorName(userInfo.data?.name || userInfo.name);
      }
    } catch (err) {
      console.error('Failed to load doctor info:', err);
    }
  }

  function addMedicine() {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', notes: '' }]);
  }

  function removeMedicine(index) {
    setMedicines(medicines.filter((_, i) => i !== index));
  }

  function updateMedicine(index, field, value) {
    setMedicines(medicines.map((med, i) => (i === index ? { ...med, [field]: value } : med)));
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (patientSearchRef.current && !patientSearchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  async function handleCreateAndSendPrescription() {
    if (!selectedPatientId) {
      setToast({ message: 'Please select a patient', type: 'error' });
      return;
    }
    if (!disease.trim()) {
      setToast({ message: 'Please enter the disease/condition', type: 'error' });
      return;
    }
    if (medicines.length === 0 || medicines.every(m => !m.name.trim())) {
      setToast({ message: 'Please add at least one medicine', type: 'error' });
      return;
    }

    try {
      setSaving(true);
      const content = {
        disease: disease.trim(),
        medicines: medicines.filter(m => m.name.trim()),
        notes: additionalNotes.trim()
      };

      // Create prescription
      const createResult = await createPrescription(
        { patientId: selectedPatientId, content },
        token
      );

      if (createResult.success) {
        // Send prescription to patient
        const sendResult = await sendPrescriptionToPatient(createResult.data._id, token);
        
        if (sendResult.success) {
          setToast({ 
            message: 'Prescription created and sent to patient successfully! The patient has been notified.', 
            type: 'success' 
          });
          // Reset form
          setDisease('');
          setMedicines([{ name: '', dosage: '', frequency: '', duration: '', notes: '' }]);
          setAdditionalNotes('');
          setSelectedPatientId('');
          setSelectedPatientName('');
          setPatientSearch('');
          setShowSuggestions(false);
        } else {
          setToast({ 
            message: 'Prescription created but failed to send. You can send it from the chat page.', 
            type: 'error' 
          });
        }
      } else {
        setToast({ 
          message: createResult.message || 'Failed to create prescription. Please try again.', 
          type: 'error' 
        });
      }
    } catch (err) {
      console.error('Failed to create/send prescription:', err);
      setToast({ 
        message: err.message || 'Failed to create prescription. Please check your connection and try again.', 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <DoctorPageShell>
      <DoctorPageHeader title="Prescription Generator" subtitle="Create and manage prescriptions for your patients" />

        <div className="rounded-2xl bg-white p-8 shadow-[0_4px_24px_rgba(91,63,168,0.08)] ring-1 ring-[#E8E0F5] dark:bg-slate-900 dark:ring-slate-700">
          <div className="space-y-6">
            {/* Patient Selection */}
            <div className="relative" ref={patientSearchRef}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Select Patient *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setShowSuggestions(true);
                    setSelectedPatientId('');
                    setSelectedPatientName('');
                  }}
                  onFocus={() => {
                    if (patientSearch) setShowSuggestions(true);
                  }}
                  placeholder="Type patient name to search..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#5B3FA8] focus:border-[#5B3FA8] outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                  disabled={loading}
                />
                {selectedPatientId && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#F3EEF9] text-[#5B3FA8] rounded-lg text-sm font-medium">
                      Selected: {selectedPatientName}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatientId('');
                        setSelectedPatientName('');
                        setPatientSearch('');
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && patientSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {(() => {
                    const filtered = patients.filter(patient => {
                      const searchLower = patientSearch.toLowerCase();
                      const nameLower = (patient.name || '').toLowerCase();
                      const emailLower = (patient.email || '').toLowerCase();
                      return nameLower.startsWith(searchLower) || emailLower.startsWith(searchLower);
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="px-4 py-3 text-gray-500 text-sm">
                          No patients found starting with "{patientSearch}"
                        </div>
                      );
                    }

                    return filtered.map((patient) => (
                      <button
                        key={patient.userId}
                        type="button"
                        onClick={() => {
                          setSelectedPatientId(patient.userId);
                          setSelectedPatientName(patient.name);
                          setPatientSearch(patient.name);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-[#F3EEF9] transition flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                          {avatarImageUrl(patient.profilePic, 'patients') ? (
                            <img
                              src={avatarImageUrl(patient.profilePic, 'patients')}
                              alt={patient.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            (patient.name || 'P').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{patient.name}</div>
                          {patient.email && (
                            <div className="text-xs text-gray-500 truncate">{patient.email}</div>
                          )}
                        </div>
                      </button>
                    ));
                  })()}
                </div>
              )}

              {patients.length === 0 && !loading && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  No patients found in the system.
                </p>
              )}
            </div>

            {/* Disease/Condition */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Disease/Condition *
              </label>
              <input
                type="text"
                value={disease}
                onChange={(e) => setDisease(e.target.value)}
                list="diseases"
                placeholder="Enter skin disease or condition"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#5B3FA8] focus:border-[#5B3FA8] outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              />
              <datalist id="diseases">
                {commonSkinDiseases.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>

            {/* Medicines */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Medicines *
                </label>
                <button
                  onClick={addMedicine}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
                >
                  + Add Medicine
                </button>
              </div>

              <div className="space-y-4">
                {medicines.map((med, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Medicine {index + 1}
                      </span>
                      {medicines.length > 1 && (
                        <button
                          onClick={() => removeMedicine(index)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Medicine Name *</label>
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                          placeholder="e.g., Clindamycin Gel"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#5B3FA8] focus:border-[#5B3FA8] outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Dosage *</label>
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                          placeholder="e.g., 1%"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#5B3FA8] focus:border-[#5B3FA8] outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Frequency</label>
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                          placeholder="e.g., Twice daily"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#5B3FA8] focus:border-[#5B3FA8] outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Duration</label>
                        <input
                          type="text"
                          value={med.duration}
                          onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                          placeholder="e.g., 2 weeks"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#5B3FA8] focus:border-[#5B3FA8] outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">Notes/Instructions</label>
                        <textarea
                          value={med.notes}
                          onChange={(e) => updateMedicine(index, 'notes', e.target.value)}
                          placeholder="Additional instructions for this medicine"
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#5B3FA8] focus:border-[#5B3FA8] outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Additional Notes / Instructions
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="General instructions, follow-up date, precautions, etc."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#5B3FA8] focus:border-[#5B3FA8] outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleCreateAndSendPrescription}
                disabled={saving || loading || !selectedPatientId}
                className="px-6 py-3 bg-[#5B3FA8] text-white rounded-xl font-semibold hover:bg-[#4A3289] transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Creating & Sending...' : 'Create & Send Prescription'}
              </button>
              <Link
                to="/doctor/chats"
                className={`px-6 py-3 ${doctorBtnSecondary}`}
              >
                Go to Chats
              </Link>
            </div>

            <div className="bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-xl p-4 mt-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> The prescription will be created and automatically sent to the selected patient. 
                The patient will receive a notification immediately.
              </p>
            </div>
          </div>
        </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={5000}
        />
      )}
    </DoctorPageShell>
  );
}

