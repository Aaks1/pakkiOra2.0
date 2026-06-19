import { Clock, MapPin, Stethoscope } from 'lucide-react'
import { motion } from 'framer-motion'
import DoctorAvatar from './DoctorAvatar'
import PatientButton from './PatientButton'
import { doctorName, formatTime } from '../../utils/patientFormat'

export default function NextAppointmentTicket({
  appointment,
  onReschedule,
  onCancel,
  cancelling = false,
}) {
  const doctor = appointment?.doctor
  const date = appointment?.date ? new Date(`${appointment.date}T12:00:00`) : null
  const dayNum = date?.getDate() ?? '—'
  const monthLabel = date
    ? date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    : ''
  const location = doctor?.department || doctor?.address || 'Main Clinic'

  return (
    <motion.article
      className="patient-ticket"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="patient-ticket__date flex shrink-0 items-center sm:flex-col sm:justify-center sm:px-6 sm:py-5">
          <div className="flex items-center gap-3 px-5 py-4 sm:flex-col sm:gap-1 sm:px-0 sm:py-0">
            <span className="patient-ticket__day tabular-nums">{dayNum}</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-600/70">
              {monthLabel}
            </span>
          </div>
        </div>

        <div className="hidden w-px self-stretch border-r border-dashed border-blue-200 sm:block" />
        <div className="mx-5 border-t border-dashed border-blue-200 sm:hidden" />

        <div className="flex min-w-0 flex-1 flex-col px-5 py-4 sm:py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Next appointment
          </p>

          <div className="mt-2 flex items-start gap-3">
            <DoctorAvatar doctor={doctor} size="md" />
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-800">{doctorName(doctor)}</h2>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                <Stethoscope className="h-3.5 w-3.5 shrink-0 text-blue-500" aria-hidden="true" />
                {doctor?.specialization || 'General Practice'}
              </p>
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            <p className="flex items-center gap-1.5 text-sm text-slate-600">
              <Clock className="h-3.5 w-3.5 shrink-0 text-teal-500" aria-hidden="true" />
              {formatTime(appointment.start_time)}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-slate-600">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-violet-500" aria-hidden="true" />
              {location}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <PatientButton variant="secondary" onClick={onReschedule}>
              Reschedule
            </PatientButton>
            <PatientButton variant="danger" onClick={onCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling…' : 'Cancel'}
            </PatientButton>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
