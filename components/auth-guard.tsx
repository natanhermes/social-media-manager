'use client'

import { useAuth } from '@/hooks/use-auth'

import { Loading } from './loading'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
}

/**
 * Componente para proteger rotas no lado do cliente
 * @param children - Componentes filhos a serem renderizados se autenticado
 * @param redirectTo - Rota para redirecionar se não autenticado (padrão: '/')
 * @param fallback - Componente a ser renderizado enquanto carrega
 * @returns Componente protegido
 */
export function AuthGuard({
  children,
  redirectTo = '/',
  fallback = <Loading />,
}: AuthGuardProps) {
  const { isLoading, isAuthenticated } = useAuth(redirectTo)

  if (isLoading) {
    return <>{fallback}</>
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

/**
 * Componente para proteger rotas que requerem autenticação
 * @param children - Componentes filhos
 * @returns Componente protegido
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  return <AuthGuard redirectTo="/">{children}</AuthGuard>
}

/**
 * Componente para páginas que só devem ser acessadas por usuários não autenticados
 * @param children - Componentes filhos
 * @returns Componente protegido
 */
export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return <Loading />
  }

  if (isAuthenticated) {
    return null
  }

  return <>{children}</>
}
