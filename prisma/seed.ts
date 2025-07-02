import { faker } from '@faker-js/faker'
import { hash } from 'bcryptjs'

import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.deleteMany()
  await prisma.message.deleteMany()
  await prisma.platform.deleteMany()
  await prisma.messagePlatform.deleteMany()
  await prisma.settings.deleteMany()

  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        username: faker.internet.username(),
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: await hash('66611812', 10),
        company: faker.company.name(),
        bio: faker.lorem.sentence(),
        settings: {
          create: {
            emailNotifications: faker.datatype.boolean(),
            pushNotifications: faker.datatype.boolean(),
            smsNotifications: faker.datatype.boolean(),
            weeklyReport: faker.datatype.boolean(),
          },
        },
        platforms: {
          create: [
            {
              name: faker.company.name(),
              token: faker.string.uuid(),
              connected: faker.datatype.boolean(),
            },
            {
              name: faker.company.name(),
              token: faker.string.uuid(),
              connected: faker.datatype.boolean(),
            },
          ],
        },
      },
    })

    for (let j = 0; j < 5; j++) {
      const message = await prisma.message.create({
        data: {
          content: faker.lorem.paragraph(),
          sentAt: faker.date.recent(),
          status: faker.helpers.arrayElement(['success', 'failed', 'pending']),
          userId: user.id,
        },
      })

      const userPlatforms = await prisma.platform.findMany({
        where: { userId: user.id },
      })

      if (userPlatforms.length > 0) {
        await prisma.messagePlatform.create({
          data: {
            messageId: message.id,
            platform: userPlatforms[0].name,
          },
        })
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
