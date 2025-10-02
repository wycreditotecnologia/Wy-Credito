import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage'; // Lo crearemos en el siguiente prompt
import CookiePolicyPage from './pages/legal/CookiePolicyPage';
import TermsAndConditionsPage from './pages/legal/TermsAndConditionsPage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';

function App() {
  return (
    <Routes>
      {/* Ruta Raíz para la futura Landing Page */}
      <Route path="/" element={<LandingPage />} />
      {/* Página legal: Política de Cookies */}
      <Route path="/politica-de-cookies" element={<CookiePolicyPage />} />
      {/* Página legal: Política de Privacidad */}
      <Route path="/politica-de-privacidad" element={<PrivacyPolicyPage />} />
      {/* Página legal: Términos y Condiciones */}
      <Route path="/terminos-y-condiciones" element={<TermsAndConditionsPage />} />
      
      {/* Ruta Dedicada y Aislada para nuestra aplicación de formulario */}
      <Route path="/solicitud" element={<MainLayout />} />
      <Route path="/solicitud/:sessionId" element={<MainLayout />} />
    </Routes>
  );
}

export default App;