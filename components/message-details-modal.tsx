'use client'

import { MessageStatus } from '@prisma/client'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Copy,
  Download,
  Eye,
  MessageSquare,
  MousePointer,
  Share2,
  XCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MessageWithPlatforms } from '@/hooks/queries/useMessages'
import { useToast } from '@/hooks/use-toast'

interface MessageDetailsModalProps {
  message: MessageWithPlatforms | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MessageDetailsModal({
  message,
  open,
  onOpenChange,
}: MessageDetailsModalProps) {
  const { toast } = useToast()

  if (!message) return null

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: MessageStatus) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-100 text-green-800">
            Enviado com Sucesso
          </Badge>
        )
      case 'failed':
        return <Badge variant="destructive">Falha no Envio</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Agendado</Badge>
      default:
        return null
    }
  }

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content)
    toast({
      title: 'Mensagem copiada!',
      description:
        'O conteúdo da mensagem foi copiado para a área de transferência.',
    })
  }

  const handleExportData = () => {
    const data = {
      id: message.id,
      content: message.content,
      platforms: message.platforms,
      createdAt: message.createdAt,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `message-${message.id}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Dados exportados!',
      description: 'Os dados da mensagem foram baixados com sucesso.',
    })
  }

  // Dados simulados para métricas
  const metrics = {
    views: Math.floor(Math.random() * 1000) + 100,
    clicks: Math.floor(Math.random() * 100) + 10,
    shares: Math.floor(Math.random() * 50) + 5,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Detalhes da Mensagem
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Ações */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {message.platforms.map((platform) => (
                <div key={platform.id} className="flex items-center gap-1">
                  {getStatusIcon(platform.status)}
                  {getStatusBadge(platform.status)}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyMessage}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conteúdo da Mensagem */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Conteúdo da Mensagem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    {message.content.length} caracteres
                  </div>
                </CardContent>
              </Card>

              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Data/Hora:</span>
                    <span className="text-sm">
                      {new Date(message.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">ID da Mensagem:</span>
                    <span className="text-sm font-mono">{message.id}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Plataformas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Plataformas de Envio
                  </CardTitle>
                  <CardDescription>
                    Mensagem enviada para {message.platforms.length}{' '}
                    plataforma(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {message.platforms.map((platform) => (
                      <div
                        key={platform.id}
                        className="flex items-center gap-3 p-2 border rounded-lg"
                      >
                        <span className="font-medium">
                          {platform.platform.name}
                        </span>
                        <div className="ml-auto flex items-center gap-2">
                          {platform.sentAt && (
                            <span className="text-sm text-gray-500">
                              {new Date(platform.sentAt).toLocaleString(
                                'pt-BR',
                              )}
                            </span>
                          )}
                          {getStatusIcon(platform.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Métricas e Histórico */}
            <div className="space-y-4">
              {/* Métricas */}
              {message.platforms.some((p) => p.status === 'success') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Métricas de Performance
                    </CardTitle>
                    <CardDescription>
                      Estatísticas de engajamento da mensagem
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Eye className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-blue-600">
                          {metrics.views}
                        </div>
                        <div className="text-xs text-gray-600">
                          Visualizações
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <MousePointer className="h-6 w-6 text-green-600 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-green-600">
                          {metrics.clicks}
                        </div>
                        <div className="text-xs text-gray-600">Cliques</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <Share2 className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-purple-600">
                          {metrics.shares}
                        </div>
                        <div className="text-xs text-gray-600">
                          Compartilhamentos
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Histórico de Tentativas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Histórico de Envios</CardTitle>
                  <CardDescription>
                    Registro de tentativas de envio por plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {message.platforms.map((platform) => (
                      <div
                        key={platform.id}
                        className="p-3 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {platform.platform.name}
                          </span>
                          {getStatusBadge(platform.status)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {platform.sentAt ? (
                            <>
                              <Calendar className="h-4 w-4 inline-block mr-1" />
                              {new Date(platform.sentAt).toLocaleString(
                                'pt-BR',
                              )}
                            </>
                          ) : (
                            'Não enviado'
                          )}
                        </div>
                        {platform.errorMsg && (
                          <div className="text-sm text-red-500">
                            Erro: {platform.errorMsg}
                          </div>
                        )}
                        {platform.retryCount > 0 && (
                          <div className="text-sm text-gray-500">
                            Tentativas: {platform.retryCount}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
