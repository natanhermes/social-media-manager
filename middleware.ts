import { NextResponse } from 'next/server'

import { auth } from '@/auth'

export default auth((request) => {
  const { nextUrl } = request
  const isLoggedIn = !!request.auth
  const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
  const isOnRegister = nextUrl.pathname.startsWith('/register')
  const isOnLogin = nextUrl.pathname === '/'

  // Redirecionar usuário logado da página de login/registro para dashboard
  if (isLoggedIn && (isOnLogin || isOnRegister)) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Redirecionar usuário não logado do dashboard para login
  if (!isLoggedIn && isOnDashboard) {
    return NextResponse.redirect(new URL('/', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  // Proteger todas as rotas do dashboard e da API, exceto auth
  matcher: [
    '/dashboard/:path*',
    '/api/messages/:path*',
    '/api/plataforms/:path*',
    '/',
    '/register',
  ],
}
