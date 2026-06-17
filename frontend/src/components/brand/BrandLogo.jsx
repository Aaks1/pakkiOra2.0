import { Link } from 'react-router-dom'
import logoImg from '../../assets/Paki Ora HealthTech Logo.png'

/**
 * compact — navbar / inline (icon + wordmark, tagline clipped)
 * full    — auth panels, footer, marketing blocks
 */
export default function BrandLogo({ variant = 'full', to = '/', className = '' }) {
  const img = (
    <img
      src={logoImg}
      alt="Paki Ora"
      className={variant === 'compact' ? 'brand-logo__img--compact' : 'brand-logo__img--full'}
      draggable={false}
    />
  )

  const wrapClass = [
    'brand-logo',
    variant === 'compact' ? 'brand-logo--compact' : 'brand-logo--full',
    className,
  ].join(' ')

  if (to) {
    return (
      <Link to={to} className={wrapClass} aria-label="Paki Ora home">
        {img}
      </Link>
    )
  }

  return <span className={wrapClass}>{img}</span>
}
