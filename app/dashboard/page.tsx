"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Send, Calendar, MessageSquare, Users, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { MessageDetailsModal } from "@/components/message-details-modal"
import { LoadingOverlay } from "@/components/loading-overlay"
import { Loader2 } from "lucide-react"

interface Message {
  id: string
  content: string
  platforms: string[]
  sentAt: string
  status: "success" | "failed" | "pending"
}

const platforms = [
  { id: "whatsapp", name: "WhatsApp", color: "bg-green-500" },
  { id: "telegram", name: "Telegram", color: "bg-blue-500" },
  { id: "instagram", name: "Instagram", color: "bg-pink-500" },
]

export default function DashboardPage() {
  const [message, setMessage] = useState("")
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("")
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const { toast } = useToast()

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Promoção especial! 50% de desconto em todos os produtos até sexta-feira!",
      platforms: ["whatsapp", "instagram"],
      sentAt: "2024-01-15 14:30",
      status: "success",
    },
    {
      id: "2",
      content: "Novo produto lançado! Confira nossa nova linha de produtos.",
      platforms: ["telegram", "instagram"],
      sentAt: "2024-01-14 10:15",
      status: "success",
    },
    {
      id: "3",
      content: "Manutenção programada para hoje às 22h.",
      platforms: ["whatsapp", "telegram", "instagram"],
      sentAt: "2024-01-13 16:45",
      status: "failed",
    },
    {
      id: "4",
      content: "Mensagem agendada para amanhã",
      platforms: ["whatsapp"],
      sentAt: "2024-01-16 09:00",
      status: "pending",
    },
  ])

  const handlePlatformChange = (platformId: string, checked: boolean) => {
    if (checked) {
      setSelectedPlatforms([...selectedPlatforms, platformId])
    } else {
      setSelectedPlatforms(selectedPlatforms.filter((id) => id !== platformId))
    }
  }

  const handleSendNow = async () => {
    if (!message.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite uma mensagem.",
        variant: "destructive",
      })
      return
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma plataforma.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    // Simular delay de envio
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      platforms: selectedPlatforms,
      sentAt: new Date().toLocaleString("pt-BR"),
      status: "success",
    }

    setMessages([newMessage, ...messages])
    setMessage("")
    setSelectedPlatforms([])
    setIsSending(false)

    toast({
      title: "Mensagem enviada!",
      description: `Mensagem enviada para ${selectedPlatforms.length} plataforma(s) com sucesso.`,
    })
  }

  const handleSchedule = () => {
    if (!message.trim() || !scheduleDate || !scheduleTime) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos para agendar.",
        variant: "destructive",
      })
      return
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma plataforma.",
        variant: "destructive",
      })
      return
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message,
      platforms: selectedPlatforms,
      sentAt: `${scheduleDate} ${scheduleTime}`,
      status: "pending",
    }

    setMessages([newMessage, ...messages])
    setMessage("")
    setSelectedPlatforms([])
    setScheduleDate("")
    setScheduleTime("")
    setIsScheduleModalOpen(false)

    toast({
      title: "Mensagem agendada!",
      description: "Sua mensagem foi agendada com sucesso.",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Sucesso</Badge>
      case "failed":
        return <Badge variant="destructive">Falha</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      default:
        return null
    }
  }

  const stats = [
    {
      title: "Mensagens Enviadas",
      value: messages.filter((m) => m.status === "success").length,
      icon: MessageSquare,
      color: "text-blue-600",
    },
    {
      title: "Plataformas Ativas",
      value: "3",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Agendadas",
      value: messages.filter((m) => m.status === "pending").length,
      icon: Clock,
      color: "text-yellow-600",
    },
  ]

  const handleViewDetails = (message: Message) => {
    setSelectedMessage(message)
    setIsDetailsModalOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Gerencie suas mensagens para redes sociais</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message Composer */}
      <Card>
        <CardHeader>
          <CardTitle>Nova Mensagem</CardTitle>
          <CardDescription>Compose e envie mensagens para múltiplas plataformas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              placeholder="Digite sua mensagem aqui..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label>Plataformas</Label>
            <div className="flex flex-wrap gap-4 mt-2">
              {platforms.map((platform) => (
                <div key={platform.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform.id}
                    checked={selectedPlatforms.includes(platform.id)}
                    onCheckedChange={(checked) => handlePlatformChange(platform.id, checked as boolean)}
                  />
                  <Label htmlFor={platform.id} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${platform.color}`} />
                    {platform.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSendNow} className="flex items-center gap-2" disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Agora
                </>
              )}
            </Button>

            <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Calendar className="h-4 w-4" />
                  Agendar Envio
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agendar Mensagem</DialogTitle>
                  <DialogDescription>Escolha a data e hora para enviar sua mensagem</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Hora</Label>
                    <Input
                      id="time"
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleSchedule} className="w-full">
                    Agendar Mensagem
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Messages History */}
      <LoadingOverlay isLoading={isLoading} text="Carregando mensagens...">
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Mensagens</CardTitle>
            <CardDescription>Visualize todas as mensagens enviadas e agendadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Plataformas</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((msg) => (
                    <TableRow key={msg.id}>
                      <TableCell className="max-w-xs">
                        <p className="truncate">{msg.content}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {msg.platforms.map((platformId) => {
                            const platform = platforms.find((p) => p.id === platformId)
                            return platform ? (
                              <Badge key={platformId} variant="secondary" className="text-xs">
                                {platform.name}
                              </Badge>
                            ) : null
                          })}
                        </div>
                      </TableCell>
                      <TableCell>{msg.sentAt}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(msg.status)}
                          {getStatusBadge(msg.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewDetails(msg)}>
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </LoadingOverlay>
      <MessageDetailsModal
        message={selectedMessage}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  )
}
