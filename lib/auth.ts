import { redirect } from 'next/navigation'
import { Session } from 'next-auth'

import { auth } from '@/auth'

/**
 * Verifica se o usuário está autenticado, se não estiver, redireciona para login
 * @returns Session do usuário autenticado
 */
export async function requireAuth(): Promise<Session> {
  const session = await auth()

  if (!session) {
    redirect('/')
  }

  return session
}

/**
 * Verifica se o usuário está autenticado sem redirecionar
 * @returns Session do usuário se autenticado, null caso contrário
 */
export async function getAuthUser(): Promise<Session | null> {
  const session = await auth()
  return session
}

/**
 * Verifica se o usuário tem permissão para acessar um recurso
 * @param session - Sessão do usuário
 * @param userId - ID do usuário dono do recurso
 * @returns boolean indicando se tem permissão
 */
export function hasPermission(
  session: Session | null,
  userId: string,
): boolean {
  if (!session?.user?.id) return false
  return session.user.id === userId
}

/**
 * Valida se uma sessão é válida
 * @param session - Sessão a ser validada
 * @returns boolean indicando se a sessão é válida
 */
export function isValidSession(session: Session | null): boolean {
  return !!(session?.user?.id && session?.user?.email)
}
