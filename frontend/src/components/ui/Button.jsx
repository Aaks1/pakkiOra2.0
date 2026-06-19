import { Link } from 'react-router-dom'

const VARIANTS = {
  primary: 'btn btn--primary',
  secondary: 'btn btn--secondary',
  ghost: 'btn btn--ghost',
  white: 'btn btn--white',
}

export default function Button({
  variant = 'primary',
  to,
  href,
  className = '',
  children,
  loading = false,
  disabled,
  type = 'button',
  ...props
}) {
  const classes = `${VARIANTS[variant] || VARIANTS.primary} ${className}`.trim()
  const content = children

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  )
}
