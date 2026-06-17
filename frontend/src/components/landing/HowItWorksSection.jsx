import Container from '../ui/Container'
import SectionHeader from '../ui/SectionHeader'
import { HOW_IT_WORKS } from './landingData'

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="lp-section lp-section--muted" aria-labelledby="how-heading">
      <Container>
        <SectionHeader
          eyebrow="Simple process"
          title="How it works"
          description="Three clear steps from search to care — designed to reduce friction and decision fatigue."
        />
        <ol className="lp-steps">
          {HOW_IT_WORKS.map((item) => (
            <li key={item.step} className="lp-steps__card">
              <span className="lp-steps__number" aria-hidden="true">{item.step}</span>
              <h3 className="lp-steps__title">{item.title}</h3>
              <p className="lp-steps__text">{item.description}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
