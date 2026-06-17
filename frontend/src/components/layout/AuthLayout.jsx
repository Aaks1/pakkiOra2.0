import { Link } from 'react-router-dom'
import BrandLogo from '../brand/BrandLogo'
import Container from '../ui/Container'

const TRUST_POINTS = [
  'Secure patient accounts',
  'Book appointments online',
  'Manage your health in one place',
]

export default function AuthLayout({ eyebrow, title, description, children, alternateLink }) {
  return (
    <div className="auth-page">
      <header className="auth-page__header">
        <Container className="auth-page__header-inner">
          <BrandLogo variant="compact" className="auth-page__logo" />
          <nav className="auth-page__nav" aria-label="Auth navigation">
            <Link to="/" className="auth-page__nav-link">Home</Link>
            {alternateLink}
          </nav>
        </Container>
      </header>

      <Container className="auth-page__body">
        <aside className="auth-page__aside">
          <p className="auth-page__eyebrow">{eyebrow}</p>
          <h1 className="auth-page__title">{title}</h1>
          <p className="auth-page__description">{description}</p>
          <ul className="auth-page__points">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="auth-page__point">{point}</li>
            ))}
          </ul>
        </aside>

        <section className="auth-page__main" aria-label="Authentication form">
          {children}
        </section>
      </Container>
    </div>
  )
}
