import { groupSlotsByPeriod } from '../../utils/patientFormat'

const PERIOD_LABELS = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
}

export default function SlotPicker({ slots, selected, onSelect, bookedTimes = [] }) {
  const groups = groupSlotsByPeriod(slots)
  const bookedSet = new Set(bookedTimes.map((t) => String(t).slice(0, 5)))

  if (!slots.length) {
    return <p className="text-sm text-slate-500">No slots available for this date.</p>
  }

  return (
    <div className="space-y-5">
      {Object.entries(groups).map(([period, periodSlots]) => {
        if (!periodSlots.length) return null
        return (
          <div key={period}>
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              {PERIOD_LABELS[period] || period}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {periodSlots.map((slot) => {
                const time = slot.start_time
                const isBooked = bookedSet.has(time)
                const isSelected = selected?.start_time === time
                const label = slot.start_display || time

                if (isBooked) {
                  return (
                    <div
                      key={time}
                      className="rounded-md border border-slate-100 py-2 text-center text-sm text-slate-300 line-through"
                    >
                      {label}
                    </div>
                  )
                }

                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => onSelect(slot)}
                    className={`rounded-md border py-2 text-center text-sm transition-colors ${
                      isSelected
                        ? 'border-slate-800 bg-slate-800 text-white'
                        : 'border-slate-200 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
