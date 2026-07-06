import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'

export function useAnonymousLimit() {
  return useQuery({
    queryKey: ['anonymous-limit'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/admin/plan-configs')
      if (error || !data) throw new Error('Could not fetch plan configs')
      const anon = (data as Array<{ plan_name: string; daily_limit: number | null }>)
        .find(p => p.plan_name === 'anonymous')
      if (!anon || anon.daily_limit == null || !Number.isFinite(anon.daily_limit)) {
        throw new Error('Anonymous plan not found or limit is unlimited')
      }
      return anon.daily_limit
    },
    // Refresh every 5 minutes so it picks up live DB changes without a redeploy
    staleTime: 5 * 60 * 1000,
    // Never retry on failure — fall back to static text silently
    retry: false,
  })
}
