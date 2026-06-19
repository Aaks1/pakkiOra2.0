export function StarRating({ value, max = 5 }) {
  const rating = Math.min(max, Math.max(0, Number(value) || 0))
  const stars = []

  for (let i = 1; i <= max; i += 1) {
    const filled = rating >= i
    const half = !filled && rating >= i - 0.5
    stars.push(
      <span key={i} className="inline-block h-3.5 w-3.5" aria-hidden="true">
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5">
          <defs>
            {half && (
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#e2e8f0" />
              </linearGradient>
            )}
          </defs>
          <path
            fill={filled ? '#fbbf24' : half ? `url(#half-${i})` : '#e2e8f0'}
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      </span>,
    )
  }

  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${rating} out of ${max}`}>
      {stars}
    </div>
  )
}
