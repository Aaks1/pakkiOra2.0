const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const ADMIN_STAFF_INITIAL = {
  username: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  department: '',
  password: '',
  confirm_password: '',
}

/** Payload for POST /api/v1/admin/staff/ (AdminUserSerializer) */
export function buildAdminStaffPayload(form) {
  const payload = {
    username: form.username.trim(),
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    email: form.email.trim(),
    password: form.password,
    confirm_password: form.confirm_password,
  }

  const phone = form.phone?.trim()
  const department = form.department?.trim()
  if (phone) payload.phone = phone
  if (department) payload.department = department

  return payload
}

export function validateAdminStaffForm(form) {
  if (!form.username.trim()) return 'Username is required.'
  if (form.username.trim().length < 3) return 'Username must be at least 3 characters.'
  if (!form.first_name.trim()) return 'First name is required.'
  if (!form.last_name.trim()) return 'Last name is required.'
  if (!form.email.trim()) return 'Email is required.'
  if (!EMAIL_PATTERN.test(form.email.trim())) return 'Enter a valid email address.'
  if (!form.password) return 'Password is required.'
  if (form.password.length < 8) return 'Password must be at least 8 characters.'
  if (form.password !== form.confirm_password) return 'Passwords do not match.'
  return ''
}

export function normalizeAdminList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  return []
}
