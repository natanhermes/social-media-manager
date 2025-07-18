'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, Download, Filter, Search, Send, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

import { getMessagesAction } from '@/actions/messageActions'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface MessageDelivery {
  id: string
  status: string
  sentAt: Date | null
  errorMessage: string | null
  selectedConversation: {
    name: string
    externalId: string
    type: string
  }
  integration: {
    name: string
    platform: string
  }
}

interface MessageWithDeliveries {
  id: string
  content: string
  createdAt: Date
  scheduledFor: Date | null
  isScheduled: boolean
  sentAt: Date | null
  userId: string
  messageDeliveries: MessageDelivery[]
}

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [selectedMessage, setSelectedMessage] =
    useState<MessageWithDeliveries | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [messages, setMessages] = useState<MessageWithDeliveries[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await getMessagesAction(0)
        if (result.success) {
          setMessages(result.data as MessageWithDeliveries[])
        } else {
          setError(result.error || 'Erro ao carregar mensagens')
        }
      } catch (error) {
        setError('Erro ao carregar mensagens')
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [])

  const getStatusBadge = (deliveries: Array<{ status: string }>) => {
    if (deliveries.length === 0) {
      return <Badge variant="secondary">Sem deliveries</Badge>
    }

    const statuses = deliveries.map((d) => d.status)
    const hasSuccess = statuses.includes('SENT')
    const hasFailed = statuses.includes('FAILED')
    const hasPending =
      statuses.includes('PENDING') || statuses.includes('PROCESSING')
    const hasScheduled = statuses.includes('SCHEDULED')

    if (hasScheduled) {
      return <Badge className="bg-blue-100 text-blue-800">Agendada</Badge>
    }
    if (hasSuccess && !hasFailed && !hasPending) {
      return <Badge className="bg-green-100 text-green-800">Enviada</Badge>
    }
    if (hasFailed && !hasSuccess) {
      return <Badge variant="destructive">Falhou</Badge>
    }
    if (hasPending) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">Processando</Badge>
      )
    }
    if (hasSuccess && hasFailed) {
      return <Badge className="bg-orange-100 text-orange-800">Parcial</Badge>
    }

    return <Badge variant="secondary">Desconhecido</Badge>
  }

  const getMessagePlatforms = (
    deliveries: Array<{ integration: { platform: string } }>,
  ) => {
    const platforms = [
      ...new Set(deliveries.map((d) => d.integration.platform)),
    ]
    return platforms
  }

  const getMessageSendDate = (message: MessageWithDeliveries) => {
    // Para mensagens agendadas que ainda não foram enviadas
    if (message.isScheduled && message.scheduledFor && !message.sentAt) {
      return (
        <div className="flex items-center gap-1 text-blue-600">
          <Clock className="h-3 w-3" />
          <span className="text-xs">
            Agendada para{' '}
            {format(new Date(message.scheduledFor), 'dd/MM/yyyy HH:mm', {
              locale: ptBR,
            })}
          </span>
        </div>
      )
    }

    // Para mensagens enviadas (tem sentAt)
    if (message.sentAt) {
      return format(new Date(message.sentAt), 'dd/MM/yyyy HH:mm', {
        locale: ptBR,
      })
    }

    // Para mensagens que ainda não foram enviadas (pendentes)
    return (
      <span className="text-muted-foreground text-xs italic">
        Aguardando envio
      </span>
    )
  }

  const filteredMessages = messages.filter((message) => {
    const matchesSearch = message.content
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    const platforms = getMessagePlatforms(message.messageDeliveries)
    const matchesPlatform =
      platformFilter === 'all' ||
      platforms.some(
        (platform) => platform.toLowerCase() === platformFilter.toLowerCase(),
      )

    const deliveryStatuses = message.messageDeliveries.map((d) => d.status)
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'sent' && deliveryStatuses.includes('SENT')) ||
      (statusFilter === 'failed' && deliveryStatuses.includes('FAILED')) ||
      (statusFilter === 'pending' &&
        (deliveryStatuses.includes('PENDING') ||
          deliveryStatuses.includes('PROCESSING'))) ||
      (statusFilter === 'scheduled' && deliveryStatuses.includes('SCHEDULED'))

    return matchesSearch && matchesStatus && matchesPlatform
  })

  const stats = [
    {
      label: 'Total de Mensagens',
      value: messages.length,
      color: 'text-blue-600',
    },
    {
      label: 'Mensagens Enviadas',
      value: messages.filter((m) =>
        m.messageDeliveries.some((d) => d.status === 'SENT'),
      ).length,
      color: 'text-green-600',
    },
    {
      label: 'Com Falhas',
      value: messages.filter((m) =>
        m.messageDeliveries.some((d) => d.status === 'FAILED'),
      ).length,
      color: 'text-red-600',
    },
    {
      label: 'Agendadas',
      value: messages.filter((m) =>
        m.messageDeliveries.some((d) => d.status === 'SCHEDULED'),
      ).length,
      color: 'text-blue-600',
    },
  ]

  const handleMessageClick = (message: MessageWithDeliveries) => {
    setSelectedMessage(message)
    setIsDetailsModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Carregando mensagens...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto" />
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Histórico de Mensagens
        </h1>
        <p className="text-muted-foreground">
          Visualize e gerencie todas as suas mensagens enviadas
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
          <CardDescription>
            Filtre suas mensagens por conteúdo, status ou plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar mensagens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="sent">Enviadas</SelectItem>
                <SelectItem value="failed">Falharam</SelectItem>
                <SelectItem value="pending">Processando</SelectItem>
                <SelectItem value="scheduled">Agendadas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Plataforma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as plataformas</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="evolution">Evolution</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Mensagens */}
      <Card>
        <CardHeader>
          <CardTitle>Mensagens ({filteredMessages.length})</CardTitle>
          <CardDescription>
            Lista de todas as suas mensagens com status de entrega
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conteúdo</TableHead>
                <TableHead>Plataformas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Envio/Agendamento</TableHead>
                <TableHead>Deliveries</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.map((message) => (
                <TableRow
                  key={message.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleMessageClick(message)}
                >
                  <TableCell>
                    <div className="max-w-[200px] truncate">
                      {message.content}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getMessagePlatforms(message.messageDeliveries).map(
                        (platform) => (
                          <Badge
                            key={platform}
                            variant="outline"
                            className="text-xs"
                          >
                            {platform}
                          </Badge>
                        ),
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(message.messageDeliveries)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(message.createdAt), 'dd/MM/yyyy HH:mm', {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>{getMessageSendDate(message)}</TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {message.messageDeliveries.length} envio(s)
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMessages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      Nenhuma mensagem encontrada
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedMessage && (
        <MessageDetailsModal
          message={selectedMessage}
          open={isDetailsModalOpen}
          onOpenChange={setIsDetailsModalOpen}
        />
      )}
    </div>
  )
}
