const STATUS_STYLES = {
  BOOKED: 'bg-blue-50 text-blue-700 ring-blue-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 ring-red-200',
  NO_SHOW: 'bg-amber-50 text-amber-700 ring-amber-200',
}

export default function AppointmentCard({ appointment, onEdit, onCancel, showActions }) {
  const doctor = appointment.doctor
  const statusClass = STATUS_STYLES[appointment.status] || STATUS_STYLES.BOOKED

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 transition-colors hover:border-blue-200 hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-700">{appointment.date}</p>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusClass}`}>
          {appointment.status}
        </span>
      </div>
      <h3 className="mt-2 text-lg font-semibold text-slate-900">
        {doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : '—'}
      </h3>
      <p className="text-sm text-slate-500">{doctor?.specialization}</p>
      <p className="mt-3 text-xl font-semibold text-slate-800">
        {String(appointment.start_time).slice(0, 5)}
      </p>
      {appointment.symptoms && (
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{appointment.symptoms}</p>
      )}
      {showActions && appointment.status === 'BOOKED' && (
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit?.(appointment)}
            className="flex-1 rounded-md border border-slate-200 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onCancel?.(appointment)}
            className="flex-1 rounded-md border border-red-200 py-2 text-sm font-medium text-red-600 transition-colors hover:border-red-300"
          >
            Cancel
          </button>
        </div>
      )}
    </article>
  )
}
