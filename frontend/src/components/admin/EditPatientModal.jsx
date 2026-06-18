import { useEffect, useState } from 'react'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import { updateAdminPatient } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'

export default function EditPatientModal({ patient, onClose, onSaved }) {
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
      phone: patient.phone || '',
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
    <div className="admin-modal" role="dialog" aria-modal="true">
      <button type="button" className="admin-modal__backdrop" onClick={onClose} aria-label="Close" />
      <div className="admin-modal__panel">
        <header className="admin-modal__header">
          <h2 className="admin-modal__title">Edit patient — {patient.username}</h2>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Close">
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </header>
        <div className="admin-modal__body">
          <Alert message={error} onClose={() => setError('')} />
          <form className="dashboard-form" onSubmit={handleSubmit} noValidate>
            <Input label="First name" name="first_name" required value={form.first_name} onChange={setField('first_name')} />
            <Input label="Last name" name="last_name" required value={form.last_name} onChange={setField('last_name')} />
            <Input label="Email" name="email" type="email" required value={form.email} onChange={setField('email')} />
            <Input label="Phone" name="phone" type="tel" value={form.phone} onChange={setField('phone')} />
            <Select label="Status" name="is_active" value={form.is_active ? 'true' : 'false'} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.value === 'true' }))}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
            <div className="dashboard-form__actions">
              <Button type="submit" variant="primary" loading={loading}>Save changes</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
