import { createManifest } from '@repo/utils'

export default function manifest() {
  return createManifest({
    name: 'Dashboard App',
    shortName: 'Dashboard',
    description: 'Unified dashboard for all applications',
    themeColor: '#007AFF',
  })
}

