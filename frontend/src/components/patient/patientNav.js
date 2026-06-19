export const PATIENT_NAV = [
  { to: '/patient/dashboard', label: 'Dashboard', icon: 'stethoscope' },
  { to: '/patient/doctors', label: 'Find Doctors', icon: 'users' },
  { to: '/patient/book', label: 'Book Appointment', icon: 'calendar' },
  { to: '/patient/appointments', label: 'My Appointments', icon: 'calendar' },
  { to: '/patient/notifications', label: 'Notifications', icon: 'bell' },
  { to: '/patient/profile', label: 'Profile', icon: 'user' },
]

export function patientInitials(user) {
  const first = user?.first_name?.[0] || ''
  const last = user?.last_name?.[0] || ''
  if (first || last) return `${first}${last}`.toUpperCase()
  return (user?.username?.[0] || 'P').toUpperCase()
}

export function patientDisplayName(user) {
  if (user?.first_name) {
    return `${user.first_name} ${user.last_name || ''}`.trim()
  }
  return user?.username || 'Patient'
}
