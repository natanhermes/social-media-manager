'use client'

import { Integration, IntegrationStatus } from '@prisma/client'
import { AlertCircle, Bot, MessageCircle, Settings, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'

import {
  deleteIntegrationAction,
  getIntegrationsAction,
} from '@/actions/integrationActions'

import { TelegramConnectionModal } from './telegram-connection-modal'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
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
    case 'DISCONNECTED':
      return 'bg-gray-500'
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
    case 'DISCONNECTED':
      return 'Desconectado'
    case 'ERROR':
      return 'Erro'
    case 'EXPIRED':
      return 'Expirado'
    default:
      return 'Desconhecido'
  }
}

const getStatusBadgeVariant = (status: IntegrationStatus) => {
  switch (status) {
    case 'CONNECTED':
      return 'default' as const
    case 'CONNECTING':
      return 'secondary' as const
    case 'DISCONNECTED':
      return 'outline' as const
    case 'ERROR':
      return 'destructive' as const
    case 'EXPIRED':
      return 'secondary' as const
    default:
      return 'outline' as const
  }
}

export function IntegrationsList({
  onSelectIntegration,
}: IntegrationsListProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const loadIntegrations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await getIntegrationsAction()
      if (result.success) {
        setIntegrations(result.data as Integration[])
      } else {
        setError(result.error || 'Erro desconhecido')
        toast.error('Erro ao carregar integrações')
      }
    } catch (error) {
      setError('Erro ao carregar integrações')
      toast.error('Erro ao carregar integrações')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadIntegrations()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta integração?')) {
      return
    }

    startTransition(async () => {
      try {
        const result = await deleteIntegrationAction(id)
        if (result.success) {
          toast.success('Integração deletada com sucesso')
          await loadIntegrations() // Recarregar lista
          router.refresh()
        } else {
          toast.error(
            'error' in result ? result.error : 'Erro ao deletar integração',
          )
        }
      } catch (error) {
        toast.error('Erro interno do servidor')
      }
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={loadIntegrations}
            >
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com botões de conexão */}
      <div className="flex flex-col sm:flex-row gap-4">
        <WhatsAppConnectionModal onSuccess={loadIntegrations} />
        <TelegramConnectionModal onSuccess={loadIntegrations} />
      </div>

      {/* Lista de integrações */}
      <div className="space-y-4">
        {integrations.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma integração configurada
                </h3>
                <p className="text-gray-600">
                  Conecte suas contas de redes sociais para começar a enviar
                  mensagens.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          integrations.map((integration) => (
            <Card
              key={integration.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center space-x-4 flex-1"
                    onClick={() => onSelectIntegration?.(integration)}
                  >
                    <div className="flex-shrink-0">
                      {integration.platform === 'TELEGRAM' ? (
                        <Bot className="h-8 w-8 text-blue-500" />
                      ) : (
                        <MessageCircle className="h-8 w-8 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {integration.name}
                        </h3>
                        <Badge
                          variant={getStatusBadgeVariant(integration.status)}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${getStatusColor(integration.status)} mr-1`}
                          />
                          {getStatusText(integration.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 capitalize">
                        {integration.platform.toLowerCase()}
                      </p>
                      <p className="text-xs text-gray-400">
                        Criado em{' '}
                        {new Date(integration.createdAt).toLocaleDateString(
                          'pt-BR',
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectIntegration?.(integration)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(integration.id)}
                      disabled={isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
