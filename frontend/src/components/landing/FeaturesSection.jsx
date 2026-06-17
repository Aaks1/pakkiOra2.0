import Container from '../ui/Container'
import SectionHeader from '../ui/SectionHeader'
import { FEATURES } from './landingData'

export default function FeaturesSection() {
  return (
    <section id="features" className="lp-section" aria-labelledby="features-heading">
      <Container>
        <SectionHeader
          eyebrow="Platform capabilities"
          title="Everything you need for modern care"
          description="Purpose-built tools that help patients stay informed, connected, and in control of their health journey."
        />
        <div className="lp-features">
          {FEATURES.map((feature, index) => (
            <article key={feature.title} className="lp-features__card">
              <span className="lp-features__index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="lp-features__title">{feature.title}</h3>
              <p className="lp-features__text">{feature.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
