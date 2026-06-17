import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { getAdminStats } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'

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
    { label: 'Total patients', value: stats?.total_users, icon: 'fa-users' },
    { label: 'Total admins', value: stats?.total_admins, icon: 'fa-user-shield' },
    { label: 'Active doctors', value: stats?.active_doctors, icon: 'fa-user-doctor' },
    { label: 'Appointments today', value: stats?.todays_appointments, icon: 'fa-calendar-day' },
    { label: 'Total appointments', value: stats?.total_appointments, icon: 'fa-calendar-check' },
    { label: 'Booked', value: stats?.booked_appointments, icon: 'fa-clock' },
    { label: 'Completed', value: stats?.completed_appointments, icon: 'fa-circle-check' },
    { label: 'Cancelled', value: stats?.cancelled_appointments, icon: 'fa-ban' },
  ]

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Overview of clinic operations and key metrics."
      />

      {error ? <p className="dashboard-feedback dashboard-feedback--error">{error}</p> : null}

      <section className="dashboard-grid">
        <article className="dashboard-card dashboard-card--span">
          <h2 className="dashboard-card__title">Overview</h2>
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
      </section>
    </>
  )
}
