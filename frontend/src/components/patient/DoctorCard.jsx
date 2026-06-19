import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import DoctorAvatar from './DoctorAvatar'
import { doctorName, formatDoctorSchedule } from '../../utils/patientFormat'

export default function DoctorCard({ doctor }) {
  const schedule = formatDoctorSchedule(doctor)
  const specialty = doctor.specialization || 'General'
  const experience = doctor.experience_years

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-blue-200 hover:shadow-md">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 to-teal-50/50 px-4 py-4">
        <DoctorAvatar doctor={doctor} size="md" />
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-800">{doctorName(doctor)}</h3>
          <p className="mt-1 text-xs text-blue-700/80">{specialty}</p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {experience != null && experience > 0 && (
          <p className="text-xs text-slate-500">{experience} yrs experience</p>
        )}

        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            Consultation schedule
          </p>
          <p className="mt-1 text-sm text-slate-700">{schedule.days}</p>
          {schedule.hours ? (
            <p className="mt-0.5 text-xs text-slate-500">{schedule.hours}</p>
          ) : null}
        </div>

        <Link
          to={`/patient/book?doctor=${doctor.id}`}
          className="block w-full rounded-lg bg-blue-600 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Book appointment
        </Link>
      </div>
    </article>
  )
}
