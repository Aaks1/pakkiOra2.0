import { Link } from 'react-router-dom'
import logoImg from '../../assets/Paki Ora HealthTech Logo.png'

/**
 * overhang — full logo badge that extends below the navbar (landing header)
 * compact  — inline logo for auth panels and sidebars
 * full     — large stacked logo for marketing blocks
 */
export default function BrandLogo({ variant = 'full', to = '/', className = '' }) {
  let content

  if (variant === 'overhang') {
    content = (
      <img
        src={logoImg}
        alt="Paki Ora"
        className="brand-logo__img--overhang"
        draggable={false}
      />
    )
  } else if (variant === 'compact') {
    content = (
      <img
        src={logoImg}
        alt="Paki Ora"
        className="brand-logo__img--compact"
        draggable={false}
      />
    )
  } else {
    content = (
      <img
        src={logoImg}
        alt="Paki Ora"
        className="brand-logo__img--full"
        draggable={false}
      />
    )
  }

  const wrapClass = [
    'brand-logo',
    `brand-logo--${variant}`,
    className,
  ].join(' ')

  if (to) {
    return (
      <Link to={to} className={wrapClass} aria-label="Paki Ora home">
        {content}
      </Link>
    )
  }

  return <span className={wrapClass}>{content}</span>
}
