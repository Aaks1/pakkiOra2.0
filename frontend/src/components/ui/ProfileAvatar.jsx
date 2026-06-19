const SIZES = {
  sm: 'h-9 w-9 text-xs',
  md: 'h-10 w-10 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-16 w-16 text-base',
  '2xl': 'h-20 w-20 text-lg',
}

export default function ProfileAvatar({ initials, size = 'md', className = '' }) {
  const sizeClass = SIZES[size] || SIZES.md

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-slate-100 font-medium text-slate-600 ${sizeClass} ${className}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}
