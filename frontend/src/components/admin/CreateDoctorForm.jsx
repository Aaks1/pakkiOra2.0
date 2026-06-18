import { useState } from 'react'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import {
  DOCTOR_DAYS,
  DOCTOR_INITIAL,
  buildDoctorPayload,
  toggleDoctorDay,
  validateDoctorForm,
} from '../../utils/doctorForm'
import { createDoctor } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'

export default function CreateDoctorForm({ onCreated }) {
  const [form, setForm] = useState(DOCTOR_INITIAL)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

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
      await createDoctor(buildDoctorPayload(form))
      setForm(DOCTOR_INITIAL)
      onCreated?.()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="dashboard-card">
      <h2 className="dashboard-card__title">Create doctor</h2>
      <p className="dashboard-card__hint">
        Adds a new doctor profile using the doctor write API schema.
      </p>

      <Alert message={error} onClose={() => setError('')} />

      <form className="dashboard-form dashboard-form--grid" onSubmit={handleSubmit} noValidate>
        <Input
          label="First name"
          name="first_name"
          required
          value={form.first_name}
          onChange={setField('first_name')}
        />
        <Input
          label="Last name"
          name="last_name"
          required
          value={form.last_name}
          onChange={setField('last_name')}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={setField('email')}
        />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          required
          hint="9–15 digits"
          value={form.phone}
          onChange={setField('phone')}
        />
        <Input
          label="Specialization"
          name="specialization"
          required
          value={form.specialization}
          onChange={setField('specialization')}
        />
        <Input
          label="Qualification"
          name="qualification"
          required
          value={form.qualification}
          onChange={setField('qualification')}
        />
        <Input
          label="License number"
          name="license_number"
          required
          value={form.license_number}
          onChange={setField('license_number')}
        />
        <Input
          label="Experience (years)"
          name="experience_years"
          type="number"
          min="0"
          hint="Optional"
          value={form.experience_years}
          onChange={setField('experience_years')}
        />
        <Input
          label="Department"
          name="department"
          hint="Optional"
          value={form.department}
          onChange={setField('department')}
        />
        <Input
          label="Time slots"
          name="time_slots"
          hint="e.g. 09:00-12:00, 14:00-17:00"
          value={form.time_slots}
          onChange={setField('time_slots')}
        />
        <Textarea
          label="Address"
          name="address"
          hint="Optional"
          rows={2}
          value={form.address}
          onChange={setField('address')}
          wrapperClassName="dashboard-form__full"
        />
        <Textarea
          label="Bio"
          name="bio"
          hint="Optional"
          rows={3}
          value={form.bio}
          onChange={setField('bio')}
          wrapperClassName="dashboard-form__full"
        />

        <fieldset className="dashboard-form__full day-picker">
          <legend className="day-picker__legend">Available days</legend>
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

        <div className="dashboard-form__actions">
          <Button type="submit" variant="primary" loading={loading} className="btn--lg">
            {loading ? 'Creating…' : 'Create doctor'}
          </Button>
        </div>
      </form>
    </article>
  )
}
