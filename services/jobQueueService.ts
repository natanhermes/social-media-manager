import Redis from 'ioredis'

import db from '@/lib/db'

import { TelegramBotService } from './integrations/telegramService'
import { EvolutionWhatsAppService } from './integrations/whatsappService'

interface JobData {
  messageId: string
  deliveryId: string
}

class JobQueueService {
  private redis: Redis | null = null
  private isProcessing = false

  constructor() {
    this.initRedis()
  }

  private initRedis() {
    try {
      this.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6380'),
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      })

      this.redis.on('error', (error: Error) => {
        console.error('Redis connection error:', error)
        this.redis = null
      })

      this.redis.on('connect', () => {
        console.log('Redis connected successfully')
        this.startProcessing()
      })
    } catch (error) {
      console.error('Failed to initialize Redis:', error)
      this.redis = null
    }
  }

  async scheduleMessage(
    messageId: string,
    deliveryId: string,
    scheduledFor: Date,
  ): Promise<void> {
    if (!this.redis) {
      console.warn('Redis not available, scheduling skipped')
      return
    }

    try {
      const jobData: JobData = { messageId, deliveryId }
      const score = scheduledFor.getTime()

      await this.redis.zadd(
        'scheduled_messages',
        score,
        JSON.stringify(jobData),
      )
      console.log(`Mensagem agendada para ${scheduledFor.toISOString()}`)
    } catch (error) {
      console.error('Error scheduling message:', error)
    }
  }

  private async startProcessing() {
    if (this.isProcessing || !this.redis) return

    this.isProcessing = true
    console.log('Iniciando processamento de mensagens agendadas...')

    // Processar a cada 30 segundos
    setInterval(async () => {
      try {
        await this.processScheduledMessages()
      } catch (error) {
        console.error('Error processing scheduled messages:', error)
      }
    }, 30000)
  }

  private async processScheduledMessages() {
    if (!this.redis) return

    try {
      const now = Date.now()

      // Usar ZPOPMIN para remoção atômica (Redis 5.0+)
      // Se não disponível, usar fallback com lock
      let jobs: string[] = []

      try {
        // Tentar usar ZPOPMIN para remoção atômica de até 10 jobs prontos
        const result = (await this.redis.eval(
          `
          local key = KEYS[1]
          local maxScore = ARGV[1]
          local count = ARGV[2]
          
          -- Buscar jobs prontos para execução
          local jobs = redis.call('ZRANGEBYSCORE', key, 0, maxScore, 'LIMIT', 0, count)
          
          -- Remover jobs encontrados atomicamente
          if #jobs > 0 then
            redis.call('ZREM', key, unpack(jobs))
          end
          
          return jobs
        `,
          1,
          'scheduled_messages',
          now.toString(),
          '10',
        )) as string[]

        jobs = result || []
      } catch (luaError) {
        console.warn(
          'ZPOPMIN not available, using fallback with locks:',
          luaError,
        )
        // Fallback para versões antigas do Redis
        jobs = await this.getJobsWithLock(now)
      }

      for (const jobStr of jobs) {
        try {
          const job: JobData = JSON.parse(jobStr)

          // Implementar lock distributivo por deliveryId
          const lockKey = `processing_lock:${job.deliveryId}`
          const lockValue = `${Date.now()}_${Math.random()}`
          const lockTTL = 300 // 5 minutos

          // Tentar adquirir lock
          const lockAcquired = await this.redis.set(
            lockKey,
            lockValue,
            'PX',
            lockTTL * 1000,
            'NX',
          )

          if (!lockAcquired) {
            console.log(
              `Job ${job.deliveryId} já está sendo processado por outra instância`,
            )
            continue
          }

          try {
            // Processar a mensagem com lock adquirido
            await this.processMessageDelivery(job.deliveryId)
            console.log(`Mensagem processada: ${job.messageId}`)
          } finally {
            // Liberar lock apenas se ainda possuímos
            const currentLock = await this.redis.get(lockKey)
            if (currentLock === lockValue) {
              await this.redis.del(lockKey)
            }
          }
        } catch (error) {
          console.error('Error processing individual job:', error)
        }
      }
    } catch (error) {
      console.error('Error fetching scheduled messages:', error)
    }
  }

  // Fallback para versões antigas do Redis sem suporte a scripts Lua avançados
  private async getJobsWithLock(maxScore: number): Promise<string[]> {
    if (!this.redis) return []

    const lockKey = 'scheduled_messages_processing'
    const lockValue = `${Date.now()}_${Math.random()}`
    const lockTTL = 30 // 30 segundos

    // Tentar adquirir lock global
    const lockAcquired = await this.redis.set(
      lockKey,
      lockValue,
      'PX',
      lockTTL * 1000,
      'NX',
    )

    if (!lockAcquired) {
      console.log('Processamento já em andamento em outra instância')
      return []
    }

    try {
      // Buscar jobs prontos
      const jobs = await this.redis.zrangebyscore(
        'scheduled_messages',
        0,
        maxScore,
        'LIMIT',
        0,
        10,
      )

      // Remover jobs encontrados
      if (jobs.length > 0) {
        await this.redis.zrem('scheduled_messages', ...jobs)
      }

      return jobs
    } finally {
      // Liberar lock global apenas se ainda possuímos
      const currentLock = await this.redis.get(lockKey)
      if (currentLock === lockValue) {
        await this.redis.del(lockKey)
      }
    }
  }

  private async processMessageDelivery(deliveryId: string) {
    try {
      // Buscar delivery com todas as informações necessárias
      const delivery = await db.messageDelivery.findUnique({
        where: { id: deliveryId },
        include: {
          message: true,
          integration: {
            include: {
              selectedConversations: true,
            },
          },
          selectedConversation: true,
        },
      })

      if (!delivery) {
        console.error(`Delivery não encontrado: ${deliveryId}`)
        return
      }

      if (delivery.status !== 'SCHEDULED') {
        console.log(`Delivery ${deliveryId} já processado: ${delivery.status}`)
        return
      }

      // Atualizar status para PROCESSING com verificação atômica
      const updateResult = await db.messageDelivery.updateMany({
        where: {
          id: deliveryId,
          status: 'SCHEDULED', // Só atualiza se ainda estiver SCHEDULED
        },
        data: { status: 'PROCESSING' },
      })

      // Se não atualizou nenhum registro, significa que já foi processado
      if (updateResult.count === 0) {
        console.log(
          `Delivery ${deliveryId} já foi processado por outra instância`,
        )
        return
      }

      // Enviar mensagem
      const success = await this.sendMessageToIntegration(
        { config: delivery.integration.config as Record<string, unknown> },
        delivery.selectedConversation,
        delivery.message.content,
      )

      // Atualizar status final
      await db.messageDelivery.update({
        where: { id: deliveryId },
        data: {
          status: success.success ? 'SENT' : 'FAILED',
          sentAt: success.success ? new Date() : null,
          externalId: success.externalId || null,
          errorMessage: success.error || null,
          retryCount: success.success ? 0 : delivery.retryCount + 1,
        },
      })

      // Atualizar timestamp da mensagem se for o primeiro envio bem-sucedido
      if (success.success && !delivery.message.sentAt) {
        await db.message.update({
          where: { id: delivery.message.id },
          data: { sentAt: new Date() },
        })
      }
    } catch (error) {
      console.error(`Error processing delivery ${deliveryId}:`, error)

      // Marcar como failed em caso de erro
      await db.messageDelivery
        .update({
          where: { id: deliveryId },
          data: {
            status: 'FAILED',
            errorMessage: `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            retryCount: { increment: 1 },
          },
        })
        .catch(() => {}) // Ignorar erro de update se delivery não existir
    }
  }

  private async sendMessageToIntegration(
    integration: { config: Record<string, unknown> },
    conversation: { externalId: string },
    messageContent: string,
  ): Promise<{ success: boolean; externalId?: string; error?: string }> {
    try {
      const config = integration.config as Record<string, unknown>

      if (config?.instanceName) {
        // WhatsApp Evolution
        if (!process.env.EVOLUTION_API_URL || !process.env.EVOLUTION_API_KEY) {
          return {
            success: false,
            error:
              'Variáveis de ambiente EVOLUTION_API_URL ou EVOLUTION_API_KEY não configuradas',
          }
        }

        const whatsappService = new EvolutionWhatsAppService(
          process.env.EVOLUTION_API_URL,
          process.env.EVOLUTION_API_KEY,
        )

        const result = await whatsappService.sendMessage(
          config.instanceName as string,
          {
            conversationId: conversation.externalId,
            content: messageContent,
          },
        )

        return {
          success: result.success,
          externalId: result.messageId,
          error: result.error,
        }
      } else if (config?.botToken) {
        // Telegram Bot
        const telegramService = new TelegramBotService(
          config.botToken as string,
        )

        const result = await telegramService.sendMessage({
          conversationId: conversation.externalId,
          content: messageContent,
        })

        return {
          success: result.success,
          externalId: result.messageId,
          error: result.error,
        }
      } else {
        return {
          success: false,
          error: 'Configuração de integração inválida',
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Send error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  async retryFailedDeliveries(): Promise<void> {
    try {
      // Buscar deliveries que falharam e têm retry count < 3
      const failedDeliveries = await db.messageDelivery.findMany({
        where: {
          status: 'FAILED',
          retryCount: { lt: 3 },
          lastRetryAt: {
            lt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
          },
        },
        include: {
          message: true,
          integration: true,
          selectedConversation: true,
        },
        take: 10,
      })

      for (const delivery of failedDeliveries) {
        // Marcar último retry
        await db.messageDelivery.update({
          where: { id: delivery.id },
          data: {
            lastRetryAt: new Date(),
            status: 'PROCESSING',
          },
        })

        // Processar novamente
        await this.processMessageDelivery(delivery.id)
      }
    } catch (error) {
      console.error('Error retrying failed deliveries:', error)
    }
  }
}

// Singleton instance
export const jobQueueService = new JobQueueService()
