import { IntegrationPlatformType } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

import { getAuthUser } from '@/lib/auth'
import { TelegramBotService } from '@/services/integrations/telegramService'
import { EvolutionWhatsAppService } from '@/services/integrations/whatsappService'
import {
  createIntegration,
  getUserIntegrations,
} from '@/services/integrationService'

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 },
      )
    }

    const integrations = await getUserIntegrations(user.user.id)

    return NextResponse.json({
      success: true,
      data: integrations,
    })
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch integrations',
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 },
      )
    }

    const body = await request.json()

    const { config, testConnection } = body

    if (!config) {
      return NextResponse.json(
        {
          success: false,
          error: 'Platform and config are required',
        },
        { status: 400 },
      )
    }

    // Detectar plataforma baseado na configuração
    let result
    let platformType: IntegrationPlatformType

    if (config.botToken) {
      // Telegram Bot
      const telegramService = new TelegramBotService(config.botToken)
      result = await telegramService.connectTelegram({
        config,
        testConnection,
      })
      platformType = IntegrationPlatformType.TELEGRAM
    } else if (config.instanceName) {
      // WhatsApp Evolution
      const evolutionService = new EvolutionWhatsAppService(
        process.env.EVOLUTION_API_URL!,
        process.env.EVOLUTION_API_KEY!,
      )
      result = await evolutionService.connectEvolution({
        config,
        testConnection,
      })
      platformType = IntegrationPlatformType.EVOLUTION
    } else {
      return NextResponse.json(
        {
          success: false,
          error:
            'Configuração inválida. Forneça instanceName para WhatsApp ou botToken para Telegram.',
        },
        { status: 400 },
      )
    }

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 },
      )
    }

    if (testConnection) {
      return NextResponse.json({
        success: true,
        message: 'Connection test successful',
        setupInstructions: result.setupInstructions,
        qrCode: result.qrCode,
      })
    }

    const integration = await createIntegration(
      user.user.id,
      platformType,
      result.integration!.name,
      result.integration!.config,
      result.integration!.metadata,
    )

    return NextResponse.json({
      success: true,
      data: integration,
      setupInstructions: result.setupInstructions,
    })
  } catch (error) {
    console.error('Error creating integration:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create integration',
      },
      { status: 500 },
    )
  }
}
