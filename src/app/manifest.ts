import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ViMore',
    short_name: 'ViMore',
    description: 'Connect, share, and enhance your voice with ViMore.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F2ECF7',
    theme_color: '#9940E5',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
