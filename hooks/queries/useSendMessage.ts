import { useMutation, useQueryClient } from '@tanstack/react-query'

import { MessageFormData } from '@/schemas/message-form-schema'
import { SendMessageResponse } from '@/services/messageService'

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: MessageFormData): Promise<SendMessageResponse> => {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar mensagem')
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}
