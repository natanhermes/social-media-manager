import { MessageStatus } from '@prisma/client'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusBadge(status: MessageStatus): {
  label: string
  variant:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | null
    | undefined
  color?: string
} | null {
  switch (status) {
    case 'success':
      return {
        label: 'Sucesso',
        variant: 'default',
        color: 'bg-green-100 text-green-800',
      }
    case 'failed':
      return {
        label: 'Falha',
        variant: 'destructive',
      }
    case 'pending':
      return {
        label: 'Pendente',
        variant: 'outline',
        color: 'bg-yellow-100 text-yellow-800',
      }
    default:
      return null
  }
}
