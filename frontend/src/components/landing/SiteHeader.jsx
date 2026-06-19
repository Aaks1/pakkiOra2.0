import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../brand/BrandLogo'
import Button from '../ui/Button'
import Container from '../ui/Container'
import { NAV_LINKS } from './landingData'
import { useScrollSpy, useScrolled } from '../../hooks/useScrollSpy'

function handleNavClick(event, href, onClose) {
  if (!href.startsWith('#')) return
  event.preventDefault()
  const target = document.querySelector(href)
  if (target) {
    const header = document.querySelector('.site-header')
    const offset = (header?.offsetHeight ?? 68) + 12
    const top = target.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
  onClose?.()
}

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const scrolled = useScrolled()
  const activeId = useScrollSpy(NAV_LINKS.map((link) => link.id))

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  return (
    <header className={`site-header${scrolled ? ' site-header--scrolled' : ''}`}>
      <Container className="site-header__inner">
        <BrandLogo variant="overhang" className="site-header__logo" />

        <nav className="site-header__nav" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={`site-header__nav-link${activeId === link.id ? ' site-header__nav-link--active' : ''}`}
              onClick={(e) => handleNavClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="site-header__actions">
          <Link to="/login" className="site-header__sign-in">
            Sign In
          </Link>
          <Button to="/register" variant="primary" className="site-header__cta-desktop">
            Get Started
          </Button>
          <button
            type="button"
            className="site-header__menu-btn"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="site-header__menu-icon" aria-hidden="true" />
          </button>
        </div>
      </Container>

      <div
        id="mobile-nav"
        className={`site-header__drawer${menuOpen ? ' site-header__drawer--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <div
          className="site-header__backdrop"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
        <div className="site-header__drawer-panel" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <nav className="site-header__drawer-nav" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className={`site-header__drawer-link${activeId === link.id ? ' site-header__drawer-link--active' : ''}`}
                onClick={(e) => handleNavClick(e, link.href, () => setMenuOpen(false))}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="site-header__drawer-actions">
            <Link
              to="/login"
              className="site-header__drawer-link"
              onClick={() => setMenuOpen(false)}
            >
              Sign In
            </Link>
            <Button to="/register" variant="primary" className="site-header__drawer-cta" onClick={() => setMenuOpen(false)}>
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
