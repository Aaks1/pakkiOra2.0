import PublicLayout from '../components/layout/PublicLayout'
import BenefitsSection from '../components/landing/BenefitsSection'
import CtaSection from '../components/landing/CtaSection'
import FeaturesSection from '../components/landing/FeaturesSection'
import HeroSection from '../components/landing/HeroSection'
import HowItWorksSection from '../components/landing/HowItWorksSection'
import TrustSection from '../components/landing/TrustSection'

export default function Landing() {
  return (
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
