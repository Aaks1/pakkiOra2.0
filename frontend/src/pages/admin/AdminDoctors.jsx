import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import Button from '../../components/ui/Button'
import { listDoctors, toggleDoctorActive } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'
import { normalizeList } from '../../utils/apiList'

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actionId, setActionId] = useState(null)

  const loadDoctors = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listDoctors()
      setDoctors(normalizeList(data))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDoctors()
  }, [loadDoctors])

  const handleToggleActive = async (doctor) => {
    setActionId(doctor.id)
    setError('')
    setSuccess('')
    try {
      const result = await toggleDoctorActive(doctor.id)
      setSuccess(`Doctor ${result.is_active ? 'activated' : 'deactivated'} successfully.`)
      await loadDoctors()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setActionId(null)
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Doctors"
        subtitle="Manage doctor profiles and availability status."
      />

      {error ? <p className="dashboard-feedback dashboard-feedback--error">{error}</p> : null}
      {success ? <p className="dashboard-feedback dashboard-feedback--success">{success}</p> : null}

      <article className="dashboard-card">
        <h2 className="dashboard-card__title">Doctor directory</h2>
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Department</th>
                <th>Email</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="dashboard-table__empty">
                    {loading ? 'Loading doctors…' : 'No doctors found.'}
                  </td>
                </tr>
              ) : (
                doctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td>{doctor.full_name || `${doctor.first_name} ${doctor.last_name}`}</td>
                    <td>{doctor.specialization || '—'}</td>
                    <td>{doctor.department || '—'}</td>
                    <td>{doctor.email || '—'}</td>
                    <td>{doctor.experience_years != null ? `${doctor.experience_years} yrs` : '—'}</td>
                    <td>
                      <span className={`status-badge ${doctor.is_active ? 'status-badge--active' : 'status-badge--inactive'}`}>
                        {doctor.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        loading={actionId === doctor.id}
                        disabled={actionId === doctor.id}
                        onClick={() => handleToggleActive(doctor)}
                      >
                        {doctor.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </>
  )
}
