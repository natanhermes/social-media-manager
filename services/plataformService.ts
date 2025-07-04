import { Platform } from '@prisma/client'

import db from '@/lib/db'

export async function listPlataforms(
  userId: string,
): Promise<Pick<Platform, 'id' | 'name' | 'connected'>[]> {
  const platforms = await db.platform.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      name: true,
      connected: true,
    },
  })

  return platforms
}
