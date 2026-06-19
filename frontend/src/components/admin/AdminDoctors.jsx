import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import AdminPageHeader from './AdminPageHeader'
import AdminSearch from './AdminSearch'
import AdminStatus from './AdminStatus'
import AdminDataTable, { AdminAction, AdminRowActions } from './AdminDataTable'
import { AdminError, AdminSuccess } from './AdminFeedback'
import CreateDoctorModal from './CreateDoctorModal'
import EditDoctorModal from './EditDoctorModal'
import DoctorSlotModal from './DoctorSlotModal'
import DoctorAppointmentsSection from './DoctorAppointmentsSection'
import AdminPersonCell from './AdminPersonCell'
import { deleteDoctor, listDoctors, toggleDoctorActive } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'
import { normalizeList } from '../../utils/apiList'
import { doctorInitials, doctorName } from '../../utils/patientFormat'

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [editDoctor, setEditDoctor] = useState(null)
  const [slotDoctor, setSlotDoctor] = useState(null)
  const [viewAppointmentsDoctor, setViewAppointmentsDoctor] = useState(null)
  const [actionId, setActionId] = useState(null)

  const loadDoctors = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (searchQuery.trim()) params.search = searchQuery.trim()
      if (statusFilter === 'active') params.is_active = true
      if (statusFilter === 'inactive') params.is_active = false
      const data = await listDoctors(params)
      setDoctors(normalizeList(data))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [searchQuery, statusFilter])

  useEffect(() => {
    loadDoctors()
  }, [loadDoctors])

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') setSearchQuery(searchInput)
  }

  const handleToggle = async (doctor) => {
    setActionId(doctor.id)
    setError('')
    setSuccess('')
    try {
      await toggleDoctorActive(doctor.id)
      setSuccess(`Doctor ${doctor.is_active ? 'deactivated' : 'activated'}.`)
      await loadDoctors()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (doctor) => {
    const name = doctor.full_name || `${doctor.first_name} ${doctor.last_name}`
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return
    setActionId(doctor.id)
    setError('')
    setSuccess('')
    try {
      await deleteDoctor(doctor.id)
      setSuccess('Doctor deleted.')
      await loadDoctors()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setActionId(null)
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'Doctor',
      render: (r) => (
        <AdminPersonCell
          photoUrl={r.photo_url}
          name={doctorName(r)}
          initials={doctorInitials(r)}
        />
      ),
    },
    { key: 'specialization', header: 'Specialization', render: (r) => r.specialization || '—' },
    {
      key: 'email',
      header: 'Email',
      cellClassName: 'admin-table__cell--email',
      render: (r) => (
        <span className="admin-table__truncate" title={r.email || undefined}>
          {r.email || '—'}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      cellClassName: 'admin-table__cell--phone',
      render: (r) => r.phone || '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <AdminStatus status={r.is_active ? 'active' : 'inactive'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      cellClassName: 'admin-table__cell--actions',
      render: (r) => (
        <AdminRowActions>
          <AdminAction onClick={() => setEditDoctor(r)}>Edit</AdminAction>
          <AdminAction onClick={() => setSlotDoctor(r)}>Slots</AdminAction>
          <AdminAction onClick={() => setViewAppointmentsDoctor(r)}>View</AdminAction>
          <AdminAction destructive disabled={actionId === r.id} onClick={() => handleToggle(r)}>
            {r.is_active ? 'Deactivate' : 'Activate'}
          </AdminAction>
          <AdminAction destructive disabled={actionId === r.id} onClick={() => handleDelete(r)}>
            Delete
          </AdminAction>
        </AdminRowActions>
      ),
    },
  ]

  return (
    <div>
      <AdminPageHeader title="Doctors" subtitle="Manage doctor profiles and schedules" />
      <AdminError message={error} />
      <AdminSuccess message={success} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AdminSearch
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKey}
          placeholder="Search doctors…"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          type="button"
          onClick={() => setSearchQuery(searchInput)}
          className="admin-btn admin-btn--secondary"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="admin-btn admin-btn--primary ml-auto"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Create doctor
        </button>
      </div>

      <AdminDataTable columns={columns} rows={doctors} loading={loading} emptyMessage="No doctors found." />

      {viewAppointmentsDoctor ? (
        <DoctorAppointmentsSection
          doctor={viewAppointmentsDoctor}
          onClose={() => setViewAppointmentsDoctor(null)}
        />
      ) : null}

      <CreateDoctorModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setSuccess('Doctor created successfully.')
          loadDoctors()
        }}
      />
      <EditDoctorModal
        doctor={editDoctor}
        open={Boolean(editDoctor)}
        onClose={() => setEditDoctor(null)}
        onSaved={() => {
          setSuccess('Doctor updated.')
          loadDoctors()
        }}
      />
      <DoctorSlotModal
        doctor={slotDoctor}
        open={Boolean(slotDoctor)}
        onClose={() => setSlotDoctor(null)}
        onSaved={() => setSuccess('Slot configuration saved.')}
      />
    </div>
  )
}
