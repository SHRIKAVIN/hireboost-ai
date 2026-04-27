import { CtaSection } from '../components/cta-section';
import { FeatureGrid } from '../components/feature-grid';
import { Hero } from '../components/hero';
import { HowItWorks } from '../components/how-it-works';

export function LandingPage() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <HowItWorks />
      <CtaSection />
    </>
  );
}

export default LandingPage;
