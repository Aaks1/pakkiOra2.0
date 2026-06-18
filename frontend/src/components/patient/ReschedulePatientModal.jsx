import { useEffect, useState } from 'react'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import { getErrorMessage } from '../../api/axios'
import {
  getDoctorAvailableDates,
  getDoctorSlots,
  rescheduleAppointment,
} from '../../api/patient'

export default function ReschedulePatientModal({ appointment, onClose, onSaved }) {
  const [dates, setDates] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)

  const doctorId = appointment?.doctor?.id

  useEffect(() => {
    if (!doctorId) return
    setSelectedDate(appointment.date || '')
    setSelectedSlot({ start_time: String(appointment.start_time || '').slice(0, 5) })
    getDoctorAvailableDates(doctorId)
      .then(setDates)
      .catch(() => setDates([]))
  }, [appointment, doctorId])

  useEffect(() => {
    if (!doctorId || !selectedDate) return
    setSlotsLoading(true)
    getDoctorSlots(doctorId, selectedDate)
      .then((data) => setSlots(data?.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false))
  }, [doctorId, selectedDate])

  if (!appointment) return null

  const doctorName = `Dr. ${appointment.doctor?.first_name} ${appointment.doctor?.last_name}`

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedDate || !selectedSlot?.start_time) return
    setLoading(true)
    setError('')
    try {
      await rescheduleAppointment(appointment.id, {
        date: selectedDate,
        start_time: selectedSlot.start_time,
      })
      onSaved?.()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-modal" role="dialog" aria-modal="true">
      <button type="button" className="admin-modal__backdrop" onClick={onClose} aria-label="Close" />
      <div className="admin-modal__panel">
        <header className="admin-modal__header">
          <h2 className="admin-modal__title">Reschedule appointment</h2>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Close">
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="admin-modal__body">
          <Alert message={error} onClose={() => setError('')} />
          <p className="dashboard-feedback" style={{ marginBottom: '1rem' }}>
            {doctorName} · {appointment.doctor?.specialization || 'General'}
          </p>

          <p className="form-field__label">Select date</p>
          <div className="patient-slot-grid" style={{ marginBottom: '1rem' }}>
            {dates.map((date) => (
              <button
                key={date}
                type="button"
                className={`patient-slot-chip ${selectedDate === date ? 'patient-slot-chip--active' : ''}`}
                onClick={() => {
                  setSelectedDate(date)
                  setSelectedSlot(null)
                }}
              >
                {date}
              </button>
            ))}
          </div>

          <p className="form-field__label">Select time</p>
          {slotsLoading ? (
            <p className="dashboard-feedback">Loading slots…</p>
          ) : (
            <div className="patient-slot-grid" style={{ marginBottom: '1rem' }}>
              {slots.map((slot) => (
                <button
                  key={slot.start_time}
                  type="button"
                  className={`patient-slot-chip ${selectedSlot?.start_time === slot.start_time ? 'patient-slot-chip--active' : ''}`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot.start_display || slot.start_time}
                </button>
              ))}
            </div>
          )}

          <div className="admin-modal__footer">
            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" variant="primary" loading={loading} disabled={!selectedSlot}>
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
