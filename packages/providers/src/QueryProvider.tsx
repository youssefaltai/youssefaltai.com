'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

interface QueryProviderProps {
  children: React.ReactNode
}

/**
 * TanStack Query provider with optimal defaults
 * Configures caching, refetching, and retry behavior
 * 
 * @example
 * ```tsx
 * // In app/layout.tsx
 * import { QueryProvider } from '@repo/providers'
 * 
 * <QueryProvider>{children}</QueryProvider>
 * ```
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays fresh for 5 minutes before refetching
            staleTime: 1000 * 60 * 5,
            // Retry failed requests twice
            retry: 2,
            // Refetch when user returns to window
            refetchOnWindowFocus: true,
            // Don't refetch on component mount if data is fresh
            refetchOnMount: false,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

