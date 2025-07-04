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
import { useMessages } from '@/hooks/queries/useMessages'
import { usePlatforms } from '@/hooks/queries/usePlatforms'
import { getStatusBadge } from '@/lib/utils'

export default function DashboardPage() {
  const { data: messages = [], isLoading: isLoadingMessages } = useMessages(0)
  const { data: plataforms = [] } = usePlatforms()

  const stats = [
    {
      title: 'Mensagens Enviadas',
      value: messages.length,
      icon: MessageSquare,
      color: 'text-blue-600',
    },
    {
      title: 'Plataformas Ativas',
      value: plataforms.filter((p) => p.connected).length,
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Agendadas',
      value: messages.reduce((acc, msg) => {
        const pendingPlatforms = msg.platforms.filter(
          (p) => p.status === 'pending',
        )
        return acc + pendingPlatforms.length
      }, 0),
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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Plataformas</TableHead>
                  <TableHead>Data de Envio</TableHead>
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
                      <div className="flex gap-1">
                        {msg.platforms.map((platform) => (
                          <Badge
                            key={platform.id}
                            variant="outline"
                            className={
                              platform.platform.connected
                                ? 'bg-green-50'
                                : 'bg-gray-50'
                            }
                          >
                            {platform.platform.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {msg.platforms.some((p) => p.sentAt)
                        ? new Date(msg.platforms[0].sentAt!).toLocaleString(
                            'pt-BR',
                          )
                        : 'Não enviado'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {msg.platforms.map((platform) => (
                          <div
                            key={platform.id}
                            className="flex items-center gap-1"
                          >
                            <Badge
                              variant={getStatusBadge(platform.status)?.variant}
                              className={getStatusBadge(platform.status)?.color}
                            >
                              {getStatusBadge(platform.status)?.label}
                            </Badge>
                          </div>
                        ))}
                      </div>
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

      <MessageDetailsModal
        message={messages[0]}
        open={false}
        onOpenChange={() => {}}
      />
    </div>
  )
}
