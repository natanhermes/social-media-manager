# Guia de Autenticação - Social Media Dashboard

Este projeto implementa uma solução completa de autenticação e autorização usando **NextAuth.js** com múltiplas camadas de proteção.

## 🛡️ Camadas de Proteção

### 1. Middleware (middleware.ts)
O middleware é executado antes da renderização das páginas e protege rotas no nível do servidor.

**Funcionalidades:**
- Redireciona usuários não autenticados para `/` (login)
- Redireciona usuários autenticados da página de login para `/dashboard`
- Protege todas as rotas do dashboard e APIs sensíveis

**Rotas protegidas:**
- `/dashboard/*` - Requer autenticação
- `/api/messages/*` - Requer autenticação
- `/api/plataforms/*` - Requer autenticação
- `/` - Redireciona se já autenticado
- `/register` - Redireciona se já autenticado

### 2. Layout Protection (app/dashboard/layout.tsx)
O layout do dashboard usa a função `requireAuth()` que:
- Verifica se o usuário está autenticado
- Redireciona para login se não estiver autenticado
- Garante que apenas usuários autenticados vejam o dashboard

### 3. API Protection
Todas as APIs sensíveis verificam a sessão:
```typescript
const session = await auth()
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

## 🔧 Utilitários de Autenticação

### Server-Side (`lib/auth.ts`)

#### `requireAuth()`
Força autenticação - redireciona para login se não autenticado:
```typescript
import { requireAuth } from '@/lib/auth'

export default async function ProtectedPage() {
  const session = await requireAuth()
  
  // Só executa se o usuário estiver autenticado
  return <div>Conteúdo protegido</div>
}
```

#### `getAuthUser()`
Obtém dados do usuário sem redirecionar:
```typescript
import { getAuthUser } from '@/lib/auth'

export default async function OptionalAuthPage() {
  const session = await getAuthUser()
  
  return (
    <div>
      {session ? 'Usuário logado' : 'Usuário não logado'}
    </div>
  )
}
```

#### `hasPermission()`
Verifica se o usuário tem permissão para acessar um recurso:
```typescript
import { hasPermission } from '@/lib/auth'

if (!hasPermission(session, resourceUserId)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### Client-Side (`hooks/use-auth.ts`)

#### `useAuth()`
Hook principal para autenticação no cliente:
```typescript
import { useAuth } from '@/hooks/use-auth'

export default function ClientComponent() {
  const { session, isLoading, isAuthenticated, user } = useAuth()
  
  if (isLoading) return <div>Carregando...</div>
  if (!isAuthenticated) return <div>Não autenticado</div>
  
  return <div>Bem-vindo, {user?.name}</div>
}
```

#### `useRequireAuth()`
Hook que força autenticação:
```typescript
import { useRequireAuth } from '@/hooks/use-auth'

export default function ProtectedComponent() {
  const { session, isLoading } = useRequireAuth()
  
  if (isLoading) return <div>Carregando...</div>
  
  // Só renderiza se autenticado
  return <div>Conteúdo protegido</div>
}
```

## 🎨 Componentes de Proteção

### `<AuthGuard>`
Componente flexível para proteger conteúdo:
```typescript
import { AuthGuard } from '@/components/auth-guard'

export default function Page() {
  return (
    <AuthGuard redirectTo="/login" fallback={<div>Carregando...</div>}>
      <ProtectedContent />
    </AuthGuard>
  )
}
```

### `<RequireAuth>`
Componente que força autenticação:
```typescript
import { RequireAuth } from '@/components/auth-guard'

export default function Page() {
  return (
    <RequireAuth>
      <ProtectedContent />
    </RequireAuth>
  )
}
```

### `<GuestOnly>`
Componente para usuários não autenticados:
```typescript
import { GuestOnly } from '@/components/auth-guard'

export default function Page() {
  return (
    <GuestOnly>
      <LoginForm />
    </GuestOnly>
  )
}
```

## 📋 Exemplos Práticos

### Página Protegida (Server Component)
```typescript
// app/dashboard/profile/page.tsx
import { requireAuth } from '@/lib/auth'

export default async function ProfilePage() {
  const session = await requireAuth()
  
  return (
    <div>
      <h1>Perfil de {session.user?.name}</h1>
      <p>Email: {session.user?.email}</p>
    </div>
  )
}
```

### Componente Protegido (Client Component)
```typescript
// components/user-profile.tsx
'use client'

import { useRequireAuth } from '@/hooks/use-auth'

export function UserProfile() {
  const { session, isLoading } = useRequireAuth()
  
  if (isLoading) return <div>Carregando perfil...</div>
  
  return (
    <div>
      <h2>Bem-vindo, {session.user?.name}</h2>
      <p>Último login: {new Date().toLocaleDateString()}</p>
    </div>
  )
}
```

### API Route Protegida
```typescript
// app/api/user/profile/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Lógica da API para usuário autenticado
  return NextResponse.json({ user: session.user })
}
```

## 🔄 Fluxo de Autenticação

1. **Usuário tenta acessar `/dashboard`**
2. **Middleware verifica se está autenticado**
3. **Se não autenticado**: Redireciona para `/`
4. **Se autenticado**: Permite acesso
5. **Layout do dashboard verifica novamente** (segurança extra)
6. **Componentes podem usar hooks/guards** para proteção adicional

## 🚀 Benefícios desta Implementação

- **Múltiplas camadas de proteção**: Middleware + Layout + Components
- **Flexibilidade**: Diferentes níveis de proteção para diferentes necessidades
- **Performance**: Redirecionamento no middleware é mais rápido
- **Segurança**: Verificações tanto no servidor quanto no cliente
- **Reutilização**: Hooks e componentes podem ser reutilizados
- **Tipagem**: TypeScript completo com interfaces do NextAuth

## 📝 Configuração Necessária

Certifique-se de ter estas dependências instaladas:
```bash
npm install next-auth@beta
```

E que o `auth.ts` esteja configurado corretamente com seu provider de autenticação.

## 🐛 Troubleshooting

### Erro: "Session not found"
- Verifique se o `SessionProvider` está configurado no `app/providers.tsx`
- Confirme que o middleware está funcionando corretamente

### Redirecionamento infinito
- Verifique se as rotas no `matcher` do middleware estão corretas
- Confirme que não há conflitos entre diferentes verificações de autenticação

### Hooks não funcionam
- Certifique-se de que o componente está marcado como `'use client'`
- Verifique se está dentro do `SessionProvider` 