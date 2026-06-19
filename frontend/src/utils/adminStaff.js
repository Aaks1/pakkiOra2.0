export const ADMIN_STAFF_INITIAL = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  department: '',
  password: '',
  confirm_password: '',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateAdminStaffForm(form) {
  if (!form.username?.trim()) return 'Username is required.'
  if (!form.email?.trim() || !EMAIL_PATTERN.test(form.email)) return 'A valid email is required.'
  if (!form.first_name?.trim()) return 'First name is required.'
  if (!form.last_name?.trim()) return 'Last name is required.'
  if (!form.password || form.password.length < 8) return 'Password must be at least 8 characters.'
  if (form.password !== form.confirm_password) return 'Passwords do not match.'
  return ''
}

export function buildAdminStaffPayload(form) {
  const payload = {
    username: form.username.trim(),
    email: form.email.trim(),
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    password: form.password,
    confirm_password: form.confirm_password,
  }
  if (form.phone?.trim()) payload.phone = form.phone.trim()
  if (form.department?.trim()) payload.department = form.department.trim()
  return payload
}

export function adminToForm(admin) {
  if (!admin) {
    return {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      department: '',
      is_active: true,
      password: '',
      confirm_password: '',
    }
  }
  return {
    username: admin.username || '',
    email: admin.email || '',
    first_name: admin.first_name || '',
    last_name: admin.last_name || '',
    phone: admin.phone || '',
    department: admin.department || '',
    is_active: admin.is_active !== false,
    password: '',
    confirm_password: '',
  }
}

export function validateAdminStaffUpdateForm(form) {
  if (!form.email?.trim() || !EMAIL_PATTERN.test(form.email)) return 'A valid email is required.'
  if (!form.first_name?.trim()) return 'First name is required.'
  if (!form.last_name?.trim()) return 'Last name is required.'
  if (form.password || form.confirm_password) {
    if (form.password.length < 8) return 'Password must be at least 8 characters.'
    if (form.password !== form.confirm_password) return 'Passwords do not match.'
  }
  return ''
}

export function buildAdminStaffUpdatePayload(form) {
  const payload = {
    email: form.email.trim(),
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    is_active: form.is_active !== false,
    phone: form.phone?.trim() || '',
    department: form.department?.trim() || '',
  }
  if (form.password) {
    payload.password = form.password
    payload.confirm_password = form.confirm_password
  }
  return payload
}
