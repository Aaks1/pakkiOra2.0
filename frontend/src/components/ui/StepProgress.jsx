import { Check } from 'lucide-react'

export default function StepProgress({ steps, currentStep }) {
  const progress = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 100

  return (
    <nav className="step-progress" aria-label="Registration progress">
      <div className="step-progress__track" aria-hidden="true">
        <div className="step-progress__fill" style={{ width: `${progress}%` }} />
      </div>
      <ol className="step-progress__list">
        {steps.map((step, index) => {
          const done = index < currentStep
          const active = index === currentStep
          return (
            <li
              key={step.id}
              className={[
                'step-progress__item',
                done && 'step-progress__item--done',
                active && 'step-progress__item--active',
              ].filter(Boolean).join(' ')}
              aria-current={active ? 'step' : undefined}
            >
              <span className="step-progress__marker" aria-hidden="true">
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : index + 1}
              </span>
              <span className="step-progress__label">{step.label}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
