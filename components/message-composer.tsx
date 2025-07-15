'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Send } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useIntegrations } from '@/hooks/queries/useIntegrations'
import { useSendMessage } from '@/hooks/queries/useSendMessage'
import {
  MessageFormData,
  messageFormSchema,
} from '@/schemas/message-form-schema'
import { EvolutionIntegration } from '@/types/integrations'

import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Input } from './ui/input'
import { Spinner } from './ui/spinner'
import { Textarea } from './ui/textarea'

export function MessageComposer() {
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const { data: integrations } = useIntegrations()
  const sendMessageMutation = useSendMessage()

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      message: '',
      scheduled: false,
      scheduledDate: '',
      scheduledTime: '',
    },
  })

  const handleSubmit = async (data: MessageFormData) => {
    try {
      const response = await sendMessageMutation.mutateAsync(data)

      if (response.success) {
        toast.success('Mensagem enviada com sucesso!', {
          description: response.message,
        })

        form.reset()
        setIsScheduleDialogOpen(false)
      } else {
        toast.error('Erro ao enviar mensagem', {
          description: response.message,
        })
      }

      if (response.errors && response.errors.length > 0) {
        response.errors.forEach((error) => {
          toast.error(`Erro na plataforma ${error.platform}`, {
            description: error.error,
          })
        })
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao enviar mensagem'

      toast.error('Erro ao enviar mensagem', {
        description: errorMessage,
      })
    }
  }

  const handleSchedule = () => {
    form.setValue('scheduled', true)
    setIsScheduleDialogOpen(true)
  }

  const handleSendNow = () => {
    form.setValue('scheduled', false)
    form.handleSubmit(handleSubmit)()
  }

  const handleScheduleConfirm = () => {
    form.handleSubmit(handleSubmit)()
  }

  const connectedIntegrations = (integrations?.data || []).filter(
    (integration: EvolutionIntegration) => integration.status === 'CONNECTED',
  )

  const isLoading = sendMessageMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Nova Mensagem</CardTitle>
            <CardDescription>
              Envie mensagens para múltiplas plataformas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite sua mensagem aqui..."
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg border p-4 bg-muted/50">
              <h4 className="text-sm font-medium mb-2">
                Integrações Conectadas
              </h4>
              {connectedIntegrations.length > 0 ? (
                <div className="space-y-2">
                  {connectedIntegrations.map((integration) => (
                    <div
                      key={integration.id}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span>{integration.name}</span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground mt-2">
                    A mensagem será enviada para os grupos selecionados em todas
                    as integrações conectadas.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma integração conectada. Configure uma integração do
                  WhatsApp primeiro.
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                className="flex-1"
                onClick={handleSendNow}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Agora
                  </>
                )}
              </Button>

              <Dialog
                open={isScheduleDialogOpen}
                onOpenChange={setIsScheduleDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1"
                    type="button"
                    onClick={handleSchedule}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Agendar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agendar Mensagem</DialogTitle>
                    <DialogDescription>
                      Escolha a data e hora para enviar sua mensagem
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="scheduledDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="scheduledTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hora</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    onClick={handleScheduleConfirm}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner />
                        Agendando...
                      </>
                    ) : (
                      'Confirmar Agendamento'
                    )}
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
