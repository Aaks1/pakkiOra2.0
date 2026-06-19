import { useCallback, useEffect, useState } from 'react'
import AdminModal from './AdminModal'
import AdminDayPicker from './AdminDayPicker'
import AdminField, { inputClass } from './AdminField'
import {
  DEFAULT_TIME_SLOTS,
  buildSlotConfigPayload,
  validateSlotConfigForm,
} from '../../utils/slotForm'
import {
  getDoctorAvailableDates,
  getDoctorSlotConfig,
  getDoctorSlots,
  updateDoctorSlotConfig,
} from '../../api/admin'
import { getErrorMessage } from '../../api/axios'

const FORM_ID = 'doctor-slot-form'

export default function DoctorSlotModal({ doctor, open, onClose, onSaved }) {
  const [form, setForm] = useState({
    available_days: [],
    time_slots: DEFAULT_TIME_SLOTS,
    override_date: '',
    override_is_available: true,
    override_notes: '',
  })
  const [overrides, setOverrides] = useState([])
  const [previewDate, setPreviewDate] = useState('')
  const [previewSlots, setPreviewSlots] = useState([])
  const [availableDates, setAvailableDates] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadConfig = useCallback(async () => {
    if (!doctor?.id) return
    setLoading(true)
    setError('')
    try {
      const [config, datesData] = await Promise.all([
        getDoctorSlotConfig(doctor.id),
        getDoctorAvailableDates(doctor.id, 30),
      ])
      setForm((prev) => ({
        ...prev,
        available_days: config.available_days || [],
        time_slots: config.time_slots || DEFAULT_TIME_SLOTS,
      }))
      setOverrides(config.overrides || [])
      const dates = datesData?.dates || []
      setAvailableDates(dates)
      if (dates.length) setPreviewDate(dates[0])
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [doctor?.id])

  useEffect(() => {
    if (open) loadConfig()
  }, [open, loadConfig])

  useEffect(() => {
    if (!doctor?.id || !previewDate) {
      setPreviewSlots([])
      return undefined
    }
    let active = true
    setPreviewLoading(true)
    getDoctorSlots(doctor.id, previewDate)
      .then((data) => {
        if (active) setPreviewSlots(data?.slots || [])
      })
      .catch(() => {
        if (active) setPreviewSlots([])
      })
      .finally(() => {
        if (active) setPreviewLoading(false)
      })
    return () => {
      active = false
    }
  }, [doctor?.id, previewDate])

  if (!doctor) return null

  const setField = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validateSlotConfigForm(form)
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await updateDoctorSlotConfig(doctor.id, buildSlotConfigPayload(form))
      setSuccess('Slot configuration saved.')
      await loadConfig()
      onSaved?.()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const doctorName = doctor.full_name || `Dr. ${doctor.first_name} ${doctor.last_name}`

  return (
    <AdminModal
      open={open}
      title={`Manage slots — ${doctorName}`}
      onClose={onClose}
      formId={FORM_ID}
      onSubmit={handleSubmit}
      maxWidth="max-w-2xl"
      footer={(
        <>
          <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700">
            Close
          </button>
          <button type="submit" disabled={saving || loading} className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save configuration'}
          </button>
        </>
      )}
    >
      {loading ? <p className="text-sm text-slate-400">Loading...</p> : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {success ? <p className="mb-4 text-sm text-emerald-700">{success}</p> : null}

      {!loading ? (
        <div className="space-y-5">
          <AdminField label="Weekly available days">
            <AdminDayPicker
              value={form.available_days}
              onChange={(days) => setForm((p) => ({ ...p, available_days: days }))}
            />
          </AdminField>

          <AdminField label="Time slots">
            <input
              className={inputClass}
              value={form.time_slots}
              onChange={setField('time_slots')}
              placeholder="09:00-12:00, 14:00-17:00"
              required
            />
          </AdminField>

          <div className="rounded-lg border border-slate-200 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Date override</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="Date">
                <input className={inputClass} type="date" value={form.override_date} onChange={setField('override_date')} />
              </AdminField>
              <AdminField label="Availability">
                <select
                  className={inputClass}
                  value={form.override_is_available ? 'true' : 'false'}
                  onChange={(e) => setForm((p) => ({ ...p, override_is_available: e.target.value === 'true' }))}
                >
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </AdminField>
              <AdminField label="Notes" className="sm:col-span-2">
                <textarea className={inputClass} rows={2} value={form.override_notes} onChange={setField('override_notes')} />
              </AdminField>
            </div>
          </div>

          {overrides.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Recent overrides</p>
              <ul className="space-y-1 text-sm text-slate-600">
                {overrides.map((item) => (
                  <li key={item.id}>
                    <span className="font-medium text-slate-900">{item.date}</span>
                    {' — '}
                    {item.is_available ? 'Available' : 'Unavailable'}
                    {item.notes ? ` (${item.notes})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Preview slots</p>
            <AdminField label="Preview date">
              <input
                className={inputClass}
                type="date"
                value={previewDate}
                onChange={(e) => setPreviewDate(e.target.value)}
                list="doctor-available-dates"
              />
              <datalist id="doctor-available-dates">
                {availableDates.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </AdminField>
            {previewLoading ? (
              <p className="mt-2 text-sm text-slate-400">Loading...</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {previewSlots.length === 0 ? (
                  <p className="text-sm text-slate-400">No open slots for this date.</p>
                ) : (
                  previewSlots.map((slot) => (
                    <span
                      key={slot.start_time}
                      className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800"
                    >
                      {slot.start_display} – {slot.end_display}
                    </span>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </AdminModal>
  )
}
