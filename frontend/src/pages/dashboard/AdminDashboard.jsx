import { useCallback, useEffect, useState } from 'react'
import DashboardLayout from '../../components/dashboard/DashboardLayout'
import CreateAdminForm from '../../components/admin/CreateAdminForm'
import { getAdminStats, listAdminStaff } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'
import { normalizeAdminList } from '../../utils/adminStaff'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [statsData, staffData] = await Promise.all([
        getAdminStats(),
        listAdminStaff(),
      ])
      setStats(statsData)
      setStaff(normalizeAdminList(staffData))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  const handleAdminCreated = async () => {
    setSuccess('Admin account created successfully.')
    await loadDashboard()
  }

  const statCards = [
    { label: 'Total patients', value: stats?.total_users ?? '—' },
    { label: 'Appointments today', value: stats?.todays_appointments ?? '—' },
    { label: 'Active doctors', value: stats?.active_doctors ?? '—' },
    { label: 'Total admins', value: stats?.total_admins ?? '—' },
  ]

  return (
    <DashboardLayout
      role="admin"
      title="Admin Dashboard"
      subtitle="Monitor clinic operations and create staff admin accounts."
    >
      {error ? <p className="dashboard-feedback dashboard-feedback--error">{error}</p> : null}
      {success ? <p className="dashboard-feedback dashboard-feedback--success">{success}</p> : null}

      <section className="dashboard-grid">
        <article className="dashboard-card dashboard-card--span">
          <h2 className="dashboard-card__title">Overview</h2>
          <div className="dashboard-stats">
            {statCards.map((stat) => (
              <div key={stat.label} className="dashboard-stat">
                <p className="dashboard-stat__value">{loading ? '…' : stat.value}</p>
                <p className="dashboard-stat__label">{stat.label}</p>
              </div>
            ))}
          </div>
        </article>

        <CreateAdminForm onCreated={handleAdminCreated} />

        <article className="dashboard-card dashboard-card--span">
          <h2 className="dashboard-card__title">Admin staff</h2>
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="dashboard-table__empty">
                      {loading ? 'Loading admin users…' : 'No admin users found.'}
                    </td>
                  </tr>
                ) : (
                  staff.map((admin) => (
                    <tr key={admin.id}>
                      <td>{admin.username}</td>
                      <td>{`${admin.first_name || ''} ${admin.last_name || ''}`.trim() || '—'}</td>
                      <td>{admin.email || '—'}</td>
                      <td>{admin.department || '—'}</td>
                      <td>{admin.is_active ? 'Active' : 'Inactive'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </DashboardLayout>
  )
}
