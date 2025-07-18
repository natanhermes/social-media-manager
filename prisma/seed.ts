import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Limpar dados existentes
  await prisma.messageDelivery.deleteMany()
  await prisma.selectedConversation.deleteMany()
  await prisma.integration.deleteMany()
  await prisma.message.deleteMany()
  await prisma.settings.deleteMany()
  await prisma.user.deleteMany()

  const integrationPlatforms = ['WHATSAPP', 'TELEGRAM'] as const
  const conversationTypes = ['INDIVIDUAL', 'GROUP'] as const

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
      },
    })

    // Criar algumas integrações para o usuário
    const integrations = []
    for (let j = 0; j < faker.number.int({ min: 1, max: 3 }); j++) {
      const platform = faker.helpers.arrayElement(integrationPlatforms)
      const integration = await prisma.integration.create({
        data: {
          platform,
          name: `${platform} Integration ${j + 1}`,
          status: faker.helpers.arrayElement([
            'CONNECTED',
            'DISCONNECTED',
            'ERROR',
          ]),
          config:
            platform === 'WHATSAPP'
              ? { instanceName: faker.string.alphanumeric(10) }
              : { botToken: faker.string.alphanumeric(32) },
          metadata: { createdBy: 'seed' },
          userId: user.id,
        },
      })
      integrations.push(integration)

      // Criar conversas selecionadas para integrações conectadas
      if (integration.status === 'CONNECTED') {
        for (let k = 0; k < faker.number.int({ min: 2, max: 5 }); k++) {
          await prisma.selectedConversation.create({
            data: {
              externalId: faker.string.numeric(10),
              name:
                faker.helpers.arrayElement(conversationTypes) === 'GROUP'
                  ? `Grupo ${faker.company.name()}`
                  : faker.person.fullName(),
              type: faker.helpers.arrayElement(conversationTypes),
              active: faker.datatype.boolean({ probability: 0.8 }),
              integrationId: integration.id,
            },
          })
        }
      }
    }

    // Criar mensagens para o usuário
    for (let j = 0; j < 5; j++) {
      const isScheduled = faker.datatype.boolean({ probability: 0.3 })
      const scheduledFor = isScheduled ? faker.date.future() : null

      const message = await prisma.message.create({
        data: {
          content: faker.lorem.paragraph(),
          userId: user.id,
          isScheduled,
          scheduledFor,
          sentAt:
            !isScheduled && faker.datatype.boolean({ probability: 0.7 })
              ? faker.date.recent()
              : null,
        },
      })

      // Criar MessageDelivery para integrações conectadas com conversas ativas
      const connectedIntegrations = await prisma.integration.findMany({
        where: {
          userId: user.id,
          status: 'CONNECTED',
        },
        include: {
          selectedConversations: {
            where: { active: true },
          },
        },
      })

      for (const integration of connectedIntegrations) {
        for (const conversation of integration.selectedConversations) {
          const status = isScheduled
            ? 'SCHEDULED'
            : faker.helpers.arrayElement([
                'SENT',
                'FAILED',
                'PENDING',
                'PROCESSING',
              ])

          await prisma.messageDelivery.create({
            data: {
              messageId: message.id,
              integrationId: integration.id,
              selectedConversationId: conversation.id,
              status,
              sentAt: status === 'SENT' ? faker.date.recent() : null,
              externalId:
                status === 'SENT' ? faker.string.alphanumeric(10) : null,
              errorMessage:
                status === 'FAILED'
                  ? faker.helpers.arrayElement([
                      'Token expirado',
                      'Rate limit excedido',
                      'Conteúdo não permitido',
                      'Erro de rede',
                      'Plataforma indisponível',
                    ])
                  : null,
              retryCount:
                status === 'FAILED' ? faker.number.int({ min: 0, max: 3 }) : 0,
              lastRetryAt:
                status === 'FAILED' && faker.datatype.boolean()
                  ? faker.date.recent()
                  : null,
            },
          })
        }
      }
    }
  }

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
