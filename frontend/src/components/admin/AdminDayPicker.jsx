import { useMemo } from 'react'
import { DOCTOR_DAYS } from '../../utils/doctorForm'

export default function AdminDayPicker({ value, onChange }) {
  const selected = useMemo(() => new Set(value || []), [value])

  const toggle = (day) => {
    const next = new Set(selected)
    if (next.has(day)) next.delete(day)
    else next.add(day)
    onChange([...next])
  }

  return (
    <div className="flex flex-wrap gap-2">
      {DOCTOR_DAYS.map(({ value: day, label }) => {
        const active = selected.has(day)
        return (
          <button
            key={day}
            type="button"
            onClick={() => toggle(day)}
            className={active ? 'admin-day-pill admin-day-pill--active' : 'admin-day-pill'}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
