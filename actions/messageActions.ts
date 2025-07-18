'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import { MessageFormData } from '@/schemas/message-form-schema'
import { sendMessage } from '@/services/messageService'

export async function sendMessageAction(data: MessageFormData) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Usuário não autenticado',
      }
    }

    const result = await sendMessage(session.user.id, data)

    // Revalidar as páginas que mostram mensagens
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/history')

    return result
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

export async function getMessagesAction(page: number = 0) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Usuário não autenticado',
        data: [],
      }
    }

    const userId = session.user.id
    const { listMessages } = await import('@/services/messageService')
    const messages = await listMessages(userId, page)

    return {
      success: true,
      data: messages,
    }
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
      data: [],
    }
  }
}
