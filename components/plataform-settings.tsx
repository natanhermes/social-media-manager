'use client'

import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

import { useIntegrations } from '@/hooks/queries/useIntegrations'
import { getPlatformConfig, PlatformType } from '@/lib/platform-config'
import { Integration, IntegrationStatus } from '@/types/integrations'

import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'

const statusMap: Record<IntegrationStatus, string> = {
  CONNECTED: 'Online',
  ERROR: 'Erro',
  CONNECTING: 'Conectando',
  DISCONNECTED: 'Offline',
  EXPIRED: 'Expirado',
}

const statusColorMap: Record<IntegrationStatus, string> = {
  CONNECTED: 'bg-green-100 text-green-700',
  ERROR: 'bg-red-100 text-red-700',
  CONNECTING: 'bg-yellow-100 text-yellow-700',
  DISCONNECTED: 'bg-gray-100 text-gray-700',
  EXPIRED: 'bg-red-100 text-red-700',
}

export function PlataformSettings() {
  const { data: integrations, isLoading } = useIntegrations()

  // Agrupa integrações por plataforma e calcula status
  const platformStatus = useMemo(() => {
    if (!integrations?.data) return {}

    const platforms: Record<
      string,
      { connected: boolean; integrations: Integration[] }
    > = {}

    integrations.data.forEach((integration) => {
      const platform = integration.platform as PlatformType

      if (!platforms[platform]) {
        platforms[platform] = {
          connected: false,
          integrations: [],
        }
      }

      platforms[platform].integrations.push(integration)

      // Marca como conectado se pelo menos uma integração estiver conectada
      if (integration.status === 'CONNECTED') {
        platforms[platform].connected = true
      }
    })

    return platforms
  }, [integrations?.data])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Conexões da Plataforma</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie suas conexões de mídia social
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center w-full py-8">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : Object.keys(platformStatus).length === 0 ? (
        <div className="text-center py-8">
          <div className="text-muted-foreground mb-4">
            Nenhuma integração encontrada
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Você ainda não possui integrações configuradas.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1">
          {Object.entries(platformStatus).map(([platform, status]) => {
            const config = getPlatformConfig(platform as PlatformType)
            const IconComponent = config.icon

            return (
              <Card key={platform}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {config.name}
                  </CardTitle>
                  <IconComponent className={`h-4 w-4 ${config.iconColor}`} />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          status.connected ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <span className="text-sm">
                        {status.connected ? 'Conectado' : 'Desconectado'}
                      </span>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {status.connected
                      ? config.description.connected
                      : config.description.disconnected}
                  </CardDescription>
                  {status.integrations.length > 0 && (
                    <div className="mt-3 pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        {status.integrations.length} integração(ões):
                      </div>
                      <div className="mt-1 space-y-1">
                        {status.integrations.map((integration) => (
                          <div
                            key={integration.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="font-medium">
                              {integration.name}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs ${statusColorMap[integration.status]}`}
                            >
                              {statusMap[integration.status]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <div className="rounded-lg border p-4">
        <h4 className="font-medium">Sobre as Conexões</h4>
        <p className="mt-2 text-sm text-muted-foreground">
          Para enviar mensagens, você precisa ter pelo menos uma integração
          conectada. Acesse a página de{' '}
          <Link href="/dashboard/integrations">
            <Button variant="link" className="h-auto p-0">
              Integrações
            </Button>{' '}
          </Link>
          para configurar suas conexões.
        </p>
      </div>
    </div>
  )
}
