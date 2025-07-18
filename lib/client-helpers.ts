// Helpers client-side para buscar dados quando necessário
// Usado apenas em componentes client que precisam de reatividade

import { MessageFormData } from '@/schemas/message-form-schema'

export async function fetchUserProfile() {
  const response = await fetch('/api/user/profile')
  if (!response.ok) {
    throw new Error('Erro ao buscar dados do usuário')
  }
  return response.json()
}

export async function fetchMessages(page: number = 0) {
  const response = await fetch(`/api/messages?page=${page}`)
  if (!response.ok) {
    throw new Error('Erro ao buscar mensagens')
  }
  return response.json()
}

export async function fetchIntegrations() {
  const response = await fetch('/api/integrations')
  if (!response.ok) {
    throw new Error('Erro ao buscar integrações')
  }
  return response.json()
}

export async function sendMessage(data: MessageFormData) {
  const response = await fetch('/api/messages/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('Erro ao enviar mensagem')
  }

  return response.json()
}
