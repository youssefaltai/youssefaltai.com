import { useQuery } from '@tanstack/react-query'

interface UserSettings {
  baseCurrency: string
}

async function fetchUserSettings(): Promise<UserSettings> {
  const response = await fetch('/api/settings')
  if (!response.ok) {
    throw new Error('Failed to fetch user settings')
  }
  return response.json()
}

export function useUserSettings() {
  return useQuery({
    queryKey: ['userSettings'],
    queryFn: fetchUserSettings,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

