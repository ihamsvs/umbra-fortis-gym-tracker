'use client';

import React from 'react';

export function BatIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 60"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M 50,14 L 53,4 L 56,14 C 64,12 74,10 88,17 C 96,21 100,28 100,31 C 89,29 80,32 75,42 C 68,32 58,35 50,52 C 42,35 32,32 25,42 C 20,32 11,29 0,31 C 0,28 4,21 12,17 C 26,10 36,12 44,14 L 47,4 Z" />
    </svg>
  );
}
