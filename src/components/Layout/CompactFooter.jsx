import React from 'react';

export default function CompactFooter() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-transparent">
      <div className="container mx-auto px-4 py-4 text-center text-xs text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} Wy Crédito. Diseño y Desarrollo por{' '}
        <a
          href="https://krezco.digital"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline-offset-2 hover:underline text-gray-700 dark:text-gray-300"
        >
          Krezco.Digital
        </a>
      </div>
    </footer>
  );
}