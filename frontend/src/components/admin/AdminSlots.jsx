import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from './AdminPageHeader'
import AdminField, { inputClass } from './AdminField'
import { AdminError } from './AdminFeedback'
import { getDoctorSlotOverview, listDoctors } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'
import { normalizeList } from '../../utils/apiList'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function patientInitials(name) {
  if (!name) return ''
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

function slotChipClass(status) {
  switch (status) {
    case 'available':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800'
    case 'booked':
      return 'border-blue-200 bg-blue-50 text-blue-800'
    case 'cancelled':
      return 'border-red-200 bg-red-50 text-red-500 line-through'
    default:
      return 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300'
  }
}

export default function AdminSlots() {
  const [doctors, setDoctors] = useState([])
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState(todayIso)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    listDoctors({ is_active: true })
      .then((data) => {
        const list = normalizeList(data)
        setDoctors(list)
        if (list.length) setDoctorId(String(list[0].id))
      })
      .catch(() => setDoctors([]))
  }, [])

  const selectedDoctor = doctors.find((d) => String(d.id) === String(doctorId))

  const loadSlots = useCallback(async () => {
    if (!doctorId || !date) return
    setLoading(true)
    setError('')
    try {
      const data = await getDoctorSlotOverview(doctorId, date)
      setSlots(data?.slots || [])
    } catch (err) {
      setError(getErrorMessage(err))
      setSlots([])
    } finally {
      setLoading(false)
    }
  }, [doctorId, date])

  useEffect(() => {
    loadSlots()
  }, [loadSlots])

  const doctorLabel = selectedDoctor
    ? selectedDoctor.full_name || `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}`
    : '—'

  return (
    <div>
      <AdminPageHeader title="Slots" subtitle="View doctor availability by date" />
      <AdminError message={error} />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <AdminField label="Doctor">
          <select
            className={`${inputClass} w-64`}
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
          >
            <option value="">Select doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.full_name || `${d.first_name} ${d.last_name}`}
              </option>
            ))}
          </select>
        </AdminField>
        <AdminField label="Date">
          <input className={`${inputClass} w-48`} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </AdminField>
        <button
          type="button"
          onClick={loadSlots}
          disabled={!doctorId || !date || loading}
          className="admin-btn admin-btn--secondary"
        >
          Refresh
        </button>
      </div>

      {date && doctorId ? (
        <>
          <p className="mb-4 text-sm font-medium text-slate-900">
            {doctorLabel} — {date}
          </p>
          {loading ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {slots.length === 0 ? (
                <p className="col-span-full text-sm text-slate-400">No slots for this date.</p>
              ) : (
                slots.map((slot) => {
                  const status = slot.slot_status || 'disabled'
                  return (
                    <div
                      key={slot.start_time}
                      className={`rounded-md border px-3 py-2 text-center text-xs font-medium ${slotChipClass(status)}`}
                    >
                      {status === 'available' ? (
                        <span
                          className="mb-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div>{slot.start_display || String(slot.start_time).slice(0, 5)}</div>
                      {status === 'booked' && slot.patient_name ? (
                        <div className="mt-0.5 text-[10px] font-normal opacity-80">
                          {patientInitials(slot.patient_name)}
                        </div>
                      ) : null}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
