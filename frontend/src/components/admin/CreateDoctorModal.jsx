import { useState } from 'react'
import AdminModal from './AdminModal'
import AdminDayPicker from './AdminDayPicker'
import AdminField, { inputClass } from './AdminField'
import AdminSpecializationSelect from './AdminSpecializationSelect'
import { DOCTOR_INITIAL, buildDoctorPayload, validateDoctorForm } from '../../utils/doctorForm'
import { createDoctor } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'

const FORM_ID = 'create-doctor-form'

export default function CreateDoctorModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(DOCTOR_INITIAL)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleClose = () => {
    setForm(DOCTOR_INITIAL)
    setError('')
    onClose()
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
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminModal
      open={open}
      title="Create doctor"
      onClose={handleClose}
      formId={FORM_ID}
      onSubmit={handleSubmit}
      maxWidth="max-w-2xl"
      footer={(
        <>
          <button type="button" onClick={handleClose} className="admin-btn admin-btn--secondary">
            Cancel
          </button>
          <button type="submit" form={FORM_ID} disabled={loading} className="admin-btn admin-btn--primary">
            {loading ? 'Creating…' : 'Create doctor'}
          </button>
        </>
      )}
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="First name">
          <input className={inputClass} value={form.first_name} onChange={setField('first_name')} required />
        </AdminField>
        <AdminField label="Last name">
          <input className={inputClass} value={form.last_name} onChange={setField('last_name')} required />
        </AdminField>
        <AdminField label="Email">
          <input className={inputClass} type="email" value={form.email} onChange={setField('email')} required />
        </AdminField>
        <AdminField label="Phone">
          <input className={inputClass} type="tel" value={form.phone} onChange={setField('phone')} placeholder="e.g. 0212345678" required />
        </AdminField>
        <AdminField label="Specialization">
          <AdminSpecializationSelect
            value={form.specialization}
            onChange={(specialization) => setForm((prev) => ({ ...prev, specialization }))}
          />
        </AdminField>
        <AdminField label="Qualification">
          <input className={inputClass} value={form.qualification} onChange={setField('qualification')} required />
        </AdminField>
        <AdminField label="License number">
          <input className={inputClass} value={form.license_number} onChange={setField('license_number')} required />
        </AdminField>
        <AdminField label="Experience (years)">
          <input className={inputClass} type="number" min="0" value={form.experience_years} onChange={setField('experience_years')} />
        </AdminField>
        <AdminField label="Department">
          <input className={inputClass} value={form.department} onChange={setField('department')} />
        </AdminField>
        <AdminField label="Time slots">
          <input className={inputClass} value={form.time_slots} onChange={setField('time_slots')} placeholder="09:00-12:00, 14:00-17:00" />
        </AdminField>
        <AdminField label="Address" className="sm:col-span-2">
          <textarea className={inputClass} rows={2} value={form.address} onChange={setField('address')} />
        </AdminField>
        <AdminField label="Bio" className="sm:col-span-2">
          <textarea className={inputClass} rows={3} value={form.bio} onChange={setField('bio')} />
        </AdminField>
        <AdminField label="Available days" className="sm:col-span-2">
          <AdminDayPicker value={form.available_days} onChange={(days) => setForm((p) => ({ ...p, available_days: days }))} />
        </AdminField>
      </div>
    </AdminModal>
  )
}
