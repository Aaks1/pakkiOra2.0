import Button from '../ui/Button'
import Container from '../ui/Container'

export default function CtaSection() {
  return (
    <section className="lp-cta" aria-labelledby="cta-heading">
      <Container className="lp-cta__inner">
        <div className="lp-cta__content">
          <h2 id="cta-heading" className="lp-cta__title">
            Ready to Simplify Your Healthcare Experience?
          </h2>
          <p className="lp-cta__text">
            Join thousands of patients who book faster, stay informed, and feel more in control
            of their care.
          </p>
        </div>
        <div className="lp-cta__actions">
          <Button to="/register" variant="white" className="btn--lg">
            Book Appointment
          </Button>
          <Button to="/register" variant="secondary" className="btn--lg lp-cta__btn-outline">
            Create Account
          </Button>
        </div>
      </Container>
    </section>
  )
}
