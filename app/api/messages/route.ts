import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/auth'
import { listMessages } from '@/services/messageService'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')

    const messages = await listMessages(session.user.id, page)

    return NextResponse.json({
      success: true,
      data: messages,
    })
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 },
    )
  }
}
