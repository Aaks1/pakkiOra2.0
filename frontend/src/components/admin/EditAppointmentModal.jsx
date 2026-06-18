import { useEffect, useState } from 'react'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { cancelAdminAppointment, listDoctors, updateAdminAppointment } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'
import { normalizeList } from '../../utils/apiList'

const STATUS_OPTIONS = ['BOOKED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

export default function EditAppointmentModal({ appointment, onClose, onSaved }) {
  const [doctors, setDoctors] = useState([])
  const [form, setForm] = useState({ doctor: '', date: '', start_time: '', status: 'BOOKED' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    listDoctors().then((d) => setDoctors(normalizeList(d))).catch(() => setDoctors([]))
  }, [])

  useEffect(() => {
    if (!appointment) return
    setForm({
      doctor: String(appointment.doctor?.id || ''),
      date: appointment.date || '',
      start_time: String(appointment.start_time || '').slice(0, 5),
      status: appointment.status || 'BOOKED',
    })
  }, [appointment])

  if (!appointment) return null

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        doctor: Number(form.doctor),
        date: form.date,
        start_time: form.start_time,
        status: form.status,
      }
      await updateAdminAppointment(appointment.id, payload)
      onSaved?.()
      onClose?.()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Cancel this appointment? The slot will become available again.')) return
    setLoading(true)
    setError('')
    try {
      await cancelAdminAppointment(appointment.id)
      onSaved?.()
      onClose?.()
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
          <h2 className="admin-modal__title">Edit appointment #{appointment.id}</h2>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Close">
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </header>
        <div className="admin-modal__body">
          <Alert message={error} onClose={() => setError('')} />
          <form className="dashboard-form" onSubmit={handleSubmit} noValidate>
            <Select label="Doctor" name="doctor" required value={form.doctor} onChange={setField('doctor')}>
              <option value="">Select doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.full_name || `${d.first_name} ${d.last_name}`}</option>
              ))}
            </Select>
            <Input label="Date" name="date" type="date" required value={form.date} onChange={setField('date')} />
            <Input label="Time" name="start_time" type="time" required value={form.start_time} onChange={setField('start_time')} />
            <Select label="Status" name="status" value={form.status} onChange={setField('status')}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <div className="dashboard-form__actions dashboard-form__actions--row">
              <Button type="submit" variant="primary" loading={loading}>Save</Button>
              {appointment.status === 'BOOKED' ? (
                <Button type="button" variant="ghost" onClick={handleCancel} disabled={loading}>Cancel appointment</Button>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
