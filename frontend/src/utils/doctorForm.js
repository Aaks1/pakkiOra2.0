export const DOCTOR_SPECIALIZATIONS = [
  'General Practice',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Neurology',
  'Psychiatry',
  'Gynecology',
  'Ophthalmology',
  'ENT (Otolaryngology)',
  'Dentistry',
  'Radiology',
]

export const DOCTOR_DAYS = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
]

export const DOCTOR_INITIAL = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  specialization: '',
  qualification: '',
  license_number: '',
  experience_years: '',
  department: '',
  time_slots: '09:00-17:00',
  address: '',
  bio: '',
  photo_url: '',
  available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  is_active: true,
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?1?\d{9,15}$/

function normalizePhone(phone) {
  const raw = String(phone || '').trim()
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  if (raw.startsWith('+')) return `+${digits}`
  return digits
}

export function toggleDoctorDay(days, day) {
  const set = new Set(days || [])
  if (set.has(day)) set.delete(day)
  else set.add(day)
  return [...set]
}

export function doctorToForm(doctor) {
  if (!doctor) return { ...DOCTOR_INITIAL }
  return {
    first_name: doctor.first_name || '',
    last_name: doctor.last_name || '',
    email: doctor.email || '',
    phone: doctor.phone || '',
    specialization: doctor.specialization || '',
    qualification: doctor.qualification || '',
    license_number: doctor.license_number || '',
    experience_years: doctor.experience_years ?? '',
    department: doctor.department || '',
    time_slots: doctor.time_slots || '',
    address: doctor.address || '',
    bio: doctor.bio || '',
    photo_url: doctor.photo_url || '',
    available_days: doctor.available_days || [],
    is_active: doctor.is_active !== false,
  }
}

export function validateDoctorForm(form) {
  if (!form.first_name?.trim()) return 'First name is required.'
  if (!form.last_name?.trim()) return 'Last name is required.'
  if (!form.email?.trim() || !EMAIL_PATTERN.test(form.email)) return 'A valid email is required.'
  const phone = normalizePhone(form.phone)
  if (!phone || !PHONE_PATTERN.test(phone)) return 'Enter a valid phone (9–15 digits).'
  if (!form.specialization?.trim()) return 'Specialization is required.'
  if (!form.qualification?.trim()) return 'Qualification is required.'
  if (!form.license_number?.trim()) return 'License number is required.'
  return ''
}

export function buildDoctorPayload(form) {
  const payload = {
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    email: form.email.trim(),
    phone: normalizePhone(form.phone),
    specialization: form.specialization.trim(),
    qualification: form.qualification.trim(),
    license_number: form.license_number.trim(),
    available_days: form.available_days || [],
    time_slots: form.time_slots?.trim() || '',
    is_active: form.is_active !== false,
  }
  if (form.experience_years !== '' && form.experience_years != null) {
    payload.experience_years = Number(form.experience_years)
  }
  if (form.department?.trim()) payload.department = form.department.trim()
  if (form.address?.trim()) payload.address = form.address.trim()
  if (form.bio?.trim()) payload.bio = form.bio.trim()
  if (form.photo_url?.trim()) payload.photo_url = form.photo_url.trim()
  else payload.photo_url = null
  return payload
}
