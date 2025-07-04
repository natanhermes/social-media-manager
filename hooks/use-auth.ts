import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

/**
 * Hook para verificar autenticação no lado do cliente
 * @param redirectTo - Rota para redirecionar se não estiver autenticado
 * @returns Dados da sessão e funções utilitárias
 */
export function useAuth(redirectTo?: string) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'
  const isUnauthenticated = status === 'unauthenticated'

  useEffect(() => {
    if (isUnauthenticated && redirectTo) {
      router.push(redirectTo)
    }
  }, [isUnauthenticated, redirectTo, router])

  return {
    session,
    isLoading,
    isAuthenticated,
    isUnauthenticated,
    user: session?.user,
  }
}

/**
 * Hook que força autenticação - redireciona para login se não autenticado
 * @returns Dados da sessão
 */
export function useRequireAuth() {
  return useAuth('/')
}

/**
 * Hook que redireciona usuário logado para dashboard
 * @returns Dados da sessão
 */
export function useRedirectIfAuthenticated() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard')
    }
  }, [status, session, router])

  return { session, status }
}
