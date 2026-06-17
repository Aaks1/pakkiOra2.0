export const REGISTER_STEPS = [
  { id: 'personal', label: 'Personal' },
  { id: 'contact', label: 'Contact' },
  { id: 'medical', label: 'Medical' },
  { id: 'security', label: 'Account' },
]

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const INITIAL_FORM = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  date_of_birth: '',
  address: '',
  blood_group: '',
  allergies: '',
  medical_conditions: '',
  password: '',
  confirm_password: '',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateStep(step, form) {
  switch (step) {
    case 0:
      if (!form.username.trim()) return 'Username is required.'
      if (form.username.trim().length < 3) return 'Username must be at least 3 characters.'
      if (!form.email.trim()) return 'Email is required.'
      if (!EMAIL_PATTERN.test(form.email.trim())) return 'Enter a valid email address.'
      if (!form.first_name.trim()) return 'First name is required.'
      if (!form.last_name.trim()) return 'Last name is required.'
      return ''
    case 1:
      return ''
    case 2:
      return ''
    case 3:
      if (!form.password) return 'Password is required.'
      if (form.password.length < 8) return 'Password must be at least 8 characters.'
      if (form.password !== form.confirm_password) return 'Passwords do not match.'
      return ''
    default:
      return ''
  }
}

/** Shape payload to match PatientRegistrationSerializer */
export function buildRegisterPayload(form) {
  const payload = {
    username: form.username.trim(),
    email: form.email.trim(),
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    password: form.password,
    confirm_password: form.confirm_password,
  }

  if (form.phone?.trim()) payload.phone = form.phone.trim()
  if (form.date_of_birth) payload.date_of_birth = form.date_of_birth
  if (form.address?.trim()) payload.address = form.address.trim()
  if (form.blood_group) payload.blood_group = form.blood_group
  if (form.allergies?.trim()) payload.allergies = form.allergies.trim()
  if (form.medical_conditions?.trim()) payload.medical_conditions = form.medical_conditions.trim()

  return payload
}
