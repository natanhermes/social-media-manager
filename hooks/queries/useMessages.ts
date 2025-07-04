import { Message, MessagePlatform, Platform } from '@prisma/client'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'

type PlatformData = Pick<Platform, 'id' | 'name' | 'connected'>

type MessagePlatformWithData = Pick<
  MessagePlatform,
  | 'id'
  | 'status'
  | 'sentAt'
  | 'externalId'
  | 'errorMsg'
  | 'retryCount'
  | 'createdAt'
> & {
  platform: PlatformData
}

export type MessageWithPlatforms = Message & {
  platforms: MessagePlatformWithData[]
}

export function useMessages(
  page: number,
): UseQueryResult<MessageWithPlatforms[], Error> {
  return useQuery({
    queryKey: ['messages', page],
    queryFn: async () => {
      const response = await fetch(`/api/messages?page=${page}`)
      const result = await response.json()
      return result.data
    },
  })
}
