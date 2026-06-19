import Button from '../ui/Button'
import Container from '../ui/Container'
import HeroCarousel from './HeroCarousel'
import { HERO_SLIDES, TRUST_BADGES } from './landingData'

export default function HeroSection() {
  return (
    <section className="lp-hero" aria-labelledby="hero-heading">
      <Container className="lp-hero__inner">
        <div className="lp-hero__grid">
          <div className="lp-hero__content">
            <p className="lp-hero__eyebrow">Modern healthcare platform</p>
            <h1 id="hero-heading" className="lp-hero__title">
              Healthcare Appointments Made Effortless
            </h1>
            <p className="lp-hero__lead">
              Book appointments, manage health records, connect with providers, and take control
              of your healthcare experience from a single platform.
            </p>

            <div className="lp-hero__actions">
              <Button to="/register" variant="primary" className="btn--lg">
                Book Appointment
              </Button>
              <Button href="#how-it-works" variant="secondary" className="btn--lg">
                Learn More
              </Button>
            </div>

            <div className="lp-hero__trust" aria-label="Trust indicators">
              <ul className="lp-hero__badges">
                {TRUST_BADGES.map((badge) => (
                  <li key={badge} className="lp-hero__badge">{badge}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lp-hero__visual">
            <HeroCarousel slides={HERO_SLIDES} />
          </div>
        </div>
      </Container>
    </section>
  )
}
