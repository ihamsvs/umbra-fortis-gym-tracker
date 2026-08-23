import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Umbra Fortis — Gym Tracker',
    short_name: 'Umbra Fortis',
    description: 'Registra tus entrenamientos, series, repeticiones y récords personales en equipo.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#050505',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192x192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/batman.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
