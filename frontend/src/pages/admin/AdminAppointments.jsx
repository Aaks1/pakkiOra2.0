import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import EditAppointmentModal from '../../components/admin/EditAppointmentModal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { listAdminAppointments, listDoctors } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'
import { normalizeList } from '../../utils/apiList'

const STATUS_OPTIONS = ['', 'BOOKED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']

function formatTime(time) {
  if (!time) return '—'
  return String(time).slice(0, 5)
}

function formatDate(value) {
  if (!value) return '—'
  return String(value).slice(0, 10)
}

function statusClass(status) {
  return `status-badge status-badge--${String(status || '').toLowerCase()}`
}

export default function AdminAppointments() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editAppointment, setEditAppointment] = useState(null)

  const [doctorFilter, setDoctorFilter] = useState(searchParams.get('doctor') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || '')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    listDoctors().then((data) => setDoctors(normalizeList(data))).catch(() => setDoctors([]))
  }, [])

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (doctorFilter) params.doctor = doctorFilter
      if (statusFilter) params.status = statusFilter
      if (dateFilter) params.date = dateFilter
      if (searchQuery.trim()) params.search = searchQuery.trim()
      const data = await listAdminAppointments(params)
      setAppointments(normalizeList(data))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [doctorFilter, statusFilter, dateFilter, searchQuery])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  useEffect(() => {
    const params = {}
    if (doctorFilter) params.doctor = doctorFilter
    if (statusFilter) params.status = statusFilter
    if (dateFilter) params.date = dateFilter
    setSearchParams(params)
  }, [doctorFilter, statusFilter, dateFilter, setSearchParams])

  const clearFilters = () => {
    setDoctorFilter('')
    setStatusFilter('')
    setDateFilter('')
    setSearchInput('')
    setSearchQuery('')
  }

  return (
    <>
      <AdminPageHeader
        title="Appointment Management"
        subtitle="View, search, edit, and cancel patient bookings."
      />

      {error ? <p className="dashboard-feedback dashboard-feedback--error">{error}</p> : null}
      {success ? <p className="dashboard-feedback dashboard-feedback--success">{success}</p> : null}

      <article className="dashboard-card">
        <div className="admin-toolbar">
          <h2 className="dashboard-card__title admin-toolbar__title">All bookings</h2>
          <div className="admin-toolbar__controls admin-toolbar__controls--filters">
            <Input name="search" placeholder="Patient or doctor name…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(searchInput)} wrapperClassName="admin-toolbar__search" />
            <Select label="Doctor" name="doctor" value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} wrapperClassName="admin-filter-field">
              <option value="">All doctors</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>{doctor.full_name || `${doctor.first_name} ${doctor.last_name}`}</option>
              ))}
            </Select>
            <Select label="Status" name="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} wrapperClassName="admin-filter-field">
              {STATUS_OPTIONS.map((status) => (
                <option key={status || 'all'} value={status}>{status || 'All statuses'}</option>
              ))}
            </Select>
            <Input label="Date" name="date" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} wrapperClassName="admin-filter-field" />
            <Button variant="secondary" onClick={() => setSearchQuery(searchInput)}>Search</Button>
            <Button variant="ghost" onClick={clearFilters}>Clear</Button>
          </div>
        </div>

        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Booked</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="dashboard-table__empty">
                    {loading ? 'Loading appointments…' : 'No appointments found.'}
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>{appt.id}</td>
                    <td>{appt.patient_name || appt.patient_username || '—'}</td>
                    <td>{appt.doctor?.full_name || '—'}</td>
                    <td>{appt.date || '—'}</td>
                    <td>{formatTime(appt.start_time)}</td>
                    <td><span className={statusClass(appt.status)}>{appt.status || '—'}</span></td>
                    <td>{formatDate(appt.created_at)}</td>
                    <td>
                      <Button variant="ghost" onClick={() => setEditAppointment(appt)}>Edit</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>

      <EditAppointmentModal
        appointment={editAppointment}
        onClose={() => setEditAppointment(null)}
        onSaved={() => {
          setSuccess('Appointment updated successfully.')
          loadAppointments()
        }}
      />
    </>
  )
}
