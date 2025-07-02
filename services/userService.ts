import { compareSync } from 'bcryptjs'

import db from '@/lib/db'
import { User } from '@/lib/generated/prisma'

export async function findUserByCredentials(
  username: string,
  password: string,
): Promise<User | null> {
  const user = await db.user.findFirst({
    where: {
      username,
    },
  })

  if (!user) {
    return null
  }

  const passwordsMatch = compareSync(password, user.password)

  if (passwordsMatch) return user

  return null
}
