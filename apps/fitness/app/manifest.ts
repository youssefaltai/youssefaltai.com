import { createManifest } from '@repo/utils'

export default function manifest() {
  return createManifest({
    name: 'Fitness App',
    shortName: 'Fitness',
    description: 'Personal fitness tracking application',
    themeColor: '#34C759',
  })
}

