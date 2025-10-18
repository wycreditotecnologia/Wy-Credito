/*
  Diseño y Desarrollo por Krezco.Digital — https://krezco.digital
  Atribución: footer visible, watermark sutil, metadatos y X-Powered-By.
*/
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage'; // Lo crearemos en el siguiente prompt
import CookiePolicyPage from './pages/legal/CookiePolicyPage';
import TermsAndConditionsPage from './pages/legal/TermsAndConditionsPage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import UiShowcase from './views/UiShowcase.jsx';
import Seguimiento from './pages/Seguimiento.jsx';
import HashScrollHandler from './components/providers/HashScrollHandler.jsx';

function App() {
  return (
    <>
      <HashScrollHandler />
      <Routes>
      {/* Ruta Raíz para la futura Landing Page */}
      <Route path="/" element={<LandingPage />} />
      {/* Página legal: Política de Cookies */}
      <Route path="/politica-de-cookies" element={<CookiePolicyPage />} />
      {/* Página legal: Política de Privacidad */}
      <Route path="/politica-de-privacidad" element={<PrivacyPolicyPage />} />
      {/* Página legal: Términos y Condiciones */}
      <Route path="/terminos-y-condiciones" element={<TermsAndConditionsPage />} />
      
      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Ruta Dedicada y Aislada para nuestra aplicación de formulario protegida */}
      <Route
        path="/solicitud"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/solicitud/:sessionId"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      />
      {/* Ruta de seguimiento de solicitud */}
      <Route path="/seguimiento" element={<Seguimiento />} />
      {/* Ruta de Showcase de UI para guiar patrones visuales */}
      <Route path="/ui/kit" element={<UiShowcase />} />
      </Routes>
    </>
  );
}

export default App;