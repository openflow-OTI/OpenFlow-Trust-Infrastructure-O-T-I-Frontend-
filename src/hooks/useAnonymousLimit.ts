import { useQuery } from '@tanstack/react-query'

const baseUrl = import.meta.env.VITE_API_BASE_URL as string

export function useAnonymousLimit() {
  return useQuery({
    queryKey: ['anonymous-limit'],
    queryFn: async () => {
      // Use the public endpoint — not the admin one (which requires x-admin-secret).
      // cache: 'no-store' ensures the browser never serves a stale response from
      // its HTTP cache after an admin change.
      const res = await fetch(`${baseUrl}/api/config/anonymous-limit`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Could not fetch anonymous limit')
      const data = await res.json() as { daily_limit: number | null }
      const limit = data.daily_limit
      // null means the DB hasn't been explicitly set yet — fall back to the
      // architectural default of 3 (anonymous plan always rate-limits to 3/day)
      if (limit == null || !Number.isFinite(limit)) return 3
      return limit as number
    },
    // refetchOnMount: 'always' — unconditionally refetch every time the home
    // page mounts, so an admin limit change is reflected on the very next visit
    // regardless of cache state. staleTime: 0 keeps the in-memory value from
    // being served as "fresh" between mounts.
    staleTime: 0,
    refetchOnMount: 'always',
    retry: false,
  })
}
