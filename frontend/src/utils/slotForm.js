import { DOCTOR_DAYS } from './doctorForm'

export const DEFAULT_TIME_SLOTS = '09:00-17:00'

export function buildSlotConfigPayload(form) {
  const payload = {
    available_days: form.available_days,
    time_slots: form.time_slots.trim(),
  }

  if (form.override_date) {
    payload.override_date = form.override_date
    payload.override_is_available = form.override_is_available
    payload.override_notes = form.override_notes?.trim() || ''
  }

  return payload
}

export function validateSlotConfigForm(form) {
  if (!form.available_days?.length) {
    return 'Select at least one available day.'
  }
  if (!form.time_slots?.trim()) {
    return 'Time slots are required.'
  }
  return ''
}

export { DOCTOR_DAYS }
