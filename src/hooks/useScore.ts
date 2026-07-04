import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { toApiError } from '@/lib/apiError'
import type { components } from '@/api/schema.gen'
import type { ScoreMetadata } from '@/lib/types'

type ScoreResponseWithMetadata = components['schemas']['ScoreResponse'] & {
  metadata?: ScoreMetadata
}

type ScoreQueryResult =
  | ScoreResponseWithMetadata
  | components['schemas']['CompromisedScoreResponse']

export function useScore(address: string, chain: string) {
  return useQuery({
    queryKey: ['score', chain, address],
    queryFn: async () => {
      const { data, error, response } = await apiClient.GET('/score/{address}', {
        params: {
          path: { address },
          query: { chain: chain as never },
        },
      })

      if (error) {
        throw toApiError(response.status, error)
      }

      return data as ScoreQueryResult
    },
    enabled: Boolean(address && chain),
    retry: false,
  })
}
