export const DEFAULT_TIME_SLOTS = '09:00-12:00, 14:00-17:00'

export function validateSlotConfigForm(form) {
  if (!form.available_days?.length) return 'Select at least one available day.'
  if (!form.time_slots?.trim()) return 'Time slots are required.'
  return ''
}

export function buildSlotConfigPayload(form) {
  const payload = {
    available_days: form.available_days || [],
    time_slots: form.time_slots.trim(),
  }
  if (form.override_date) {
    payload.override = {
      date: form.override_date,
      is_available: form.override_is_available !== false,
      notes: form.override_notes?.trim() || '',
    }
  }
  return payload
}
