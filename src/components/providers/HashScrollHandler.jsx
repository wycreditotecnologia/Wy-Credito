import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function HashScrollHandler() {
  const location = useLocation();

  useEffect(() => {
    const { hash } = location;
    if (!hash) return;

    const id = hash.replace('#', '');

    let attempts = 0;
    const maxAttempts = 20; // ~1s total con intervalos de 50ms
    const intervalMs = 50;

    const timer = setInterval(() => {
      attempts += 1;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        clearInterval(timer);
      } else if (attempts >= maxAttempts) {
        clearInterval(timer);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [location.hash, location.pathname]);

  return null;
}