import React from 'react';

/**
 * Diseño y Desarrollo por Krezco.Digital
 * https://krezco.digital
 *
 * Overlay sutil como marca de agua, no bloquea interacción.
 */
export default function WatermarkOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 select-none"
    >
      <div
        className="absolute bottom-6 right-6 rotate-[-12deg] opacity-[0.06] text-[28px] sm:text-[36px] font-semibold tracking-wide"
        style={{
          color: '#115466',
          textShadow:
            '0 0 1px rgba(17,84,102,0.06), 0 1px 2px rgba(0,0,0,0.04)'
        }}
      >
        Diseño y Desarrollo por Krezco.Digital
      </div>
    </div>
  );
}