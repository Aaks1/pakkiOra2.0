import { QueryClient } from '@tanstack/react-query'

// Shared cache for doctors, history, and booking — reduces repeat API calls in the patient portal.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
