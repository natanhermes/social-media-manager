import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  ConversationChannel,
  Integration,
  IntegrationConnectionRequest,
  IntegrationConnectionResponse,
  SelectedConversation,
} from '@/types/integrations'

export function useIntegrations() {
  return useQuery<{ success: boolean; data: Integration[] }>({
    queryKey: ['integrations'],
    queryFn: async () => {
      const response = await fetch('/api/integrations')
      if (!response.ok) {
        throw new Error('Failed to fetch integrations')
      }
      return response.json()
    },
  })
}

export function useIntegration(id: string) {
  return useQuery<{ success: boolean; data: Integration }>({
    queryKey: ['integration', id],
    queryFn: async () => {
      const response = await fetch(`/api/integrations/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch integration')
      }
      return response.json()
    },
    enabled: !!id,
  })
}

export function useCreateIntegration() {
  const queryClient = useQueryClient()

  return useMutation<
    IntegrationConnectionResponse,
    Error,
    IntegrationConnectionRequest
  >({
    mutationFn: async (request) => {
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create integration')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
    },
  })
}

export function useDeleteIntegration() {
  const queryClient = useQueryClient()

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: async (id) => {
      const response = await fetch(`/api/integrations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete integration')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
    },
  })
}

export function useUpdateIntegrationStatus() {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean; data: Integration },
    Error,
    { id: string; status: string; errorMessage?: string }
  >({
    mutationFn: async ({ id, status, errorMessage }) => {
      const response = await fetch(`/api/integrations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, errorMessage }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update integration status')
      }

      return response.json()
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] })
      queryClient.invalidateQueries({ queryKey: ['integration', id] })
    },
  })
}

export function useIntegrationChannels(integrationId: string) {
  return useQuery<{ success: boolean; data: ConversationChannel[] }>({
    queryKey: ['integration-channels', integrationId],
    queryFn: async () => {
      const response = await fetch(
        `/api/integrations/${integrationId}/channels`,
      )
      if (!response.ok) {
        throw new Error('Failed to fetch channels')
      }
      return response.json()
    },
    enabled: !!integrationId,
  })
}

// Hooks para conversas selecionadas
export function useSelectedConversations(integrationId: string) {
  return useQuery<{ success: boolean; data: SelectedConversation[] }>({
    queryKey: ['selected-conversations', integrationId],
    queryFn: async () => {
      const response = await fetch(
        `/api/integrations/${integrationId}/selected-conversations`,
      )
      if (!response.ok) {
        throw new Error('Failed to fetch selected conversations')
      }
      return response.json()
    },
    enabled: !!integrationId,
  })
}

export function useToggleSelectedConversation() {
  const queryClient = useQueryClient()

  return useMutation<
    { success: boolean; data?: SelectedConversation; message?: string },
    Error,
    {
      integrationId: string
      externalId: string
      name: string
      type: string
      selected: boolean
    }
  >({
    mutationFn: async ({ integrationId, externalId, name, type, selected }) => {
      if (selected) {
        const response = await fetch(
          `/api/integrations/${integrationId}/selected-conversations`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              externalId,
              name,
              type,
            }),
          },
        )

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to select conversation')
        }

        return response.json()
      } else {
        const response = await fetch(
          `/api/integrations/${integrationId}/selected-conversations?externalId=${externalId}`,
          {
            method: 'DELETE',
          },
        )

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to unselect conversation')
        }

        return response.json()
      }
    },
    onSuccess: (_, { integrationId }) => {
      queryClient.invalidateQueries({
        queryKey: ['selected-conversations', integrationId],
      })
      queryClient.invalidateQueries({
        queryKey: ['integration-channels', integrationId],
      })
    },
  })
}
