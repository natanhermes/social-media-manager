import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/auth'
import db from '@/lib/db'

export async function GET(_request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Usuário não autenticado',
        },
        { status: 401 },
      )
    }

    const userId = session.user.id

    // Buscar estatísticas das mensagens do usuário
    const [
      totalMessages,
      scheduledMessages,
      sentMessages,
      failedDeliveries,
      pendingDeliveries,
      totalDeliveries,
    ] = await Promise.all([
      // Total de mensagens
      db.message.count({
        where: { userId },
      }),

      // Mensagens agendadas
      db.message.count({
        where: {
          userId,
          isScheduled: true,
          scheduledFor: { gt: new Date() },
        },
      }),

      // Mensagens enviadas (com pelo menos um delivery SENT)
      db.message.count({
        where: {
          userId,
          sentAt: { not: null },
        },
      }),

      // Deliveries com falha
      db.messageDelivery.count({
        where: {
          message: { userId },
          status: 'FAILED',
        },
      }),

      // Deliveries pendentes
      db.messageDelivery.count({
        where: {
          message: { userId },
          status: { in: ['PENDING', 'PROCESSING', 'SCHEDULED'] },
        },
      }),

      // Total de deliveries
      db.messageDelivery.count({
        where: {
          message: { userId },
        },
      }),
    ])

    // Buscar estatísticas por plataforma
    const deliveryStats = await db.messageDelivery.groupBy({
      by: ['status'],
      where: {
        message: { userId },
      },
      _count: {
        status: true,
      },
    })

    // Buscar estatísticas por integração
    const integrationStatsRaw = await db.messageDelivery.groupBy({
      by: ['integrationId'],
      where: {
        message: { userId },
      },
      _count: {
        integrationId: true,
      },
    })

    // Buscar dados das integrações separadamente
    const integrationIds = integrationStatsRaw.map((stat) => stat.integrationId)
    const integrations = await db.integration.findMany({
      where: {
        id: { in: integrationIds },
      },
      select: {
        id: true,
        name: true,
        platform: true,
      },
    })

    const integrationStats = integrationStatsRaw.map((stat) => ({
      ...stat,
      integration: integrations.find((int) => int.id === stat.integrationId),
    }))

    // Buscar mensagens recentes
    const recentMessages = await db.message.findMany({
      where: { userId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        isScheduled: true,
        scheduledFor: true,
        sentAt: true,
        messageDeliveries: {
          select: {
            status: true,
            sentAt: true,
            integration: {
              select: {
                name: true,
                platform: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalMessages,
          scheduledMessages,
          sentMessages,
          failedDeliveries,
          pendingDeliveries,
          totalDeliveries,
          successRate:
            totalDeliveries > 0
              ? Math.round(
                  ((totalDeliveries - failedDeliveries) / totalDeliveries) *
                    100,
                )
              : 0,
        },
        deliveryStats: deliveryStats.reduce(
          (acc, stat) => {
            acc[stat.status] = stat._count.status
            return acc
          },
          {} as Record<string, number>,
        ),
        integrationStats,
        recentMessages,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor',
      },
      { status: 500 },
    )
  }
}
