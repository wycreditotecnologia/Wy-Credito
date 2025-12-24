
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { CreditSimulator } from "@/components/landing/CreditSimulator";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CallToActionSection } from "@/components/landing/CallToActionSection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <Header />
      <main>
        <HeroSection />
        <CreditSimulator />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CallToActionSection />
      </main>
      <Footer />
    </div>
  );
}
