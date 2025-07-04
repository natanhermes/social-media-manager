# 👤 Exibindo Dados do Usuário - Social Media Dashboard

Esta documentação explica como exibir e usar dados do usuário logado em sua aplicação.

## 🏗️ Estrutura Implementada

### 1. **Modelo de Dados (Prisma)**
```typescript
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  username  String   @unique
  password  String
  company   String?
  bio       String?
  // ... outros campos
}
```

### 2. **Serviços (services/userService.ts)**
```typescript
// Tipo público do usuário (sem password)
export type PublicUser = Omit<User, 'password'>

// Buscar usuário por ID
export async function findUserById(id: string): Promise<PublicUser | null>

// Atualizar dados do usuário
export async function updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User>
```

### 3. **API Route (app/api/user/profile/route.ts)**
```typescript
// GET /api/user/profile
// Retorna dados do usuário logado
```

### 4. **Hook React Query (hooks/queries/useUserProfile.ts)**
```typescript
export function useUserProfile() {
  // Hook para carregar dados do usuário com cache
}
```

## 📋 Como Usar

### 1. **Hook useUserProfile**
```typescript
'use client'

import { useUserProfile } from '@/hooks/queries/useUserProfile'

export function MeuComponente() {
  const { data, isLoading, error } = useUserProfile()
  
  if (isLoading) return <div>Carregando...</div>
  if (error) return <div>Erro ao carregar dados</div>
  
  const user = data?.data
  
  return (
    <div>
      <h1>Bem-vindo, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
      <p>Empresa: {user?.company || 'Não informado'}</p>
    </div>
  )
}
```

### 2. **Componente UserHeader**
```typescript
import { UserHeader } from '@/components/user-header'

// Uso básico
<UserHeader />

// Com opções
<UserHeader 
  showEmail={true}
  showUsername={true}
  showCompany={true}
  className="p-4"
/>
```

### 3. **Componente ProfileSettings**
```typescript
import { ProfileSettings } from '@/components/profile-settings'

// Exibe formulário com dados do usuário
<ProfileSettings />
```

## 🎨 Exemplos de Uso

### **Dashboard Principal**
```typescript
export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Gerencie suas mensagens</p>
        </div>
        <UserHeader showEmail showCompany />
      </div>
      
      {/* Resto do conteúdo */}
    </div>
  )
}
```

### **Perfil do Usuário**
```typescript
'use client'

import { useUserProfile } from '@/hooks/queries/useUserProfile'

export function UserProfilePage() {
  const { data, isLoading } = useUserProfile()
  const user = data?.data

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl">
              {user?.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <p className="text-gray-600">@{user?.username}</p>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Informações Pessoais</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Nome:</span> {user?.name}</p>
              <p><span className="font-medium">Email:</span> {user?.email}</p>
              <p><span className="font-medium">Empresa:</span> {user?.company || 'Não informado'}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Sobre</h3>
            <p className="text-gray-700">
              {user?.bio || 'Nenhuma biografia fornecida.'}
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <div className="flex gap-6 text-sm text-gray-500">
            <span>Membro desde: {new Date(user?.createdAt).toLocaleDateString('pt-BR')}</span>
            <span>Última atualização: {new Date(user?.updatedAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### **Mensagem de Boas-vindas Personalizada**
```typescript
'use client'

import { useUserProfile } from '@/hooks/queries/useUserProfile'

export function WelcomeMessage() {
  const { data } = useUserProfile()
  const user = data?.data

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-2">
        {getGreeting()}, {user?.name?.split(' ')[0] || 'Usuário'}! 👋
      </h2>
      <p className="text-blue-100">
        {user?.company ? `Bem-vindo de volta à ${user.company}` : 'Bem-vindo de volta'}
      </p>
      <p className="text-sm text-blue-200 mt-2">
        Último acesso: {new Date(user?.updatedAt).toLocaleString('pt-BR')}
      </p>
    </div>
  )
}
```

### **Sidebar com Informações do Usuário**
```typescript
'use client'

import { useUserProfile } from '@/hooks/queries/useUserProfile'

export function UserSidebar() {
  const { data, isLoading } = useUserProfile()
  const user = data?.data

  if (isLoading) {
    return (
      <div className="p-4 border-b">
        <Skeleton className="h-12 w-12 rounded-full mb-3" />
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
    )
  }

  return (
    <div className="p-4 border-b bg-gray-50">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-blue-600 text-white">
            {user?.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{user?.name}</p>
          <p className="text-sm text-gray-600 truncate">{user?.email}</p>
          {user?.company && (
            <p className="text-xs text-gray-500 truncate">{user.company}</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

## 🔄 Estados de Loading e Erro

### **Loading States**
```typescript
export function ComponenteComLoading() {
  const { data, isLoading, error } = useUserProfile()

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded">
        <p>Erro ao carregar dados do usuário</p>
        <button onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
      </div>
    )
  }

  // Renderizar com dados
  return <div>{/* Conteúdo */}</div>
}
```

## 🚀 Benefícios

- ✅ **Cache automático** - React Query gerencia o cache
- ✅ **Reatividade** - Dados atualizados em tempo real
- ✅ **Loading states** - UX melhor com estados de carregamento
- ✅ **Error handling** - Tratamento de erros consistente
- ✅ **Reutilização** - Componentes reutilizáveis
- ✅ **Tipagem forte** - TypeScript completo

## 📚 Dicas

1. **Use o hook `useUserProfile`** para carregar dados do usuário
2. **Implemente loading states** para melhor UX
3. **Trate erros graciosamente** com fallbacks apropriados
4. **Reutilize componentes** como `UserHeader` em diferentes páginas
5. **Personalize a experiência** com dados do usuário
6. **Considere cache** - os dados ficam em cache por 5 minutos

## 🔧 Configuração Adicional

Para usar os dados do usuário, certifique-se de que:

1. O usuário está autenticado (use os utilitários de auth)
2. O `SessionProvider` está configurado corretamente
3. A API route `/api/user/profile` está acessível
4. O banco de dados está configurado corretamente

## 🎯 Próximos Passos

- Implementar edição de perfil
- Adicionar upload de foto de perfil
- Criar notificações personalizadas
- Implementar preferências do usuário 