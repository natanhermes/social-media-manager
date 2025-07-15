'use client'

import { AlertCircle, Users } from 'lucide-react'
import { useMemo } from 'react'
import { toast } from 'sonner'

import {
  useIntegrationChannels,
  useSelectedConversations,
  useToggleSelectedConversation,
} from '@/hooks/queries/useIntegrations'
import { ConversationChannel } from '@/types/integrations'

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
  const { data, isLoading, error } = useIntegrationChannels(integrationId)
  const { data: selectedData } = useSelectedConversations(integrationId)
  const toggleSelection = useToggleSelectedConversation()

  const channels = data?.data || []
  const selectedConversations = selectedData?.data || []

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
      await toggleSelection.mutateAsync({
        integrationId,
        externalId: channel.id,
        name: channel.name,
        type: channel.type,
        selected: !channel.selected,
      })

      if (!channel.selected) {
        toast.success(`Grupo "${channel.name}" selecionado`)
      } else {
        toast.success(`Grupo "${channel.name}" removido da seleção`)
      }
    } catch (error) {
      toast.error(
        `Erro ao ${!channel.selected ? 'selecionar' : 'remover'} grupo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      )
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
            <CardDescription>
              Não foi possível carregar os grupos.
            </CardDescription>
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
              Não foi possível carregar os grupos.
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
                        disabled={toggleSelection.isPending}
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
