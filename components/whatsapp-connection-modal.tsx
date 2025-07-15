'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle, Loader2, MessageCircle, QrCode } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { useCreateIntegration } from '@/hooks/queries/useIntegrations'
import { useConnectionPolling } from '@/hooks/use-connection-polling'
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

interface WhatsAppConnectionModalProps {
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export function WhatsAppConnectionModal({
  trigger,
  onSuccess,
}: WhatsAppConnectionModalProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<
    'form' | 'testing' | 'qr-waiting' | 'connected' | 'success'
  >('form')
  const [testResult, setTestResult] = useState<{
    success: boolean
    setupInstructions?: string[]
    qrCode?: string
    instanceName?: string
  } | null>(null)

  const createIntegration = useCreateIntegration()

  const { status } = useConnectionPolling({
    instanceName: testResult?.instanceName || '',
    enabled: step === 'qr-waiting',
    onConnected: () => {
      setStep('connected')
      setTimeout(() => {
        setStep('success')
      }, 2000)
    },
  })

  const form = useForm<IntegrationsFormData>({
    resolver: zodResolver(integrationsFormSchema),
    defaultValues: {
      instanceName: '',
    },
  })

  const handleTestConnection = async (data: IntegrationsFormData) => {
    try {
      setStep('testing')
      const result = await createIntegration.mutateAsync({
        config: data,
        testConnection: true,
      })

      setTestResult({
        success: true,
        setupInstructions: result.setupInstructions,
        qrCode: result.qrCode,
        instanceName: data.instanceName,
      })

      if (result.qrCode) {
        setStep('qr-waiting')
      } else {
        setStep('success')
      }
    } catch (error) {
      setStep('form')
    }
  }

  const handleSaveIntegration = async () => {
    try {
      await createIntegration.mutateAsync({
        config: form.getValues(),
        testConnection: false,
      })

      toast.success('Instância do WhatsApp conectada com sucesso!')
      setOpen((prev) => !prev)
      onSuccess?.()

      form.reset()
      setStep('form')
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao conectar instância do WhatsApp',
      )
    }
  }

  const handleClose = async () => {
    if (testResult?.instanceName) {
      await fetch(`/api/integrations/instance/${testResult.instanceName}`, {
        method: 'DELETE',
      })
    }

    setOpen((prev) => !prev)
    setStep('form')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <MessageCircle className="mr-2 h-4 w-4" />
            Conectar WhatsApp
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Conectar WhatsApp
          </DialogTitle>
          <DialogDescription>
            Configure sua instância do WhatsApp para enviar mensagens através do
            dashboard.
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(handleTestConnection)}
          >
            <div>
              <Label htmlFor="instanceName">
                Nome da Instância <span className="text-red-500">*</span>
              </Label>
              <Input
                id="instanceName"
                placeholder="minha-instancia"
                {...form.register('instanceName')}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Nome único para sua instância WhatsApp.
              </p>
              {form.formState.errors.instanceName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.instanceName.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createIntegration.isPending}>
                {createIntegration.isPending ? (
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
                  Testando conexão com WhatsApp...
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 'qr-waiting' && (
          <div className="space-y-4">
            <Alert>
              <QrCode className="h-4 w-4" />
              <AlertDescription>
                Escaneie o QR Code abaixo com seu WhatsApp para conectar
              </AlertDescription>
            </Alert>

            {testResult?.qrCode && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-100 rounded-lg">
                  <img
                    src={testResult.qrCode}
                    alt="QR Code WhatsApp"
                    className="mx-auto max-w-[250px] h-auto"
                  />
                </div>

                <div className="flex items-center justify-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground">
                    Aguardando conexão... Status: {status}
                  </span>
                </div>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    1. Abra o WhatsApp no seu celular
                  </p>
                  <p className="text-sm text-muted-foreground">
                    2. Vá em Configurações → Aparelhos conectados
                  </p>
                  <p className="text-sm text-muted-foreground">
                    3. Toque em "Conectar um aparelho"
                  </p>
                  <p className="text-sm text-muted-foreground">
                    4. Escaneie o código QR acima
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {step === 'connected' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-600">
                    Conexão Estabelecida!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Seu WhatsApp foi conectado com sucesso
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
                WhatsApp conectado com sucesso! Sua instância está pronta para
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

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleSaveIntegration}
                disabled={createIntegration.isPending}
              >
                {createIntegration.isPending ? (
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
