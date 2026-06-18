import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import { cancelAdminAppointment, listAdminAppointments } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'
import { normalizeList } from '../../utils/apiList'

function formatTime(time) {
  if (!time) return '—'
  return String(time).slice(0, 5)
}

function statusClass(status) {
  const key = String(status || '').toLowerCase()
  return `status-badge status-badge--${key}`
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

  const doctorName = doctor.full_name || `Dr. ${doctor.first_name} ${doctor.last_name}`

  return (
    <article className="dashboard-card dashboard-card--span doctor-appointments-section">
      <div className="admin-toolbar">
        <h2 className="dashboard-card__title admin-toolbar__title">
          Appointments for {doctorName}
        </h2>
        <div className="admin-toolbar__controls">
          <Link to={`/admin/appointments?doctor=${doctor.id}`} className="dashboard-chip">
            Open full page
          </Link>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>

      {error ? <p className="dashboard-feedback dashboard-feedback--error">{error}</p> : null}
      {success ? <p className="dashboard-feedback dashboard-feedback--success">{success}</p> : null}

      <div className="dashboard-table-wrap">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Patient</th>
              <th>Status</th>
              <th>Symptoms</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="dashboard-table__empty">
                  {loading ? 'Loading appointments…' : 'No appointments for this doctor.'}
                </td>
              </tr>
            ) : (
              appointments.map((appt) => (
                <tr key={appt.id}>
                  <td>{appt.date || '—'}</td>
                  <td>{formatTime(appt.start_time)}</td>
                  <td>{appt.patient_name || appt.patient_username || '—'}</td>
                  <td>
                    <span className={statusClass(appt.status)}>{appt.status || '—'}</span>
                  </td>
                  <td>{appt.symptoms || '—'}</td>
                  <td>
                    {appt.status === 'BOOKED' ? (
                      <Button
                        variant="ghost"
                        loading={actionId === appt.id}
                        disabled={actionId === appt.id}
                        onClick={() => handleCancel(appt)}
                      >
                        Cancel
                      </Button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  )
}
