import type {
  Integration,
  Message,
  MessageDelivery,
  SelectedConversation,
} from '@prisma/client'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

type MessageWithDeliveries = Message & {
  messageDeliveries: (MessageDelivery & {
    integration: Pick<Integration, 'name' | 'platform'>
    selectedConversation: Pick<
      SelectedConversation,
      'name' | 'externalId' | 'type'
    >
  })[]
}

interface MessagesResponse {
  success: boolean
  data: MessageWithDeliveries[]
}

export function useMessages(
  page: number = 0,
): UseQueryResult<MessagesResponse, Error> {
  return useQuery({
    queryKey: ['messages', page],
    queryFn: async (): Promise<MessagesResponse> => {
      const response = await fetch(`/api/messages?page=${page}`)

      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }

      return response.json()
    },
  })
}

export type { MessageWithDeliveries }
