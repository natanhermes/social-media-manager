'use client'

import { Calendar, Copy, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

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
import { SimpleMessage } from '@/hooks/queries/useMessages'

interface MessageDetailsModalProps {
  message: SimpleMessage | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MessageDetailsModal({
  message,
  open,
  onOpenChange,
}: MessageDetailsModalProps) {
  if (!message) return null

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.info('Texto copiado para a área de transferência.')
    } catch (error) {
      toast.error('Não foi possível copiar o texto.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Detalhes da Mensagem
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Conteúdo da Mensagem */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Conteúdo</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(message.content)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
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
                <span className="text-sm font-medium">Data de Criação:</span>
                <span className="text-sm">
                  {new Date(message.createdAt).toLocaleString('pt-BR', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Status da Entrega */}
          <Card>
            <CardHeader>
              <CardTitle>Status da Entrega</CardTitle>
              <CardDescription>
                Esta mensagem foi enviada para suas integrações conectadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">Mensagem Enviada</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  A mensagem foi processada e enviada para todas as integrações
                  ativas no momento do envio.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
