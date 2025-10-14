import { createManifest } from '@repo/utils'

export default function manifest() {
  return createManifest({
    name: 'Finance App',
    shortName: 'Finance',
    description: 'Personal finance management application',
    themeColor: '#007AFF',
    backgroundColor: '#F2F2F7',
  })
}

