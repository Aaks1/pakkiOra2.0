import Container from '../ui/Container'
import SectionHeader from '../ui/SectionHeader'
import { BENEFITS } from './landingData'

export default function BenefitsSection() {
  return (
    <section id="services" className="lp-section lp-section--muted" aria-labelledby="benefits-heading">
      <Container>
        <SectionHeader
          eyebrow="Patient outcomes"
          title="Care that works for your life"
          description="We focus on real-world results — less friction, faster access, and a calmer healthcare experience."
        />
        <div className="lp-benefits">
          {BENEFITS.map((benefit) => (
            <article key={benefit.title} className="lp-benefits__card">
              <h3 className="lp-benefits__title">{benefit.title}</h3>
              <p className="lp-benefits__text">{benefit.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
