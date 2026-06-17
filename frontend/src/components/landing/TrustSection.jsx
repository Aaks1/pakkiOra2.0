import Container from '../ui/Container'
import SectionHeader from '../ui/SectionHeader'
import { TRUST_STATS } from './landingData'

export default function TrustSection() {
  return (
    <section id="about" className="lp-trust" aria-label="Trust and statistics">
      <Container>
        <SectionHeader
          eyebrow="Why patients choose us"
          title="Healthcare you can trust"
          description="Paki Ora combines clinical reliability with consumer-grade software — designed to earn confidence from the first visit."
        />
        <dl className="lp-trust__grid">
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="lp-trust__card">
              <dt className="lp-trust__value">{stat.value}</dt>
              <dd className="lp-trust__label">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  )
}
