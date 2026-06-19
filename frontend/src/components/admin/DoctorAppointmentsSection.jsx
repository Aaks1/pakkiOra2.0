import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminStatus from './AdminStatus'
import AdminDataTable, { AdminAction, AdminRowActions } from './AdminDataTable'
import DoctorAvatar from '../patient/DoctorAvatar'
import { cancelAdminAppointment, listAdminAppointments } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'
import { normalizeList } from '../../utils/apiList'
import { doctorName } from '../../utils/patientFormat'

function formatTime(time) {
  if (!time) return '—'
  return String(time).slice(0, 5)
}

export default function DoctorAppointmentsSection({ doctor, onClose }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actionId, setActionId] = useState(null)

  const loadAppointments = useCallback(async () => {
    if (!doctor?.id) return
    setLoading(true)
    setError('')
    try {
      const data = await listAdminAppointments({ doctor: doctor.id })
      setAppointments(normalizeList(data))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [doctor?.id])

  useEffect(() => {
    loadAppointments()
  }, [loadAppointments])

  const handleCancel = async (appointment) => {
    if (!window.confirm(`Cancel appointment for ${appointment.patient_username}?`)) return
    setActionId(appointment.id)
    setError('')
    setSuccess('')
    try {
      await cancelAdminAppointment(appointment.id)
      setSuccess('Appointment cancelled.')
      await loadAppointments()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setActionId(null)
    }
  }

  if (!doctor) return null

  const displayName = doctorName(doctor)

  const columns = [
    { key: 'date', header: 'Date', render: (r) => r.date || '—' },
    { key: 'time', header: 'Time', render: (r) => formatTime(r.start_time) },
    { key: 'patient', header: 'Patient', render: (r) => r.patient_name || r.patient_username || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <AdminStatus status={r.status?.toLowerCase()} label={r.status} />,
    },
    { key: 'symptoms', header: 'Symptoms', render: (r) => r.symptoms || '—' },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        r.status === 'BOOKED' ? (
          <AdminRowActions>
            <AdminAction destructive disabled={actionId === r.id} onClick={() => handleCancel(r)}>
              Cancel
            </AdminAction>
          </AdminRowActions>
        ) : '—'
      ),
    },
  ]

  return (
    <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <DoctorAvatar doctor={doctor} size="lg" />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">{displayName}</h2>
            {doctor.specialization ? (
              <p className="text-xs text-slate-500">{doctor.specialization}</p>
            ) : null}
            <p className="mt-1 text-xs text-slate-400">Appointments</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/admin/appointments?doctor=${doctor.id}`} className="text-xs text-slate-500 hover:text-slate-900">
            Open full page
          </Link>
          <button type="button" onClick={onClose} className="text-xs text-slate-500 hover:text-slate-900">
            Close
          </button>
        </div>
      </div>
      {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}
      {success ? <p className="mb-3 text-sm text-emerald-700">{success}</p> : null}
      <AdminDataTable columns={columns} rows={appointments} loading={loading} emptyMessage="No appointments for this doctor." />
    </div>
  )
}

