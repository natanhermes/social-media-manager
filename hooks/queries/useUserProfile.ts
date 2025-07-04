import { useQuery } from '@tanstack/react-query'

import { PublicUser } from '@/services/userService'

interface UserProfileResponse {
  success: boolean
  message: string
  data: PublicUser
}

export function useUserProfile() {
  return useQuery<UserProfileResponse>({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await fetch('/api/user/profile')

      if (!response.ok) {
        throw new Error('Erro ao buscar dados do usuário')
      }

      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
    retryDelay: 1000,
  })
}
