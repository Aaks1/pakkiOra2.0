import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminPageHeader from './AdminPageHeader'
import AdminSearch from './AdminSearch'
import AdminStatus from './AdminStatus'
import AdminDataTable, { AdminAction, AdminRowActions } from './AdminDataTable'
import { AdminError, AdminSuccess } from './AdminFeedback'
import EditAppointmentModal from './EditAppointmentModal'
import { listAdminAppointments, listDoctors } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'
import { normalizeList } from '../../utils/apiList'

const STATUS_OPTIONS = ['all', 'BOOKED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

function formatTime(time) {
  if (!time) return '—'
  return String(time).slice(0, 5)
}

export default function AdminAppointments() {
  const [searchParams] = useSearchParams()
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [doctorFilter, setDoctorFilter] = useState(searchParams.get('doctor') || 'all')
  const [editAppointment, setEditAppointment] = useState(null)

  useEffect(() => {
    listDoctors().then((d) => setDoctors(normalizeList(d))).catch(() => setDoctors([]))
  }, [])

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (searchQuery.trim()) params.search = searchQuery.trim()
      if (statusFilter !== 'all') params.status = statusFilter
      if (doctorFilter !== 'all') params.doctor = doctorFilter
      const data = await listAdminAppointments(params)
      setAppointments(normalizeList(data))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [searchQuery, statusFilter, doctorFilter])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const handleSearchKey = (e) => {
    if (e.key === 'Enter') setSearchQuery(searchInput)
  }

  const columns = [
    { key: 'id', header: 'ID', render: (r) => `#${r.id}` },
    { key: 'date', header: 'Date', render: (r) => r.date || '—' },
    { key: 'time', header: 'Time', render: (r) => formatTime(r.start_time) },
    {
      key: 'doctor',
      header: 'Doctor',
      render: (r) => r.doctor?.full_name || r.doctor_name || '—',
    },
    {
      key: 'patient',
      header: 'Patient',
      render: (r) => r.patient_name || r.patient_username || '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <AdminStatus status={r.status?.toLowerCase()} label={r.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <AdminRowActions>
          <AdminAction onClick={() => setEditAppointment(r)}>Edit</AdminAction>
        </AdminRowActions>
      ),
    },
  ]

  return (
    <div>
      <AdminPageHeader title="Appointments" subtitle="View and manage all appointments" />
      <AdminError message={error} />
      <AdminSuccess message={success} />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <AdminSearch
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKey}
          placeholder="Search appointments…"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>
          ))}
        </select>
        <select
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
        >
          <option value="all">All doctors</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.full_name || `${d.first_name} ${d.last_name}`}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setSearchQuery(searchInput)}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
        >
          Search
        </button>
      </div>

      <AdminDataTable columns={columns} rows={appointments} loading={loading} emptyMessage="No appointments found." />

      <EditAppointmentModal
        appointment={editAppointment}
        open={Boolean(editAppointment)}
        onClose={() => setEditAppointment(null)}
        onSaved={() => {
          setSuccess('Appointment updated.')
          loadAppointments()
        }}
      />
    </div>
  )
}
