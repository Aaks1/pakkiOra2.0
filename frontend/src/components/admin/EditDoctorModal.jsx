import { useEffect, useState } from 'react'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import {
  DOCTOR_DAYS,
  buildDoctorPayload,
  doctorToForm,
  toggleDoctorDay,
  validateDoctorForm,
} from '../../utils/doctorForm'
import { updateDoctor } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'

export default function EditDoctorModal({ doctor, onClose, onSaved }) {
  const [form, setForm] = useState(doctorToForm(doctor))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setForm(doctorToForm(doctor))
  }, [doctor])

  if (!doctor) return null

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validateDoctorForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')
    try {
      await updateDoctor(doctor.id, buildDoctorPayload(form))
      onSaved?.()
      onClose?.()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const name = doctor.full_name || `Dr. ${doctor.first_name} ${doctor.last_name}`

  return (
    <div className="admin-modal" role="dialog" aria-modal="true">
      <button type="button" className="admin-modal__backdrop" onClick={onClose} aria-label="Close" />
      <div className="admin-modal__panel admin-modal__panel--wide">
        <header className="admin-modal__header">
          <h2 className="admin-modal__title">Edit doctor — {name}</h2>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Close">
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </header>
        <div className="admin-modal__body">
          <Alert message={error} onClose={() => setError('')} />
          <form className="dashboard-form dashboard-form--grid" onSubmit={handleSubmit} noValidate>
            <Input label="First name" name="first_name" required value={form.first_name} onChange={setField('first_name')} />
            <Input label="Last name" name="last_name" required value={form.last_name} onChange={setField('last_name')} />
            <Input label="Email" name="email" type="email" required value={form.email} onChange={setField('email')} />
            <Input label="Phone" name="phone" type="tel" required value={form.phone} onChange={setField('phone')} />
            <Input label="Specialization" name="specialization" required value={form.specialization} onChange={setField('specialization')} />
            <Input label="Qualification" name="qualification" required value={form.qualification} onChange={setField('qualification')} />
            <Input label="License number" name="license_number" required value={form.license_number} onChange={setField('license_number')} />
            <Input label="Consultation schedule (time slots)" name="time_slots" hint="e.g. 09:00-17:00" value={form.time_slots} onChange={setField('time_slots')} wrapperClassName="dashboard-form__full" />
            <Select label="Status" name="is_active" value={form.is_active ? 'true' : 'false'} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value === 'true' }))}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
            <fieldset className="dashboard-form__full day-picker">
              <legend className="day-picker__legend">Available days</legend>
              <div className="day-picker__grid">
                {DOCTOR_DAYS.map((day) => (
                  <label key={day.value} className="day-picker__item">
                    <input type="checkbox" checked={form.available_days.includes(day.value)} onChange={() => handleDayToggle(day.value)} />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="dashboard-form__actions">
              <Button type="submit" variant="primary" loading={loading}>Save changes</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
