import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { getErrorMessage } from '../../api/axios'
import { getAppointmentHistory } from '../../api/patient'

const QUICK_ACTIONS = [
  { to: '/patient/book', label: 'Book new appointment', icon: 'fa-calendar-plus' },
  { to: '/patient/appointments', label: 'View all appointments', icon: 'fa-calendar-check' },
  { to: '/patient/profile', label: 'Update profile', icon: 'fa-user' },
]

function formatTime(time) {
  if (!time) return '—'
  return String(time).slice(0, 5)
}

function doctorName(doctor) {
  if (!doctor) return '—'
  return `Dr. ${doctor.first_name} ${doctor.last_name}`.trim()
}

export default function PatientOverview() {
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadHistory = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAppointmentHistory()
      setHistory(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const upcoming = history?.upcoming ?? []
  const statCards = [
    { label: 'Upcoming', value: upcoming.length, icon: 'fa-clock' },
    { label: 'Completed', value: history?.completed?.length ?? 0, icon: 'fa-circle-check' },
    { label: 'Cancelled', value: history?.cancelled?.length ?? 0, icon: 'fa-ban' },
    { label: 'Past visits', value: history?.past?.length ?? 0, icon: 'fa-history' },
  ]

  return (
    <>
      <AdminPageHeader
        title="Patient Dashboard"
        subtitle="Track appointments and manage your care in one place."
      />

      {error && <p className="dashboard-feedback dashboard-feedback--error">{error}</p>}

      <section className="dashboard-grid">
        <article className="dashboard-card dashboard-card--span">
          <h2 className="dashboard-card__title">Summary</h2>
          <div className="dashboard-stats dashboard-stats--overview">
            {statCards.map((card) => (
              <div key={card.label} className="dashboard-stat dashboard-stat--with-icon">
                <i className={`fas ${card.icon} dashboard-stat__icon`} aria-hidden="true" />
                <p className="dashboard-stat__value">{loading ? '…' : card.value}</p>
                <p className="dashboard-stat__label">{card.label}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card">
          <h2 className="dashboard-card__title">Quick actions</h2>
          <div className="quick-actions">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.to} to={action.to} className="quick-actions__link">
                <i className={`fas ${action.icon}`} aria-hidden="true" />
                {action.label}
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-card" style={{ marginTop: '1rem' }}>
        <h2 className="dashboard-card__title">Upcoming appointments</h2>
        {loading ? (
          <p className="dashboard-feedback">Loading…</p>
        ) : upcoming.length === 0 ? (
          <p className="dashboard-feedback">No upcoming appointments. Book one to get started.</p>
        ) : (
          <ul className="dashboard-list">
            {upcoming.slice(0, 5).map((appt) => (
              <li key={appt.id} className="dashboard-list__item">
                <p className="dashboard-list__primary">{doctorName(appt.doctor)}</p>
                <p className="dashboard-list__secondary">{appt.doctor?.specialization || '—'}</p>
                <p className="dashboard-list__meta">
                  {appt.date} at {formatTime(appt.start_time)}
                </p>
              </li>
            ))}
          </ul>
        )}
        {upcoming.length > 0 && (
          <Link to="/patient/appointments" className="quick-actions__link" style={{ marginTop: '0.75rem' }}>
            View all appointments
          </Link>
        )}
      </section>
    </>
  )
}
