import {
  Integration,
  IntegrationPlatformType,
  IntegrationStatus,
  Prisma,
} from '@prisma/client'

import db from '@/lib/db'
import { TelegramBotService } from '@/services/integrations/telegramService'
import { EvolutionWhatsAppService } from '@/services/integrations/whatsappService'

export async function getUserIntegrations(
  userId: string,
): Promise<Integration[]> {
  const integrations = await db.integration.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return integrations
}

export async function getIntegrationById(
  id: string,
  userId: string,
): Promise<Integration | null> {
  const integration = await db.integration.findFirst({
    where: {
      id,
      userId,
    },
  })

  return integration
}

export async function createIntegration(
  userId: string,
  platform: IntegrationPlatformType,
  name: string,
  config: Record<string, unknown>,
  metadata: Record<string, unknown>,
): Promise<Integration> {
  const integration = await db.integration.create({
    data: {
      userId,
      platform,
      name,
      status: IntegrationStatus.CONNECTED,
      config: config as Prisma.InputJsonValue,
      metadata: metadata as Prisma.InputJsonValue,
    },
  })

  return integration
}

export async function updateIntegrationStatus(
  id: string,
  userId: string,
  status: IntegrationStatus,
  _errorMessage?: string,
): Promise<Integration> {
  const integration = await db.integration.update({
    where: {
      id,
      userId,
    },
    data: {
      status,
      updatedAt: new Date(),
    },
  })

  return integration
}

export async function deleteIntegration(
  id: string,
  userId: string,
): Promise<boolean> {
  try {
    await db.integration.delete({
      where: {
        id,
        userId,
      },
    })
    return true
  } catch (error) {
    console.error('Error deleting integration:', error)
    return false
  }
}

export async function deleteIntegrationWithCleanup(
  id: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const integration = await getIntegrationById(id, userId)

    if (!integration) {
      return {
        success: false,
        error: 'Integration not found',
      }
    }

    // Se for integração do WhatsApp (Evolution), deletar instância da API
    if (integration.platform === 'EVOLUTION') {
      const config = integration.config as { instanceName?: string }
      const instanceName = config?.instanceName

      if (!instanceName) {
        return {
          success: false,
          error: 'Instance Name not found for WhatsApp integration',
        }
      }

      const whatsappService = new EvolutionWhatsAppService(
        process.env.EVOLUTION_API_URL!,
        process.env.EVOLUTION_API_KEY!,
      )

      const evolutionDeleted =
        await whatsappService.deleteInstance(instanceName)

      if (!evolutionDeleted) {
        return {
          success: false,
          error: 'Failed to delete WhatsApp instance from Evolution API',
        }
      }
    }

    // Se for integração do Telegram, executar limpeza específica
    if (integration.platform === 'TELEGRAM') {
      const config = integration.config as { botToken?: string }
      const botToken = config?.botToken

      if (botToken) {
        const telegramService = new TelegramBotService(botToken)
        const telegramDisconnected = await telegramService.disconnectTelegram()

        if (!telegramDisconnected.success) {
          console.warn(
            'Warning: Failed to properly disconnect Telegram bot:',
            telegramDisconnected.error,
          )
          // Não retornamos erro aqui, pois a desconexão do Telegram não é crítica
          // O importante é remover do banco de dados
        }
      }
    }

    // Deletar integração do banco de dados
    const deleted = await deleteIntegration(id, userId)

    if (!deleted) {
      return {
        success: false,
        error: 'Failed to delete integration from database',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error deleting integration with cleanup:', error)
    return {
      success: false,
      error: 'Internal server error',
    }
  }
}
