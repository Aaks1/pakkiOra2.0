import { formatDateShort } from '../../utils/patientFormat'

function dayNum(dateStr) {
  return new Date(`${dateStr}T12:00:00`).getDate()
}

function weekday(dateStr) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' })
}

export default function DateSlider({ dates, selected, onSelect }) {
  if (!dates.length) {
    return <p className="text-sm text-slate-500">No available dates for this doctor.</p>
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
      {dates.map((date) => {
        const active = selected === date
        return (
          <button
            key={date}
            type="button"
            onClick={() => onSelect(date)}
            className={`flex min-w-[4.5rem] flex-col items-center rounded-lg border px-4 py-3 transition-colors ${
              active
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
            }`}
          >
            <span className="text-xs font-medium opacity-80">{weekday(date)}</span>
            <span className="text-xl font-semibold">{dayNum(date)}</span>
            <span className="text-xs opacity-70">{formatDateShort(date)}</span>
          </button>
        )
      })}
    </div>
  )
}
