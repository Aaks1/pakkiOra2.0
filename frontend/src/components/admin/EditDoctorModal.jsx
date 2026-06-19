import { useEffect, useState } from 'react'
import AdminModal from './AdminModal'
import AdminDayPicker from './AdminDayPicker'
import AdminField, { inputClass } from './AdminField'
import AdminSpecializationSelect from './AdminSpecializationSelect'
import CloudinaryPhotoField from '../ui/CloudinaryPhotoField'
import { buildDoctorPayload, doctorToForm, validateDoctorForm } from '../../utils/doctorForm'
import { updateDoctor } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'

const FORM_ID = 'edit-doctor-form'

export default function EditDoctorModal({ doctor, open, onClose, onSaved }) {
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
    <AdminModal
      open={open}
      title={`Edit doctor — ${name}`}
      onClose={onClose}
      formId={FORM_ID}
      onSubmit={handleSubmit}
      maxWidth="max-w-2xl"
      footer={(
        <>
          <button type="button" onClick={onClose} className="admin-btn admin-btn--secondary">
            Cancel
          </button>
          <button type="submit" form={FORM_ID} disabled={loading} className="admin-btn admin-btn--primary">
            {loading ? 'Saving…' : 'Save changes'}
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
          <input className={inputClass} type="tel" value={form.phone} onChange={setField('phone')} required />
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
        <AdminField label="Time slots" className="sm:col-span-2">
          <input className={inputClass} value={form.time_slots} onChange={setField('time_slots')} />
        </AdminField>
        <AdminField label="Address" className="sm:col-span-2">
          <textarea className={inputClass} rows={2} value={form.address} onChange={setField('address')} />
        </AdminField>
        <AdminField label="Bio" className="sm:col-span-2">
          <textarea className={inputClass} rows={3} value={form.bio} onChange={setField('bio')} />
        </AdminField>
        <div className="sm:col-span-2">
          <CloudinaryPhotoField
            value={form.photo_url}
            onChange={(photo_url) => setForm((prev) => ({ ...prev, photo_url }))}
            initials={`${form.first_name?.[0] || ''}${form.last_name?.[0] || ''}`.toUpperCase() || 'DR'}
            inputClass={inputClass}
          />
        </div>
        <AdminField label="Status">
          <select
            className={inputClass}
            value={form.is_active ? 'true' : 'false'}
            onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value === 'true' }))}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </AdminField>
        <AdminField label="Available days" className="sm:col-span-2">
          <AdminDayPicker value={form.available_days} onChange={(days) => setForm((p) => ({ ...p, available_days: days }))} />
        </AdminField>
      </div>
    </AdminModal>
  )
}
