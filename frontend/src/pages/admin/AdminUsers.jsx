import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import Button from '../../components/ui/Button'
import { listAdminPatients, togglePatientActive } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'
import { normalizeList } from '../../utils/apiList'

export default function AdminUsers() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actionId, setActionId] = useState(null)

  const loadPatients = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listAdminPatients({ user_type: 'patient' })
      setPatients(normalizeList(data))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPatients()
  }, [loadPatients])

  const handleToggleActive = async (patient) => {
    setActionId(patient.id)
    setError('')
    setSuccess('')
    try {
      const result = await togglePatientActive(patient.id)
      setSuccess(`Account ${result.is_active ? 'activated' : 'deactivated'} for ${patient.username}.`)
      await loadPatients()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setActionId(null)
    }
  }

  return (
    <>
      <AdminPageHeader
        title="User Management"
        subtitle="View and manage registered patient accounts."
      />

      {error ? <p className="dashboard-feedback dashboard-feedback--error">{error}</p> : null}
      {success ? <p className="dashboard-feedback dashboard-feedback--success">{success}</p> : null}

      <article className="dashboard-card">
        <h2 className="dashboard-card__title">Patients</h2>
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Profile</th>
                <th>Appointments</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="dashboard-table__empty">
                    {loading ? 'Loading patients…' : 'No patients found.'}
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.username}</td>
                    <td>{`${patient.first_name || ''} ${patient.last_name || ''}`.trim() || '—'}</td>
                    <td>{patient.email || '—'}</td>
                    <td>{patient.has_patient_profile ? 'Complete' : 'Incomplete'}</td>
                    <td>{patient.appointment_count ?? 0}</td>
                    <td>
                      <span className={`status-badge ${patient.is_active ? 'status-badge--active' : 'status-badge--inactive'}`}>
                        {patient.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        loading={actionId === patient.id}
                        disabled={actionId === patient.id}
                        onClick={() => handleToggleActive(patient)}
                      >
                        {patient.is_active ? 'Deactivate' : 'Activate'}
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
