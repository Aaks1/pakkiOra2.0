import { useState } from 'react'
import AdminModal from './AdminModal'
import AdminField, { inputClass } from './AdminField'
import {
  ADMIN_STAFF_INITIAL,
  buildAdminStaffPayload,
  validateAdminStaffForm,
} from '../../utils/adminStaff'
import { createAdminStaff } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'

const FORM_ID = 'create-admin-form'

export default function CreateAdminModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(ADMIN_STAFF_INITIAL)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleClose = () => {
    setForm(ADMIN_STAFF_INITIAL)
    setError('')
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validateAdminStaffForm(form)
    if (validationError) {
      setError(validationError)
      return
    }
    setLoading(true)
    setError('')
    try {
      const created = await createAdminStaff(buildAdminStaffPayload(form))
      setForm(ADMIN_STAFF_INITIAL)
      onCreated?.(created)
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
      title="Create admin"
      onClose={handleClose}
      formId={FORM_ID}
      onSubmit={handleSubmit}
      footer={(
        <>
          <button type="button" onClick={handleClose} className="admin-btn admin-btn--secondary">
            Cancel
          </button>
          <button type="submit" form={FORM_ID} disabled={loading} className="admin-btn admin-btn--primary">
            {loading ? 'Creating…' : 'Create admin'}
          </button>
        </>
      )}
    >
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Username">
          <input className={inputClass} value={form.username} onChange={setField('username')} required />
        </AdminField>
        <AdminField label="Email">
          <input className={inputClass} type="email" value={form.email} onChange={setField('email')} required />
        </AdminField>
        <AdminField label="First name">
          <input className={inputClass} value={form.first_name} onChange={setField('first_name')} required />
        </AdminField>
        <AdminField label="Last name">
          <input className={inputClass} value={form.last_name} onChange={setField('last_name')} required />
        </AdminField>
        <AdminField label="Phone">
          <input className={inputClass} type="tel" value={form.phone} onChange={setField('phone')} />
        </AdminField>
        <AdminField label="Department">
          <input className={inputClass} value={form.department} onChange={setField('department')} />
        </AdminField>
        <AdminField label="Password">
          <input className={inputClass} type="password" value={form.password} onChange={setField('password')} required />
        </AdminField>
        <AdminField label="Confirm password">
          <input className={inputClass} type="password" value={form.confirm_password} onChange={setField('confirm_password')} required />
        </AdminField>
      </div>
    </AdminModal>
  )
}
