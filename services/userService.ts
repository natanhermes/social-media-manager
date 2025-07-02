import { compareSync } from 'bcryptjs'

import db from '@/lib/db'
import { Prisma, User } from '@/lib/generated/prisma'

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

export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await db.user.findUnique({
    where: {
      email,
    },
  })

  if (!user) {
    return null
  }

  return user
}

export async function findUserByUsername(
  username: string,
): Promise<User | null> {
  const user = await db.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return null
  }

  return user
}

export async function createUser(user: Prisma.UserCreateInput): Promise<User> {
  const newUser = await db.user.create({
    data: user,
  })

  return newUser
}
