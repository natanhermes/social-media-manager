import { IntegrationsFormData } from '@/schemas/integrations-form-schema'
import {
  ConversationChannel,
  EvolutionIntegration,
  IntegrationConnectionRequest,
  IntegrationConnectionResponse,
  IntegrationPlatform,
  IntegrationStatus,
  SendMessageRequest,
  SendMessageResponse,
} from '@/types/integrations'

interface EvolutionCreateInstanceResponse {
  instance: {
    instanceName: string
    instanceId: string
    integration: string
    webhookWaBusiness: string | null
    accessTokenWaBusiness: string
    status: string
  }
  qrcode?: {
    pairingCode: string | null
    code: string
    base64: string
    count: number
  }
}

interface EvolutionInstanceInfoResponse {
  id: string
  name: string
  connectionStatus: string
  ownerJid: string | null
  profileName: null
  profilePicUrl: null
  integration: string
  token: string
  clientName: string
  createdAt: string
  updatedAt: string
}

interface EvolutionGroup {
  id: string
  subject: string
  description?: string
  participants: Array<{
    id: string
    admin: string
  }>
  subjectOwner: string
  subjectTime: number
  creation: number
  pictureUrl?: string
}

export class EvolutionWhatsAppService {
  private baseUrl: string
  private apiKey: string

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.apiKey = apiKey
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      apikey: this.apiKey,
    }
  }

  async testConnection(instanceName: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/instance/connectionState/${instanceName}`,
        {
          headers: this.getHeaders(),
        },
      )

      if (!response.ok) {
        const error = await response.text()
        return {
          success: false,
          error: `Evolution API Error: ${response.status} - ${error}`,
        }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  async createInstance(instanceName: string): Promise<{
    success: boolean
    error?: string
    instance?: EvolutionCreateInstanceResponse
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/instance/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        return {
          success: false,
          error: `Failed to create instance: ${response.status} - ${error}`,
        }
      }

      const data = await response.json()
      return {
        success: true,
        ...data,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create instance: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Busca informações da instância
   */
  async getInstanceInfo(instanceName: string): Promise<{
    success: boolean
    instance?: EvolutionInstanceInfoResponse
    error?: string
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/instance/fetchInstances`, {
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const error = await response.text()
        return {
          success: false,
          error: `Failed to get instance info: ${response.status} - ${error}`,
        }
      }

      const data = await response.json()
      const instance = data.find(
        (inst: EvolutionInstanceInfoResponse) => inst.name === instanceName,
      )

      if (!instance) {
        return {
          success: false,
          error: 'Instance not found',
        }
      }

      return { success: true, instance }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get instance info: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Busca conversas (grupos e individuais) da instância
   */
  async getConversations(instanceName: string): Promise<ConversationChannel[]> {
    try {
      const [groupsResponse] = await Promise.all([
        fetch(
          `${this.baseUrl}/group/fetchAllGroups/${instanceName}?getParticipants=true`,
          {
            headers: this.getHeaders(),
          },
        ),
      ])

      const conversations: ConversationChannel[] = []

      // Processar grupos
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json()
        const groups = Array.isArray(groupsData) ? groupsData : []

        groups.forEach((group: EvolutionGroup) => {
          conversations.push({
            id: group.id,
            name: group.subject,
            type: 'group',
            participants: group.participants?.length || 0,
            metadata: {
              description: group.description,
              pictureUrl: group.pictureUrl,
            },
          })
        })
      }

      return conversations
    } catch (error) {
      console.error('Error fetching conversations:', error)
      return []
    }
  }

  /**
   * Envia mensagem para grupo
   */
  async sendMessage(
    instanceName: string,
    request: SendMessageRequest,
  ): Promise<SendMessageResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/message/sendText/${instanceName}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            number: request.conversationId,
            text: request.content,
          }),
        },
      )

      if (!response.ok) {
        const error = await response.text()
        return {
          success: false,
          error: `Message send failed: ${response.status} - ${error}`,
        }
      }

      const data = await response.json()
      return {
        success: true,
        messageId: data.key?.id || data.messageId,
      }
    } catch (error) {
      return {
        success: false,
        error: `Message send failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  async connectEvolution(
    request: IntegrationConnectionRequest,
  ): Promise<IntegrationConnectionResponse> {
    const { config } = request

    const requiredFields = ['instanceName']
    for (const field of requiredFields) {
      if (!config[field as keyof IntegrationsFormData]) {
        return {
          success: false,
          error: `Campo obrigatório: ${field}`,
        }
      }
    }

    const connectionTest = await this.testConnection(config.instanceName)

    if (!connectionTest.success) {
      const createResult = await this.createInstance(config.instanceName)

      if (!createResult.success) {
        return {
          success: false,
          error: createResult.error,
        }
      }

      const qrCodeBase64 = createResult.instance?.qrcode?.base64

      return {
        success: true,
        qrCode: qrCodeBase64,
        setupInstructions: [
          'Escaneie o QR Code com seu WhatsApp',
          'Aguarde a conexão ser estabelecida',
          'A instância ficará ativa após a conexão',
        ],
      }
    }

    const instanceInfo = await this.getInstanceInfo(config.instanceName)

    const instance = instanceInfo.instance

    const integration: EvolutionIntegration = {
      id: '',
      platform: IntegrationPlatform.WHATSAPP,
      name: `WhatsApp (${instance!.name})`,
      status:
        instance?.connectionStatus === 'open'
          ? IntegrationStatus.CONNECTED
          : IntegrationStatus.CONNECTING,
      userId: '',
      config: {
        instanceName: instance!.name,
        instanceId: instance!.id,
      },
      metadata: {
        instanceId: instance!.id,
        displayName: instance!.name,
        status: instance?.connectionStatus as 'open' | 'close' | 'connecting',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return {
      success: true,
      integration,
      setupInstructions: [
        'Sua instância do WhatsApp está configurada',
        'Você pode agora listar grupos e enviar mensagens',
        'Use o dashboard para gerenciar suas mensagens programadas',
      ],
    }
  }

  /**
   * Verifica o status específico da conexão da instância
   */
  async getConnectionStatus(instanceName: string): Promise<{
    success: boolean
    status?: 'open' | 'close' | 'connecting'
    error?: string
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/instance/connectionState/${instanceName}`,
        {
          headers: this.getHeaders(),
        },
      )

      if (!response.ok) {
        const error = await response.text()
        return {
          success: false,
          error: `Failed to get connection status: ${response.status} - ${error}`,
        }
      }

      const data = await response.json()

      return {
        success: true,
        status: data.instance.state as 'open' | 'close' | 'connecting',
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get connection status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }
}
