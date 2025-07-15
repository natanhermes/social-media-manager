import {
  Integration,
  IntegrationPlatformType,
  IntegrationStatus,
  Prisma,
} from '@prisma/client'

import db from '@/lib/db'

export async function getUserIntegrations(
  userId: string,
): Promise<Integration[]> {
  const integrations = await db.integration.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return integrations
}

export async function getIntegrationById(
  id: string,
  userId: string,
): Promise<Integration | null> {
  const integration = await db.integration.findFirst({
    where: {
      id,
      userId,
    },
  })

  return integration
}

export async function createIntegration(
  userId: string,
  platform: IntegrationPlatformType,
  name: string,
  config: Record<string, unknown>,
  metadata: Record<string, unknown>,
): Promise<Integration> {
  const integration = await db.integration.create({
    data: {
      userId,
      platform,
      name,
      status: IntegrationStatus.CONNECTED,
      config: config as Prisma.InputJsonValue,
      metadata: metadata as Prisma.InputJsonValue,
    },
  })

  return integration
}

export async function updateIntegrationStatus(
  id: string,
  userId: string,
  status: IntegrationStatus,
  _errorMessage?: string,
): Promise<Integration> {
  const integration = await db.integration.update({
    where: {
      id,
      userId,
    },
    data: {
      status,
      updatedAt: new Date(),
    },
  })

  return integration
}

export async function deleteIntegration(
  id: string,
  userId: string,
): Promise<boolean> {
  try {
    await db.integration.delete({
      where: {
        id,
        userId,
      },
    })
    return true
  } catch (error) {
    console.error('Error deleting integration:', error)
    return false
  }
}
