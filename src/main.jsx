/*
  Diseño y Desarrollo por Krezco.Digital — https://krezco.digital
  Atribución: footer visible, watermark sutil, metadatos y X-Powered-By.
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from './components/providers/ThemeProvider.jsx';
import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
        <Toaster richColors position="top-center" />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);