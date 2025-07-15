'use client'

import { Integration } from '@prisma/client'
import { MessageCircle } from 'lucide-react'

import { IntegrationChannelsList } from './integration-channels-list'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

interface IntegrationDetailsModalProps {
  integration: Integration | null
  open: boolean
  onClose: () => void
}

export function IntegrationDetailsModal({
  integration,
  open,
  onClose,
}: IntegrationDetailsModalProps) {
  if (!integration) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {integration.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Integração</CardTitle>
              <CardDescription>
                Informações e configurações da integração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Nome
                </label>
                <p className="text-sm">{integration.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <p className="text-sm">{integration.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Criado em
                </label>
                <p className="text-sm">
                  {new Date(integration.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grupos para Envio</CardTitle>
              <CardDescription>
                Selecione os grupos onde as mensagens serão enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IntegrationChannelsList integrationId={integration.id} />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
