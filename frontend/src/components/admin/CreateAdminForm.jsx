import { useState } from 'react'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Input from '../ui/Input'
import {
  ADMIN_STAFF_INITIAL,
  buildAdminStaffPayload,
  validateAdminStaffForm,
} from '../../utils/adminStaff'
import { createAdminStaff } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'

export default function CreateAdminForm({ onCreated }) {
  const [form, setForm] = useState(ADMIN_STAFF_INITIAL)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

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
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <article className="dashboard-card">
      <h2 className="dashboard-card__title">Create admin user</h2>
      <p className="dashboard-card__hint">
        Creates a staff account using the admin staff API schema.
      </p>

      <Alert message={error} onClose={() => setError('')} />

      <form className="dashboard-form dashboard-form--grid" onSubmit={handleSubmit} noValidate>
        <Input
          label="Username"
          name="username"
          autoComplete="username"
          required
          value={form.username}
          onChange={setField('username')}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={setField('email')}
        />
        <Input
          label="First name"
          name="first_name"
          autoComplete="given-name"
          required
          value={form.first_name}
          onChange={setField('first_name')}
        />
        <Input
          label="Last name"
          name="last_name"
          autoComplete="family-name"
          required
          value={form.last_name}
          onChange={setField('last_name')}
        />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          hint="Optional"
          value={form.phone}
          onChange={setField('phone')}
        />
        <Input
          label="Department"
          name="department"
          hint="Optional"
          value={form.department}
          onChange={setField('department')}
        />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          hint="Minimum 8 characters"
          value={form.password}
          onChange={setField('password')}
        />
        <Input
          label="Confirm password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          required
          value={form.confirm_password}
          onChange={setField('confirm_password')}
        />

        <div className="dashboard-form__actions">
          <Button type="submit" variant="primary" loading={loading} className="btn--lg">
            {loading ? 'Creating…' : 'Create admin'}
          </Button>
        </div>
      </form>
    </article>
  )
}
