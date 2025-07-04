import { Platform } from '@prisma/client'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'

export function usePlataforms(): UseQueryResult<
  Pick<Platform, 'id' | 'name' | 'connected'>[],
  Error
> {
  return useQuery({
    queryKey: ['plataforms'],
    queryFn: async () => {
      const response = await fetch(`/api/plataforms`)
      const result = await response.json()
      return result.data
    },
  })
}
