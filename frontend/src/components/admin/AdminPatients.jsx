import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from './AdminPageHeader'
import AdminSearch from './AdminSearch'
import AdminStatus from './AdminStatus'
import AdminDataTable, { AdminAction, AdminRowActions } from './AdminDataTable'
import { AdminError, AdminSuccess } from './AdminFeedback'
import PatientDetailModal from './PatientDetailModal'
import EditPatientModal from './EditPatientModal'
import { deletePatient, listAdminPatients, togglePatientActive } from '../../api/admin'
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
  const [filter, setFilter] = useState('patient')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [detailId, setDetailId] = useState(null)
  const [editPatient, setEditPatient] = useState(null)

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

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') setSearchQuery(searchInput)
  }

  const handleToggleActive = async (patient) => {
    if (!window.confirm(`${patient.is_active ? 'Deactivate' : 'Activate'} ${patient.username}?`)) return
    setError('')
    setSuccess('')
    try {
      await togglePatientActive(patient.id)
      setSuccess(`Patient ${patient.is_active ? 'deactivated' : 'activated'}.`)
      await loadPatients()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleDelete = async (patient) => {
    if (!window.confirm(`Delete patient account "${patient.username}"? This cannot be undone.`)) return
    setError('')
    setSuccess('')
    try {
      await deletePatient(patient.id)
      setSuccess('Patient deleted.')
      await loadPatients()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const columns = [
    { key: 'username', header: 'Username', render: (r) => r.username || '—' },
    {
      key: 'name',
      header: 'Name',
      render: (r) => `${r.first_name || ''} ${r.last_name || ''}`.trim() || '—',
    },
    { key: 'email', header: 'Email', render: (r) => r.email || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <AdminStatus status={r.is_active ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <AdminRowActions>
          <AdminAction onClick={() => setDetailId(r.id)}>View</AdminAction>
          <AdminAction onClick={() => setEditPatient(r)}>Edit</AdminAction>
          <AdminAction onClick={() => handleToggleActive(r)}>
            {r.is_active ? 'Deactivate' : 'Activate'}
          </AdminAction>
          <AdminAction destructive onClick={() => handleDelete(r)}>Delete</AdminAction>
        </AdminRowActions>
      ),
    },
  ]

  return (
    <div>
      <AdminPageHeader title="Patients" subtitle="View, edit, and manage patient accounts" />
      <AdminError message={error} />
      <AdminSuccess message={success} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AdminSearch
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKey}
          placeholder="Search patients…"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setSearchQuery(searchInput)}
          className="admin-btn admin-btn--secondary"
        >
          Search
        </button>
      </div>

      <AdminDataTable columns={columns} rows={patients} loading={loading} emptyMessage="No patients found." />

      <PatientDetailModal
        patientId={detailId}
        open={Boolean(detailId)}
        onClose={() => setDetailId(null)}
      />

      <EditPatientModal
        patient={editPatient}
        open={Boolean(editPatient)}
        onClose={() => setEditPatient(null)}
        onSaved={() => {
          setSuccess('Patient updated.')
          loadPatients()
        }}
      />
    </div>
  )
}
