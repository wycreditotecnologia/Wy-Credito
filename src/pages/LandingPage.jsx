import React from 'react';
import Header from './landing/Header';
import HeroSection from './landing/HeroSection';
import SimulatorSection from './landing/SimulatorSection'; // Importado
import FeaturesSection from './landing/FeaturesSection';
import HowItWorksSection from './landing/HowItWorksSection';
import TestimonialsSection from './landing/TestimonialsSection';
import CTASection from './landing/CTASection';
import Footer from './landing/Footer';
import ScrollToTopButton from '@/components/ScrollToTopButton';

const LandingPage = () => {
  return (
    <div className="bg-white dark:bg-black">
      <Header />
      {/* El div espaciador ha sido eliminado */}
      <main> {/* <-- ELIMINA 'pt-32' DE AQUÍ --> */}
        <HeroSection />
        <HowItWorksSection /> {/* <-- MOVIDO A ESTA POSICIÓN */}
        <SimulatorSection />  {/* <-- AHORA EN TERCER LUGAR */}
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
        <Footer />
      </main>
      <ScrollToTopButton />
    </div>
  );
};

export default LandingPage;