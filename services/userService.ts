import { compareSync } from 'bcryptjs'

import db from '@/lib/db'
import { User } from '@/lib/generated/prisma'

export async function findUserByCredentials(
  email: string,
  password: string,
): Promise<User | null> {
  const user = await db.user.findFirst({
    where: {
      email,
    },
  })

  if (!user) {
    return null
  }

  const passwordsMatch = compareSync(password, user.password)

  if (passwordsMatch) return user

  return null
}
