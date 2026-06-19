import { useEffect, useState } from 'react'
import AdminModal from './AdminModal'
import AdminField, { inputClass } from './AdminField'
import { cancelAdminAppointment, listDoctors, updateAdminAppointment } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'
import { normalizeList } from '../../utils/apiList'

const STATUS_OPTIONS = ['BOOKED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']
const FORM_ID = 'edit-appointment-form'

export default function EditAppointmentModal({ appointment, open, onClose, onSaved }) {
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
      await updateAdminAppointment(appointment.id, {
        doctor: Number(form.doctor),
        date: form.date,
        start_time: form.start_time,
        status: form.status,
      })
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
    <AdminModal
      open={open}
      title={`Edit appointment #${appointment.id}`}
      onClose={onClose}
      formId={FORM_ID}
      onSubmit={handleSubmit}
      footer={(
        <>
          {appointment.status === 'BOOKED' ? (
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="mr-auto text-xs text-red-500 hover:text-red-700"
            >
              Cancel appointment
            </button>
          ) : null}
          <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700">
            Close
          </button>
          <button type="submit" disabled={loading} className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50">
            {loading ? 'Saving…' : 'Save'}
          </button>
        </>
      )}
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <div className="grid gap-4">
        <AdminField label="Doctor">
          <select className={inputClass} value={form.doctor} onChange={setField('doctor')} required>
            <option value="">Select doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.full_name || `${d.first_name} ${d.last_name}`}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Date">
          <input className={inputClass} type="date" value={form.date} onChange={setField('date')} required />
        </AdminField>
        <AdminField label="Time">
          <input className={inputClass} type="time" value={form.start_time} onChange={setField('start_time')} required />
        </AdminField>
        <AdminField label="Status">
          <select className={inputClass} value={form.status} onChange={setField('status')}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </AdminField>
      </div>
    </AdminModal>
  )
}
