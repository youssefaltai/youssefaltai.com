/**
 * Configuration for PWA manifest
 */
export interface PWAManifestConfig {
  name: string
  shortName: string
  description: string
  themeColor: string
  backgroundColor: string
}

/**
 * PWA Manifest structure
 * Compatible with Next.js MetadataRoute.Manifest
 */
export interface PWAManifest {
  name: string
  short_name: string
  description: string
  start_url: string
  display: string
  background_color: string
  theme_color: string
  icons: Array<{
    src: string
    sizes: string
    type: string
    purpose: string
  }>
}

/**
 * PWA Viewport structure
 * Compatible with Next.js Viewport
 */
export interface PWAViewport {
  viewportFit: "cover" | "contain" | "auto" | undefined;
  width: string
  initialScale: number
  maximumScale: number
  themeColor: string
}

/**
 * Create a PWA manifest with consistent defaults
 * Follows Apple HIG and PWA best practices
 * 
 * @param config - App-specific configuration
 * @returns PWA Manifest object for Next.js
 */
export function createManifest(config: PWAManifestConfig): PWAManifest {
  return {
    name: config.name,
    short_name: config.shortName,
    description: config.description,
    start_url: '/',
    display: 'standalone',
    background_color: config.backgroundColor,
    theme_color: config.themeColor,
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

export function createViewport(): PWAViewport {
  return {
    viewportFit: "cover",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#F2F2F7",
  }
}