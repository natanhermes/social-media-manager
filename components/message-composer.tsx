'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { getIntegrationsAction } from '@/actions/integrationActions'
import { sendMessageAction } from '@/actions/messageActions'
import {
  MessageFormData,
  messageFormSchema,
} from '@/schemas/message-form-schema'
import { Integration } from '@/types/integrations'

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
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      message: '',
      platforms: [],
      scheduled: false,
      scheduledDate: '',
      scheduledTime: '',
    },
  })

  // Carregar integrações no client-side
  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        const result = await getIntegrationsAction()
        if (result.success) {
          setIntegrations(result.data as Integration[])
        } else {
          toast.error('Erro ao carregar integrações')
        }
      } catch (error) {
        toast.error('Erro ao carregar integrações')
      } finally {
        setIsLoadingIntegrations(false)
      }
    }

    loadIntegrations()
  }, [])

  const onSubmit = async (data: MessageFormData) => {
    startTransition(async () => {
      try {
        const result = await sendMessageAction(data)

        if (result.success) {
          const successMessage = data.scheduled
            ? 'Mensagem agendada com sucesso!'
            : 'Mensagem enviada com sucesso!'
          toast.success(successMessage)
          form.reset()
          setIsScheduleDialogOpen(false)
          router.refresh()
        } else {
          const errorMessage = data.scheduled
            ? 'Erro ao agendar mensagem'
            : 'Erro ao enviar mensagem'
          toast.error('error' in result ? result.error : errorMessage)
        }
      } catch (error) {
        toast.error('Erro interno do servidor')
      }
    })
  }

  const handleScheduleToggle = (scheduled: boolean) => {
    form.setValue('scheduled', scheduled)
    setIsScheduleDialogOpen(scheduled)

    if (scheduled && !form.getValues('scheduledDate')) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateString = tomorrow.toISOString().split('T')[0]
      form.setValue('scheduledDate', dateString)
    }

    if (scheduled && !form.getValues('scheduledTime')) {
      const now = new Date()
      now.setHours(now.getHours() + 1, 0, 0, 0)
      const timeString = now.toTimeString().slice(0, 5)
      form.setValue('scheduledTime', timeString)
    }
  }

  const handleScheduleSubmit = async () => {
    form.setValue('scheduled', true)

    const platforms = form.getValues('platforms')
    if (!platforms || platforms.length === 0) {
      toast.error('Selecione pelo menos uma integração para agendar a mensagem')
      return
    }

    const isValid = await form.trigger()

    if (isValid) {
      setIsScheduleDialogOpen(false)
      const formData = form.getValues()
      onSubmit(formData)
    }
  }

  const connectedIntegrations = integrations.filter(
    (integration) => integration.status === 'CONNECTED',
  )

  if (isLoadingIntegrations) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Spinner />
            <span className="ml-2">Carregando integrações...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (connectedIntegrations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nova Mensagem</CardTitle>
          <CardDescription>
            Envie mensagens para suas redes sociais conectadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma integração conectada
            </h3>
            <p className="text-gray-600">
              Conecte uma plataforma para começar a enviar mensagens.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Mensagem</CardTitle>
        <CardDescription>
          Envie mensagens para suas redes sociais conectadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platforms"
              render={() => (
                <FormItem>
                  <FormLabel>Integrações</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {connectedIntegrations.map((integration) => (
                      <FormField
                        key={integration.id}
                        control={form.control}
                        name="platforms"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={integration.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value?.includes(
                                    integration.id,
                                  )}
                                  onChange={(checked) => {
                                    const currentValue = field.value || []
                                    return checked.target.checked
                                      ? field.onChange([
                                          ...currentValue,
                                          integration.id,
                                        ])
                                      : field.onChange(
                                          currentValue?.filter(
                                            (value) => value !== integration.id,
                                          ),
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {integration.name} ({integration.platform})
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1"
                onClick={() => form.setValue('scheduled', false)}
              >
                {isPending ? (
                  <>
                    <Spinner />
                    <span className="ml-2">Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
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
                    type="button"
                    variant="outline"
                    onClick={() => handleScheduleToggle(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
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
                  <div className="space-y-4">
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
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        disabled={isPending}
                        className="flex-1"
                        onClick={handleScheduleSubmit}
                      >
                        {isPending ? (
                          <>
                            <Spinner />
                            <span className="ml-2">Agendando...</span>
                          </>
                        ) : (
                          'Agendar Mensagem'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          handleScheduleToggle(false)
                          form.setValue('scheduled', false)
                          form.setValue('scheduledDate', '')
                          form.setValue('scheduledTime', '')
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
