import React from 'react';
import Navbar from '../components/Layout/Navbar'; // Lo crearemos a continuación
import Footer from '../components/Layout/Footer'; // Lo crearemos a continuación
import { CookieConsentBanner } from '@/components/landing/CookieConsentBanner';
import WatermarkOverlay from '@/components/Layout/WatermarkOverlay.jsx';

const LandingLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen text-white bg-gray-900 dark:bg-dark-gradient">
      <Navbar />
      <main className="flex-grow dark:glass-dark">
        {children}
      </main>
      <Footer />
      <CookieConsentBanner />
      <WatermarkOverlay />
    </div>
  );
};

export default LandingLayout;