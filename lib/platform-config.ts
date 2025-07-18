import { Bot, MessageCircle } from 'lucide-react'

export type PlatformType = 'WHATSAPP' | 'EVOLUTION' | 'TELEGRAM'

export interface PlatformConfig {
  name: string
  icon: React.ComponentType<{ className?: string }>
  description: {
    connected: string
    disconnected: string
  }
  iconColor: string
}

export const platformConfigs: Record<PlatformType, PlatformConfig> = {
  WHATSAPP: {
    name: 'WhatsApp',
    icon: MessageCircle,
    description: {
      connected: 'Sua conta do WhatsApp está conectada e funcionando.',
      disconnected: 'Conecte sua conta do WhatsApp para enviar mensagens.',
    },
    iconColor: 'text-green-600',
  },
  EVOLUTION: {
    name: 'WhatsApp Evolution',
    icon: MessageCircle,
    description: {
      connected: 'Sua instância Evolution está conectada e funcionando.',
      disconnected:
        'Conecte uma instância Evolution para enviar mensagens via WhatsApp.',
    },
    iconColor: 'text-green-600',
  },
  TELEGRAM: {
    name: 'Telegram',
    icon: Bot,
    description: {
      connected: 'Seu bot do Telegram está conectado e funcionando.',
      disconnected: 'Conecte um bot do Telegram para enviar mensagens.',
    },
    iconColor: 'text-blue-600',
  },
}

export function getPlatformConfig(platform: PlatformType): PlatformConfig {
  return platformConfigs[platform]
}
