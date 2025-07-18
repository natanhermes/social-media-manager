'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Bot, CheckCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { createIntegrationAction } from '@/actions/integrationActions'
import {
  IntegrationsFormData,
  integrationsFormSchema,
} from '@/schemas/integrations-form-schema'

import { Alert, AlertDescription } from './ui/alert'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface TelegramConnectionModalProps {
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function TelegramConnectionModal({
  trigger,
  onSuccess,
}: TelegramConnectionModalProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<
    'form' | 'testing' | 'connected' | 'success'
  >('form')
  const [testResult, setTestResult] = useState<{
    success: boolean
    setupInstructions?: string[]
    botInfo?: {
      id: number
      first_name: string
      username: string
    }
  } | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<IntegrationsFormData>({
    resolver: zodResolver(integrationsFormSchema),
    defaultValues: {
      botToken: '',
    },
  })

  const handleTestConnection = async (data: IntegrationsFormData) => {
    startTransition(async () => {
      try {
        setStep('testing')

        // Para teste de conexão, podemos fazer uma chamada para a API diretamente
        const response = await fetch('/api/integrations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            config: data,
            testConnection: true,
          }),
        })

        if (!response.ok) {
          throw new Error('Erro ao testar conexão')
        }

        const result = await response.json()

        if (result.success) {
          setTestResult({
            success: true,
            setupInstructions: result.setupInstructions,
          })

          setStep('connected')
          setTimeout(() => {
            setStep('success')
          }, 2000)
        } else {
          throw new Error(result.error || 'Erro ao testar conexão')
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'Erro ao testar conexão',
        )
        setStep('form')
      }
    })
  }

  const handleSaveIntegration = async () => {
    startTransition(async () => {
      try {
        const result = await createIntegrationAction({
          config: form.getValues(),
          testConnection: false,
        })

        if (result.success) {
          toast.success('Bot do Telegram conectado com sucesso!')
          setOpen(false)
          onSuccess?.()
          router.refresh()

          form.reset()
          setStep('form')
          setTestResult(null)
        } else {
          throw new Error(result.error || 'Erro ao conectar bot')
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Erro ao conectar bot do Telegram',
        )
      }
    })
  }

  const handleClose = async () => {
    setOpen(false)
    setStep('form')
    setTestResult(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Bot className="mr-2 h-4 w-4" />
            Conectar Telegram
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Conectar Telegram Bot
          </DialogTitle>
          <DialogDescription>
            Configure seu bot do Telegram para enviar mensagens através do
            dashboard. Você precisa ter um bot criado via @BotFather.
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleTestConnection)}
          >
            <div>
              <Label htmlFor="botToken">
                Token do Bot <span className="text-red-500">*</span>
              </Label>
              <Input
                id="botToken"
                type="password"
                placeholder="1234567890:ABCdefGHIjklmnoPQRStuVWXyz"
                {...form.register('botToken')}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Token obtido do @BotFather no Telegram. Mantenha seguro!
              </p>
              {form.formState.errors.botToken && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.botToken.message}
                </p>
              )}
            </div>

            <Alert>
              <Bot className="h-4 w-4" />
              <AlertDescription>
                <strong>Como obter o token:</strong>
                <br />
                1. Abra o Telegram e procure por @BotFather
                <br />
                2. Envie /newbot e siga as instruções
                <br />
                3. Copie o token fornecido pelo BotFather
                <br />
                4. Cole o token no campo acima
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Testar Conexão
              </Button>
            </div>
          </form>
        )}

        {step === 'testing' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Testando conexão com o bot do Telegram...
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 'connected' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-600">
                    Conexão Estabelecida!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {testResult?.botInfo?.first_name && (
                      <>
                        Seu bot <strong>{testResult.botInfo.first_name}</strong>{' '}
                        foi conectado com sucesso
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Bot do Telegram conectado com sucesso! Seu bot está pronto para
                uso.
              </AlertDescription>
            </Alert>

            {testResult?.setupInstructions &&
              testResult.setupInstructions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Próximos passos:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {testResult.setupInstructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ul>
                </div>
              )}

            <Alert>
              <Bot className="h-4 w-4" />
              <AlertDescription>
                <strong>Importante:</strong> Para enviar mensagens para grupos,
                você deve adicionar o bot aos grupos desejados e dar as
                permissões necessárias para envio de mensagens.
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button onClick={handleSaveIntegration} disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Salvar Integração
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
