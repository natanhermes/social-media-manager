import { Message } from '@prisma/client'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'

export type SimpleMessage = Pick<
  Message,
  'id' | 'content' | 'createdAt' | 'userId'
>

export function useMessages(
  page: number,
): UseQueryResult<SimpleMessage[], Error> {
  return useQuery({
    queryKey: ['messages', page],
    queryFn: async () => {
      const response = await fetch(`/api/messages?page=${page}`)
      const result = await response.json()
      return result.data
    },
  })
}
