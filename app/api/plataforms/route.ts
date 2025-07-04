import { NextResponse } from 'next/server'

import { auth } from '@/auth'
import { listPlataforms } from '@/services/plataformService'

export async function GET() {
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

    const plataforms = await listPlataforms(session.user.id)

    return NextResponse.json(
      {
        success: true,
        message: 'Plataformas listadas com sucesso',
        data: plataforms,
        count: plataforms.length,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('[GET /api/plataforms] Erro ao listar plataformas:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: 'Não foi possível listar as plataformas',
      },
      { status: 500 },
    )
  }
}
