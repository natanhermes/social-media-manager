import { NextRequest, NextResponse } from 'next/server'

import { getAuthUser } from '@/lib/auth'
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
      const evolutionServiceInstance = new EvolutionWhatsAppService(
        process.env.EVOLUTION_API_URL!,
        process.env.EVOLUTION_API_KEY!,
      )
      conversations = await evolutionServiceInstance.getConversations(
        config.instanceName,
      )
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
