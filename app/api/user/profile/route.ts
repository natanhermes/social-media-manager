import { NextResponse } from 'next/server'

import { auth } from '@/auth'
import { findUserById } from '@/services/userService'

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

    const user = await findUserById(session.user.id)

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Usuário não encontrado',
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Dados do usuário recuperados com sucesso',
        data: user,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error(
      '[GET /api/user/profile] Erro ao buscar dados do usuário:',
      error,
    )

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: 'Não foi possível buscar os dados do usuário',
      },
      { status: 500 },
    )
  }
}
