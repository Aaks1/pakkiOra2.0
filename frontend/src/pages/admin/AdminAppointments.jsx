import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import Button from '../../components/ui/Button'
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

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actionId, setActionId] = useState(null)

  const loadAppointments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listAdminAppointments()
      setAppointments(normalizeList(data))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

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
      setSuccess('Appointment cancelled successfully.')
      await loadAppointments()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setActionId(null)
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Appointments"
        subtitle="View and manage all clinic appointments."
      />

      {error ? <p className="dashboard-feedback dashboard-feedback--error">{error}</p> : null}
      {success ? <p className="dashboard-feedback dashboard-feedback--success">{success}</p> : null}

      <article className="dashboard-card">
        <h2 className="dashboard-card__title">All appointments</h2>
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="dashboard-table__empty">
                    {loading ? 'Loading appointments…' : 'No appointments found.'}
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>{appt.date || '—'}</td>
                    <td>{formatTime(appt.start_time)}</td>
                    <td>{appt.patient_name || appt.patient_username || '—'}</td>
                    <td>{appt.doctor?.full_name || '—'}</td>
                    <td>
                      <span className={statusClass(appt.status)}>
                        {appt.status || '—'}
                      </span>
                    </td>
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
    </>
  )
}
