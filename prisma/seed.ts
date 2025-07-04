import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.deleteMany()
  await prisma.message.deleteMany()
  await prisma.platform.deleteMany()
  await prisma.messagePlatform.deleteMany()
  await prisma.settings.deleteMany()

  const platformNames = ['Instagram', 'WhatsApp', 'Telegram']

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
          create: faker.helpers
            .shuffle(platformNames)
            .slice(0, faker.number.int({ min: 1, max: 3 }))
            .map((platformName) => ({
              name: platformName,
              token: faker.string.uuid(),
              connected: faker.datatype.boolean(),
              lastSyncAt: faker.date.recent(),
            })),
        },
      },
    })

    // Buscar as plataformas criadas para este usuário
    const userPlatforms = await prisma.platform.findMany({
      where: { userId: user.id },
    })

    for (let j = 0; j < 5; j++) {
      const message = await prisma.message.create({
        data: {
          content: faker.lorem.paragraph(),
          userId: user.id,
        },
      })

      // Criar MessagePlatform para cada plataforma conectada do usuário
      for (const platform of userPlatforms) {
        if (platform.connected) {
          const status = faker.helpers.arrayElement([
            'success',
            'failed',
            'pending',
          ])
          const sentAt = status === 'pending' ? null : faker.date.recent()

          await prisma.messagePlatform.create({
            data: {
              messageId: message.id,
              platformId: platform.id,
              status,
              sentAt,
              externalId:
                status === 'success' ? faker.string.alphanumeric(10) : null,
              errorMsg:
                status === 'failed'
                  ? faker.helpers.arrayElement([
                      'Token expirado',
                      'Rate limit excedido',
                      'Conteúdo não permitido',
                      'Erro de rede',
                      'Plataforma indisponível',
                    ])
                  : null,
              retryCount:
                status === 'failed' ? faker.number.int({ min: 0, max: 3 }) : 0,
            },
          })
        }
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
