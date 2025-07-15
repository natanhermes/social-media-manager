import { NextRequest, NextResponse } from 'next/server'

import { getAuthUser } from '@/lib/auth'
import { EvolutionWhatsAppService } from '@/services/integrations/whatsappService'

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

    const evolutionService = new EvolutionWhatsAppService(
      process.env.EVOLUTION_API_URL!,
      process.env.EVOLUTION_API_KEY!,
    )

    const statusResult = await evolutionService.getConnectionStatus(id)

    if (!statusResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: statusResult.error,
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      status: statusResult.status,
      connected: statusResult.status === 'open',
    })
  } catch (error) {
    console.error('Error checking connection status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check connection status',
      },
      { status: 500 },
    )
  }
}
