/* eslint-disable no-console */
// Ligero util de logging para evitar warnings de ESLint por uso de console
// Usa console solo en desarrollo o si VITE_ENABLE_DEBUG_LOGS === 'true'

const shouldLog = () => {
  try {
    return import.meta.env?.DEV || import.meta.env?.VITE_ENABLE_DEBUG_LOGS === 'true';
  } catch (_) {
    return true; // fallback seguro
  }
};

export const logger = {
  log: (...args) => { if (shouldLog()) { console.log(...args); } },
  warn: (...args) => { if (shouldLog()) { console.warn(...args); } },
  error: (...args) => { if (shouldLog()) { console.error(...args); } },
};

export default logger;