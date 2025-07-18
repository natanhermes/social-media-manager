'use client'

import { useState } from 'react'

import { MessageDetailsModal } from '@/components/message-details-modal'
import { Button } from '@/components/ui/button'

interface DashboardClientProps {
  messageId: string
}

export function DashboardClient({
  messageId: _messageId,
}: DashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleViewMessage = () => {
    // Por enquanto apenas abre o modal
    // Em uma implementação completa, você buscaria os dados da mensagem
    setIsModalOpen(true)
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={handleViewMessage}>
        Detalhes
      </Button>
      <MessageDetailsModal
        message={null} // Temporário - precisará ser implementado
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  )
}
