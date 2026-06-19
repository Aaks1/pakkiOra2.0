import { useCallback, useEffect, useState } from 'react'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import CloudinaryPhotoField from '../ui/CloudinaryPhotoField'
import ProfileAvatar from '../ui/ProfileAvatar'
import PageLoader from './PageLoader'
import { useAuth } from '../../context/AuthContext'
import { getErrorMessage } from '../../api/axios'
import { changePassword, getProfile, updateProfile } from '../../api/patient'
import { patientDisplayName, patientInitials } from './patientNav'

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function PatientProfile() {
  const { updateUser } = useAuth()
  const [form, setForm] = useState(null)
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

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getProfile()
      setForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        date_of_birth: data.date_of_birth || '',
        blood_group: data.blood_group || '',
        address: data.address || '',
        allergies: data.allergies || '',
        medical_history: data.medical_history || '',
        photo_url: data.photo_url || '',
      })
      updateUser({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        photo_url: data.photo_url || '',
      })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [updateUser])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await updateProfile(form)
      updateUser({
        first_name: form.first_name,
        last_name: form.last_name,
        photo_url: form.photo_url || '',
      })
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New passwords do not match.')
      return
    }
    setPasswordSaving(true)
    setError('')
    setSuccess('')
    try {
      await changePassword(passwordForm)
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' })
      setSuccess('Password updated successfully.')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setPasswordSaving(false)
    }
  }

  if (loading) return <PageLoader label="Loading profile..." />
  if (!form) return <p className="text-sm text-red-600">{error || 'Could not load profile.'}</p>

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-r from-blue-50/80 to-teal-50/50 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <ProfileAvatar
            photoUrl={form.photo_url}
            initials={patientInitials(form)}
            size="2xl"
          />
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-800">{patientDisplayName(form)}</h1>
            <p className="mt-1 text-sm text-slate-600">{form.email}</p>
            {form.phone ? <p className="mt-0.5 text-sm text-slate-500">{form.phone}</p> : null}
          </div>
        </div>
      </section>

      <Alert message={error} onClose={() => setError('')} />
      {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

      <form onSubmit={handleSaveProfile} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <CloudinaryPhotoField
          value={form.photo_url}
          onChange={(photo_url) => {
            setForm((prev) => ({ ...prev, photo_url }))
            updateUser({ photo_url })
          }}
          initials={patientInitials(form)}
        />
        <h2 className="text-sm font-semibold text-slate-900">Personal details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="First name" name="first_name" value={form.first_name} onChange={setField('first_name')} required />
          <Input label="Last name" name="last_name" value={form.last_name} onChange={setField('last_name')} required />
          <Input label="Email" name="email" type="email" value={form.email} onChange={setField('email')} required />
          <Input label="Phone" name="phone" type="tel" value={form.phone} onChange={setField('phone')} />
          <Input label="Date of birth" name="date_of_birth" type="date" value={form.date_of_birth} onChange={setField('date_of_birth')} />
          <Select label="Blood group" name="blood_group" value={form.blood_group} onChange={setField('blood_group')}>
            {BLOOD_GROUPS.map((g) => (
              <option key={g || 'none'} value={g}>{g || 'Select blood group'}</option>
            ))}
          </Select>
        </div>
        <Textarea label="Address" name="address" rows={2} value={form.address} onChange={setField('address')} />
        <Textarea label="Allergies" name="allergies" rows={2} value={form.allergies} onChange={setField('allergies')} />
        <Textarea label="Medical history" name="medical_history" rows={3} value={form.medical_history} onChange={setField('medical_history')} />
        <Button type="submit" variant="primary" loading={saving}>Save profile</Button>
      </form>

      <form onSubmit={handleChangePassword} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Change password</h2>
        <Input label="Current password" name="old_password" type="password" value={passwordForm.old_password} onChange={(e) => setPasswordForm((p) => ({ ...p, old_password: e.target.value }))} required />
        <Input label="New password" name="new_password" type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))} required />
        <Input label="Confirm new password" name="confirm_password" type="password" value={passwordForm.confirm_password} onChange={(e) => setPasswordForm((p) => ({ ...p, confirm_password: e.target.value }))} required />
        <Button type="submit" variant="secondary" loading={passwordSaving}>Update password</Button>
      </form>
    </div>
  )
}
