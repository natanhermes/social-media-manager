'use client'

import { Clock, MessageSquare, Users } from 'lucide-react'

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
import { useMessages } from '@/hooks/queries/useMessages'

export default function DashboardPage() {
  const { data: messages = [], isLoading: isLoadingMessages } = useMessages(0)
  const { data: integrations } = useIntegrations()

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
                  <TableHead>Data de Envio</TableHead>
                  <TableHead>Integrações</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((msg) => (
                  <TableRow key={msg.id}>
                    <TableCell className="max-w-[300px] truncate">
                      {msg.content}
                    </TableCell>
                    <TableCell>
                      {new Date(msg.createdAt).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {connectedIntegrations.map((integration) => (
                          <Badge
                            key={integration.id}
                            variant="outline"
                            className="bg-green-50"
                          >
                            {integration.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-500">
                        Enviada
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {messages.length > 0 && (
        <MessageDetailsModal
          message={messages[0]}
          open={false}
          onOpenChange={() => {}}
        />
      )}
    </div>
  )
}
