'use client'

import { Save, User } from 'lucide-react'

import { useUserProfile } from '@/hooks/queries/useUserProfile'

import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Skeleton } from './ui/skeleton'
import { Textarea } from './ui/textarea'

export function ProfileSettings() {
  const { data, isLoading, error } = useUserProfile()
  const user = data?.data

  if (isLoading) {
    return (
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Perfil
            </CardTitle>
            <CardDescription>
              Atualize suas informações pessoais e profissionais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Skeleton className="h-9 w-full" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
            <div>
              <Label htmlFor="company">Empresa</Label>
              <Skeleton className="h-9 w-full" />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-9 w-32" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Perfil
            </CardTitle>
            <CardDescription>
              Erro ao carregar informações do perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">
              Não foi possível carregar as informações do perfil. Contate o
              suporte.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="lg:col-span-2 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações do Perfil
          </CardTitle>
          <CardDescription>
            Atualize suas informações pessoais e profissionais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                defaultValue={user?.name || ''}
                placeholder="Digite seu nome completo"
                disabled
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email || ''}
                placeholder="Digite seu email"
                disabled
              />
            </div>
          </div>
          <div>
            <Label htmlFor="username">Nome de usuário</Label>
            <Input
              id="username"
              defaultValue={user?.username || ''}
              placeholder="Digite seu nome de usuário"
              disabled
            />
          </div>
          <div>
            <Label htmlFor="company">Empresa</Label>
            <Input
              id="company"
              defaultValue={user?.company || ''}
              placeholder="Digite o nome da empresa"
              disabled
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              defaultValue={user?.bio || ''}
              placeholder="Conte um pouco sobre você..."
              className="resize-none"
              disabled
            />
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Membro desde:{' '}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('pt-BR')
                : 'N/A'}
            </span>
            <span>
              Última atualização:{' '}
              {user?.updatedAt
                ? new Date(user.updatedAt).toLocaleDateString('pt-BR')
                : 'N/A'}
            </span>
          </div>
          <Button className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Salvar Perfil
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
