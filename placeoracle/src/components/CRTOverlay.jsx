import React from 'react';

export function CRTOverlay() {
  return (
    <>
      {/* CRT Scanline and vignette layer */}
      <div 
        className="fixed inset-0 pointer-events-none z-50 crt-overlay opacity-30 select-none"
        aria-hidden="true" 
      />
      {/* Subtle screen flicker / ambient noise */}
      <div 
        className="fixed inset-0 pointer-events-none z-40 bg-radial-vignette opacity-70 select-none"
        aria-hidden="true"
      />
    </>
  );
}
