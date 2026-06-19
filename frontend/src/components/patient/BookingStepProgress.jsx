const STEPS = ['Doctor', 'Date', 'Time', 'Confirm']

export default function BookingStepProgress({ step }) {
  return (
    <div className="mb-8">
      <div className="flex gap-1">
        {STEPS.map((label, i) => {
          const num = i + 1
          const done = step > num
          const active = step === num
          let barClass = 'bg-slate-200'
          if (done) barClass = 'bg-slate-400'
          else if (active) barClass = 'bg-slate-600'

          return (
            <div key={label} className="flex-1">
              <div className={`h-1 rounded-full ${barClass}`} />
              <p
                className={`mt-2 text-center text-xs ${
                  active ? 'font-medium text-slate-800' : 'text-slate-400'
                }`}
              >
                {label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
