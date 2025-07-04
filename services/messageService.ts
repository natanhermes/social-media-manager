import db from '@/lib/db'

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
    platforms: string[]
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
    include: {
      platforms: {
        select: {
          id: true,
          status: true,
          sentAt: true,
          externalId: true,
          errorMsg: true,
          retryCount: true,
          createdAt: true,
          platform: {
            select: {
              id: true,
              name: true,
              connected: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
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
    // Validar se as plataformas estão conectadas
    const platforms = await db.platform.findMany({
      where: {
        userId,
        id: {
          in: payload.platforms,
        },
        connected: true,
      },
      select: {
        id: true,
        name: true,
        connected: true,
      },
    })

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
        platforms: {
          create: payload.platforms.map((platformId) => ({
            platformId,
            status: payload.scheduled ? 'pending' : 'pending',
          })),
        },
      },
      include: {
        platforms: {
          include: {
            platform: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // Simular envio para cada plataforma (aqui seria a lógica real de envio)
    const sendResults = await Promise.allSettled(
      platforms.map((platform) =>
        simulatePlatformSend(platform, payload.message),
      ),
    )

    const errors: { platform: string; error: string }[] = []

    sendResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        errors.push({
          platform: platforms[index].name,
          error: result.reason || 'Erro desconhecido',
        })
      }
    })

    return {
      success: errors.length === 0,
      message:
        errors.length > 0
          ? `Mensagem enviada com alguns erros`
          : payload.scheduled
            ? 'Mensagem agendada com sucesso'
            : 'Mensagem enviada com sucesso',
      data: {
        messageId: message.id,
        platforms: message.platforms.map((mp) => mp.platform.name),
        scheduledFor,
      },
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return {
      success: false,
      message: 'Erro interno do servidor',
    }
  }
}

async function simulatePlatformSend(
  platform: { id: string; name: string; connected: boolean },
  message: string,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000))

  if (Math.random() < 0.1) {
    throw new Error(`Falha no envio para ${platform.name}`)
  }

  console.log(`Mensagem enviada para ${platform.name}: ${message}`)
}
