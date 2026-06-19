import { useEffect, useState } from 'react'
import AdminModal from './AdminModal'
import AdminField, { inputClass } from './AdminField'
import {
  adminToForm,
  buildAdminStaffUpdatePayload,
  validateAdminStaffUpdateForm,
} from '../../utils/adminStaff'
import { updateAdminStaff } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'

const FORM_ID = 'edit-admin-form'

export default function EditAdminModal({ admin, open, onClose, onSaved }) {
  const [form, setForm] = useState(adminToForm(admin))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setForm(adminToForm(admin))
    setError('')
  }, [admin])

  if (!admin) return null

  const setField = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validateAdminStaffUpdateForm(form)
    if (validationError) {
      setError(validationError)
      return
    }
    setLoading(true)
    setError('')
    try {
      await updateAdminStaff(admin.id, buildAdminStaffUpdatePayload(form))
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
      title={`Edit admin — ${admin.username}`}
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
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminField label="Username">
          <input className={`${inputClass} bg-slate-50`} value={form.username} readOnly disabled />
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
        <AdminField label="Email">
          <input className={inputClass} type="email" value={form.email} onChange={setField('email')} required />
        </AdminField>
        <AdminField label="Phone">
          <input className={inputClass} type="tel" value={form.phone} onChange={setField('phone')} />
        </AdminField>
        <AdminField label="First name">
          <input className={inputClass} value={form.first_name} onChange={setField('first_name')} required />
        </AdminField>
        <AdminField label="Last name">
          <input className={inputClass} value={form.last_name} onChange={setField('last_name')} required />
        </AdminField>
        <AdminField label="Department" className="sm:col-span-2">
          <input className={inputClass} value={form.department} onChange={setField('department')} />
        </AdminField>
        <AdminField label="New password (optional)">
          <input className={inputClass} type="password" value={form.password} onChange={setField('password')} autoComplete="new-password" />
        </AdminField>
        <AdminField label="Confirm new password">
          <input className={inputClass} type="password" value={form.confirm_password} onChange={setField('confirm_password')} autoComplete="new-password" />
        </AdminField>
      </div>
    </AdminModal>
  )
}
