import { IntegrationsFormData } from '@/schemas/integrations-form-schema'

export enum IntegrationPlatform {
  WHATSAPP = 'WHATSAPP',
  EVOLUTION = 'EVOLUTION',
}

export enum IntegrationStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
  EXPIRED = 'EXPIRED',
}

export interface BaseIntegration {
  id: string
  platform: IntegrationPlatform
  name: string
  status: IntegrationStatus
  userId: string
  config: IntegrationsFormData
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface EvolutionIntegration extends BaseIntegration {
  platform: IntegrationPlatform
  config: {
    instanceName: string
    instanceId: string
  }
  metadata: {
    instanceId: string
    displayName: string
    status: 'open' | 'close' | 'connecting'
  }
}

export type Integration = EvolutionIntegration

export interface ConversationChannel {
  id: string
  name: string
  type: string
  participants?: number
  metadata?: Record<string, unknown>
  selected?: boolean // Indica se a conversa está selecionada
}

export interface SelectedConversation {
  id: string
  externalId: string
  name: string
  type: string
  integrationId: string
  createdAt: Date
  updatedAt: Date
}

export interface IntegrationConnectionRequest {
  config: IntegrationsFormData
  testConnection?: boolean
}

export interface IntegrationConnectionResponse {
  success: boolean
  integration?: Integration
  error?: string
  setupInstructions?: string[]
  qrCode?: string
}

export interface SendMessageRequest {
  conversationId: string
  content: string
}

export interface SendMessageResponse {
  success: boolean
  messageId?: string
  error?: string
}
