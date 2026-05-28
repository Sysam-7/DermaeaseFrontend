import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchPrescriptions } from '../../services/users.js';
import PatientPageShell from '../../components/patient/PatientPageShell';
import PatientPageHeader from '../../components/patient/PatientPageHeader';
import { patientCardStatic, patientBtnPrimary, patientBtnSecondary } from '../../components/patient/patientTheme';

export default function ViewPrescription() {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadPrescription();
  }, [prescriptionId]);

  async function loadPrescription() {
    try {
      setLoading(true);
      setError('');
      const result = await fetchPrescriptions(token);
      if (result.success) {
        const prescriptions = result.data || [];
        const found = prescriptions.find(
          p => p._id === prescriptionId || p._id?.toString() === prescriptionId
        );
        if (found) {
          setPrescription(found);
        } else {
          setError('Prescription not found');
        }
      } else {
        setError('Failed to load prescription');
      }
    } catch (err) {
      console.error('Failed to load prescription:', err);
      setError(err.message || 'Failed to load prescription');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  if (loading) {
    return (
      <PatientPageShell mainClassName="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#5B3FA8]" />
          <p className="text-[#6B6280]">Loading prescription...</p>
        </div>
      </PatientPageShell>
    );
  }

  if (error || !prescription) {
    return (
      <PatientPageShell mainClassName="max-w-4xl">
        <div className={`${patientCardStatic} p-8 text-center`}>
          <div className="mb-4 text-6xl">❌</div>
          <h2 className="mb-2 text-2xl font-bold text-[#2D2640]">Prescription Not Found</h2>
          <p className="mb-6 text-[#6B6280]">{error || 'The prescription you are looking for does not exist.'}</p>
          <Link to="/patient" className={patientBtnPrimary}>
            Back to Dashboard
          </Link>
        </div>
      </PatientPageShell>
    );
  }

  const doctorName = prescription.doctorId?.name || prescription.doctorId || 'Dr. Smith';
  const disease = prescription.content?.disease || 'Skin Condition';
  const medicines = prescription.content?.medicines || [];
  const notes = prescription.content?.notes || '';

  return (
    <PatientPageShell mainClassName="max-w-4xl">
      <PatientPageHeader
        title="Prescription"
        subtitle="View your prescription details"
        actions={
          <Link to="/prescriptions" className={patientBtnSecondary}>
            All prescriptions
          </Link>
        }
      />

      <div className={`${patientCardStatic} overflow-hidden`}>
          <div className="bg-gradient-to-r from-[#5B3FA8] to-[#7B5FCF] px-6 py-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">DermaEase</h2>
                <p className="text-white/80 text-sm">Digital Prescription</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/80">Date</p>
                <p className="font-semibold">{formatDate(prescription.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Doctor & Patient Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Prescribed By</p>
                <p className="text-lg font-semibold text-gray-900">{doctorName}</p>
                <p className="text-sm text-gray-600">Dermatologist</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Patient</p>
                <p className="text-lg font-semibold text-gray-900">
                  {prescription.patientId?.name || 'Patient'}
                </p>
              </div>
            </div>

            {/* Disease/Condition */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Diagnosis</p>
              <p className="text-xl font-bold text-gray-900">{disease}</p>
            </div>

            {/* Medicines */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Prescribed Medicines</p>
              {medicines.length === 0 ? (
                <p className="text-gray-500 italic">No medicines prescribed</p>
              ) : (
                <div className="space-y-4">
                  {medicines.map((med, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#F3EEF9] text-sm font-bold text-[#5B3FA8]">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg mb-2">{med.name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {med.dosage && (
                              <div>
                                <span className="text-gray-500">Dosage:</span>{' '}
                                <span className="font-medium text-gray-900">{med.dosage}</span>
                              </div>
                            )}
                            {med.frequency && (
                              <div>
                                <span className="text-gray-500">Frequency:</span>{' '}
                                <span className="font-medium text-gray-900">{med.frequency}</span>
                              </div>
                            )}
                            {med.duration && (
                              <div>
                                <span className="text-gray-500">Duration:</span>{' '}
                                <span className="font-medium text-gray-900">{med.duration}</span>
                              </div>
                            )}
                          </div>
                          {med.notes && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <span className="text-gray-500 text-sm">Instructions: </span>
                              <span className="text-gray-700 text-sm">{med.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Notes */}
            {notes && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Additional Notes</p>
                <p className="text-gray-700 leading-relaxed">{notes}</p>
              </div>
            )}

            {/* PDF Download */}
            {prescription.pdfLink && (
              <div className="pt-4 border-t border-gray-200">
                <a
                  href={prescription.pdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${patientBtnPrimary} gap-2`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="rounded-xl border border-[#E8E0F5] bg-[#F8F5FD] p-4">
          <p className="text-sm text-[#5B3FA8]">
            <strong>Important:</strong> Please follow the prescription instructions carefully. 
            If you have any questions or concerns, contact your doctor through the chat feature.
          </p>
        </div>
    </PatientPageShell>
  );
}

