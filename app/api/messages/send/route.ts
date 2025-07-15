import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/auth'
import { messageFormSchema } from '@/schemas/message-form-schema'
import { sendMessage } from '@/services/messageService'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const validatedData = messageFormSchema.parse(body)

    const result = await sendMessage(session.user.id, {
      message: validatedData.message,
      platforms: validatedData.platforms,
      scheduled: validatedData.scheduled,
      scheduledDate: validatedData.scheduledDate,
      scheduledTime: validatedData.scheduledTime,
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: error.message,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 },
    )
  }
}
