import { useEffect, useState } from 'react'
import AdminModal from './AdminModal'
import AdminField, { inputClass } from './AdminField'
import { updateAdminPatient } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'

const FORM_ID = 'edit-patient-form'

export default function EditPatientModal({ patient, open, onClose, onSaved }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    is_active: true,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!patient) return
    setForm({
      first_name: patient.first_name || '',
      last_name: patient.last_name || '',
      email: patient.email || '',
      phone: patient.phone || patient.profile?.phone || '',
      is_active: patient.is_active !== false,
    })
  }, [patient])

  if (!patient) return null

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await updateAdminPatient(patient.id, form)
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
      title={`Edit patient — ${patient.username}`}
      onClose={onClose}
      formId={FORM_ID}
      onSubmit={handleSubmit}
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
      <div className="grid gap-4">
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
          <input className={inputClass} type="tel" value={form.phone} onChange={setField('phone')} />
        </AdminField>
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
      </div>
    </AdminModal>
  )
}
