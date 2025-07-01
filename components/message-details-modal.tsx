"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  Eye,
  MousePointer,
  Share2,
  Copy,
  Download,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MessageDetailsModalProps {
  message: {
    id: string
    content: string
    platforms: string[]
    sentAt: string
    status: "success" | "failed" | "pending"
  } | null
  isOpen: boolean
  onClose: () => void
}

export function MessageDetailsModal({ message, isOpen, onClose }: MessageDetailsModalProps) {
  const { toast } = useToast()

  if (!message) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Enviado com Sucesso</Badge>
      case "failed":
        return <Badge variant="destructive">Falha no Envio</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Agendado</Badge>
      default:
        return null
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "whatsapp":
        return "bg-green-500"
      case "telegram":
        return "bg-blue-500"
      case "instagram":
        return "bg-pink-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content)
    toast({
      title: "Mensagem copiada!",
      description: "O conteúdo da mensagem foi copiado para a área de transferência.",
    })
  }

  const handleExportData = () => {
    const data = {
      id: message.id,
      content: message.content,
      platforms: message.platforms,
      sentAt: message.sentAt,
      status: message.status,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `message-${message.id}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Dados exportados!",
      description: "Os dados da mensagem foram baixados com sucesso.",
    })
  }

  // Dados simulados para métricas
  const metrics = {
    views: Math.floor(Math.random() * 1000) + 100,
    clicks: Math.floor(Math.random() * 100) + 10,
    shares: Math.floor(Math.random() * 50) + 5,
  }

  const deliveryAttempts = [
    {
      platform: "WhatsApp",
      timestamp: "2024-01-15 14:30:15",
      status: "success",
      message: "Mensagem entregue com sucesso",
    },
    {
      platform: "Instagram",
      timestamp: "2024-01-15 14:30:18",
      status: "success",
      message: "Mensagem entregue com sucesso",
    },
    {
      platform: "Telegram",
      timestamp: "2024-01-15 14:30:20",
      status: "failed",
      message: "Erro de autenticação - Token inválido",
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              {getStatusIcon(message.status)}
              {getStatusBadge(message.status)}
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
                  <CardTitle className="text-lg">Conteúdo da Mensagem</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-gray-900 whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className="mt-3 text-sm text-gray-500">{message.content.length} caracteres</div>
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
                    <span className="text-sm">{message.sentAt}</span>
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
                  <CardTitle className="text-lg">Plataformas de Envio</CardTitle>
                  <CardDescription>Mensagem enviada para {message.platforms.length} plataforma(s)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {message.platforms.map((platform) => (
                      <div key={platform} className="flex items-center gap-3 p-2 border rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${getPlatformColor(platform)}`} />
                        <span className="font-medium">{platform}</span>
                        <div className="ml-auto">
                          {message.status === "success" ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : message.status === "failed" ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
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
              {message.status === "success" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Métricas de Performance</CardTitle>
                    <CardDescription>Estatísticas de engajamento da mensagem</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <Eye className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-blue-600">{metrics.views}</div>
                        <div className="text-xs text-gray-600">Visualizações</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <MousePointer className="h-6 w-6 text-green-600 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-green-600">{metrics.clicks}</div>
                        <div className="text-xs text-gray-600">Cliques</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <Share2 className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                        <div className="text-2xl font-bold text-purple-600">{metrics.shares}</div>
                        <div className="text-xs text-gray-600">Compartilhamentos</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Histórico de Entrega */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Histórico de Entrega</CardTitle>
                  <CardDescription>Tentativas de envio para cada plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {deliveryAttempts.map((attempt, index) => (
                      <div key={index} className="border-l-4 border-gray-200 pl-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{attempt.platform}</span>
                          <span className="text-xs text-gray-500">{attempt.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {attempt.status === "success" ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className="text-xs text-gray-600">{attempt.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Ações Adicionais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Reenviar Mensagem
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar como Template
                  </Button>
                  <Separator />
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Excluir Mensagem
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
