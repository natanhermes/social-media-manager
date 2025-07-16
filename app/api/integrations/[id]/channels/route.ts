import { NextRequest, NextResponse } from 'next/server'

import { getAuthUser } from '@/lib/auth'
import { TelegramBotService } from '@/services/integrations/telegramService'
import { EvolutionWhatsAppService } from '@/services/integrations/whatsappService'
import { getIntegrationById } from '@/services/integrationService'
import { ConversationChannel } from '@/types/integrations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser()
    const { id } = await params
    if (!user?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 },
      )
    }

    const integration = await getIntegrationById(id, user.user.id)

    if (!integration) {
      return NextResponse.json(
        {
          success: false,
          error: 'Integration not found',
        },
        { status: 404 },
      )
    }

    let conversations: ConversationChannel[] = []

    try {
      const config = integration.config as Record<string, string>

      // Detectar tipo de integração baseado na configuração
      if (config.instanceName) {
        // WhatsApp Evolution
        const evolutionServiceInstance = new EvolutionWhatsAppService(
          process.env.EVOLUTION_API_URL!,
          process.env.EVOLUTION_API_KEY!,
        )
        conversations = await evolutionServiceInstance.getConversations(
          config.instanceName,
        )
      } else if (config.botToken) {
        // Telegram Bot
        const telegramService = new TelegramBotService(config.botToken)
        conversations = await telegramService.getConversations()
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Configuração de integração inválida',
          },
          { status: 400 },
        )
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch conversations',
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: conversations,
    })
  } catch (error) {
    console.error('Error fetching integration groups:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch integration groups',
      },
      { status: 500 },
    )
  }
}
