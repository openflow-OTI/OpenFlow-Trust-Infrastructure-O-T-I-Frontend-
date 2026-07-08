import { useQuery } from '@tanstack/react-query'

const baseUrl = import.meta.env.VITE_API_BASE_URL as string

export function useAnonymousLimit() {
  return useQuery({
    queryKey: ['anonymous-limit'],
    queryFn: async () => {
      // Public endpoint — no admin secret required.
      // Backend now sends Cache-Control: no-store on all responses, so no
      // edge/CDN caching possible. cache:'no-store' on the request side for
      // belt-and-suspenders browser cache prevention.
      const res = await fetch(`${baseUrl}/api/config/anonymous-limit`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Could not fetch anonymous limit')
      const data = await res.json() as { daily_limit: number | null; updated_at?: string }
      const limit = data.daily_limit
      // null means the DB hasn't been explicitly set yet — fall back to the
      // architectural default of 3 (anonymous plan always rate-limits to 3/day)
      if (limit == null || !Number.isFinite(limit)) return 3
      return limit as number
    },
    // staleTime: 60s — keeps setQueryData values fresh long enough that
    // navigating admin → home does not immediately overwrite them with a
    // network fetch. Regular users still get a fresh fetch on every visit
    // (cache starts empty). After 60s the data re-fetches in background.
    staleTime: 60_000,
    retry: false,
  })
}
