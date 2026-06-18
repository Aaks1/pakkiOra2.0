import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
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

const FILTERS = [
  { value: 'patient', label: 'With profile' },
  { value: 'all', label: 'All users' },
  { value: 'regular', label: 'Without profile' },
]

export default function AdminPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actionId, setActionId] = useState(null)
  const [filter, setFilter] = useState('patient')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const loadPatients = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filter === 'patient') params.user_type = 'patient'
      if (filter === 'regular') params.user_type = 'regular'
      if (searchQuery.trim()) params.search = searchQuery.trim()
      const data = await listAdminPatients(params)
      setPatients(normalizeList(data))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [filter, searchQuery])

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
    if (!window.confirm(`Delete patient account "${patient.username}"? This cannot be undone.`)) return

    setActionId(patient.id)
    setError('')
    setSuccess('')
    try {
      await deletePatient(patient.id)
      setSuccess(`Patient "${patient.username}" deleted.`)
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
        title="Patients"
        subtitle="View and manage patient accounts. Patients register themselves on the public site."
      />

      {error ? <p className="dashboard-feedback dashboard-feedback--error">{error}</p> : null}
      {success ? <p className="dashboard-feedback dashboard-feedback--success">{success}</p> : null}

      <article className="dashboard-card">
        <div className="admin-toolbar">
          <h2 className="dashboard-card__title admin-toolbar__title">Patient directory</h2>
          <div className="admin-toolbar__controls">
            <div className="admin-filter-tabs">
              {FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`admin-filter-tabs__btn ${filter === item.value ? 'admin-filter-tabs__btn--active' : ''}`}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <Input
              name="search"
              placeholder="Search patients…"
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
                      <div className="dashboard-table__actions">
                        <Button variant="ghost" onClick={() => setSelectedId(patient.id)}>
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          loading={actionId === patient.id}
                          disabled={actionId === patient.id}
                          onClick={() => handleToggleActive(patient)}
                        >
                          {patient.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="ghost"
                          disabled={actionId === patient.id}
                          onClick={() => handleDelete(patient)}
                        >
                          Delete
                        </Button>
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
    </>
  )
}
