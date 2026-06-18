import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import EditPatientModal from '../../components/admin/EditPatientModal'
import PatientDetailModal from '../../components/admin/PatientDetailModal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import {
  deletePatient,
  listAdminPatients,
  togglePatientActive,
} from '../../api/admin'
import { getErrorMessage } from '../../api/axios'
import { normalizeList } from '../../utils/apiList'

function formatDate(value) {
  if (!value) return '—'
  return String(value).slice(0, 10)
}

export default function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actionId, setActionId] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [editPatient, setEditPatient] = useState(null)

  const loadPatients = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { user_type: 'patient' }
      if (searchQuery.trim()) params.search = searchQuery.trim()
      const data = await listAdminPatients(params)
      setPatients(normalizeList(data))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

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

  const handleDelete = async (patient) => {
    if (!window.confirm(`Remove patient account "${patient.username}"? This cannot be undone.`)) return
    setActionId(patient.id)
    setError('')
    setSuccess('')
    try {
      await deletePatient(patient.id)
      setSuccess(`Patient "${patient.username}" removed.`)
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
        title="Patient Management"
        subtitle="View and manage registered patient accounts. Patients sign up on the public site."
      />

      {error ? <p className="dashboard-feedback dashboard-feedback--error">{error}</p> : null}
      {success ? <p className="dashboard-feedback dashboard-feedback--success">{success}</p> : null}

      <article className="dashboard-card">
        <div className="admin-toolbar">
          <h2 className="dashboard-card__title admin-toolbar__title">All patients</h2>
          <div className="admin-toolbar__controls">
            <Input
              name="search"
              placeholder="Search by name, email, or phone…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(searchInput)}
              wrapperClassName="admin-toolbar__search"
            />
            <Button variant="secondary" onClick={() => setSearchQuery(searchInput)}>Search</Button>
          </div>
        </div>

        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Registered</th>
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
                    <td>{patient.id}</td>
                    <td>{`${patient.first_name || ''} ${patient.last_name || ''}`.trim() || patient.username}</td>
                    <td>{patient.email || '—'}</td>
                    <td>{patient.phone || '—'}</td>
                    <td>{formatDate(patient.registration_date || patient.date_joined)}</td>
                    <td>
                      <span className={`status-badge ${patient.is_active ? 'status-badge--active' : 'status-badge--inactive'}`}>
                        {patient.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="dashboard-table__actions">
                        <Button variant="ghost" onClick={() => setSelectedId(patient.id)}>View</Button>
                        <Button variant="ghost" onClick={() => setEditPatient(patient)}>Edit</Button>
                        <Button variant="ghost" loading={actionId === patient.id} disabled={actionId === patient.id} onClick={() => handleToggleActive(patient)}>
                          {patient.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="ghost" disabled={actionId === patient.id} onClick={() => handleDelete(patient)}>Remove</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>

      <PatientDetailModal patientId={selectedId} onClose={() => setSelectedId(null)} />
      <EditPatientModal
        patient={editPatient}
        onClose={() => setEditPatient(null)}
        onSaved={() => {
          setSuccess('Patient updated successfully.')
          loadPatients()
        }}
      />
    </>
  )
}
