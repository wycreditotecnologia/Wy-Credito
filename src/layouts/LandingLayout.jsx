import React from 'react';
import Navbar from '../components/layout/Navbar'; // Lo crearemos a continuación
import Footer from '../components/layout/Footer'; // Lo crearemos a continuación
import { CookieConsentBanner } from '@/components/landing/CookieConsentBanner';

const LandingLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen text-white bg-gray-900 dark:bg-dark-gradient">
      <Navbar />
      <main className="flex-grow dark:glass-dark">
        {children}
      </main>
      <Footer />
      <CookieConsentBanner />
    </div>
  );
};

export default LandingLayout;