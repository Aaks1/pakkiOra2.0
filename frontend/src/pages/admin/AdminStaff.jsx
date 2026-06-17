import { useCallback, useEffect, useState } from 'react'
import CreateAdminForm from '../../components/admin/CreateAdminForm'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { listAdminStaff } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'
import { normalizeList } from '../../utils/apiList'

export default function AdminStaff() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadStaff = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listAdminStaff()
      setStaff(normalizeList(data))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStaff()
  }, [loadStaff])

  const handleAdminCreated = async () => {
    setSuccess('Admin account created successfully.')
    await loadStaff()
  }

  return (
    <>
      <AdminPageHeader
        title="Admin Management"
        subtitle="Create staff accounts and manage admin users."
      />

      {error ? <p className="dashboard-feedback dashboard-feedback--error">{error}</p> : null}
      {success ? <p className="dashboard-feedback dashboard-feedback--success">{success}</p> : null}

      <section className="dashboard-grid">
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
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="dashboard-table__empty">
                      {loading ? 'Loading admin users…' : 'No admin users found.'}
                    </td>
                  </tr>
                ) : (
                  staff.map((admin) => (
                    <tr key={admin.id}>
                      <td>{admin.username}</td>
                      <td>{`${admin.first_name || ''} ${admin.last_name || ''}`.trim() || '—'}</td>
                      <td>{admin.email || '—'}</td>
                      <td>{admin.phone || '—'}</td>
                      <td>{admin.department || '—'}</td>
                      <td>
                        <span className={`status-badge ${admin.is_active ? 'status-badge--active' : 'status-badge--inactive'}`}>
                          {admin.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </>
  )
}
