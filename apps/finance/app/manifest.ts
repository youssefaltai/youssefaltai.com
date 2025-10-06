import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Finance App',
    short_name: 'Finance',
    description: 'Personal finance management application',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0B66C2',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}

