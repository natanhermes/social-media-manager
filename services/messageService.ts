import db from '@/lib/db'

import { jobQueueService } from './jobQueueService'

interface SelectedConversationData {
  id: string
  externalId: string
  name: string
  type: string
  active: boolean
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
    deliveryCount?: number
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
      scheduledFor: true,
      isScheduled: true,
      sentAt: true,
      userId: true,
      messageDeliveries: {
        select: {
          id: true,
          status: true,
          sentAt: true,
          errorMessage: true,
          selectedConversation: {
            select: {
              name: true,
              externalId: true,
              type: true,
            },
          },
          integration: {
            select: {
              name: true,
              platform: true,
            },
          },
        },
      },
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
          'Nenhuma integração conectada encontrada. Conecte uma integração primeiro.',
      }
    }

    // Buscar integrações conectadas que tenham grupos selecionados e ativos
    const integrations = await db.integration.findMany({
      where: {
        userId,
        status: 'CONNECTED',
        selectedConversations: {
          some: {
            active: true,
          },
        },
      },
      include: {
        selectedConversations: {
          where: {
            active: true,
          },
        },
      },
    })

    if (integrations.length === 0) {
      return {
        success: false,
        message:
          'Você possui integrações conectadas, mas nenhum grupo ativo foi selecionado para envio. Selecione pelo menos um grupo nas suas integrações.',
      }
    }

    // Processar agendamento se necessário
    let scheduledFor: Date | undefined
    if (payload.scheduled && payload.scheduledDate && payload.scheduledTime) {
      const [hours, minutes] = payload.scheduledTime.split(':').map(Number)
      // Adicionar T00:00:00 para evitar problemas de timezone
      scheduledFor = new Date(payload.scheduledDate + 'T00:00:00')
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
        scheduledFor,
        isScheduled: !!scheduledFor,
      },
    })

    // Criar MessageDelivery para cada conversa selecionada
    const deliveries = []

    for (const integration of integrations) {
      for (const conversation of integration.selectedConversations) {
        const delivery = await db.messageDelivery.create({
          data: {
            messageId: message.id,
            integrationId: integration.id,
            selectedConversationId: conversation.id,
            status: scheduledFor ? 'SCHEDULED' : 'PENDING',
          },
        })

        deliveries.push(delivery)

        // Se for agendada, adicionar à fila
        if (scheduledFor) {
          await jobQueueService.scheduleMessage(
            message.id,
            delivery.id,
            scheduledFor,
          )
        }
      }
    }

    // Se não for agendada, enviar imediatamente
    if (!scheduledFor) {
      try {
        await sendToConnectedIntegrations(
          integrations as IntegrationWithConversations[],
          payload.message,
          message.id,
        )
      } catch (sendError) {
        console.error('Erro durante envio para integrações:', sendError)
        // Não interromper o fluxo, pois a mensagem já foi criada
      }
    }

    return {
      success: true,
      message: scheduledFor
        ? `Mensagem agendada para ${scheduledFor.toLocaleString('pt-BR')}`
        : 'Mensagem enviada com sucesso',
      data: {
        messageId: message.id,
        scheduledFor,
        deliveryCount: deliveries.length,
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
  messageId: string,
): Promise<void> {
  const sendPromises = integrations.map(async (integration) => {
    try {
      const config = integration.config as Record<string, unknown>

      // Detectar o tipo de integração baseado na configuração
      if (config?.instanceName) {
        // WhatsApp Evolution
        if (!process.env.EVOLUTION_API_URL || !process.env.EVOLUTION_API_KEY) {
          console.error(
            'Variáveis de ambiente EVOLUTION_API_URL ou EVOLUTION_API_KEY não estão definidas para WhatsApp',
          )
          return
        }

        const { EvolutionWhatsAppService } = await import(
          './integrations/whatsappService'
        )
        const whatsappService = new EvolutionWhatsAppService(
          process.env.EVOLUTION_API_URL,
          process.env.EVOLUTION_API_KEY,
        )

        const instanceName = config.instanceName as string

        // Enviar mensagem para cada grupo selecionado
        const groupSendPromises = integration.selectedConversations.map(
          async (conversation: SelectedConversationData) => {
            try {
              // Buscar delivery correspondente
              const delivery = await db.messageDelivery.findFirst({
                where: {
                  messageId,
                  integrationId: integration.id,
                  selectedConversationId: conversation.id,
                },
              })

              if (!delivery) {
                console.error(
                  `Delivery não encontrado para conversa ${conversation.id}`,
                )
                return
              }

              // Atualizar status para PROCESSING
              await db.messageDelivery.update({
                where: { id: delivery.id },
                data: { status: 'PROCESSING' },
              })

              const sendResult = await whatsappService.sendMessage(
                instanceName,
                {
                  conversationId: conversation.externalId,
                  content: messageContent,
                },
              )

              // Atualizar delivery com resultado
              await db.messageDelivery.update({
                where: { id: delivery.id },
                data: {
                  status: sendResult.success ? 'SENT' : 'FAILED',
                  sentAt: sendResult.success ? new Date() : null,
                  externalId: sendResult.messageId || null,
                  errorMessage: sendResult.error || null,
                },
              })

              if (sendResult.success) {
                console.log(
                  `WhatsApp: Mensagem enviada para grupo ${conversation.name} (${conversation.externalId})`,
                )
              } else {
                console.error(
                  `WhatsApp: Erro ao enviar para grupo ${conversation.name}:`,
                  sendResult.error,
                )
              }
            } catch (error) {
              console.error(
                `WhatsApp: Erro ao enviar mensagem para grupo ${conversation.name}:`,
                error,
              )

              // Buscar delivery e marcar como failed
              const delivery = await db.messageDelivery.findFirst({
                where: {
                  messageId,
                  integrationId: integration.id,
                  selectedConversationId: conversation.id,
                },
              })

              if (delivery) {
                await db.messageDelivery.update({
                  where: { id: delivery.id },
                  data: {
                    status: 'FAILED',
                    errorMessage:
                      error instanceof Error ? error.message : 'Unknown error',
                    retryCount: { increment: 1 },
                  },
                })
              }
            }
          },
        )

        await Promise.allSettled(groupSendPromises)
      } else if (config?.botToken) {
        // Telegram Bot
        const { TelegramBotService } = await import(
          './integrations/telegramService'
        )
        const telegramService = new TelegramBotService(
          config.botToken as string,
        )

        // Enviar mensagem para cada grupo selecionado
        const groupSendPromises = integration.selectedConversations.map(
          async (conversation: SelectedConversationData) => {
            try {
              // Buscar delivery correspondente
              const delivery = await db.messageDelivery.findFirst({
                where: {
                  messageId,
                  integrationId: integration.id,
                  selectedConversationId: conversation.id,
                },
              })

              if (!delivery) {
                console.error(
                  `Delivery não encontrado para conversa ${conversation.id}`,
                )
                return
              }

              // Atualizar status para PROCESSING
              await db.messageDelivery.update({
                where: { id: delivery.id },
                data: { status: 'PROCESSING' },
              })

              const sendResult = await telegramService.sendMessage({
                conversationId: conversation.externalId,
                content: messageContent,
              })

              // Atualizar delivery com resultado
              await db.messageDelivery.update({
                where: { id: delivery.id },
                data: {
                  status: sendResult.success ? 'SENT' : 'FAILED',
                  sentAt: sendResult.success ? new Date() : null,
                  externalId: sendResult.messageId || null,
                  errorMessage: sendResult.error || null,
                },
              })

              if (sendResult.success) {
                console.log(
                  `Telegram: Mensagem enviada para grupo ${conversation.name} (${conversation.externalId})`,
                )
              } else {
                console.error(
                  `Telegram: Erro ao enviar para grupo ${conversation.name}:`,
                  sendResult.error,
                )
              }
            } catch (error) {
              console.error(
                `Telegram: Erro ao enviar mensagem para grupo ${conversation.name}:`,
                error,
              )

              // Buscar delivery e marcar como failed
              const delivery = await db.messageDelivery.findFirst({
                where: {
                  messageId,
                  integrationId: integration.id,
                  selectedConversationId: conversation.id,
                },
              })

              if (delivery) {
                await db.messageDelivery.update({
                  where: { id: delivery.id },
                  data: {
                    status: 'FAILED',
                    errorMessage:
                      error instanceof Error ? error.message : 'Unknown error',
                    retryCount: { increment: 1 },
                  },
                })
              }
            }
          },
        )

        await Promise.allSettled(groupSendPromises)
      } else {
        console.error(
          'Configuração inválida para integração:',
          integration.id,
          'Necessário instanceName (WhatsApp) ou botToken (Telegram)',
        )
      }
    } catch (integrationError) {
      console.error(
        `Erro geral na integração ${integration.id}:`,
        integrationError,
      )
    }
  })

  await Promise.allSettled(sendPromises)

  // Atualizar timestamp da mensagem após processamento
  const hasSuccessfulDelivery = await db.messageDelivery.findFirst({
    where: {
      messageId,
      status: 'SENT',
    },
  })

  if (hasSuccessfulDelivery) {
    await db.message.update({
      where: { id: messageId },
      data: { sentAt: new Date() },
    })
  }
}
