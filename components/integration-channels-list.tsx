'use client'

import { AlertCircle, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { ConversationChannel, SelectedConversation } from '@/types/integrations'

import { Card, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Checkbox } from './ui/checkbox'
import { ScrollArea } from './ui/scroll-area'
import { Skeleton } from './ui/skeleton'

interface IntegrationChannelsListProps {
  integrationId: string
}

export function IntegrationChannelsList({
  integrationId,
}: IntegrationChannelsListProps) {
  const [channels, setChannels] = useState<ConversationChannel[]>([])
  const [selectedConversations, setSelectedConversations] = useState<
    SelectedConversation[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isToggling, setIsToggling] = useState(false)

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Buscar canais e conversas selecionadas em paralelo
      const [channelsResponse, selectedResponse] = await Promise.all([
        fetch(`/api/integrations/${integrationId}/channels`),
        fetch(`/api/integrations/${integrationId}/selected-conversations`),
      ])

      if (channelsResponse.ok) {
        const channelsData = await channelsResponse.json()
        if (channelsData.success) {
          setChannels(channelsData.data || [])
        }
      }

      if (selectedResponse.ok) {
        const selectedData = await selectedResponse.json()
        if (selectedData.success) {
          setSelectedConversations(selectedData.data || [])
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setError('Erro ao carregar grupos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (integrationId) {
      loadData()
    }
  }, [integrationId])

  // Combinar dados de canais com conversas selecionadas
  const channelsWithSelection = useMemo(() => {
    return channels.map((channel) => ({
      ...channel,
      selected: selectedConversations.some(
        (selected) => selected.externalId === channel.id,
      ),
    }))
  }, [channels, selectedConversations])

  const handleToggleSelection = async (
    channel: ConversationChannel & { selected: boolean },
  ) => {
    try {
      setIsToggling(true)

      const response = await fetch(
        `/api/integrations/${integrationId}/selected-conversations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            externalId: channel.id,
            name: channel.name,
            type: channel.type,
            selected: !channel.selected,
          }),
        },
      )

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Recarregar dados para sincronizar
          await loadData()

          if (!channel.selected) {
            toast.success(`Grupo "${channel.name}" selecionado`)
          } else {
            toast.success(`Grupo "${channel.name}" removido da seleção`)
          }
        } else {
          toast.error(result.error || 'Erro ao atualizar seleção')
        }
      } else {
        toast.error('Erro ao atualizar seleção')
      }
    } catch (error) {
      toast.error(
        `Erro ao ${!channel.selected ? 'selecionar' : 'remover'} grupo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      )
    } finally {
      setIsToggling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold">Canais de Conversa</h4>
          <Skeleton className="h-9 w-32" />
        </div>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div>
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-semibold">Grupos para Envio</h4>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Erro ao carregar grupos
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold">
          Grupos para Envio {channels.length > 0 && `(${channels.length})`}
        </h4>
      </div>

      {channelsWithSelection.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum grupo encontrado</CardTitle>
            <CardDescription>
              Não foi possível carregar os grupos desta integração.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {channelsWithSelection.map((channel) => {
              return (
                <Card
                  key={channel.id}
                  className={`p-3 transition-all ${
                    channel.selected
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={channel.selected}
                        onCheckedChange={() => handleToggleSelection(channel)}
                        disabled={isToggling}
                      />
                      <div className="p-2 rounded-lg bg-gray-100 text-purple-600">
                        {channel.metadata?.pictureUrl ? (
                          <img
                            src={channel.metadata.pictureUrl as string}
                            alt={channel.name}
                            className="h-6 w-6"
                          />
                        ) : (
                          <Users className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{channel.name}</h5>
                        <div className="text-xs text-muted-foreground mt-1">
                          {channel.participants} participantes
                        </div>
                      </div>
                    </div>
                    {channel.selected && (
                      <div className="text-xs text-blue-600 font-medium">
                        Selecionada
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
