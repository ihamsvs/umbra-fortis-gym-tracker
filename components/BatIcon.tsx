'use client';

import React from 'react';

export function BatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 1.6 L13.2 4.6 L15.3 3.2 C18.5 4.5 21 7.2 22.3 9.6 C22.8 10.6 22.5 11.4 21.8 11.4 C20.6 11.4 19.5 11 18.6 10.4 L17.2 12.2 L15.6 10.4 L14.4 12.4 L12.6 10.6 L12 14.2 L11.4 10.6 L9.6 12.4 L8.4 10.4 L6.8 12.2 L5.4 10.4 C4.5 11 3.4 11.4 2.2 11.4 C1.5 11.4 1.2 10.6 1.7 9.6 C3 7.2 5.5 4.5 8.7 3.2 L10.8 4.6 L12 1.6 Z" />
    </svg>
  );
}
