'use client'

import { Integration, IntegrationStatus } from '@prisma/client'
import { AlertCircle, MessageCircle, Settings, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  useDeleteIntegration,
  useIntegrations,
} from '@/hooks/queries/useIntegrations'

import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Skeleton } from './ui/skeleton'
import { WhatsAppConnectionModal } from './whatsapp-connection-modal'

interface IntegrationsListProps {
  onSelectIntegration?: (integration: Integration) => void
}

const getStatusColor = (status: IntegrationStatus) => {
  switch (status) {
    case 'CONNECTED':
      return 'bg-green-500'
    case 'CONNECTING':
      return 'bg-yellow-500'
    case 'ERROR':
      return 'bg-red-500'
    case 'EXPIRED':
      return 'bg-orange-500'
    default:
      return 'bg-gray-500'
  }
}

const getStatusText = (status: IntegrationStatus) => {
  switch (status) {
    case 'CONNECTED':
      return 'Conectado'
    case 'CONNECTING':
      return 'Conectando'
    case 'ERROR':
      return 'Erro'
    case 'EXPIRED':
      return 'Expirado'
    case 'DISCONNECTED':
      return 'Desconectado'
    default:
      return 'Desconhecido'
  }
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'WHATSAPP':
      return <MessageCircle className="h-4 w-4 text-green-600" />
    default:
      return <MessageCircle className="h-4 w-4" />
  }
}

export function IntegrationsList({
  onSelectIntegration,
}: IntegrationsListProps) {
  const { data: integrationsData, isLoading, error } = useIntegrations()
  const deleteIntegration = useDeleteIntegration()

  const integrations = integrationsData?.data || []

  const handleDeleteIntegration = async (integrationId: string) => {
    try {
      await deleteIntegration.mutateAsync(integrationId)
      toast.success('Integração removida com sucesso')
    } catch (error) {
      toast.error('Erro ao remover integração')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Integrações</h3>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Integrações</h3>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Erro ao carregar integrações
            </CardTitle>
            <CardDescription>
              Não foi possível carregar suas integrações. Tente novamente.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <WhatsAppConnectionModal
          trigger={
            <Button>
              <MessageCircle className="mr-2 h-4 w-4" />
              Conectar WhatsApp
            </Button>
          }
          onSuccess={() => {}}
        />
      </div>

      {integrations.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhuma integração encontrada</CardTitle>
            <CardDescription>
              Conecte suas contas de redes sociais para começar a gerenciar suas
              mensagens.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {integrations.map((integration) => (
            <Card
              key={integration.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectIntegration?.(integration)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getPlatformIcon(integration.platform)}
                    </div>
                    <div>
                      <h4 className="font-medium">{integration.name}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(integration.status)} text-white`}
                    >
                      {getStatusText(integration.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Criada em{' '}
                    {new Date(integration.createdAt).toLocaleDateString(
                      'pt-BR',
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: Implementar configurações
                        toast.info('Funcionalidade em desenvolvimento')
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (
                          confirm(
                            'Tem certeza que deseja remover esta integração?',
                          )
                        ) {
                          handleDeleteIntegration(integration.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
