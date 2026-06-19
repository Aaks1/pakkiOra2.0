const DOT = {
  active: 'admin-status-dot--bull',
  booked: 'admin-status-dot--bull',
  completed: 'admin-status-dot--bull',
  cancelled: 'admin-status-dot--alert',
  inactive: 'admin-status-dot--alert',
  no_show: 'admin-status-dot--alert',
  pending: 'admin-status-dot--warn',
  upcoming: 'admin-status-dot--warn',
}

export default function AdminStatus({ status, label }) {
  const key = String(status || '').toLowerCase()
  const text = label ?? (typeof status === 'string' ? status.replace(/_/g, ' ') : '—')
  return (
    <span className="flex items-center gap-1.5">
      <span className={`admin-status-dot ${DOT[key] || 'admin-status-dot--muted'}`} />
      <span className="text-xs capitalize text-slate-600">{text}</span>
    </span>
  )
}
