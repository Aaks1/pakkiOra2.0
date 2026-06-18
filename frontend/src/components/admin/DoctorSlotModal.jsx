import { useCallback, useEffect, useState } from 'react'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import {
  DEFAULT_TIME_SLOTS,
  DOCTOR_DAYS,
  buildSlotConfigPayload,
  validateSlotConfigForm,
} from '../../utils/slotForm'
import { toggleDoctorDay } from '../../utils/doctorForm'
import {
  getDoctorAvailableDates,
  getDoctorSlotConfig,
  getDoctorSlots,
  updateDoctorSlotConfig,
} from '../../api/admin'
import { getErrorMessage } from '../../api/axios'

export default function DoctorSlotModal({ doctor, onClose, onSaved }) {
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
      if (dates.length) {
        setPreviewDate(dates[0])
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [doctor?.id])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

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

  const setField = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleDayToggle = (day) => {
    setForm((prev) => ({
      ...prev,
      available_days: toggleDoctorDay(prev.available_days, day),
    }))
  }

  const handleSave = async (e) => {
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

  if (!doctor) return null

  const doctorName = doctor.full_name || `Dr. ${doctor.first_name} ${doctor.last_name}`

  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="doctor-slot-title">
      <button type="button" className="admin-modal__backdrop" onClick={onClose} aria-label="Close" />
      <div className="admin-modal__panel admin-modal__panel--wide">
        <header className="admin-modal__header">
          <h2 id="doctor-slot-title" className="admin-modal__title">
            Manage slots — {doctorName}
          </h2>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Close">
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </header>

        <div className="admin-modal__body">
          {loading ? <p className="admin-modal__loading">Loading slot configuration…</p> : null}

          <Alert message={error} onClose={() => setError('')} />
          {success ? <p className="dashboard-feedback dashboard-feedback--success">{success}</p> : null}

          {!loading ? (
            <form className="dashboard-form dashboard-form--grid" onSubmit={handleSave} noValidate>
              <fieldset className="dashboard-form__full day-picker">
                <legend className="day-picker__legend">Weekly available days</legend>
                <div className="day-picker__grid">
                  {DOCTOR_DAYS.map((day) => (
                    <label key={day.value} className="day-picker__item">
                      <input
                        type="checkbox"
                        checked={form.available_days.includes(day.value)}
                        onChange={() => handleDayToggle(day.value)}
                      />
                      <span>{day.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <Input
                label="Time slots"
                name="time_slots"
                required
                hint="Comma-separated times or ranges, e.g. 09:00-12:00, 14:00-17:00"
                value={form.time_slots}
                onChange={setField('time_slots')}
                wrapperClassName="dashboard-form__full"
              />

              <div className="dashboard-form__full slot-override">
                <h3 className="slot-override__title">Date override (optional)</h3>
                <p className="dashboard-card__hint">
                  Block or open a specific date outside the weekly schedule.
                </p>
                <div className="slot-override__grid">
                  <Input
                    label="Date"
                    name="override_date"
                    type="date"
                    value={form.override_date}
                    onChange={setField('override_date')}
                  />
                  <Select
                    label="Availability"
                    name="override_is_available"
                    value={form.override_is_available ? 'true' : 'false'}
                    onChange={(e) => setForm((prev) => ({
                      ...prev,
                      override_is_available: e.target.value === 'true',
                    }))}
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </Select>
                  <Textarea
                    label="Notes"
                    name="override_notes"
                    rows={2}
                    value={form.override_notes}
                    onChange={setField('override_notes')}
                    wrapperClassName="slot-override__notes"
                  />
                </div>
              </div>

              {overrides.length > 0 ? (
                <div className="dashboard-form__full">
                  <h3 className="slot-override__title">Recent overrides</h3>
                  <ul className="slot-override-list">
                    {overrides.map((item) => (
                      <li key={item.id} className="slot-override-list__item">
                        <strong>{item.date}</strong>
                        {' — '}
                        {item.is_available ? 'Available' : 'Unavailable'}
                        {item.notes ? ` (${item.notes})` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="dashboard-form__full slot-preview">
                <h3 className="slot-override__title">Preview available slots</h3>
                <div className="slot-preview__controls">
                  <Input
                    label="Preview date"
                    name="preview_date"
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
                </div>
                {previewLoading ? (
                  <p className="dashboard-card__hint">Loading slots…</p>
                ) : (
                  <div className="slot-preview__chips">
                    {previewSlots.length === 0 ? (
                      <p className="dashboard-card__hint">No open slots for this date.</p>
                    ) : (
                      previewSlots.map((slot) => (
                        <span key={slot.start_time} className="slot-chip">
                          {slot.start_display} – {slot.end_display}
                        </span>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="dashboard-form__actions">
                <Button type="submit" variant="primary" loading={saving}>
                  {saving ? 'Saving…' : 'Save slot configuration'}
                </Button>
              </div>
            </form>
          ) : null}
        </div>

        <footer className="admin-modal__footer">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </footer>
      </div>
    </div>
  )
}
