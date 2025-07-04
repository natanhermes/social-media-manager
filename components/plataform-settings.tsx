'use client'

import { MessageSquare, Smartphone } from 'lucide-react'

import { PlatformName } from '@/enums/platform'
import { usePlatforms } from '@/hooks/queries/usePlatforms'

import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'

export function PlataformSettings() {
  const { data: platforms = [] } = usePlatforms()

  const getPlatformStatus = (platformName: PlatformName) => {
    const platform = platforms.find(
      (platform) => (platform.name as unknown as PlatformName) === platformName,
    )
    return platform?.connected ?? false
  }

  const whatsappConnected = getPlatformStatus(PlatformName.WHATSAPP)
  const telegramConnected = getPlatformStatus(PlatformName.TELEGRAM)
  const instagramConnected = getPlatformStatus(PlatformName.INSTAGRAM)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Plataformas Conectadas
        </CardTitle>
        <CardDescription>
          Gerencie suas conexões com redes sociais
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium">WhatsApp</p>
              <p className="text-sm text-gray-500">
                {whatsappConnected ? 'Conectado' : 'Desconectado'}
              </p>
            </div>
          </div>
          <Button
            variant={whatsappConnected ? 'outline' : 'default'}
            size="sm"
            onClick={() => {
              console.log(
                `${whatsappConnected ? 'Desconectando' : 'Conectando'} WhatsApp`,
              )
            }}
          >
            {whatsappConnected ? 'Desconectar' : 'Conectar'}
          </Button>
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium">Telegram</p>
              <p className="text-sm text-gray-500">
                {telegramConnected ? 'Conectado' : 'Desconectado'}
              </p>
            </div>
          </div>
          {telegramConnected ? (
            <Button variant="outline" size="sm">
              Desconectar
            </Button>
          ) : (
            <Button size="sm">Conectar</Button>
          )}
        </div>

        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-medium">Instagram</p>
              <p className="text-sm text-gray-500">
                {instagramConnected ? 'Conectado' : 'Desconectado'}
              </p>
            </div>
          </div>
          {instagramConnected ? (
            <Button variant="outline" size="sm">
              Desconectar
            </Button>
          ) : (
            <Button size="sm">Conectar</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
