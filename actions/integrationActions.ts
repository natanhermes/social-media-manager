'use server'

import { IntegrationPlatformType } from '@prisma/client'
import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import {
  createIntegration,
  deleteIntegration,
  getUserIntegrations,
} from '@/services/integrationService'
import { IntegrationConnectionRequest } from '@/types/integrations'

export async function getIntegrationsAction() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
        data: [],
      }
    }

    const integrations = await getUserIntegrations(session.user.id)

    return {
      success: true,
      data: integrations,
    }
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return {
      success: false,
      error: 'Failed to fetch integrations',
      data: [],
    }
  }
}

export async function getIntegrationAction(id: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
        data: null,
      }
    }

    const integrations = await getUserIntegrations(session.user.id)
    const integration = integrations.find(
      (integration) => integration.id === id,
    )

    if (!integration) {
      return {
        success: false,
        error: 'Integration not found',
        data: null,
      }
    }

    return {
      success: true,
      data: integration,
    }
  } catch (error) {
    console.error('Error fetching integration:', error)
    return {
      success: false,
      error: 'Failed to fetch integration',
      data: null,
    }
  }
}

export async function createIntegrationAction(
  data: IntegrationConnectionRequest,
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // Determinar plataforma baseado nos dados
    let platform: IntegrationPlatformType,
      name: string,
      config: Record<string, unknown>,
      metadata: Record<string, unknown>

    if (data.config.instanceName) {
      platform = IntegrationPlatformType.EVOLUTION
      name = `WhatsApp Evolution - ${data.config.instanceName}`
      config = { instanceName: data.config.instanceName }
      metadata = {}
    } else if (data.config.botToken) {
      platform = IntegrationPlatformType.TELEGRAM
      name = `Telegram Bot`
      config = { botToken: data.config.botToken }
      metadata = {}
    } else {
      return {
        success: false,
        error: 'Invalid configuration data',
      }
    }

    const result = await createIntegration(
      session.user.id,
      platform,
      name,
      config,
      metadata,
    )

    // Revalidar as páginas que mostram integrações
    revalidatePath('/dashboard/integrations')
    revalidatePath('/dashboard')

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error('Error creating integration:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create integration',
    }
  }
}

export async function deleteIntegrationAction(id: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    const success = await deleteIntegration(id, session.user.id)

    if (!success) {
      return {
        success: false,
        error: 'Failed to delete integration',
      }
    }

    // Revalidar as páginas que mostram integrações
    revalidatePath('/dashboard/integrations')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: 'Integration deleted successfully',
    }
  } catch (error) {
    console.error('Error deleting integration:', error)
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete integration',
    }
  }
}
