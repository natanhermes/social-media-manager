'use client'

import { Integration } from '@prisma/client'
import { useState } from 'react'

import { IntegrationDetailsModal } from './integration-details-modal'
import { IntegrationsList } from './integrations-list'

export function IntegrationsDashboard() {
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null)

  const handleSelectIntegration = (integration: Integration) => {
    setSelectedIntegration(integration)
  }

  const handleCloseModal = () => {
    setSelectedIntegration(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Integrações</h2>
        <p className="text-muted-foreground">
          Conecte e gerencie suas contas de mídia social
        </p>
      </div>

      {/* Lista de integrações */}
      <IntegrationsList onSelectIntegration={handleSelectIntegration} />

      {/* Modal de detalhes */}
      <IntegrationDetailsModal
        integration={selectedIntegration}
        open={!!selectedIntegration}
        onClose={handleCloseModal}
      />
    </div>
  )
}
