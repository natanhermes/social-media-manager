import db from '@/lib/db'

import { EvolutionWhatsAppService } from './integrations/whatsappService'

interface SelectedConversationData {
  id: string
  externalId: string
  name: string
  type: string
}

interface IntegrationWithConversations {
  id: string
  userId: string
  config: Record<string, unknown>
  selectedConversations: SelectedConversationData[]
}

export interface CreateMessageData {
  content: string
  platforms: string[]
  sentAt?: Date
  status?: 'pending' | 'success' | 'failed'
}

export interface SendMessagePayload {
  message: string
  platforms: string[]
  scheduled?: boolean
  scheduledDate?: string
  scheduledTime?: string
}

export interface SendMessageResponse {
  success: boolean
  message: string
  data?: {
    messageId: string
    platforms?: string[]
    scheduledFor?: Date
  }
  errors?: {
    platform: string
    error: string
  }[]
}

export async function listMessages(userId: string, page: number) {
  const messages = await db.message.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      userId: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
    skip: page * 20,
  })

  return messages
}

export async function sendMessage(
  userId: string,
  payload: SendMessagePayload,
): Promise<SendMessageResponse> {
  try {
    // Primeiro verificar se existem integrações conectadas
    const connectedIntegrations = await db.integration.findMany({
      where: {
        userId,
        status: 'CONNECTED',
      },
    })

    if (connectedIntegrations.length === 0) {
      return {
        success: false,
        message:
          'Nenhuma integração do WhatsApp conectada encontrada. Conecte uma integração primeiro.',
      }
    }

    // Buscar integrações conectadas que tenham grupos selecionados
    const integrations = await db.integration.findMany({
      where: {
        userId,
        status: 'CONNECTED',
        selectedConversations: {
          some: {},
        },
      },
      include: {
        selectedConversations: true,
      },
    })

    if (integrations.length === 0) {
      return {
        success: false,
        message:
          'Você possui integrações conectadas, mas nenhum grupo foi selecionado para envio. Selecione pelo menos um grupo nas suas integrações.',
      }
    }

    // Processar agendamento se necessário
    let scheduledFor: Date | undefined
    if (payload.scheduled && payload.scheduledDate && payload.scheduledTime) {
      const [hours, minutes] = payload.scheduledTime.split(':').map(Number)
      scheduledFor = new Date(payload.scheduledDate)
      scheduledFor.setHours(hours, minutes, 0, 0)

      // Validar se a data/hora é futura
      if (scheduledFor <= new Date()) {
        return {
          success: false,
          message: 'Data e hora de agendamento devem ser futuras',
        }
      }
    }

    // Criar mensagem no banco de dados
    const message = await db.message.create({
      data: {
        content: payload.message,
        userId,
      },
    })

    // Implementar envio para as integrações conectadas
    try {
      await sendToConnectedIntegrations(
        integrations as IntegrationWithConversations[],
        payload.message,
      )
    } catch (sendError) {
      console.error('Erro durante envio para integrações:', sendError)
      // Não interromper o fluxo, pois a mensagem já foi criada
    }

    return {
      success: true,
      message: 'Mensagem enviada com sucesso',
      data: {
        messageId: message.id,
        scheduledFor,
      },
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return {
      success: false,
      message: 'Erro interno do servidor',
    }
  }
}

async function sendToConnectedIntegrations(
  integrations: IntegrationWithConversations[],
  messageContent: string,
): Promise<void> {
  // Verificar se as variáveis de ambiente estão definidas
  if (!process.env.EVOLUTION_API_URL || !process.env.EVOLUTION_API_KEY) {
    console.error(
      'Variáveis de ambiente EVOLUTION_API_URL ou EVOLUTION_API_KEY não estão definidas',
    )
    return
  }

  const whatsappService = new EvolutionWhatsAppService(
    process.env.EVOLUTION_API_URL,
    process.env.EVOLUTION_API_KEY,
  )

  const sendPromises = integrations.map(async (integration) => {
    try {
      const config = integration.config as Record<string, unknown>
      const instanceName = config?.instanceName as string

      if (!instanceName) {
        console.error(
          'Instance name não encontrado para integração:',
          integration.id,
        )
        return
      }

      // Enviar mensagem para cada grupo selecionado
      const groupSendPromises = integration.selectedConversations.map(
        async (conversation: SelectedConversationData) => {
          try {
            const sendResult = await whatsappService.sendMessage(instanceName, {
              conversationId: conversation.externalId,
              content: messageContent,
            })

            if (sendResult.success) {
              console.log(
                `Mensagem enviada para grupo ${conversation.name} (${conversation.externalId})`,
              )
            } else {
              console.error(
                `Erro ao enviar para grupo ${conversation.name}:`,
                sendResult.error,
              )
            }
          } catch (error) {
            console.error(
              `Erro ao enviar mensagem para grupo ${conversation.name}:`,
              error,
            )
          }
        },
      )

      await Promise.allSettled(groupSendPromises)
    } catch (integrationError) {
      console.error(
        `Erro geral na integração ${integration.id}:`,
        integrationError,
      )
    }
  })

  await Promise.allSettled(sendPromises)
}
