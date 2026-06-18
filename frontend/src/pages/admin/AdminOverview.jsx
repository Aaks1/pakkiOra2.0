import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { getAdminStats } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'

const QUICK_ACTIONS = [
  { to: '/admin/doctors', label: 'Add / manage doctors', icon: 'fa-user-doctor' },
  { to: '/admin/slots', label: 'Manage slots', icon: 'fa-clock' },
  { to: '/admin/appointments', label: 'View appointments', icon: 'fa-calendar-check' },
  { to: '/admin/admins', label: 'Manage admins', icon: 'fa-user-shield' },
  { to: '/admin/patients', label: 'View patients', icon: 'fa-user-injured' },
]

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAdminStats()
      setStats(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const statCards = [
    { label: 'Total doctors', value: stats?.total_doctors, icon: 'fa-user-doctor' },
    { label: 'Total patients', value: stats?.total_users, icon: 'fa-users' },
    { label: 'Total appointments', value: stats?.total_appointments, icon: 'fa-calendar-check' },
    { label: "Today's appointments", value: stats?.todays_appointments, icon: 'fa-calendar-day' },
    { label: 'Booked (upcoming)', value: stats?.booked_appointments, icon: 'fa-clock' },
    { label: 'Completed', value: stats?.completed_appointments, icon: 'fa-circle-check' },
    { label: 'Cancelled', value: stats?.cancelled_appointments, icon: 'fa-ban' },
  ]

  return (
    <>
      <AdminPageHeader
        title="Administrator Dashboard"
        subtitle="Manage doctors, slots, appointments, and patients from this custom admin panel."
      />

      {error ? <p className="dashboard-feedback dashboard-feedback--error">{error}</p> : null}

      <section className="dashboard-grid">
        <article className="dashboard-card dashboard-card--span">
          <h2 className="dashboard-card__title">Summary statistics</h2>
          <div className="dashboard-stats dashboard-stats--overview">
            {statCards.map((stat) => (
              <div key={stat.label} className="dashboard-stat dashboard-stat--with-icon">
                <i className={`fas ${stat.icon} dashboard-stat__icon`} aria-hidden="true" />
                <p className="dashboard-stat__value">{loading ? '…' : (stat.value ?? '—')}</p>
                <p className="dashboard-stat__label">{stat.label}</p>
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
    </>
  )
}
