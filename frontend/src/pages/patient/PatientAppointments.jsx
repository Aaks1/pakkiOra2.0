import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { getErrorMessage } from '../../api/axios'
import { cancelAppointment, getAppointmentHistory } from '../../api/patient'
import ReschedulePatientModal from '../../components/patient/ReschedulePatientModal'

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'completed', label: 'Completed' },
]

function formatTime(time) {
  if (!time) return '—'
  return String(time).slice(0, 5)
}

function doctorName(doctor) {
  if (!doctor) return '—'
  return `Dr. ${doctor.first_name} ${doctor.last_name}`.trim()
}

function statusClass(status) {
  return `status-badge status-badge--${String(status || '').toLowerCase()}`
}

export default function PatientAppointments() {
  const [history, setHistory] = useState(null)
  const [tab, setTab] = useState('upcoming')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState(null)
  const [rescheduleAppt, setRescheduleAppt] = useState(null)

  const loadHistory = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAppointmentHistory()
      setHistory(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const appointments = history?.[tab] ?? []

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return
    setActionId(id)
    setError('')
    try {
      await cancelAppointment(id)
      await loadHistory()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setActionId(null)
    }
  }

  return (
    <>
      <AdminPageHeader
        title="My appointments"
        subtitle="View, reschedule, or cancel your bookings."
      />

      <Alert message={error} onClose={() => setError('')} />

      <div className="admin-filter-tabs" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            className={`admin-filter-tabs__btn ${tab === item.key ? 'admin-filter-tabs__btn--active' : ''}`}
            onClick={() => setTab(item.key)}
          >
            {item.label}
            {!loading && history ? ` (${history[item.key]?.length ?? 0})` : ''}
          </button>
        ))}
      </div>

      <div className="admin-table-wrap" style={{ marginTop: '1rem' }}>
        {loading ? (
          <p className="dashboard-feedback" style={{ padding: '1rem' }}>Loading…</p>
        ) : appointments.length === 0 ? (
          <p className="dashboard-feedback" style={{ padding: '1rem' }}>No appointments in this category.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Symptoms</th>
                {tab === 'upcoming' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id}>
                  <td>{doctorName(appt.doctor)}</td>
                  <td>{appt.doctor?.specialization || '—'}</td>
                  <td>{appt.date}</td>
                  <td>{formatTime(appt.start_time)}</td>
                  <td>
                    <span className={statusClass(appt.status)}>{appt.status}</span>
                  </td>
                  <td>{appt.symptoms || '—'}</td>
                  {tab === 'upcoming' && (
                    <td>
                      <div className="admin-table__actions">
                        <Button
                          variant="ghost"
                          onClick={() => setRescheduleAppt(appt)}
                          disabled={actionId === appt.id}
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleCancel(appt.id)}
                          loading={actionId === appt.id}
                        >
                          Cancel
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {rescheduleAppt && (
        <ReschedulePatientModal
          appointment={rescheduleAppt}
          onClose={() => setRescheduleAppt(null)}
          onSaved={() => {
            setRescheduleAppt(null)
            loadHistory()
          }}
        />
      )}
    </>
  )
}
