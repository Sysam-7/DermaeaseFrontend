import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDoctorById } from '../../services/aboutDoctors.js';

export default function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const body = await getDoctorById(id);
        setDoctor(body.data || body.doctor || body);
      } catch (err) {}
    })();
  }, [id]);

  if (!doctor) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl bg-white rounded shadow">
      <div className="flex gap-4 items-center">
        <img src={doctor.profilePic || '/Images/doctor-placeholder.png'} alt={doctor.name} className="w-28 h-28 rounded-lg object-cover" />
        <div>
          <h1 className="text-2xl font-semibold">{doctor.name}</h1>
          <p className="text-sm text-gray-600">{doctor.specialty}</p>
          <p className="text-sm text-gray-500">{doctor.location}</p>
        </div>
      </div>

      {doctor.bio && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">About</h2>
          <p className="text-gray-700">{doctor.bio}</p>
        </div>
      )}

      {(doctor.workingHoursStart || doctor.workingDays) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Availability</h3>
          {doctor.workingHoursStart && doctor.workingHoursEnd && (
            <p className="text-gray-700 mb-2">
              <span className="font-medium">Working Hours:</span> {doctor.workingHoursStart} - {doctor.workingHoursEnd}
            </p>
          )}
          {doctor.workingDays && doctor.workingDays.length > 0 && (
            <div>
              <span className="font-medium">Working Days:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                  doctor.workingDays.includes(index) && (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {day}
                    </span>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => { window.location.href = `/patient/booking?doctorId=${doctor._id}`; }}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Book Consultation
        </button>
      </div>
    </div>
  );
}


