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

      // Verificar status HTTP primeiro
      if (!response.ok) {
        throw new Error(
          result.error || result.message || 'Erro ao enviar mensagem',
        )
      }

      // Verificar se o resultado indica falha mesmo com status 200
      if (result.success === false) {
        throw new Error(
          result.message || result.error || 'Falha no envio da mensagem',
        )
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}
