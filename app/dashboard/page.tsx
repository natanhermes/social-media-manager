'use client'

import { Clock, MessageSquare, Users } from 'lucide-react'
import { useState } from 'react'

import { MessageComposer } from '@/components/message-composer'
import { MessageDetailsModal } from '@/components/message-details-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useIntegrations } from '@/hooks/queries/useIntegrations'
import {
  type MessageWithDeliveries,
  useMessages,
} from '@/hooks/queries/useMessages'

export default function DashboardPage() {
  const { data: messagesResponse, isLoading: isLoadingMessages } =
    useMessages(0)
  const { data: integrations } = useIntegrations()
  const [selectedMessage, setSelectedMessage] =
    useState<MessageWithDeliveries | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const messages = messagesResponse?.data || []
  const connectedIntegrations = (integrations?.data || []).filter(
    (integration) => integration.status === 'CONNECTED',
  )

  const stats = [
    {
      title: 'Mensagens Enviadas',
      value: messages.length,
      icon: MessageSquare,
      color: 'text-blue-600',
    },
    {
      title: 'Integrações Ativas',
      value: connectedIntegrations.length,
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Última Mensagem',
      value: messages.length > 0 ? 'Hoje' : 'Nenhuma',
      icon: Clock,
      color: 'text-yellow-600',
    },
  ]

  const handleViewMessage = (message: MessageWithDeliveries) => {
    setSelectedMessage(message)
    setIsModalOpen(true)
  }

  const getMessageStatus = (
    messageDeliveries: MessageWithDeliveries['messageDeliveries'],
  ) => {
    if (!messageDeliveries || messageDeliveries.length === 0) {
      return { text: 'Sem deliveries', variant: 'secondary' as const }
    }

    const statuses = messageDeliveries.map(
      (d: MessageWithDeliveries['messageDeliveries'][0]) => d.status,
    )
    const hasSuccess = statuses.includes('SENT')
    const hasFailed = statuses.includes('FAILED')
    const hasScheduled = statuses.includes('SCHEDULED')
    const hasPending =
      statuses.includes('PENDING') || statuses.includes('PROCESSING')

    if (hasScheduled) {
      return { text: 'Agendada', variant: 'default' as const }
    }
    if (hasSuccess && !hasFailed && !hasPending) {
      return { text: 'Enviada', variant: 'default' as const }
    }
    if (hasFailed && !hasSuccess) {
      return { text: 'Falhou', variant: 'destructive' as const }
    }
    if (hasPending) {
      return { text: 'Processando', variant: 'secondary' as const }
    }
    if (hasSuccess && hasFailed) {
      return { text: 'Parcial', variant: 'secondary' as const }
    }

    return { text: 'Desconhecido', variant: 'secondary' as const }
  }

  const getMessageDateTime = (message: MessageWithDeliveries) => {
    // Para mensagens agendadas que ainda não foram enviadas
    if (message.isScheduled && message.scheduledFor && !message.sentAt) {
      return {
        display: (
          <div className="flex items-center gap-1 text-blue-600">
            <Clock className="h-3 w-3" />
            <span className="text-xs">
              Agendada para{' '}
              {new Date(message.scheduledFor).toLocaleString('pt-BR')}
            </span>
          </div>
        ),
        sortValue: new Date(message.scheduledFor).getTime(),
      }
    }

    // Para mensagens enviadas (tem sentAt)
    if (message.sentAt) {
      return {
        display: new Date(message.sentAt).toLocaleString('pt-BR'),
        sortValue: new Date(message.sentAt).getTime(),
      }
    }

    // Para mensagens que ainda não foram enviadas (pendentes)
    return {
      display: (
        <span className="text-muted-foreground text-xs italic">
          Aguardando envio
        </span>
      ),
      sortValue: 0, // Menor prioridade na ordenação
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Gerencie suas mensagens para redes sociais
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  {isLoadingMessages ? (
                    <Spinner />
                  ) : (
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  )}
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message Composer */}
      <MessageComposer />

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Mensagens Recentes</CardTitle>
          <CardDescription>
            Histórico das últimas mensagens enviadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMessages ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma mensagem enviada
              </h3>
              <p className="text-gray-600">
                Envie sua primeira mensagem usando o formulário acima.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Data/Status de Envio</TableHead>
                  <TableHead>Deliveries</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((msg) => {
                  const status = getMessageStatus(msg.messageDeliveries)
                  const dateTime = getMessageDateTime(msg)
                  return (
                    <TableRow key={msg.id}>
                      <TableCell className="max-w-[300px] truncate">
                        {msg.content}
                      </TableCell>
                      <TableCell>{dateTime.display}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {msg.messageDeliveries?.length || 0} envio(s)
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.text}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewMessage(msg)}
                        >
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Message Details Modal */}
      <MessageDetailsModal
        message={selectedMessage}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  )
}
