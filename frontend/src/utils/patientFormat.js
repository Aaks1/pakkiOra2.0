export function formatTime(time) {
  if (!time) return '—'
  return String(time).slice(0, 5)
}

export function doctorName(doctor) {
  if (!doctor) return '—'
  if (doctor.full_name) return doctor.full_name
  return `Dr. ${doctor.first_name || ''} ${doctor.last_name || ''}`.trim() || '—'
}

export function doctorInitials(doctor) {
  const name = doctorName(doctor).replace(/^Dr\.\s*/i, '')
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

export function dateLabel(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(`${dateStr}T12:00:00`)
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(`${dateStr}T12:00:00`)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export function formatDateLong(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(`${dateStr}T12:00:00`)
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function isTomorrow(dateStr) {
  if (!dateStr) return false
  const date = new Date(`${dateStr}T12:00:00`)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return date.toDateString() === tomorrow.toDateString()
}

export function greeting(name) {
  const hour = new Date().getHours()
  const salutation = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return name ? `${salutation}, ${name}` : salutation
}

export function groupSlotsByPeriod(slots = []) {
  const groups = { morning: [], afternoon: [], evening: [] }
  slots.forEach((slot) => {
    const hour = Number(String(slot.start_time || slot.start_display || '00').slice(0, 2))
    if (hour < 12) groups.morning.push(slot)
    else if (hour < 17) groups.afternoon.push(slot)
    else groups.evening.push(slot)
  })
  return groups
}

const DAY_LABELS = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
}

export function formatDoctorSchedule(doctor) {
  const days = Array.isArray(doctor?.available_days)
    ? doctor.available_days.map((d) => DAY_LABELS[d] || d).join(', ')
    : ''
  const hours = doctor?.time_slots?.trim() || ''
  return {
    days: days || 'Schedule not published',
    hours: hours ? `Hours: ${hours}` : '',
  }
}
