export const DOCTOR_DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
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
  address: '',
  bio: '',
  time_slots: '09:00-17:00',
  available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  is_active: true,
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?1?\d{9,15}$/

/** Payload for POST /api/v1/doctors/ (DoctorWriteSerializer) */
export function buildDoctorPayload(form) {
  const payload = {
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    specialization: form.specialization.trim(),
    qualification: form.qualification.trim(),
    license_number: form.license_number.trim(),
    is_active: form.is_active !== false,
  }

  if (form.address?.trim()) payload.address = form.address.trim()
  if (form.department?.trim()) payload.department = form.department.trim()
  if (form.bio?.trim()) payload.bio = form.bio.trim()
  if (form.time_slots?.trim()) payload.time_slots = form.time_slots.trim()
  if (form.available_days?.length) payload.available_days = form.available_days

  const years = form.experience_years
  if (years !== '' && years != null) {
    payload.experience_years = Number(years)
  }

  return payload
}

export function validateDoctorForm(form) {
  if (!form.first_name.trim()) return 'First name is required.'
  if (!form.last_name.trim()) return 'Last name is required.'
  if (!form.email.trim()) return 'Email is required.'
  if (!EMAIL_PATTERN.test(form.email.trim())) return 'Enter a valid email address.'
  if (!form.phone.trim()) return 'Phone is required.'
  if (!PHONE_PATTERN.test(form.phone.trim())) return 'Enter a valid phone number (9–15 digits).'
  if (!form.specialization.trim()) return 'Specialization is required.'
  if (!form.qualification.trim()) return 'Qualification is required.'
  if (!form.license_number.trim()) return 'License number is required.'
  if (form.experience_years !== '' && Number(form.experience_years) < 0) {
    return 'Experience years cannot be negative.'
  }
  return ''
}

export function toggleDoctorDay(days, day) {
  return days.includes(day) ? days.filter((d) => d !== day) : [...days, day]
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
    address: doctor.address || '',
    bio: doctor.bio || '',
    time_slots: doctor.time_slots || '09:00-17:00',
    available_days: doctor.available_days?.length
      ? doctor.available_days
      : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    is_active: doctor.is_active !== false,
  }
}
