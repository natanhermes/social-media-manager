import { useEffect, useRef, useState } from 'react'

interface UseConnectionPollingProps {
  instanceName: string
  enabled: boolean
  onConnected?: () => void
  interval?: number
}

export function useConnectionPolling({
  instanceName,
  enabled,
  onConnected,
  interval = 3000, // 3 segundos
}: UseConnectionPollingProps) {
  const [status, setStatus] = useState<'open' | 'close' | 'connecting'>(
    'connecting',
  )
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasConnectedRef = useRef(false)

  const checkStatus = async () => {
    try {
      setIsPolling(true)
      const response = await fetch(`/api/integrations/${instanceName}/status`)

      if (!response.ok) {
        throw new Error('Failed to check status')
      }

      const data = await response.json()

      if (data.success) {
        setStatus(data.status)

        // Se conectou e ainda não disparou o callback
        if (data.connected && !hasConnectedRef.current) {
          hasConnectedRef.current = true
          onConnected?.()
        }
      }
    } catch (error) {
      console.error('Error checking connection status:', error)
    } finally {
      setIsPolling(false)
    }
  }

  useEffect(() => {
    if (enabled && !hasConnectedRef.current) {
      // Verificar imediatamente
      checkStatus()

      // Configurar polling
      intervalRef.current = setInterval(checkStatus, interval)
    } else {
      // Limpar polling se desabilitado ou já conectado
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, instanceName, interval])

  // Limpar polling quando conectar
  useEffect(() => {
    if (status === 'open' && intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [status])

  return {
    status,
    isPolling,
    isConnected: status === 'open',
    isConnecting: status === 'connecting',
  }
}
