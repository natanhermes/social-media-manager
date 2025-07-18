'use server'

import { auth } from '@/auth'
import { findUserById } from '@/services/userService'

export async function getUserProfileAction() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Usuário não autenticado',
        data: null,
      }
    }

    const user = await findUserById(session.user.id)

    if (!user) {
      return {
        success: false,
        error: 'Usuário não encontrado',
        data: null,
      }
    }

    return {
      success: true,
      message: 'Dados do usuário recuperados com sucesso',
      data: user,
    }
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error)
    return {
      success: false,
      error: 'Não foi possível buscar os dados do usuário',
      data: null,
    }
  }
}
