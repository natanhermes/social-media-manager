import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/auth'
import { jobQueueService } from '@/services/jobQueueService'

export async function POST(_request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Usuário não autenticado',
        },
        { status: 401 },
      )
    }

    // Processar retry de deliveries com falha
    await jobQueueService.retryFailedDeliveries()

    return NextResponse.json({
      success: true,
      message: 'Processamento de mensagens agendadas iniciado',
    })
  } catch (error) {
    console.error('Erro ao processar mensagens agendadas:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 },
    )
  }
}
