import { Platform } from '@prisma/client'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'

export function usePlatforms(): UseQueryResult<
  Pick<Platform, 'id' | 'name' | 'connected'>[],
  Error
> {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const response = await fetch(`/api/platforms`)
      const result = await response.json()
      return result.data
    },
  })
}
