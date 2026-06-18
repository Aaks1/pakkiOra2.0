import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Select from '../../components/ui/Select'
import Alert from '../../components/ui/Alert'
import { getErrorMessage } from '../../api/axios'
import { changePassword, getProfile, updateProfile } from '../../api/patient'

const GENDER_OPTIONS = [
  { value: '', label: 'Select gender' },
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
]

const BLOOD_OPTIONS = [
  { value: '', label: 'Select blood group' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
]

const EMPTY_PROFILE = {
  email: '',
  first_name: '',
  last_name: '',
  date_of_birth: '',
  gender: '',
  blood_group: '',
  phone: '',
  address: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  medical_history: '',
  allergies: '',
}

export default function PatientProfile() {
  const [form, setForm] = useState(EMPTY_PROFILE)
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getProfile()
      setForm({
        email: data.email || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        date_of_birth: data.date_of_birth || '',
        gender: data.gender || '',
        blood_group: data.blood_group || '',
        phone: data.phone || '',
        address: data.address || '',
        emergency_contact_name: data.emergency_contact_name || '',
        emergency_contact_phone: data.emergency_contact_phone || '',
        medical_history: data.medical_history || '',
        allergies: data.allergies || '',
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await updateProfile(form)
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordSaving(true)
    setError('')
    setPasswordSuccess('')
    try {
      await changePassword(passwordForm)
      setPasswordSuccess('Password updated successfully.')
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setPasswordSaving(false)
    }
  }

  if (loading) {
    return <p className="dashboard-feedback">Loading profile…</p>
  }

  return (
    <>
      <AdminPageHeader title="My profile" subtitle="Update your personal and medical information." />

      <Alert message={error} onClose={() => setError('')} />
      {success && <p className="dashboard-feedback dashboard-feedback--success">{success}</p>}

      <form onSubmit={handleSaveProfile} className="dashboard-card" style={{ marginBottom: '1rem' }}>
        <h2 className="dashboard-card__title">Personal details</h2>
        <div className="dashboard-form dashboard-form--grid">
          <Input
            label="Email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
          />
          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />
          <Input
            label="First name"
            name="first_name"
            required
            value={form.first_name}
            onChange={(e) => updateField('first_name', e.target.value)}
          />
          <Input
            label="Last name"
            name="last_name"
            required
            value={form.last_name}
            onChange={(e) => updateField('last_name', e.target.value)}
          />
          <Input
            label="Date of birth"
            name="date_of_birth"
            type="date"
            value={form.date_of_birth}
            onChange={(e) => updateField('date_of_birth', e.target.value)}
          />
          <Select
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={(e) => updateField('gender', e.target.value)}
          >
            {GENDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
          <Select
            label="Blood group"
            name="blood_group"
            value={form.blood_group}
            onChange={(e) => updateField('blood_group', e.target.value)}
          >
            {BLOOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
          <Input
            label="Emergency contact name"
            name="emergency_contact_name"
            value={form.emergency_contact_name}
            onChange={(e) => updateField('emergency_contact_name', e.target.value)}
          />
          <Input
            label="Emergency contact phone"
            name="emergency_contact_phone"
            value={form.emergency_contact_phone}
            onChange={(e) => updateField('emergency_contact_phone', e.target.value)}
          />
        </div>
        <Textarea
          label="Address"
          name="address"
          value={form.address}
          onChange={(e) => updateField('address', e.target.value)}
          rows={2}
        />
        <Textarea
          label="Medical history"
          name="medical_history"
          value={form.medical_history}
          onChange={(e) => updateField('medical_history', e.target.value)}
          rows={3}
        />
        <Textarea
          label="Allergies"
          name="allergies"
          value={form.allergies}
          onChange={(e) => updateField('allergies', e.target.value)}
          rows={2}
        />
        <div style={{ marginTop: '1rem' }}>
          <Button type="submit" variant="primary" loading={saving}>
            Save profile
          </Button>
        </div>
      </form>

      <form onSubmit={handleChangePassword} className="dashboard-card">
        <h2 className="dashboard-card__title">Change password</h2>
        {passwordSuccess && (
          <p className="dashboard-feedback dashboard-feedback--success">{passwordSuccess}</p>
        )}
        <div className="dashboard-form dashboard-form--grid">
          <Input
            label="Current password"
            name="old_password"
            type="password"
            required
            value={passwordForm.old_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
          />
          <Input
            label="New password"
            name="new_password"
            type="password"
            required
            value={passwordForm.new_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
          />
          <Input
            label="Confirm new password"
            name="confirm_password"
            type="password"
            required
            value={passwordForm.confirm_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
          />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <Button type="submit" variant="secondary" loading={passwordSaving}>
            Update password
          </Button>
        </div>
      </form>
    </>
  )
}
