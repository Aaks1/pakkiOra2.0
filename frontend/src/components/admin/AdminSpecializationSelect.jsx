import { useEffect, useState } from 'react'
import { inputClass } from './AdminField'
import { DOCTOR_SPECIALIZATIONS } from '../../utils/doctorForm'

export default function AdminSpecializationSelect({ value, onChange, required = true }) {
  const [otherMode, setOtherMode] = useState(
    () => Boolean(value) && !DOCTOR_SPECIALIZATIONS.includes(value),
  )

  useEffect(() => {
    if (!value) {
      setOtherMode(false)
      return
    }
    setOtherMode(!DOCTOR_SPECIALIZATIONS.includes(value))
  }, [value])

  const selectValue = otherMode ? '__other__' : (value || '')

  return (
    <div className="space-y-2">
      <select
        className={inputClass}
        value={selectValue}
        onChange={(e) => {
          const next = e.target.value
          if (next === '__other__') {
            setOtherMode(true)
            onChange('')
            return
          }
          setOtherMode(false)
          onChange(next)
        }}
        required={required && !otherMode}
      >
        <option value="" disabled>
          Select specialization
        </option>
        {DOCTOR_SPECIALIZATIONS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
        <option value="__other__">Other (specify below)</option>
      </select>

      {otherMode ? (
        <input
          className={inputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter specialization"
          required={required}
        />
      ) : null}
    </div>
  )
}
