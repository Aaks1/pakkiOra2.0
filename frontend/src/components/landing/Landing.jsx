import PublicLayout from './PublicLayout'
import BenefitsSection from './BenefitsSection'
import CtaSection from './CtaSection'
import FeaturesSection from './FeaturesSection'
import HeroSection from './HeroSection'
import HowItWorksSection from './HowItWorksSection'
import TrustSection from './TrustSection'
import '../styles/landing.css'

export default function Landing() {  return (
    <PublicLayout>
      <HeroSection />
      <TrustSection />
      <HowItWorksSection />
      <FeaturesSection />
      <BenefitsSection />
      <CtaSection />
    </PublicLayout>
  )
}
