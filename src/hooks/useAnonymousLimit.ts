import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'

export function useAnonymousLimit() {
  return useQuery({
    queryKey: ['anonymous-limit'],
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/admin/plan-configs')
      if (error || !data) throw new Error('Could not fetch plan configs')

      // Live API may return camelCase (planName, dailyLimit) or
      // snake_case (plan_name, daily_limit) — handle both
      const rows = data as Array<Record<string, unknown>>
      const anon = rows.find(p =>
        p['plan_name'] === 'anonymous' || p['planName'] === 'anonymous'
      )
      if (!anon) throw new Error('Anonymous plan not found')

      const limit = (anon['daily_limit'] ?? anon['dailyLimit']) as number | null | undefined
      if (limit == null || !Number.isFinite(limit)) {
        throw new Error('Limit is unlimited or not set')
      }
      return limit as number
    },
    // Refresh every 5 minutes so it picks up live DB changes without a redeploy
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}
