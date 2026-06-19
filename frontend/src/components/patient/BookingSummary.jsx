import { doctorName, formatDateLong, formatTime } from '../../utils/patientFormat'

export default function BookingSummary({ doctor, date, slot, symptoms }) {
  if (!doctor) {
    return (
      <div className="sticky top-24 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-900">Appointment Summary</h3>
        <p className="mt-4 text-sm text-slate-500">Select a doctor to begin.</p>
      </div>
    )
  }

  return (
    <div className="sticky top-24 rounded-lg border border-slate-200 bg-white p-6">
      <h3 className="font-semibold text-slate-900">Appointment Summary</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-slate-500">Doctor</dt>
          <dd className="font-medium text-slate-900">{doctorName(doctor)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Specialization</dt>
          <dd className="font-medium text-slate-900">{doctor.specialization || '—'}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Date</dt>
          <dd className="font-medium text-slate-900">
            {date ? formatDateLong(date) : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Time</dt>
          <dd className="font-medium text-slate-900">
            {slot ? formatTime(slot.start_time) : '—'}
          </dd>
        </div>
        {symptoms && (
          <div>
            <dt className="text-slate-500">Symptoms</dt>
            <dd className="text-slate-700">{symptoms}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}
