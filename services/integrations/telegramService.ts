import { IntegrationsFormData } from '@/schemas/integrations-form-schema'
import {
  ConversationChannel,
  IntegrationConnectionRequest,
  IntegrationConnectionResponse,
  IntegrationPlatform,
  IntegrationStatus,
  SendMessageRequest,
  SendMessageResponse,
  TelegramIntegration,
} from '@/types/integrations'

// Interfaces específicas do Telegram Bot API
interface TelegramBotInfo {
  id: number
  is_bot: boolean
  first_name: string
  username: string
  can_join_groups: boolean
  can_read_all_group_messages: boolean
  supports_inline_queries: boolean
}

interface TelegramChat {
  id: number
  type: 'private' | 'group' | 'supergroup' | 'channel'
  title?: string
  username?: string
  first_name?: string
  last_name?: string
  description?: string
  invite_link?: string
  photo?: {
    small_file_id: string
    small_file_unique_id: string
    big_file_id: string
    big_file_unique_id: string
  }
  permissions?: Record<string, boolean>
  message_auto_delete_time?: number
  has_protected_content?: boolean
  has_visible_history?: boolean
  has_aggressive_anti_spam_enabled?: boolean
  has_hidden_members?: boolean
}

interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from: {
      id: number
      is_bot: boolean
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
    }
    chat: TelegramChat
    date: number
    text?: string
  }
  edited_message?: any
  channel_post?: any
  edited_channel_post?: any
  inline_query?: any
  chosen_inline_result?: any
  callback_query?: any
}

interface TelegramApiResponse<T = any> {
  ok: boolean
  result?: T
  error_code?: number
  description?: string
}

export class TelegramBotService {
  private baseUrl: string
  private botToken: string

  constructor(botToken: string) {
    this.botToken = botToken
    this.baseUrl = `https://api.telegram.org/bot${botToken}`
  }

  /**
   * Testa a conectividade com o bot
   */
  async testConnection(): Promise<{
    success: boolean
    error?: string
    botInfo?: TelegramBotInfo
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/getMe`)

      if (!response.ok) {
        return {
          success: false,
          error: `Telegram API Error: ${response.status} - ${response.statusText}`,
        }
      }

      const data: TelegramApiResponse<TelegramBotInfo> = await response.json()

      if (!data.ok) {
        return {
          success: false,
          error: `Bot API Error: ${data.description || 'Unknown error'}`,
        }
      }

      return {
        success: true,
        botInfo: data.result,
      }
    } catch (error) {
      return {
        success: false,
        error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Busca atualizações (mensagens) do bot para identificar chats/grupos
   */
  async getUpdates(limit = 100): Promise<{
    success: boolean
    updates?: TelegramUpdate[]
    error?: string
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/getUpdates?limit=${limit}&allowed_updates=["message","channel_post"]`,
      )

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to get updates: ${response.status} - ${response.statusText}`,
        }
      }

      const data: TelegramApiResponse<TelegramUpdate[]> = await response.json()

      if (!data.ok) {
        return {
          success: false,
          error: `Get updates failed: ${data.description || 'Unknown error'}`,
        }
      }

      return {
        success: true,
        updates: data.result || [],
      }
    } catch (error) {
      return {
        success: false,
        error: `Get updates failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Busca informações de um chat específico
   */
  async getChat(chatId: string | number): Promise<{
    success: boolean
    chat?: TelegramChat
    error?: string
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/getChat?chat_id=${chatId}`)

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to get chat: ${response.status} - ${response.statusText}`,
        }
      }

      const data: TelegramApiResponse<TelegramChat> = await response.json()

      if (!data.ok) {
        return {
          success: false,
          error: `Get chat failed: ${data.description || 'Unknown error'}`,
        }
      }

      return {
        success: true,
        chat: data.result,
      }
    } catch (error) {
      return {
        success: false,
        error: `Get chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Busca conversas (grupos e canais) onde o bot está presente
   */
  async getConversations(): Promise<ConversationChannel[]> {
    try {
      const updatesResult = await this.getUpdates()

      if (!updatesResult.success || !updatesResult.updates) {
        console.error('Failed to get updates:', updatesResult.error)
        return []
      }

      const conversations: ConversationChannel[] = []
      const processedChats = new Set<number>()

      // Processar mensagens e posts de canais para identificar chats únicos
      for (const update of updatesResult.updates) {
        const chat =
          update.message?.chat ||
          update.channel_post?.chat ||
          update.edited_message?.chat ||
          update.edited_channel_post?.chat

        if (!chat || processedChats.has(chat.id)) {
          continue
        }

        processedChats.add(chat.id)

        // Buscar informações detalhadas do chat
        const chatResult = await this.getChat(chat.id)
        const detailedChat = chatResult.success ? chatResult.chat : chat

        if (
          detailedChat &&
          ['group', 'supergroup', 'channel'].includes(detailedChat.type)
        ) {
          conversations.push({
            id: detailedChat.id.toString(),
            name:
              detailedChat.title || detailedChat.first_name || 'Chat sem nome',
            type: detailedChat.type,
            participants: 0, // Telegram não fornece contagem de membros facilmente
            metadata: {
              username: detailedChat.username,
              description: detailedChat.description,
              invite_link: detailedChat.invite_link,
              has_protected_content: detailedChat.has_protected_content,
              chat_type: detailedChat.type,
            },
          })
        }
      }

      return conversations
    } catch (error) {
      console.error('Error fetching conversations:', error)
      return []
    }
  }

  /**
   * Envia mensagem para um chat
   */
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: request.conversationId,
          text: request.content,
          parse_mode: 'HTML', // Permite formatação básica
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        return {
          success: false,
          error: `Message send failed: ${response.status} - ${error}`,
        }
      }

      const data: TelegramApiResponse<{
        message_id: number
        from: TelegramBotInfo
        chat: TelegramChat
        date: number
        text: string
      }> = await response.json()

      if (!data.ok) {
        return {
          success: false,
          error: `Message send failed: ${data.description || 'Unknown error'}`,
        }
      }

      return {
        success: true,
        messageId: data.result?.message_id.toString(),
      }
    } catch (error) {
      return {
        success: false,
        error: `Message send failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }
    }
  }

  /**
   * Conecta e valida o bot do Telegram
   */
  async connectTelegram(
    request: IntegrationConnectionRequest,
  ): Promise<IntegrationConnectionResponse> {
    const { config } = request

    // Validar campos obrigatórios
    const requiredFields = ['botToken']
    for (const field of requiredFields) {
      if (!config[field as keyof IntegrationsFormData]) {
        return {
          success: false,
          error: `Campo obrigatório: ${field}`,
        }
      }
    }

    // Testar conexão
    const connectionTest = await this.testConnection()

    if (!connectionTest.success) {
      return {
        success: false,
        error: connectionTest.error,
      }
    }

    const botInfo = connectionTest.botInfo!

    // Criar objeto de integração
    const integration: TelegramIntegration = {
      id: '',
      platform: IntegrationPlatform.TELEGRAM,
      name: `Telegram (${botInfo.first_name})`,
      status: IntegrationStatus.CONNECTED,
      userId: '',
      config: {
        botToken: config.botToken,
        botId: botInfo.id.toString(),
      },
      metadata: {
        botId: botInfo.id,
        botUsername: botInfo.username,
        botFirstName: botInfo.first_name,
        canJoinGroups: botInfo.can_join_groups,
        canReadAllGroupMessages: botInfo.can_read_all_group_messages,
        supportsInlineQueries: botInfo.supports_inline_queries,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return {
      success: true,
      integration,
      setupInstructions: [
        'Seu bot do Telegram foi conectado com sucesso',
        'Adicione o bot aos grupos onde deseja enviar mensagens',
        'Use o dashboard para selecionar grupos e enviar mensagens',
        'O bot precisa ter permissões para enviar mensagens nos grupos',
      ],
    }
  }

  /**
   * Verifica o status da conexão do bot
   */
  async getConnectionStatus(): Promise<{
    success: boolean
    connected?: boolean
    error?: string
  }> {
    const connectionTest = await this.testConnection()

    return {
      success: connectionTest.success,
      connected: connectionTest.success,
      error: connectionTest.error,
    }
  }

  /**
   * Desvincular/deletar integração do Telegram
   * Para Telegram, não há necessidade de deletar instância externa
   * Esta função existe para manter consistência da arquitetura
   */
  async disconnectTelegram(): Promise<{ success: boolean; error?: string }> {
    try {
      // Para Telegram Bot API, não há necessidade de fazer cleanup especial
      // O bot simplesmente para de responder quando removemos o token
      // Mas podemos adicionar aqui qualquer lógica futura se necessário

      console.log('Telegram integration disconnected successfully')

      return {
        success: true,
      }
    } catch (error) {
      console.error('Error disconnecting Telegram integration:', error)
      return {
        success: false,
        error: 'Failed to disconnect Telegram integration',
      }
    }
  }
}
