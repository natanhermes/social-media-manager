import { NextResponse } from 'next/server'

import { auth } from '@/auth'
import { listMessages } from '@/services/messageService'

export async function GET(request: Request) {
  try {
    const session = await auth()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')

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

    const messages = await listMessages(session.user.id, page)

    return NextResponse.json(
      {
        success: true,
        message: 'Mensagens listadas com sucesso',
        data: messages,
        count: messages.length,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('[GET /api/messages] Erro ao listar mensagens:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: 'Não foi possível listar as mensagens',
      },
      { status: 500 },
    )
  }
}
