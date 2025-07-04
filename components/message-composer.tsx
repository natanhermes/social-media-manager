'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Send } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { usePlataforms } from '@/hooks/queries/usePlataforms'
import { useSendMessage } from '@/hooks/queries/useSendMessage'
import {
  MessageFormData,
  messageFormSchema,
} from '@/schemas/message-form-schema'

import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Checkbox } from './ui/checkbox'
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
  const { data: platforms = [] } = usePlataforms()
  const sendMessageMutation = useSendMessage()

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

  const handleSubmit = async (data: MessageFormData) => {
    try {
      await sendMessageMutation.mutateAsync(data)

      form.reset()
      setIsScheduleDialogOpen(false)

      console.log('Mensagem enviada com sucesso!')
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      // TODO: Adicionar toast de erro
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

  const connectedPlatforms = platforms.filter((platform) => platform.connected)
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

            <FormField
              control={form.control}
              name="platforms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plataformas</FormLabel>
                  <div className="flex gap-4 mt-2">
                    {connectedPlatforms.map((platform) => (
                      <FormItem
                        key={platform.id}
                        className="flex items-center space-x-2"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value.includes(platform.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, platform.id])
                              } else {
                                field.onChange(
                                  field.value.filter(
                                    (id) => id !== platform.id,
                                  ),
                                )
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          {platform.name}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

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
